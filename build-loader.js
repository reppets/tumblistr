const fs = require('fs');
const path = require('path');

const additionalLine = '// @require file://'+path.resolve(__dirname, './dist/tumblistr.user.js')+'\n';
const metadata = fs.readFileSync('./metadata.txt', 'utf-8');
const content = metadata.replace(/(.*==\/UserScript==.*)/g, additionalLine+'$1').replace(/(.*@name\s+.*)/g,'$1 loader');
fs.writeFileSync('./dist/tumblistr-loader.user.js', content);
