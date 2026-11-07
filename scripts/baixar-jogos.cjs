#!/usr/bin/env node

/**
 * Arcade Continue? — Baixador e Sincronizador de Jogos (ROMs)
 * 
 * Permite que colaboradores (como o Leonardo) baixem os jogos para o projeto:
 * 1. Sincronização direta via IP local / Wi-Fi / Tailscale (P2P entre PCs)
 * 2. Download via Google Drive (Link compartilhado ou ID)
 * 3. Download via URL direta (.zip)
 * 4. Gerador de pacotes .zip para envio
 */

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');
const readline = require('node:readline');
const { execSync, spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');

// Pastas de destino oficiais
const DIRS = {
  snes: path.join(root, 'Super nintendo', 'GAMES'),
  ps1: path.join(root, 'ps1'),
  playstation: path.join(root, 'PlayStation', 'GAMES'),
  neogeo: path.join(root, 'neogeo'),
  temp: path.join(root, '.temp-downloads')
};

// Garante que as pastas básicas existam
for (const dir of Object.values(DIRS)) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Utilitário de formatação de tamanho
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// Conta jogos instalados localmente
function countLocalGames() {
  let snesCount = 0;
  let ps1Count = 0;

  if (fs.existsSync(DIRS.snes)) {
    try {
      const files = fs.readdirSync(DIRS.snes);
      snesCount = files.filter(f => /\.(smc|sfc|zip)$/i.test(f)).length;
    } catch {}
  }

  if (fs.existsSync(DIRS.ps1)) {
    try {
      const files = fs.readdirSync(DIRS.ps1);
      ps1Count = files.filter(f => /\.(bin|iso|cue|chd|pbp)$/i.test(f)).length;
    } catch {}
  }

  let neogeoCount = 0;
  if (fs.existsSync(DIRS.neogeo)) {
    try {
      const files = fs.readdirSync(DIRS.neogeo);
      neogeoCount = files.filter(f => f.toLowerCase() !== 'neogeo.zip' && /\.zip$/i.test(f)).length;
    } catch {}
  }

  return { snesCount, ps1Count, neogeoCount };
}

// Cria interface readline para perguntas interativas
function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Barra de progresso no terminal
function renderProgressBar(downloaded, total, startTime) {
  const width = 30;
  const ratio = total > 0 ? Math.min(downloaded / total, 1) : 0;
  const filled = Math.round(width * ratio);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  const percent = total > 0 ? (ratio * 100).toFixed(1) : '??';

  const elapsedSec = (Date.now() - startTime) / 1000;
  const speed = elapsedSec > 0 ? downloaded / elapsedSec : 0;

  process.stdout.write(`\r  [${bar}] ${percent}% | ${formatBytes(downloaded)} / ${formatBytes(total)} | ${formatBytes(speed)}/s   `);
}

// Download com streaming e suporte a redirects (HTTP/HTTPS)
function downloadFile(url, destPath, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;

    const req = client.get(url, { headers: { 'User-Agent': 'Continue-Arcade-Downloader/1.0', ...customHeaders } }, res => {
      // Trata redirecionamentos 301, 302, 303, 307
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
          const u = new URL(url);
          redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
        }
        return downloadFile(redirectUrl, destPath, customHeaders).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200 && res.statusCode !== 206) {
        return reject(new Error(`Servidor respondeu com HTTP ${res.statusCode}: ${res.statusMessage}`));
      }

      const total = parseInt(res.headers['content-length'] || '0', 10);
      let downloaded = 0;
      const startTime = Date.now();

      const fileStream = fs.createWriteStream(destPath);

      res.on('data', chunk => {
        downloaded += chunk.length;
        fileStream.write(chunk);
        renderProgressBar(downloaded, total, startTime);
      });

      res.on('end', () => {
        fileStream.end();
        console.log('\n  ✅ Download concluído!');
        resolve({ destPath, total: downloaded });
      });

      res.on('error', err => {
        fileStream.destroy();
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });

    req.on('error', err => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// Descompactador de .zip universal (usa unzip no Linux/macOS ou PowerShell no Windows)
function extractZip(zipFilePath, targetDir) {
  console.log(`\n📦 Extraindo ${path.basename(zipFilePath)} em ${targetDir}...`);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const isWin = process.platform === 'win32';
  try {
    if (isWin) {
      execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Force -Path '${zipFilePath}' -DestinationPath '${targetDir}'"`, { stdio: 'inherit' });
    } else {
      execSync(`unzip -q -o "${zipFilePath}" -d "${targetDir}"`, { stdio: 'inherit' });
    }
    console.log(`✨ Extração finalizada com sucesso!`);
    return true;
  } catch (err) {
    console.error(`❌ Erro ao extrair arquivo ZIP: ${err.message}`);
    console.log(`👉 Você pode extrair manualmente o arquivo '${zipFilePath}' para '${targetDir}'.`);
    return false;
  }
}

// Download de arquivo do Google Drive
async function downloadFromGoogleDrive(driveInput, targetDir) {
  // Extrai ID do arquivo se for um link
  let fileId = driveInput.trim();
  const idMatch = driveInput.match(/[-\w]{25,}/);
  if (idMatch) fileId = idMatch[0];

  console.log(`\n🔍 Identificador do Google Drive: ${fileId}`);
  const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  // Primeira requisição para pegar cookies e checar aviso de vírus de arquivos grandes (>100MB)
  return new Promise((resolve, reject) => {
    https.get(initialUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let body = '';
      const cookies = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');

      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Redirecionamento direto para download
        const dest = path.join(DIRS.temp, `gdrive-${fileId}.zip`);
        return downloadFile(res.headers.location, dest).then(result => {
          extractZip(dest, targetDir);
          resolve();
        }).catch(reject);
      }

      res.on('data', chunk => { body += chunk; });
      res.on('end', async () => {
        // Verifica se há token de confirmação de arquivo grande
        const confirmMatch = body.match(/confirm=([0-9A-Za-z_]+)/) || body.match(/name="confirm" value="([0-9A-Za-z_]+)"/);
        const confirmCode = confirmMatch ? confirmMatch[1] : '';

        let downloadUrl = `https://drive.google.com/uc?export=download&confirm=${confirmCode}&id=${fileId}`;
        const dest = path.join(DIRS.temp, `gdrive-${fileId}.zip`);

        console.log(`⬇️  Iniciando download do Google Drive...`);
        try {
          await downloadFile(downloadUrl, dest, { Cookie: cookies });
          extractZip(dest, targetDir);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Sincronização direta de máquina para máquina (P2P / LAN / Tailscale)
async function syncFromPeer(peerUrl) {
  let baseUrl = peerUrl.trim().replace(/\/+$/, '');
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = 'http://' + baseUrl;
  }

  console.log(`\n🌐 Conectando ao computador de origem: ${baseUrl}...`);

  // 1. Obtém catálogo de SNES
  let snesGames = [];
  try {
    const res = await fetch(`${baseUrl}/api/snes`);
    if (res.ok) {
      snesGames = await res.json();
      console.log(`🎮 Encontrados ${snesGames.length} jogos de Super Nintendo no host.`);
    }
  } catch (err) {
    console.log(`⚠️  Não foi possível listar /api/snes: ${err.message}`);
  }

  // 2. Obtém catálogo de PS1
  let ps1Games = [];
  try {
    const res = await fetch(`${baseUrl}/api/ps1`);
    if (res.ok) {
      ps1Games = await res.json();
      console.log(`💿 Encontrados ${ps1Games.length} jogos de PlayStation no host.`);
    }
  } catch (err) {
    console.log(`⚠️  Não foi possível listar /api/ps1: ${err.message}`);
  }

  // 3. Obtém catálogo de Neo Geo
  let neogeoGames = [];
  try {
    const res = await fetch(`${baseUrl}/api/neogeo`);
    if (res.ok) {
      neogeoGames = await res.json();
      console.log(`🕹️  Encontrados ${neogeoGames.length} jogos de Neo Geo no host.`);
    }
  } catch (err) {
    console.log(`⚠️  Não foi possível listar /api/neogeo: ${err.message}`);
  }

  if (snesGames.length === 0 && ps1Games.length === 0 && neogeoGames.length === 0) {
    console.log(`❌ Nenhum jogo encontrado no servidor ${baseUrl}. Verifique se o servidor está rodando ('npm run dev').`);
    return;
  }

  console.log(`\nEscolha o que deseja baixar:`);
  console.log(`[1] Todos os consoles (SNES + PS1 + Neo Geo)`);
  console.log(`[2] Apenas jogos de Super Nintendo (${snesGames.length} jogos)`);
  console.log(`[3] Apenas jogos de PlayStation (${ps1Games.length} jogos)`);
  console.log(`[4] Apenas jogos de Neo Geo Arcade (${neogeoGames.length} jogos)`);
  console.log(`[0] Cancelar`);

  const choice = await ask('\nOpção (padrão [1]): ') || '1';

  let toDownload = [];
  if (choice === '1') {
    toDownload = [
      ...snesGames.map(g => ({ ...g, type: 'snes' })),
      ...ps1Games.map(g => ({ ...g, type: 'ps1' })),
      ...neogeoGames.map(g => ({ ...g, type: 'neogeo' }))
    ];
  } else if (choice === '2') {
    toDownload = snesGames.map(g => ({ ...g, type: 'snes' }));
  } else if (choice === '3') {
    toDownload = ps1Games.map(g => ({ ...g, type: 'ps1' }));
  } else if (choice === '4') {
    toDownload = neogeoGames.map(g => ({ ...g, type: 'neogeo' }));
  } else {
    console.log('Operação cancelada.');
    return;
  }

  // Se tem jogo de Neo Geo, garante download da BIOS neogeo.zip
  if (toDownload.some(item => item.type === 'neogeo')) {
    const biosDest = path.join(DIRS.neogeo, 'neogeo.zip');
    if (!fs.existsSync(biosDest)) {
      console.log(`\n⚡ Baixando BIOS essencial do Neo Geo (neogeo.zip)...`);
      try {
        await downloadFile(`${baseUrl}/neogeo/neogeo.zip`, biosDest);
      } catch (err) {
        console.warn(`  ⚠️  Aviso ao baixar BIOS: ${err.message}`);
      }
    }
  }

  console.log(`\n🚀 Iniciando download de ${toDownload.length} arquivos...`);

  for (let i = 0; i < toDownload.length; i++) {
    const item = toDownload[i];
    let targetDir = DIRS.snes;
    if (item.type === 'ps1') targetDir = DIRS.ps1;
    if (item.type === 'neogeo') targetDir = DIRS.neogeo;
    const filename = path.basename(decodeURIComponent(item.url));
    const dest = path.join(targetDir, filename);

    // Se já existe e tem tamanho > 0, pula
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) {
      console.log(`[${i + 1}/${toDownload.length}] ⏩ Já instalado: ${filename}`);
      continue;
    }

    const fileUrl = `${baseUrl}${item.url}`;
    console.log(`\n[${i + 1}/${toDownload.length}] 📥 Baixando: ${item.title || filename}`);
    try {
      await downloadFile(fileUrl, dest);
    } catch (err) {
      console.error(`  ❌ Falha no download de ${filename}: ${err.message}`);
    }
  }

  console.log(`\n🎉 Sincronização concluída com sucesso! Todos os jogos prontos para rodar.`);
}

// Compacta os jogos locais em arquivo .zip para compartilhamento fácil
function createZipPacks() {
  console.log(`\n🗜️  Criando pacotes ZIP para compartilhamento...`);
  const isWin = process.platform === 'win32';

  // 1. SNES
  const snesZip = path.join(root, 'snes-games.zip');
  console.log(`\n📦 Compactando Super Nintendo em: ${snesZip}...`);
  try {
    if (isWin) {
      execSync(`powershell -NoProfile -Command "Compress-Archive -Force -Path 'Super nintendo' -DestinationPath '${snesZip}'"`, { stdio: 'inherit', cwd: root });
    } else {
      execSync(`zip -r -q "${snesZip}" "Super nintendo"`, { stdio: 'inherit', cwd: root });
    }
    const stat = fs.statSync(snesZip);
    console.log(`✅ ${path.basename(snesZip)} criado com sucesso! Tamanho: ${formatBytes(stat.size)}`);
    console.log(`👉 Você pode enviar este arquivo direto para o Google Drive ou para o Leonardo.`);
  } catch (err) {
    console.error(`❌ Erro ao criar ${snesZip}: ${err.message}`);
  }
  // 2. Neo Geo
  const neogeoZip = path.join(root, 'neogeo-games.zip');
  console.log(`\n📦 Compactando Neo Geo em: ${neogeoZip}...`);
  try {
    if (isWin) {
      execSync(`powershell -NoProfile -Command "Compress-Archive -Force -Path 'neogeo' -DestinationPath '${neogeoZip}'"`, { stdio: 'inherit', cwd: root });
    } else {
      execSync(`zip -r -q "${neogeoZip}" "neogeo"`, { stdio: 'inherit', cwd: root });
    }
    const stat = fs.statSync(neogeoZip);
    console.log(`✅ ${path.basename(neogeoZip)} criado com sucesso! Tamanho: ${formatBytes(stat.size)}`);
    console.log(`👉 Você pode enviar este arquivo direto para o Google Drive ou para o parceiro.`);
  } catch (err) {
    console.error(`❌ Erro ao criar ${neogeoZip}: ${err.message}`);
  }
}

// Menu principal interativo
async function main() {
  const args = process.argv.slice(2);

  // Verificação de flags de linha de comando
  const peerArg = args.find(a => a.startsWith('--peer='));
  if (peerArg) {
    await syncFromPeer(peerArg.split('=')[1]);
    return;
  }

  const gdriveArg = args.find(a => a.startsWith('--gdrive='));
  if (gdriveArg) {
    await downloadFromGoogleDrive(gdriveArg.split('=')[1], DIRS.snes);
    return;
  }

  const zipArg = args.includes('--zip');
  if (zipArg) {
    createZipPacks();
    return;
  }

  const { snesCount, ps1Count, neogeoCount } = countLocalGames();

  console.log(`\n============================================================`);
  console.log(`  🎮 CONTINUE? ARCADE — BAIXADOR & SINCRONIZADOR DE JOGOS   `);
  console.log(`============================================================`);
  console.log(`  Status Atual do seu Computador:`);
  console.log(`    🕹️  Super Nintendo : ${snesCount} jogos instalados`);
  console.log(`    💿  PlayStation 1  : ${ps1Count} jogos instalados`);
  console.log(`    ⚡  Neo Geo Arcade : ${neogeoCount} jogos instalados`);
  console.log(`============================================================`);
  console.log(`Escolha uma opção:`);
  console.log(`  [1] Sincronizar direto do PC do parceiro (Via Wi-Fi / IP / Tailscale)`);
  console.log(`  [2] Baixar Pacote via Google Drive (Link ou ID compartilhado)`);
  console.log(`  [3] Baixar Pacote via URL Direta (.zip na internet)`);
  console.log(`  [4] Gerar pacote .zip dos meus jogos (Para você enviar ao parceiro)`);
  console.log(`  [0] Sair`);
  console.log(`------------------------------------------------------------`);

  const opt = await ask('Digite a opção desejada: ');

  if (opt === '1') {
    const peer = await ask('\nDigite o IP ou URL do PC do parceiro (Ex: http://192.168.1.23:4175 ou Tailscale): ') || 'http://192.168.1.23:4175';
    await syncFromPeer(peer);
  } else if (opt === '2') {
    const driveLink = await ask('\nCole o link ou ID do arquivo no Google Drive: ');
    if (!driveLink) return;
    const target = await ask('Onde descompactar? [1] Super Nintendo, [2] PlayStation 1 (Padrão: [1]): ') || '1';
    await downloadFromGoogleDrive(driveLink, target === '2' ? DIRS.ps1 : DIRS.snes);
  } else if (opt === '3') {
    const url = await ask('\nDigite a URL direta do arquivo .zip: ');
    if (!url) return;
    const dest = path.join(DIRS.temp, 'pacote-jogos.zip');
    await downloadFile(url, dest);
    const target = await ask('Onde descompactar? [1] Super Nintendo, [2] PlayStation 1 (Padrão: [1]): ') || '1';
    extractZip(dest, target === '2' ? DIRS.ps1 : DIRS.snes);
  } else if (opt === '4') {
    createZipPacks();
  } else {
    console.log('Encerrando.');
  }
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
