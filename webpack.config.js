const path = require('path');
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
      banner:
        '// ==UserScript==\n'+
        '// @name tumblr-client\n'+
        '// @namespace reppets.net\n'+
        '// @version 0.0.1\n'+
        '// @include //reppets.net/tumblistr.html\n'+
        '// @require https://cdn.rawgit.com/ddo/oauth-1.0a/91557b7ef8c38dad6a22f9471a5d0dc216a1afd4/oauth-1.0a.js\n'+
        '// @require https://cdn.rawgit.com/dmauro/Keypress/2.1.3/keypress-2.1.3.min.js\n'+
        '// @require https://greasyfork.org/scripts/29810-tumblr-lib-gm/code/tumblr-lib-gm.js?version=211271\n'+
        '// @require https://jp.vuejs.org/js/vue.js\n'+
        '// @require https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js\n'+
        '// @grant GM_xmlhttpRequest\n'+
        '// @grant GM_deleteValue\n'+
        '// @grant GM_getValue\n'+
        '// @grant GM_listValues\n'+
        '// @grant GM_setValue\n'+
        '// ==/UserScript==\n',
      raw: true
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: false
    })
  ]
};