/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue } from "queue-promise";
declare let CS: any;
declare let puer: any;
const { DialogSystem } = CS.SkySwordKill.Next;
const { DialogAnalysis, DialogCommand } = DialogSystem;
const { Traverse } = CS.HarmonyLib;
export const cancelEvent = () => DialogAnalysis.CancelEvent();
const syncRunEvent = RunEvent();
export function CreateArrayLength(type: any, length: number) {
  return CS.System.Array.CreateInstance(puer.$typeof(type), length);
}
export function CreateArray(
  type: any,
  arr: any[],
  callback?: (value: any, index: number) => any
) {
  const length = arr.length;
  const array = CreateArrayLength(type, length);
  const cb =
    typeof callback !== "function"
      ? (value: any, i: number) => {
          // console.log(`index:${i} value:${value}`);
          array.set_Item(i, value);
        }
      : (value: any, i: number) => {
          const el = callback(value, i);
          array.set_Item(i, el);
        };

  arr.forEach(cb);
  return array;
}
export function CreateCommand(
  property: string,
  callCommand: any,
  ...props: any[]
) {
  const params = CreateArray(CS.System.String, props, (v, i) => {
    let value = v;

    if (typeof value === "boolean") {
      value = value ? 1 : 0;
    }
    value = value.toString();
    // console.log(`index:${i} value:${value}`);
    return value;
  });
  return new DialogCommand(
    property,
    params,
    callCommand.BindEventData,
    callCommand.IsEnd
  );
}

export function hasField(obj: any, field: string) {
  return Traverse.Create(obj).Fields().Contains(field);
}

export function RunEvent() {
  const queue = new Queue({ start: true, concurrent: 1, interval: 10 });
  queue.on("reject", (error) => {
    console.trace("JavaScript运行错误 --> " + error);
    cancelEvent();
  });

  return function (callback: () => void, env: any, isCommand = true) {
    return new Promise((resolve) => {
      const cb = async () => {
        const result = await new Promise((rel) => {
          if (isCommand) {
            const isFunc = typeof callback === "function";
            DialogAnalysis.RunDialogEventCommand(
              isFunc ? callback() : callback,
              env,
              rel
            );
          } else {
            rel(callback());
          }
        });

        resolve(result);
        return result;
      };
      queue.enqueue(cb);
    });
  };
}

export class StoryManager {
  static alias = ["StoryManager", "对话管理器"];
  charaSay: {
    [props in string]: {
      (template: TemplateStringsArray, ...args: any[]): Promise<unknown>;
      (text: string): Promise<unknown>;
    };
  } = {};

  static narrator = ["Narrator", "旁白"];
  checkChar(char: string) {
    if (typeof char !== "string") return false;
    const { callCommand } = this;
    return (
      callCommand.BindEventData.Character.ContainsKey(char) ||
      DialogAnalysis.TmpCharacter.ContainsKey(char) ||
      StoryManager.narrator.includes(char)
    );
  }

  constructor(
    public callCommand: any,
    public rawEnv: any,
    public eventRunner: any = null
  ) {
    return new Proxy(this, {
      get(target, property) {
        if (typeof property === "symbol") return null;
        const { charaSay } = target;
        const value = charaSay[property];
        if (value) return value;
        charaSay[property] = async function (template, ...params) {
          return await target.createSay(property, template, ...params);
        };
        return charaSay[property];
      },
    });
  }

  async createSay(
    char: string,
    template: string | TemplateStringsArray,
    ...params: any[]
  ) {
    const { callCommand, rawEnv } = this;
    const command = () => {
      let say = template;
      if (Array.isArray(template)) {
        say = String.raw(
          template as TemplateStringsArray,
          ...params
        ).toString();
      }
      const com = CreateCommand("Say", callCommand, char, say);
      return com;
    };
    return await syncRunEvent(command, rawEnv);
  }
}

export class EnvValue {
  constructor(public env: any, public property: string) {
    return new Proxy(this, {
      get(target, property) {
        const { env } = target as any;
        //@ts-ignore
        const value = target[property] ?? env[property];
        return value;
      },
      set(target, property, value) {
        const { env } = target as any;
        if (env[property]) env[property] = value;
        //@ts-ignore
        else target[property] = value;
        return true;
      },
    });
  }

  get value() {
    const { property, env } = this;
    return env[property];
  }

  set value(value) {
    const { property, env } = this;
    if (typeof env[property] !== "function") env[property] = value;
  }

  callback(callback: (arg0: any, arg1: string, arg2: any) => any) {
    const { property, env } = this;
    return callback(env[property], property, env);
  }

  toString() {
    const { property, env } = this;
    const value = env[property];
    return value.toString();
  }

  valueOf() {
    const { property, env } = this;
    return env[property];
  }

