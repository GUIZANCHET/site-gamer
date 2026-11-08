const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { once } = require('node:events');

const root = __dirname;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip'
};

function slugify(str) {
  return str
    .replace(/\.(smc|sfc|zip|cue|bin|iso|chd|pbp)$/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanDisplayTitle(filename) {
  let t = filename
    .replace(/\.(smc|sfc|zip|cue|bin|iso|chd|pbp)$/i, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/_s\b/g, "'s")
    .replace(/N_/g, "N'")
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  t = t.replace(/^([^,-]+),\s*(The|A|An)(\s*-\s*.*)?$/i, (_, main, art, rest) => {
    return `${art} ${main.trim()}${rest || ''}`;
  });
  if (/^donkey kong 2$/i.test(t)) return "Donkey Kong Country 2 - Diddy's Kong Quest";
  if (/^donkey kong country 3$/i.test(t)) return "Donkey Kong Country 3 - Dixie Kong's Double Trouble!";
  return t;
}

function extractRegion(filename) {
  if (/\(BR\)|\[BR\]|portugues|dublado|traduzido|\[T-Port/i.test(filename)) return 'BR';
  if (/\(U\)|\(USA|\(JU\)|\(UE\)/i.test(filename)) return 'USA';
  if (/\(E\)|\(Europe|\(G\)|\(F\)|\(S\)/i.test(filename)) return 'EUR';
  if (/\(J\)|\(Japan/i.test(filename)) return 'JPN';
  if (/\(Beta\)|\(Proto/i.test(filename)) return 'BETA';
  return 'USA';
}

function loadJsonIndex(jsonFile, keyField = 'name') {
  const map = new Map();
  try {
    const filePath = path.join(root, jsonFile);
    if (fs.existsSync(filePath)) {
      const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && item[keyField]) {
            map.set(item[keyField].toLocaleLowerCase('pt-BR'), item);
          }
        }
      }
    }
  } catch {
    // Fallback to dynamic metadata if JSON is being written or missing
  }
  return map;
}

async function scanPs1Directories() {
  const catalogIndex = loadJsonIndex('ps1-games.json', 'name');
  const candidateDirs = [
    path.join(root, 'PlayStation', 'GAMES'),
    path.join(root, 'ps1')
  ];

  // Also include immediate game subdirectories inside ps1/ (skipping ps1/ps1 which is the ePSXe folder)
  try {
    const ps1SubEntries = await fs.promises.readdir(path.join(root, 'ps1'), { withFileTypes: true });
    for (const sub of ps1SubEntries) {
      if (sub.isDirectory() && sub.name.toLowerCase() !== 'ps1') {
        const subPath = path.join(root, 'ps1', sub.name);
        candidateDirs.push(subPath);
        const nested = await fs.promises.readdir(subPath, { withFileTypes: true });
        for (const n of nested) {
          if (n.isDirectory()) candidateDirs.push(path.join(subPath, n.name));
        }
      }
    }
  } catch {
    // Ignore if ps1 dir doesn't exist
  }

  const games = new Map();

  for (const directory of candidateDirs) {
    let entries;
    try {
      entries = await fs.promises.readdir(directory, { withFileTypes: true });
    } catch {
      continue;
    }

    const files = entries.filter(entry => entry.isFile() && /\.(cue|chd|pbp|iso|bin)$/i.test(entry.name));

    // Prefer .bin / .BIN directly so EmulatorJS (pcsx_rearmed) downloads the full disc image over HTTP
    files.sort((a, b) => {
      const priority = name => /\.bin$/i.test(name) ? 0 : /\.(chd|pbp|iso)$/i.test(name) ? 1 : 2;
      return priority(a.name) - priority(b.name) || a.name.localeCompare(b.name, 'pt-BR');
    });

    for (const entry of files) {
      const ext = path.extname(entry.name).toLowerCase();
      const baseName = entry.name.replace(/\.[^.]+$/, '');
      const baseKey = baseName.toLocaleLowerCase('pt-BR');

      // Skip .cue files in the catalog list so the direct .bin / .BIN image is used by EmulatorJS
      if (ext === '.cue') continue;

      if (!games.has(baseKey)) {
        const relative = path.relative(root, path.join(directory, entry.name));
        const encodeSeg = s => encodeURIComponent(s).replace(/\(/g, '%28').replace(/\)/g, '%29');
        const url = '/' + relative.split(path.sep).map(encodeSeg).join('/');
        const existing = catalogIndex.get(baseKey);

        let cover = existing && existing.cover ? existing.cover : null;
        if (!cover) {
          if (baseKey.includes('castlevania')) cover = 'assets/covers/ps1/castlevania-symphony-of-the-night.png';
          else if (baseKey.includes('marvel')) cover = 'assets/covers/ps1/marvel-vs-capcom-clash-of-super-heroes.png';
          else if (baseKey.includes('crash team racing') || baseKey.startsWith('ctr')) cover = 'assets/covers/ps1/ctr-crash-team-racing.png';
          else if (baseKey.includes('donald duck')) cover = 'assets/covers/ps1/donald-duck-goin-quackers.png';
          else if (baseKey.includes('driver 2') && baseKey.includes('disc 1')) cover = 'assets/covers/ps1/driver-2-disc-1.png';
          else if (baseKey.includes('driver 2') && baseKey.includes('disc 2')) cover = 'assets/covers/ps1/driver-2-disc-2.png';
          else if (baseKey.includes('jackie chan')) cover = 'assets/covers/ps1/jackie-chan-stuntmaster.png';
          else if (baseKey.includes('primal rage')) cover = 'assets/covers/ps1/primal-rage.png';
          else if (baseKey.includes('spider 2') || baseKey.includes('spider-man 2')) cover = 'assets/covers/ps1/spider-man-2-enter-electro.png';
          else if (baseKey.includes('vigilante 8') && baseKey.includes('2nd')) cover = 'assets/covers/ps1/vigilante-8-2nd-offensive.png';
          else if (baseKey.includes('vigilante 8')) cover = 'assets/covers/ps1/vigilante-8.png';
          else if (baseKey.includes('police chases')) cover = 'assets/covers/ps1/worlds-scariest-police-chases.png';
          else {
            const slug = slugify(baseName);
            if (fs.existsSync(path.join(root, 'assets', 'covers', 'ps1', `${slug}.png`))) {
              cover = `assets/covers/ps1/${slug}.png`;
            }
          }
        }

        games.set(baseKey, {
          name: baseName,
          title: (existing && existing.title) || cleanDisplayTitle(baseName),
          region: (existing && existing.region) || extractRegion(baseName),
          genre: (existing && existing.genre) || 'Ação / Clássico',
          featured: existing && typeof existing.featured === 'boolean' ? existing.featured : true,
          url,
          cover
        });
      }
    }
  }

  return [...games.values()].sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name, 'pt-BR'));
}

const crc32Table = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  return crc >>> 0;
});

