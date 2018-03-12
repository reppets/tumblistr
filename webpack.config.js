const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {  
  mode: "developent",
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "tumblistr.user.js"
  },
  devtool: "source-map",
  module: {
    rules: [{
      test: /\.scss$/,
      use: [{
        loader: 'style-loader'
      },{
        loader: 'css-loader'
      },{
        loader: 'sass-loader'
      }]
    }]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: fs.readFileSync('./metadata.js', 'utf-8'),
      raw: true
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: false
    })
  ]
};