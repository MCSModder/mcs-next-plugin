import JSDialogEvent from "./jsDialogEvent";
import { utils } from "../utils";
import {
  DialogEventData,
  IDialogEventOption,
  IDialogTriggerOption,
  IList,
  IJSDialogEventOption,
  JSDialogEventData,
} from "./common";
import { cancelEvent, getRunner } from "./eventRunner";
import { Env, Runner } from "mcs-puerts-next";
import { createReadStream } from "node:fs";
interface IRunner {
  env: Env;
}

/**
 * Next管理器
 */
export default class NextManager {
  private static _instance: NextManager;
  public static get instance() {
    NextManager._instance ??= new this();
    return NextManager._instance;
  }

  public jsDialogEvent = new Map<string, JSDialogEvent>();
  public storyDict = new Map<string, DialogEventData>();
  public triggerData: IDialogTriggerOption[] = [];
  public eventData: IDialogEventOption[] = [];

  clear() {
    this.storyDict = new Map();
    this.jsDialogEvent = new Map();
    this.triggerData = [];
    this.eventData = [];
  }

  registerEvent(key: string, callback: DialogEventData): void;
  registerEvent(props: JSDialogEvent): void;
  registerEvent(props: JSDialogEventData): void;
  registerEvent(
    props: string | JSDialogEvent | JSDialogEventData,
    callback?: DialogEventData
  ) {
    if (typeof props === "string" && callback) {
      this.setStoryEvent(props, callback);
      return;
    }
    if (props instanceof JSDialogEvent) {
      const { prop, triggerData, eventData } = props;
      this.jsDialogEvent.set(prop.id, props);
      utils.setDialogTriggerList(...triggerData);
      utils.setDialogEventList(...eventData);
      return;
    }
    if (utils.isObject(props)) {
      console.log(`注册剧情对象:${JSON.stringify(props)}`);
      for (const [key, value] of Object.entries(props)) {
        if (typeof value === "function") {
          this.setStoryEvent(key, value);
          continue;
        }
        if (utils.isObject(value)) {
          this.setDialog(key, value);
          continue;
        }
      }
      utils.setDialogTriggerList(...this.triggerData);
      utils.setDialogEventList(...this.eventData);
      this.triggerData = [];
      this.eventData = [];
      return;
    }
  }

  setEvent(id: string) {
    this.setEventData({
      id,
      dialog: [`RunDialogEventJavaScript*${id}`],
    });
  }

  setEventData(prop: Partial<IDialogEventOption>) {
    const obj = Object.assign(
      { id: "", character: {}, dialog: [], option: [] },
      prop
    );
    this.eventData.push(obj);
  }

  setTriggerData(prop: Partial<IDialogEventOption>) {
    const obj = Object.assign(
      {
        once: false,
        default: true,
        condition: "",
        id: "",
        type: "",
        priority: 0,
        triggerEvent: "",
      },
      prop
    );
    this.triggerData.push(obj);
  }

  setStoryEvent(name: string, dialog: DialogEventData) {
    this.setStory(name, dialog);
    this.setEvent(name);
  }

  setStory(name: string, dialog: DialogEventData) {
    this.storyDict.set(name, dialog);
  }

  setDialog(key: string, props: IJSDialogEventOption) {
    const opt = this.defaultEventOption(props);
    const { trigger, character, option } = opt;
    // eslint-disable-next-line prefer-const
    let { id, event, dialog } = opt;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id = id === "" ? key : id;
    trigger.id = trigger.id === "" ? key : trigger.id;
    const dialogEvent: Partial<IDialogEventOption> = {
      id,
      character,
      option,
      dialog,
    };
    console.log(`注册剧情:${id}`);
    if (event) {
      switch (typeof event) {
        case "function":
          this.setStory(id, event as DialogEventData);
          dialogEvent.dialog = [`RunDialogEventJavaScript*${event}`];
          break;
        case "string":
          trigger.triggerEvent = event;
          break;
        case "object":
          if (Array.isArray(event)) {
            dialogEvent.dialog = event;
          }
          break;
        default:
          break;
      }
    }
    this.setEventData(dialogEvent);
    const { type, condition } = trigger;
    if (trigger && type.length > 0 && condition.length > 0) {
      console.log(`注册触发器:${trigger.id}`);
      this.setTriggerData(trigger);
    }
  }

  defaultEventOption(option: IJSDialogEventOption) {
    const trigger = Object.assign<
      IDialogTriggerOption,
      Partial<IDialogEventOption>
    >(
      {
        once: false,
        default: true,
        condition: "",
        id: "",
        type: "",
        priority: 0,
        triggerEvent: "",
      },
      option.trigger ?? {}
    );
    option.trigger = trigger;
    return Object.assign<IJSDialogEventOption, Partial<IJSDialogEventOption>>(
      {
        id: "",
        character: {},
        option: [],
        event: "",
        dialog: [],
        trigger: {
          once: false,
          default: true,
          condition: "",
          id: "",
          type: "",
          priority: 0,
          triggerEvent: "",
        },
      },
      option
    );
  }

  toJSArray(args: IList<any>) {
    const params = [];
    for (let i = 0; i < args.Length; i++) {
      params.push(args.get_Item(i));
    }
    return params;
  }

  runDialogEvent(dialog: string, args: IList<any>) {
    const { storyDict, jsDialogEvent } = this;
    console.log(`RunDialogEventJavaScript:${dialog}`);
    let func: DialogEventData | undefined;
    for (const [key, jsDialog] of Object.entries(jsDialogEvent) as [
      string,
      JSDialogEvent
    ][]) {
      const event = jsDialog.runDialog(dialog);
      if (event) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        console.log(`JsDialog:${key} Event:${dialog}`);
        func = event;
        break;
      }
    }
    if (func === null) {
      if (!storyDict.has(dialog)) {
        return;
      }
      func = storyDict.get(dialog);
    }

    const [command, env, callback] = this.toJSArray(args);
    const runner = getRunner(env, command);

    return new Promise<void>((resolve, reject) => {
      try {
        // eslint-disable-next-line no-extra-parens, @typescript-eslint/ban-ts-comment
        //@ts-ignore
        func(runner as Runner, (runner as IRunner).env);
        resolve();
      } catch (error) {
        console.error("JavaScript运行错误 --> " + error);
        reject();
      }
    })
      .then(() => callback?.Invoke())
      .catch(cancelEvent);
  }
}
