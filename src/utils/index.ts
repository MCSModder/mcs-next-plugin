import {
  IDictionary,
  IList,
  IDialogEventOption,
  IDialogTriggerOption,
} from "../manager/common";
const { SkySwordKill, System } = CS;

const { DialogSystem } = SkySwordKill.Next;
const { DialogAnalysis, DialogTriggerData, DialogEventData } = DialogSystem;
export const utils = {
  createOption(...arg: string[]) {
    return arg.map((value, i) => `${i + 1}:${value}`);
  },
  CreateArrayLength<T>(type: T, length: number): IList<T> {
    return System.Array.CreateInstance(puer.$typeof(type), length);
  },
  startDialogEvent(dialogEvent: string, env = null) {
    DialogAnalysis.StartDialogEvent(dialogEvent, env);
  },
  startTestDialogEvent(commandText: string, env = null) {
    DialogAnalysis.StartTestDialogEvent(commandText, env);
  },
  runDialogEventJS(id: string, env = null) {
    DialogAnalysis.StartTestDialogEvent(`RunDialogEventJavaScript*${id}`, env);
  },
  setDialogTrigger(option: Partial<IDialogTriggerOption>) {
    const dialogTrigger = new DialogTrigger(option);
    DialogAnalysis.DialogTriggerDataDic.set_Item(
      dialogTrigger.ID,
      dialogTrigger
    );
    return dialogTrigger;
  },
  setDialogTriggerList(...options: Partial<IDialogTriggerOption>[]) {
    return options.map(this.setDialogTrigger);
  },
  setDialogEventList(...options: Partial<IDialogEventOption>[]) {
    return options.map(this.setDialogEvent);
  },
  setDialogEvent(option: Partial<IDialogEventOption>) {
    const dialogEvent = new DialogEvent(option);
    DialogAnalysis.DialogDataDic.set_Item(dialogEvent.ID, dialogEvent);
    return dialogEvent;
  },
  isObject(obj: any) {
    return Object.prototype.toString.call(obj) === "[object Object]";
  },
};

interface DialogEvent {
  ID: string;
  Character: IDictionary<string, number>;
  Dialog: IList<string>;
  Option: IList<string>;
}

class DialogEvent extends DialogEventData {
  constructor(props: Partial<IDialogEventOption>) {
    super();
    const { id, character, dialog, option } = Object.assign(
      {
        id: "",
        character: {},
        dialog: [],
        option: [],
      },
      props
    );
    this.ID = id;
    const dict = puer.$generic(
      System.Collections.Generic.Dictionary$2,
      System.String,
      System.Int32
    );
    this.Character = new dict();
    for (const [key, value] of Object.entries<number>(character)) {
      this.Character.set_Item(key, value);
    }
    this.Dialog = utils.CreateArrayLength(System.String, dialog.length);
    this.Option = utils.CreateArrayLength(System.String, option.length);
    dialog.forEach((value, i) => {
      // console.log(`index:${i} value:${value}`);
      this.Dialog.set_Item(i, value);
    });
    option.forEach((value, i) => {
      // console.log(`index:${i} value:${value}`);
      this.Option.set_Item(i, value);
    });
  }
}

export class DialogTrigger extends DialogTriggerData {
  ID: string;
  Condition: string;
  Default: boolean;
  Type: string;
  Priority: number;
  TriggerEvent: string;
  Once: boolean;
  constructor(option: Partial<IDialogTriggerOption>) {
    super();
    const {
      condition,
      id,
      default: def,
      priority,
      type,
      triggerEvent,
      once,
    } = Object.assign(
      {
        once: false,
        default: true,
        condition: "",
        id: "",
        type: "",
        priority: 0,
        triggerEvent: "",
      },
      option
    );
    this.Condition = condition;
    this.ID = id;
    this.Default = def;
    this.Priority = priority;
    this.Type = type;
    this.TriggerEvent = triggerEvent;
    this.Once = once;
  }
}
