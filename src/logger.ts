/* eslint-disable multiline-comment-style */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createReadStream, statSync, stat, ReadStream } from "node:fs";
//@ts-ignore
import destr from "destr";
//@ts-ignore
import { createConsola } from "consola/core";
import split from "split2";
// const cholk = Cholk();
const consola = createConsola({
  reporters: [
    {
      log: (logObj) => {
        //@ts-ignore
        const cs = console.console_org ? console.console_org : console;
        cs(destr(logObj));
      },
    },
  ],
});
const Level = {
  Log: "log",
};
interface LogInfo {
  option: {
    LogLevelName: string;
    LevelLog: string;
    SourceName: string;
    Data: string;
  };
}
class LogInfo {
  static create(input: string) {
    return new LogInfo(input);
  }

  static print(input: string) {
    if (!input) return;
    return new LogInfo(input).print();
  }

  constructor(input: string) {
    if (typeof input !== "string") return;
    const result = destr(input);
    this.option = Object.assign(
      {
        LogLevelName: "Info",
        LevelLog: Level.Log,
        SourceName: "",
        Data: "",
      },
      result
    );
  }

  print() {
    const {
      option: { LevelLog, SourceName, Data, LogLevelName },
    } = this;
    consola.log(Data);
    // const cs = console.console_org ? console.console_org : console;
    // const data = `[${SourceName}] ${Data}`;
    // const log = LOGGER[LogLevelName]
    //   ? LOGGER[LogLevelName](data)
    //   : `[${LogLevelName}]${data}`;
    // if (typeof log === "string") {
    //   cs[LevelLog](log);
    // } else {
    //   cs[LevelLog](...log);
    // }
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
    //const that = this;
    this.time = setInterval(() => {
      if (!this.loading) {
        this.loading = true;
        stat(path, (err, stat) => {
          if (err) return console.error(err);
          if (this.startPos === stat.size) {
            this.loading = false;
          } else {
            this.loading = true;
            this.createReadline(stat.size);
          }
        });
      }
    }, 500);
    // this.chokidar = chokidar.watch(path);
    // this.chokidar.on("all", (eventName, path, stats) => {
    //   LogInfo.print({
    //     Data: `eventName:${eventName} 路径:${path} loading:${that.loading}`,
    //   });
    //   if (!that.loading && stats?.size != that.startPos) {
    //     that.createReadline();
    //   }
    // });
  }

  createReadline(size: number) {
    // LogInfo.print({
    //   Data: `开始新读取`,
    // });
    const { path } = this;
    this.loading = true;
    // LogInfo.print({
    //   Data: `start:${this.startPos} end:${size}`,
    // });
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

    input
      .pipe(split())
      .on("data", (input: string) => {
        this.line += input;
        if (this.line.startsWith("{") && this.line.endsWith("}")) {
          LogInfo.print(this.line);
          this.line = "";
        }
      })
      .on("end", () => {
        // LogInfo.print({
        //   Data: `已经读取完毕:${path}`,
        // });
        this.loading = false;
        const newSize = statSync(path)?.size;
        if (newSize !== size) {
          this.loading = true;
          this.createReadline(newSize);
        }
      })
      .on("close", () => {
        // LogInfo.print({
        //   Data: `开始关闭:${path}`,
        // });
      });
  }
}
export default function (path: string) {
  Logger.create(path);
}
