const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../neogeo-player.html');
let cachedHtml = '';
try {
  cachedHtml = fs.readFileSync(filePath, 'utf8');
} catch (e) {
  console.error('Falha ao ler neogeo-player.html:', e);
}

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method === 'HEAD') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const content = cachedHtml || fs.readFileSync(filePath, 'utf8');
  res.statusCode = 200;
  res.end(content);
};
