const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {  
  mode: "developent",
  entry: "./src/app.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "tumblistr.user.js"
  },
  devtool: "source-map",
  plugins: [
    new webpack.BannerPlugin({
      banner: fs.readFileSync('./metadata.txt', 'utf-8'),
      raw: true
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: false
    })
  ]
};