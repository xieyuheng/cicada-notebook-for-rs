// const path = require ("path");
// const webpack = require ("webpack");
const HtmlWebpackPlugin = require ("html-webpack-plugin");

module.exports = {
  entry: "./src/main.js",
  mode: "development",
  resolve: {
    extensions: [ ".js", ".json", ".wasm" ],
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: ["babel-loader"] },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin ({
      template: "./src/index.html",
    }),
  ],
};
