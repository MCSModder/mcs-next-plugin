/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-var */
import { NextManager, EventRunner, JSDialogEvent } from "./manager";
import { DialogEventData, IList, JSDialogEventData } from "./manager/common";
import { utils } from "./utils";
function init() {
  const instance = NextManager.instance;
  function runDialogEvent(dialog: string, args: IList<any>) {
    instance.runDialogEvent(dialog, args);
  }
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
  return {
    NextManager,
    utils,
    instance,
    JSDialogEvent,
    runDialogEvent,
    clear,
    registerEvent,
  };
}
declare global {
  var NEXT: {
    NextManager: typeof NextManager;
    utils: typeof utils;
    instance: typeof NextManager;
    JSDialogEvent: typeof JSDialogEvent;
    runDialogEvent: (dialog: string, args: IList<any>) => void;
    clear: () => void;
    registerEvent(
      props: string | JSDialogEvent | JSDialogEventData,
      callback?: DialogEventData
    ): void;
  };
  var MCS: { NEXT: typeof NEXT };
}

//@ts-ignore
var global =
  global ||
  globalThis ||
  (function () {
    //@ts-ignore
    return this;
  })();
global.MCS = global.MCS || {};
global.MCS.NEXT = global.NEXT = init();
