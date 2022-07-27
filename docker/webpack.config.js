const path = require("path");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");

module.exports = (_env, { mode = "production" }) => {
  return {
    mode,
    target: "node",
    entry: path.join(__dirname, "../lib/server.js"),
    output: {
      path: __dirname,
      filename: "bundle.js",
    },
    plugins: [new SimpleProgressWebpackPlugin()],
    optimization: {
      minimize: false,
    },
  };
};
