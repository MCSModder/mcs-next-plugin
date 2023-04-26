/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */
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
      type: "commonjs",
    },
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
          target: "es2016",
          // JavaScript version to compile to
          format: "cjs",
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  externals: [
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
  ].reduce((prev, v) => {
    // @ts-ignore
    prev[v] = "commonjs " + v;
    return prev;
  }, {}),
};
