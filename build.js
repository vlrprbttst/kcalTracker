const esbuild = require('esbuild');
const crypto = require('crypto');
const fs = require('fs');

esbuild.buildSync({
  entryPoints: ['src/app.jsx'],
  bundle: true,
  format: 'iife',
  outfile: 'app.js',
  loader: { '.jsx': 'jsx' },
  jsx: 'transform',
  logLevel: 'info',
});

const jsCode = fs.readFileSync('app.js', 'utf8');
const jsHash = crypto.createHash('sha256').update(jsCode).digest('hex').slice(0, 8);
const cssContent = fs.readFileSync('style.css', 'utf8');
const cssHash = crypto.createHash('sha256').update(cssContent).digest('hex').slice(0, 8);
const manifestContent = fs.readFileSync('manifest.json', 'utf8');
const manifestHash = crypto.createHash('sha256').update(manifestContent).digest('hex').slice(0, 8);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/app\.js\?v=[^"]+/, `app.js?v=${jsHash}`);
html = html.replace(/style\.css(?:\?v=[^"]*)?/, `style.css?v=${cssHash}`);
html = html.replace(/manifest\.json(?:\?v=[^"]*)?/, `manifest.json?v=${manifestHash}`);
fs.writeFileSync('index.html', html);

console.log(`Bundled src/app.jsx -> app.js (${jsCode.length} bytes) [v=${jsHash}] css=[v=${cssHash}] manifest=[v=${manifestHash}]`);
