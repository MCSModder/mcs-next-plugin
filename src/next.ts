/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-var */
import { NextManager, EventRunner, JSDialogEvent } from "./manager";
import {
  DialogEventData,
  IList,
  JSDialogEventData,
  IDialogTriggerOption,
  IDialogEventOption,
} from "./manager/common";
import { utils } from "./utils";
const instance = NextManager.instance;
function runDialogEvent(dialog: string, args: IList<any>) {
  instance.runDialogEvent(dialog, args);
}
function registerEvent(key: string, callback: DialogEventData): void;
function registerEvent(props: JSDialogEvent): void;
function registerEvent(props: JSDialogEventData): void;
function registerEvent(
  props: string | JSDialogEvent | JSDialogEventData,
  callback?: DialogEventData
) {
  if (typeof props === "string") {
    if (!callback) return;
    instance.registerEvent(props, callback);
    return;
  }
  instance.registerEvent(props as any);
}
function clear() {
  instance.clear();
}
const init = {
  NextManager,
  utils,
  instance,
  JSDialogEvent,
  runDialogEvent,
  clear,
  registerEvent,
};
declare global {
  var NEXT: typeof init;
  var MCS: { NEXT: typeof NEXT };
}
export type { IDialogTriggerOption, IDialogEventOption };
//@ts-ignore
var global =
  global ||
  globalThis ||
  (function () {
    //@ts-ignore
    return this;
  })();
global.MCS = global.MCS || {};
global.MCS.NEXT = global.NEXT = init;
