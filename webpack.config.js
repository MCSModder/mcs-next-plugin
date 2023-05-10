/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */
const externals = {};
[
  "fs",
  "crypto",
  "dns",
  "http",
  "http2",
  "https",
  "net",
  "os",
  "path",
  "querystring",
  "stream",
  "repl",
  "readline",
  "tls",
  "dgram",
  "url",
  "v8",
  "vm",
  "zlib",
  "util",
  "assert",
  "events",
  "tty",
  "fsevents",
  "module",
].reduce((prev, v) => {
  // @ts-ignore
  prev[v] = "commonjs " + v;
  return prev;
}, externals);
["CS", "MCS", "NEXT", "puer", "puerts"].reduce((prev, v) => {
  // @ts-ignore
  prev[v] = "global " + v;
  return prev;
}, externals);
module.exports = {
  mode: "production",

  target: "node16",
  entry: {
    next: "./src/next.ts",
    logger: "./src/logger.ts",
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist",
    library: {
      name: "PuertsNext",
      type: "commonjs-module",
    },
    iife: true,
  },
  experiments: { outputModule: false },
  optimization: { minimize: false },
  module: {
    rules: [
      {
        // Match js, jsx, ts & tsx files
        test: /\.[jt]sx?$/,
        loader: "esbuild-loader",
        options: {
          target: "node16",
          // JavaScript version to compile to
          format: "iife",
          minify: false,
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  externals,
};
