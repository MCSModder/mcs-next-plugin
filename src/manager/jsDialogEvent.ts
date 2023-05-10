import { utils } from "../utils";
import {
  DialogEventData,
  IDialogEventOption,
  IDialogTriggerOption,
  IJSDialogEventOption,
} from "./common";
import NextManager from "./nextManager";
interface IJSDialogEventOpt {
  id: string;
  prefix: string;
}
export default class JSDialogEvent {
  public storyDict = new Map<string, DialogEventData>();
  public triggerData: IDialogTriggerOption[] = [];
  public eventData: IDialogEventOption[] = [];
  public prop: IJSDialogEventOpt;
  constructor(prop: Partial<IJSDialogEventOpt>) {
    this.prop = Object.assign<IJSDialogEventOpt, Partial<IJSDialogEventOpt>>(
      {
        prefix: "",
        id: "",
      },
      prop
    );
  }

  setDialog(key: string, props: IJSDialogEventOption) {
    const opt = this.defaultEventOption(props);
    const { trigger, character, option } = opt;
    // eslint-disable-next-line prefer-const
    let { id, event, dialog } = opt;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id = id === "" ? key : id;
    if (trigger) trigger.id = trigger.id === "" ? key : trigger.id;
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
          if (id) this.setStory(id, event as DialogEventData);
          dialogEvent.dialog = [`RunDialogEventJavaScript*${event}`];
          break;
        case "string":
          if (trigger) trigger.triggerEvent = event;
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
    if (!trigger) return;
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
    ) as IJSDialogEventOption;
  }

  addEvent(name: string, dialog: DialogEventData | IJSDialogEventOption) {
    if (typeof name !== "string") {
      return;
    }
    if (typeof dialog === "function") {
      this.setStoryEvent(name, dialog);
      return;
    }
    if (utils.isObject(dialog)) {
      this.setDialog(name, dialog);
      return;
    }
  }

  setEvent(id: string) {
    this.setEventData({
      id,
      dialog: [`RunDialogEventJavaScript*${id}`],
    });
  }

  setEventData(option: Partial<IDialogEventOption>) {
    const {
      prop: { prefix },
    } = this;
    const opt = Object.assign<IDialogEventOption, Partial<IDialogEventOption>>(
      { id: "", character: {}, dialog: [], option: [] },
      option
    );
    if (!opt.id.startsWith(prefix)) {
      opt.id = prefix + opt.id;
    }

    this.eventData.push(opt);
  }

  setTriggerData(option: Partial<IDialogTriggerOption>) {
    const {
      prop: { prefix },
    } = this;
    const opt = Object.assign(
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
    if (!opt.id.startsWith(prefix)) {
      opt.id = prefix + opt.id;
    }
    this.triggerData.push(opt);
  }

  setStoryEvent(name: string, dialog: DialogEventData) {
    this.setStory(name, dialog);
    this.setEvent(name);
  }

  setStory(name: string, dialog: DialogEventData) {
    this.storyDict.set(name, dialog);
  }

  registerEvent() {
    NextManager.instance.registerEvent(this);
  }

  runDialog(name: string) {
    const { storyDict } = this;
    return storyDict.has(name) ? storyDict.get(name) : null;
  }
}