function updateCrc32(crc, buffer) {
  for (const byte of buffer) crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xff];
  return crc >>> 0;
}

async function getCueArchiveFiles(cueFile) {
  const directory = path.dirname(cueFile);
  const cueText = await fs.promises.readFile(cueFile, 'utf8');
  const references = [...cueText.matchAll(/^\s*FILE\s+(?:"([^"]+)"|(\S+))\s+\S+/gim)];
  if (!references.length) return null;

  const files = [{ path: cueFile, name: path.basename(cueFile) }];
  const seen = new Set([path.basename(cueFile).toLocaleLowerCase('pt-BR')]);
  for (const reference of references) {
    const relative = reference[1] || reference[2];
    const target = path.resolve(directory, relative);
    const relativePath = path.relative(directory, target);
    if (path.isAbsolute(relativePath) || relativePath === '..' || relativePath.startsWith(`..${path.sep}`)) return null;
    const name = relativePath.split(path.sep).join('/');
    if (seen.has(name.toLocaleLowerCase('pt-BR'))) continue;
    const stat = await fs.promises.stat(target);
    if (!stat.isFile()) return null;
    files.push({ path: target, name });
    seen.add(name.toLocaleLowerCase('pt-BR'));
  }
  return files;
}

async function writeResponseChunk(res, chunk) {
  if (!res.write(chunk)) await once(res, 'drain');
}

async function streamCueArchive(files, res) {
  const entries = await Promise.all(files.map(async file => ({
    ...file,
    size: (await fs.promises.stat(file.path)).size,
    nameBuffer: Buffer.from(file.name, 'utf8')
  })));
  if (entries.length > 0xffff || entries.some(entry => entry.size > 0xffffffff || entry.nameBuffer.length > 0xffff)) {
    throw new Error('PS1 archive exceeds ZIP format limits.');
  }

  const contentLength = entries.reduce((sum, entry) => sum + 30 + entry.nameBuffer.length + entry.size + 16 + 46 + entry.nameBuffer.length, 22);
  if (contentLength > 0xffffffff) throw new Error('PS1 archive exceeds ZIP format limits.');
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Length': contentLength,
    'Cache-Control': 'no-store'
  });

  let offset = 0;
  const centralEntries = [];
  for (const entry of entries) {
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0808, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0x21, 12);
    localHeader.writeUInt32LE(0, 14);
    localHeader.writeUInt32LE(0, 18);
    localHeader.writeUInt32LE(0, 22);
    localHeader.writeUInt16LE(entry.nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    const localOffset = offset;
    await writeResponseChunk(res, localHeader);
    await writeResponseChunk(res, entry.nameBuffer);
    offset += localHeader.length + entry.nameBuffer.length;

    let crc = 0xffffffff;
    let streamedSize = 0;
    for await (const chunk of fs.createReadStream(entry.path)) {
      crc = updateCrc32(crc, chunk);
      streamedSize += chunk.length;
      await writeResponseChunk(res, chunk);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    if (streamedSize !== entry.size) throw new Error(`PS1 file changed while streaming: ${entry.name}`);
    offset += streamedSize;

    const descriptor = Buffer.alloc(16);
    descriptor.writeUInt32LE(0x08074b50, 0);
    descriptor.writeUInt32LE(crc, 4);
    descriptor.writeUInt32LE(entry.size, 8);
    descriptor.writeUInt32LE(entry.size, 12);
    await writeResponseChunk(res, descriptor);
    offset += descriptor.length;
    centralEntries.push({ ...entry, crc, localOffset });
  }

  const centralOffset = offset;
  for (const entry of centralEntries) {
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0x0808, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt16LE(0x21, 14);
    header.writeUInt32LE(entry.crc, 16);
    header.writeUInt32LE(entry.size, 20);
    header.writeUInt32LE(entry.size, 24);
    header.writeUInt16LE(entry.nameBuffer.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE(0, 38);
    header.writeUInt32LE(entry.localOffset, 42);
    await writeResponseChunk(res, header);
    await writeResponseChunk(res, entry.nameBuffer);
    offset += header.length + entry.nameBuffer.length;
  }

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(offset - centralOffset, 12);
  end.writeUInt32LE(centralOffset, 16);
  end.writeUInt16LE(0, 20);
  res.end(end);
}

function serveStaticFile(file, req, res) {
  fs.stat(file, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      res.writeHead(statErr && statErr.code === 'ENOENT' ? 404 : 500).end('Not found');
      return;
    }

    const contentType = types[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;

    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : stat.size - 1;
        if (start >= stat.size || end >= stat.size || start > end) {
          res.writeHead(416, {
            'Content-Range': `bytes */${stat.size}`,
            'Access-Control-Allow-Origin': '*'
          }).end();
          return;
        }
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Content-Type': contentType,
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
          'Cross-Origin-Resource-Policy': 'cross-origin'
        });
        const rStream = fs.createReadStream(file, { start, end });
        rStream.on('error', () => { if (!res.headersSent) res.writeHead(500); res.end(); });
        res.on('close', () => rStream.destroy());
        rStream.pipe(res);
        return;
      }
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    const stream = fs.createReadStream(file);
    stream.on('error', () => { if (!res.headersSent) res.writeHead(500); res.end(); });
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400'
    }).end();
    return;
  }

  if (pathname === '/api/snes') {
    const gamesDir = path.join(root, 'Super nintendo', 'GAMES');
    fs.readdir(gamesDir, { withFileTypes: true }, (err, entries) => {
      if (err) {
        const fallbackPath = path.join(root, 'snes-games.json');
        if (fs.existsSync(fallbackPath)) {
          serveStaticFile(fallbackPath, req, res);
          return;
        }
        res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'application/json; charset=utf-8' })
          .end(JSON.stringify({ error: 'Não encontrei Super nintendo/GAMES.' }));
        return;
      }
      const catalogIndex = loadJsonIndex('snes-games.json', 'name');
      const games = entries
        .filter(entry => entry.isFile() && /\.(smc|sfc|zip)$/i.test(entry.name))
        .map(entry => {
          const existing = catalogIndex.get(entry.name.toLocaleLowerCase('pt-BR'));
          const slug = slugify(entry.name);
          let cover = existing && existing.cover ? existing.cover : null;
          if (!cover) {
            if (fs.existsSync(path.join(root, 'assets', 'covers', 'snes', `${slug}.png`))) {
              cover = `assets/covers/snes/${slug}.png`;
            } else if (fs.existsSync(path.join(root, 'assets', 'covers', 'snes', `${slug}.svg`))) {
              cover = `assets/covers/snes/${slug}.svg`;
            }
          }
          return {
            name: entry.name,
            title: (existing && existing.title) || cleanDisplayTitle(entry.name),
            region: (existing && existing.region) || extractRegion(entry.name),
            genre: (existing && existing.genre) || 'Ação / Plataforma',
            featured: Boolean(existing && existing.featured),
            url: '/Super%20nintendo/GAMES/' + encodeURIComponent(entry.name),
            cover
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
        .end(JSON.stringify(games));
    });
    return;
  }

  if (pathname === '/api/ps1') {
    (async () => {
      try {
        const result = await scanPs1Directories();
        if (result && result.length) {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
            .end(JSON.stringify(result));
          return;
        }
        throw new Error('Sem jogos locais');
      } catch (err) {
        const fallbackPath = path.join(root, 'ps1-games.json');
        if (fs.existsSync(fallbackPath)) {
          serveStaticFile(fallbackPath, req, res);
          return;
        }
        res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'application/json; charset=utf-8' })
          .end(JSON.stringify({ error: 'Não consegui carregar os jogos de PlayStation.' }));
      }
    })();
    return;
  }

  if (pathname === '/api/neogeo') {
    const gamesDir = path.join(root, 'neogeo');
    fs.readdir(gamesDir, { withFileTypes: true }, (err, entries) => {
      if (err) {
        const fallbackPath = path.join(root, 'neogeo-games.json');
        if (fs.existsSync(fallbackPath)) {
          serveStaticFile(fallbackPath, req, res);
          return;
        }
        res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'application/json; charset=utf-8' })
          .end(JSON.stringify({ error: 'Não encontrei a pasta neogeo.' }));
        return;
      }
      const catalogIndex = loadJsonIndex('neogeo-games.json', 'name');
      const games = entries
        .filter(entry => entry.isFile() && /\.zip$/i.test(entry.name) && entry.name.toLowerCase() !== 'neogeo.zip')
        .map(entry => {
          const existing = catalogIndex.get(entry.name.toLocaleLowerCase('pt-BR'));
          const baseName = entry.name.replace(/\.zip$/i, '');
          let cover = existing && existing.cover ? existing.cover : null;
          if (!cover) {
            if (fs.existsSync(path.join(root, 'assets', 'covers', 'neogeo', `${baseName}.png`))) {
              cover = `assets/covers/neogeo/${baseName}.png`;
            } else if (fs.existsSync(path.join(root, 'assets', 'covers', 'neogeo', `${baseName}.svg`))) {
              cover = `assets/covers/neogeo/${baseName}.svg`;
            }
          }
          return {
            name: entry.name,
            title: (existing && existing.title) || cleanDisplayTitle(entry.name),
            region: (existing && existing.region) || 'Arcade (MVS/AES)',
            genre: (existing && existing.genre) || 'Ação / Fliperama',
            featured: Boolean(existing && existing.featured),
            url: '/neogeo/' + encodeURIComponent(entry.name),
            cover
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
        .end(JSON.stringify(games));
    });
    return;
  }

  if (pathname === '/api/n64') {
    const catalogPath = path.join(root, 'n64-games.json');
    if (fs.existsSync(catalogPath)) {
      serveStaticFile(catalogPath, req, res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
      .end(JSON.stringify({ error: 'Catálogo de Nintendo 64 não encontrado.' }));
    return;
  }

  // Proteção contra DoS de Null Byte (%00)
  if (pathname.includes('\0')) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Bad Request');
    return;
  }

  // Proteção contra exposição de arquivos sensíveis (.env, .git, scripts, node_modules)
  const isBlocked =
    pathname.startsWith('/.') ||
    pathname.includes('/.') ||
    pathname.startsWith('/scripts/') ||
    pathname.startsWith('/node_modules/') ||
    /\.(env|git|cjs|bat|yml|yaml|dockerignore)$/i.test(pathname);

  if (isBlocked) {
    res.writeHead(403, { 'Content-Type': 'text/plain' }).end('Forbidden');
    return;
  }

  let file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!fs.existsSync(file) && fs.existsSync(file + '.html')) {
    file = file + '.html';
  }
  if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  if (/\.cue$/i.test(file)) {
    (async () => {
      try {
        const files = await getCueArchiveFiles(file);
        if (files && files.length > 1) {
          await streamCueArchive(files, res);
          return;
        }
      } catch (err) {
        if (res.headersSent) res.destroy(err);
        else res.writeHead(err.code === 'ENOENT' ? 404 : 500).end('Could not package PS1 disc files.');
        return;
      }
      serveStaticFile(file, req, res);
    })();
    return;
  }

  serveStaticFile(file, req, res);
});

const PORT = process.env.PORT || 4175;
const HOST = process.env.HOST || '0.0.0.0';

server.on('error', err => {
  if (err && err.code === 'EADDRINUSE') {
    console.log(`\n⚠️  A porta ${PORT} já está sendo usada.`);
    console.log(`👉 Você já pode acessar no navegador: http://localhost:${PORT}/\n`);
    process.exit(0);
  }
  console.error(err);
});

server.listen(PORT, HOST, () => {
  console.log(`\n🎮 Arcade Continue? rodando com sucesso!`);
  console.log(`💻 No PC: http://localhost:${PORT}/`);
  try {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal && !name.startsWith('br-') && !name.startsWith('docker')) {
          console.log(`📱 No Celular/Tablet (${name}): http://${net.address}:${PORT}/`);
        }
      }
    }
  } catch {}
  console.log(`⚡ Pressione Ctrl + C para encerrar.\n`);
});

process.on('uncaughtException', err => {
  if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE' || err.code === 'ERR_STREAM_PREMATURE_CLOSE')) return;
  console.error(err);
});
