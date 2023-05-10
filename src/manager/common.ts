import { Runner, Env } from "mcs-puerts-next";

export type DialogEventData = (
  runner: Runner,
  env: Env
) => Promise<void> | void;
export interface IList<T> {
  get_Item(key: number): T;
  set_Item(key: number, value: T): void;
  Length: number;
}

export interface IDictionary<TKey, TValue> {
  get_Item(key: TKey): TValue;
  set_Item(key: TKey, value: TValue): void;
}
export interface IDialogEventOption {
  id: string;
  character: {
    [prop in string]: number;
  };
  dialog: string[];
  option: string[];
}
export interface IDialogTriggerOption {
  once: boolean;
  default: boolean;
  condition: string;
  id: string;
  type: string;
  priority: number;
  triggerEvent: string;
}
export interface IJSDialogEventOption {
  trigger?: IDialogTriggerOption;
  event: DialogEventData | string | string[];
  id?: string;
  character?: {
    [prop in string]: number;
  };
  dialog?: string[];
  option?: string[];
}
export type JSDialogEventData = {
  [propName in string]: IJSDialogEventOption | DialogEventData;
};
