#!/usr/bin/env node

/**
 * Arcade Continue? — Uploader Otimizado para Cloudflare R2
 * Sobe ROMs de SNES e Neo Geo com concorrência paralela e verificação
 */

const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const BUCKET = 'site-gamer-roms';
const CONCURRENCY = 4; // 4 uploads em paralelo para máxima velocidade

const TARGETS = [
  {
    prefix: 'Super nintendo/GAMES',
    localDir: path.join(root, 'Super nintendo', 'GAMES'),
    filter: f => /\.(smc|sfc|zip)$/i.test(f)
  },
  {
    prefix: 'neogeo',
    localDir: path.join(root, 'neogeo'),
    filter: f => /\.zip$/i.test(f)
  }
];

function uploadSingleFile(bucket, r2Key, localFilePath) {
  return new Promise((resolve) => {
    // Escapa aspas para o terminal
    const cmd = `npx -y wrangler r2 object put "${bucket}/${r2Key}" --file="${localFilePath}" --remote`;
    exec(cmd, { timeout: 180000 }, (error) => {
      if (error) {
        resolve({ success: false, key: r2Key, error: error.message });
      } else {
        resolve({ success: true, key: r2Key });
      }
    });
  });
}

async function runQueue(items, concurrency, onProgress) {
  let index = 0;
  let active = 0;
  let completed = 0;
  const total = items.length;

  return new Promise((resolve) => {
    if (total === 0) return resolve();

    function next() {
      while (active < concurrency && index < total) {
        const item = items[index++];
        active++;
        uploadSingleFile(BUCKET, item.r2Key, item.localFilePath).then((res) => {
          active--;
          completed++;
          onProgress(completed, total, item.file, res.success);
          if (completed === total) {
            resolve();
          } else {
            next();
          }
        });
      }
    }

    next();
  });
}

async function main() {
  console.log(`\n============================================================`);
  console.log(`  ☁️  CONTINUE? — UPLOADER TURBO PARA CLOUDFLARE R2          `);
  console.log(`  Bucket: ${BUCKET} | Concorrência: ${CONCURRENCY} uploads simultâneos`);
  console.log(`============================================================\n`);

  const queue = [];

  for (const target of TARGETS) {
    if (!fs.existsSync(target.localDir)) continue;
    const files = fs.readdirSync(target.localDir).filter(target.filter);
    console.log(`📂 [${target.prefix}] Encontrados ${files.length} jogos para subir.`);
    for (const file of files) {
      queue.push({
        file,
        r2Key: `${target.prefix}/${file}`,
        localFilePath: path.join(target.localDir, file)
      });
    }
  }

  console.log(`\n🚀 Iniciando upload de ${queue.length} jogos...`);
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  await runQueue(queue, CONCURRENCY, (done, total, file, ok) => {
    if (ok) successCount++;
    else failCount++;

    const percent = ((done / total) * 100).toFixed(1);
    const shortName = file.length > 35 ? file.substring(0, 32) + '...' : file;
    process.stdout.write(`\r  [${done}/${total}] (${percent}%) ${ok ? '✅' : '❌'} ${shortName.padEnd(36)} `);
  });

  const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n\n🎉 Concluído em ${elapsedMin} minutos!`);
  console.log(`   Sucessos: ${successCount} | Falhas: ${failCount}\n`);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
