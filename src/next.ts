/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-var */
import { NextManager } from "./manager";
import { RunEvent } from "./eventRunner";
declare global {
  var NEXT: {
    NextManager: NextManager;
    RunEvent: typeof RunEvent;
  };
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
global.MCS.NEXT = global.NEXT = { NextManager, RunEvent };
