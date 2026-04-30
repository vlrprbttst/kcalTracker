const { transformSync } = require('@babel/core');
const crypto = require('crypto');
const fs = require('fs');

const code = fs.readFileSync('app.jsx', 'utf8');
const result = transformSync(code, {
  presets: ['@babel/preset-react'],
  filename: 'app.jsx'
});
fs.writeFileSync('app.js', result.code);

const jsHash = crypto.createHash('sha256').update(result.code).digest('hex').slice(0, 8);
const cssContent = fs.readFileSync('style.css', 'utf8');
const cssHash = crypto.createHash('sha256').update(cssContent).digest('hex').slice(0, 8);
const manifestContent = fs.readFileSync('manifest.json', 'utf8');
const manifestHash = crypto.createHash('sha256').update(manifestContent).digest('hex').slice(0, 8);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/app\.js\?v=[^"]+/, `app.js?v=${jsHash}`);
html = html.replace(/style\.css(?:\?v=[^"]*)?/, `style.css?v=${cssHash}`);
html = html.replace(/manifest\.json(?:\?v=[^"]*)?/, `manifest.json?v=${manifestHash}`);
fs.writeFileSync('index.html', html);

console.log(`Compiled app.jsx -> app.js (${result.code.length} bytes) [v=${jsHash}] css=[v=${cssHash}] manifest=[v=${manifestHash}]`);
