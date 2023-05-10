/* eslint-disable multiline-comment-style */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createReadStream, statSync, stat, ReadStream } from "node:fs";
//@ts-ignore
import destr from "destr";
import split from "split2";
import Cholk from "web-cholk";
// const cholk = Cholk();

const cholk = Cholk();
type TLogger = { [props in LogLevelName]: (text: string) => any };
const LOGGER: TLogger = {
  Info(text: string) {
    return cholk.green("[Info]").nil(text);
  },
  Debug(text: string) {
    return cholk.cyan("[Debug]").nil(text);
  },
  None(text: string) {
    return cholk.green("[Info]").nil(text);
  },
  All(text: string) {
    return `[ALL]${text}`;
  },
  Message: function (text: string) {
    return cholk.green("[Message]").nil(text);
  },
  Warning: function (text: string) {
    return cholk.yellow("[Warning]").nil(text);
  },
  Error: function (text: string) {
    return cholk.red("[Error]").nil(text);
  },
  Fatal: function (text: string) {
    return cholk.yellow("[Fatal]").nil(text);
  },
};
type PuertsLogLevelName = "info" | "log" | "warn" | "debug" | "error";
enum PuertsLogLevel {
  Log = 0,
  Info = 1,
  Debug = 2,
  Warn = 4,
  Error = 8,
}
enum LogLevel {
  None = 0,
  Fatal = 1,
  Error = 2,
  Warning = 4,
  Message = 8,
  Info = 16, // 0x00000010
  Debug = 32, // 0x00000020
  All = Debug | Info | Message | Warning | Error | Fatal, // 0x0000003F
}
type LogLevelName =
  | "Debug"
  | "Info"
  | "Message"
  | "Warning"
  | "Error"
  | "Fatal"
  | "All"
  | "None";
interface LogInfoOption {
  PuertsLogLevelName: PuertsLogLevelName;
  PuertsLogLevel: PuertsLogLevel;
  LogLevelName: LogLevelName;
  LevelLog: LogLevel;
  SourceName: string;
  Data: string;
}
class LogInfo {
  private static _inst: LogInfo;
  public static get instance() {
    this._inst ??= new this("");
    return this._inst;
  }

  public static create(input: string) {
    return new LogInfo(input);
  }

  public static print(input: string) {
    if (!input) return;
    return LogInfo.instance.setLog(input).print();
  }

  public option: LogInfoOption = {
    PuertsLogLevelName: "info",
    PuertsLogLevel: PuertsLogLevel.Info,
    LevelLog: LogLevel.Info,
    SourceName: "",
    Data: "",
    LogLevelName: "Info",
  };

  constructor(input: string) {
    this.setLog(input);
  }

  setLog(input: string) {
    if (typeof input !== "string") return this;
    const result = destr(input);
    this.option = Object.assign<LogInfoOption, Partial<LogInfoOption>>(
      {
        PuertsLogLevelName: "info",
        PuertsLogLevel: PuertsLogLevel.Info,
        LevelLog: LogLevel.Info,
        LogLevelName: "Info",
        SourceName: "",
        Data: "",
      },
      result
    );
    return this;
  }

  print() {
    const {
      option: { LevelLog, SourceName, Data, PuertsLogLevelName, LogLevelName },
    } = this;
    //@ts-ignore
    const cs = console.console_org ? console.console_org : console;
    const data = `[${SourceName}] ${Data}`;
    const log =
      LogLevelName in LOGGER
        ? LOGGER[LogLevelName](data)
        : `[${LogLevelName}]${data}`;
    if (typeof log === "string") {
      cs[PuertsLogLevelName](log);
    } else {
      cs[PuertsLogLevelName](...log);
    }
  }
}

interface Logger {
  startPos: number;
  loading: boolean;
  line: string;
  time: NodeJS.Timer;
  currentReadStream: ReadStream;
}
class Logger {
  static create(path: string) {
    return new Logger(path);
  }

  constructor(public path: string) {
    this.startPos = 0;
    this.loading = true;
    this.line = "";
    const size = statSync(path).size;
    this.createReadline(size);
    //@ts-ignorethat
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.time = setInterval(() => {
      if (!that.loading) {
        that.loading = true;
        stat(path, (err, stat) => {
          if (err) return console.error(err);
          if (that.startPos === stat.size) {
            that.loading = false;
          } else {
            that.loading = true;
            that.createReadline(stat.size);
          }
        });
      }
    }, 500);
  }

  createReadline(size: number) {
    const { path } = this;
    this.loading = true;
    if (this.startPos === size) {
      this.loading = false;
      return;
    }
    const input = createReadStream(path, {
      start: this.startPos,
      end: size - 1,
      autoClose: true,
    });
    this.startPos = size;
    this.currentReadStream = input;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    input
      .pipe(split())
      .on("data", (input: string) => {
        that.line += input;
        if (that.line.startsWith("{") && that.line.endsWith("}")) {
          LogInfo.print(that.line);
          that.line = "";
        }
      })
      .on("close", () => {
        // LogInfo.print({
        //   Data: `已经读取完毕:${path}`,
        // });
        that.loading = false;
        const newSize = statSync(path)?.size;
        if (newSize !== size) {
          that.loading = true;
          that.createReadline(newSize);
        }
      });
  }
}
export function createLogger(path: string) {
  Logger.create(path);
}
