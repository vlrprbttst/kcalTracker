const { transformSync } = require('@babel/core');
const crypto = require('crypto');
const fs = require('fs');

const code = fs.readFileSync('app.jsx', 'utf8');
const result = transformSync(code, {
  presets: ['@babel/preset-react'],
  filename: 'app.jsx'
});
fs.writeFileSync('app.js', result.code);

const hash = crypto.createHash('sha256').update(result.code).digest('hex').slice(0, 8);
const html = fs.readFileSync('index.html', 'utf8');
const updated = html.replace(/app\.js\?v=[^"]+/, `app.js?v=${hash}`);
fs.writeFileSync('index.html', updated);

console.log(`Compiled app.jsx -> app.js (${result.code.length} bytes) [v=${hash}]`);
