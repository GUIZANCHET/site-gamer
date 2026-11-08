/**
 * Handler Serverless Consolidado Vercel (1/12 Serverless Functions)
 * Centraliza todas as rotas de API de catálogo JSON e páginas HTML dos emuladores.
 */

// Catálogos JSON
const catalogs = {
  snes: JSON.stringify(require('../snes-games.json')),
  ps1: JSON.stringify(require('../ps1-games.json')),
  neogeo: JSON.stringify(require('../neogeo-games.json')),
  n64: JSON.stringify(require('../n64-games.json')),
  gameboy: JSON.stringify(require('../gameboy-games.json')),
  sega: JSON.stringify(require('../sega-games.json')),
  psp: JSON.stringify(require('../psp-games.json')),
};

// Bundles HTML dos Emuladores
const pages = {
  neogeo: require('../lib/html-bundles/neogeo-html-data.cjs'),
  'neogeo-player': require('../lib/html-bundles/neogeo-player-data.cjs'),
  n64: require('../lib/html-bundles/n64-html-data.cjs'),
  'n64-player': require('../lib/html-bundles/n64-player-data.cjs'),
  psp: require('../lib/html-bundles/psp-html-data.cjs'),
  'psp-player': require('../lib/html-bundles/psp-player-data.cjs'),
  gameboy: require('../lib/html-bundles/gameboy-html-data.cjs'),
  'gameboy-player': require('../lib/html-bundles/gameboy-player-data.cjs'),
  sega: require('../lib/html-bundles/sega-html-data.cjs'),
  'sega-player': require('../lib/html-bundles/sega-player-data.cjs'),
};

const ROUTE_MAP = {
  // APIs de catálogo JSON
  '/api/snes': { type: 'json', body: catalogs.snes },
  '/snes-games.json': { type: 'json', body: catalogs.snes },
  '/api/ps1': { type: 'json', body: catalogs.ps1 },
  '/ps1-games.json': { type: 'json', body: catalogs.ps1 },
  '/api/neogeo': { type: 'json', body: catalogs.neogeo },
  '/neogeo-games.json': { type: 'json', body: catalogs.neogeo },
  '/api/n64': { type: 'json', body: catalogs.n64 },
  '/n64-games.json': { type: 'json', body: catalogs.n64 },
  '/api/gameboy': { type: 'json', body: catalogs.gameboy },
  '/gameboy-games.json': { type: 'json', body: catalogs.gameboy },
  '/api/sega': { type: 'json', body: catalogs.sega },
  '/sega-games.json': { type: 'json', body: catalogs.sega },
  '/api/psp': { type: 'json', body: catalogs.psp },
  '/psp-games.json': { type: 'json', body: catalogs.psp },

  // Páginas de catálogo HTML
  '/neogeo': { type: 'html', body: pages.neogeo },
  '/neogeo.html': { type: 'html', body: pages.neogeo },
  '/n64': { type: 'html', body: pages.n64 },
  '/n64.html': { type: 'html', body: pages.n64 },
  '/psp': { type: 'html', body: pages.psp },
  '/psp.html': { type: 'html', body: pages.psp },
  '/gameboy': { type: 'html', body: pages.gameboy },
  '/gameboy.html': { type: 'html', body: pages.gameboy },
  '/sega': { type: 'html', body: pages.sega },
  '/sega.html': { type: 'html', body: pages.sega },

  // Páginas de player HTML
  '/neogeo-player': { type: 'html', body: pages['neogeo-player'] },
  '/neogeo-player.html': { type: 'html', body: pages['neogeo-player'] },
  '/n64-player': { type: 'html', body: pages['n64-player'] },
  '/n64-player.html': { type: 'html', body: pages['n64-player'] },
  '/psp-player': { type: 'html', body: pages['psp-player'] },
  '/psp-player.html': { type: 'html', body: pages['psp-player'] },
  '/gameboy-player': { type: 'html', body: pages['gameboy-player'] },
  '/gameboy-player.html': { type: 'html', body: pages['gameboy-player'] },
  '/sega-player': { type: 'html', body: pages['sega-player'] },
  '/sega-player.html': { type: 'html', body: pages['sega-player'] },

  // Status / Gateway Info
  '/': { type: 'json', body: JSON.stringify({ status: 'ok', service: 'Arcade Continue Serverless Gateway' }) },
  '/api': { type: 'json', body: JSON.stringify({ status: 'ok', service: 'Arcade Continue Serverless Gateway' }) },
  '/api/index': { type: 'json', body: JSON.stringify({ status: 'ok', service: 'Arcade Continue Serverless Gateway' }) },
  '/api/index.js': { type: 'json', body: JSON.stringify({ status: 'ok', service: 'Arcade Continue Serverless Gateway' }) },
};

function normalizePath(val) {
  if (!val || typeof val !== 'string') return '';
  let p = val.split('?')[0].trim().toLowerCase();
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

function resolveRoute(req) {
  const candidates = [];

  // 1. Query parameter ?route=... ou ?path=...
  if (req.query) {
    if (req.query.route) candidates.push(req.query.route);
    if (req.query.path) candidates.push(req.query.path);
  }

  // 2. Query param extraído de req.url
  if (req.url && req.url.includes('?')) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      if (parsed.searchParams.has('route')) candidates.push(parsed.searchParams.get('route'));
      if (parsed.searchParams.has('path')) candidates.push(parsed.searchParams.get('path'));
    } catch (_) {}
  }

  // 3. Cabeçalhos de rewrite da Vercel
  if (req.headers) {
    if (req.headers['x-matched-path']) candidates.push(req.headers['x-matched-path']);
    if (req.headers['x-now-route-matches']) candidates.push(req.headers['x-now-route-matches']);
    if (req.headers['x-rewrite-url']) candidates.push(req.headers['x-rewrite-url']);
  }

  // 4. Pathname de req.url
  if (req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      candidates.push(parsed.pathname);
    } catch (_) {
      candidates.push(req.url.split('?')[0]);
    }
  }

  // Encontra primeiro candidato que existe no ROUTE_MAP
  for (const c of candidates) {
    const normalized = normalizePath(c);
    if (normalized && ROUTE_MAP[normalized]) {
      return normalized;
    }
  }

  // Fallback para primeiro candidato normalizado
  for (const c of candidates) {
    const normalized = normalizePath(c);
    if (normalized) return normalized;
  }

  return '/api';
}

module.exports = (req, res) => {
  // Cabeçalhos globais obrigatórios para isolamento cross-origin e cache
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const targetPath = resolveRoute(req);
  const route = ROUTE_MAP[targetPath];

  if (!route) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Not Found', path: targetPath }));
    return;
  }

  if (route.type === 'html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  } else {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }

  if (req.method === 'HEAD') {
    res.statusCode = 200;
    res.end();
    return;
  }

  res.statusCode = 200;
  res.end(route.body);
};
