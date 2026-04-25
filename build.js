const { transformSync } = require('@babel/core');
const fs = require('fs');
const code = fs.readFileSync('app.jsx', 'utf8');
const result = transformSync(code, {
  presets: ['@babel/preset-react'],
  filename: 'app.jsx'
});
fs.writeFileSync('app.js', result.code);
console.log('Compiled app.jsx -> app.js (' + result.code.length + ' bytes)');