  [Symbol.toPrimitive](hint: any) {
    const { property, env } = this;
    const value = env[property];
    // console.log(`hint:${hint}property:${property} env:${env}`);
    // eslint-disable-next-line default-case
    switch (hint) {
      case "string":
        return value.toString();
      case "number":
        return Number.isInteger(value)
          ? Number.parseInt(value)
          : Number.parseFloat(value);
    }

    return value;
  }
}

export const getRunner = (rawEnv: any, callCommand: any) => {
  const { bindEventData } = callCommand;
  const newEnv = { rawEnv };
  const env = new Proxy(newEnv, {
    get(target, property, receiver) {
      if (typeof property === "symbol") return undefined;
      const { rawEnv: env } = target;
      const value = env[property];
      const extMethod = DialogAnalysis.GetEnvQuery(property);
      const notValue = value === null || value === undefined;
      const hasExtMethod = !!extMethod;
      // console.log(`property:${property} type:${typeof value} value:${value}`);
      // console.log(
      //   `property:${property} type:${typeof extMethod} extMethod:${extMethod}`
      // );
      // console.log(`!value && !extMethod :${!hasValue} && ${!hasExtMethod}`);

      if (notValue && !hasExtMethod) {
        console.trace(
          `JavaScript运行错误 --> env没有找到扩展方法: ${property}`
        );
        return undefined;
      }
      if (hasExtMethod) {
        return async (...params: any[]) => {
          const cb = () => {
            const arr = CreateArray(CS.System.Object, params);
            const content = new DialogSystem.DialogEnvQueryContext(rawEnv, arr);
            return extMethod.Execute(content);
          };
          return syncRunEvent(cb, null, false);
        };
      }
      if (typeof value === "function") {
        return async (...params: any[]) => {
          const cb = () => env[property](...params);

          return syncRunEvent(cb, null, false);
        };
      }
      return () => syncRunEvent(() => env[property], null, false);
    },
    set(target, property, value, receiver) {
      if (typeof property === "symbol") return false;
      //console.log(property);
      const { rawEnv: env } = target;
      const item = env[property];
      if (typeof item !== "function" && hasField(env, property)) {
        target.rawEnv[property] = value;
      }
      return true;
    },
  });
  const storyManager = new StoryManager(callCommand, newEnv.rawEnv);
  const _runner = { env, callCommand, bindEventData, storyManager };
  const runner = new Proxy(_runner, {
    get(target, property, receiver) {
      //@ts-ignore
      if (typeof property === "symbol") return target[property];
      //@ts-ignore
      const value = target[property];
      if (value) return value;
      if (StoryManager.alias.includes(property)) return target.storyManager;
      return async (...props: any[]) => {
        const { callCommand } = _runner;
        const { rawEnv } = newEnv;
        const command = () => {
          const com = CreateCommand(property, callCommand, ...props);
          return com;
        };
        return await syncRunEvent(command, rawEnv);
      };
    },
    set(target, property, value, receiver) {
      return false;
    },
  });
  return runner;
};
export const getEnv = (rawEnv: any) => {
  const newEnv = { rawEnv };
  const env = new Proxy(newEnv, {
    get(target, property, receiver) {
      if (typeof property === "symbol") return undefined;
      const { rawEnv: env } = target;
      const value = env[property];
      const extMethod = DialogAnalysis.GetEnvQuery(property);
      const hasValue = !!value;
      const hasExtMethod = !!extMethod;
      // console.log(`property:${property} type:${typeof value} value:${value}`);
      // console.log(
      //   `property:${property} type:${typeof extMethod} extMethod:${extMethod}`
      // );
      // console.log(`!value && !extMethod :${!hasValue} && ${!hasExtMethod}`);

      if (!hasValue && !hasExtMethod) {
        if (hasField(env, property)) {
          return new EnvValue(env, property);
        }
        console.trace(
          `JavaScript运行错误 --> env没有找到扩展方法: ${property}`
        );
        return undefined;
      }
      if (!hasExtMethod) {
        return function (...params: any) {
          return extMethod.Execute(
            DialogSystem.DialogEnvQueryContext(
              newEnv.rawEnv,
              CreateArray(CS.System.Object, params)
            )
          );
        };
      }
      if (typeof value === "function") {
        return function (...params: any) {
          return value(...params);
        };
      }
      return new EnvValue(env, property);
    },
    set(target, property, value, receiver) {
      if (typeof property === "symbol") return false;
      //console.log(property);
      const { rawEnv: env } = target;
      const item = env[property];
      if (typeof item !== "function" && hasField(env, property)) {
        target.rawEnv[property] = value;
      }
      return true;
      // const value = env[property];
    },
  });

  return env;
};
