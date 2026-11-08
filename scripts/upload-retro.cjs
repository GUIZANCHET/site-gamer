#!/usr/bin/env node

/**
 * Arcade Continue? — Uploader S3 Turbo para o Cloudflare R2 (site-gamer-retro)
 * Sobe Super Nintendo e Neo Geo com concorrência paralela e verificação de integridade
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env.r2.retro');

if (!fs.existsSync(envPath)) {
  console.error('❌ ERRO: .env.r2.retro não encontrado!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
}

const ACCOUNT_ID = env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const BUCKET = env.R2_BUCKET || 'site-gamer-retro';
const CONCURRENCY = 6; // 6 uploads em paralelo para equilíbrio ideal

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const TARGETS = [
  {
    prefix: 'Super nintendo/GAMES',
    localDir: path.join(root, 'Super nintendo', 'GAMES'),
    filter: f => /\.(smc|sfc|zip)$/i.test(f),
    contentType: 'application/octet-stream'
  },
  {
    prefix: 'neogeo',
    localDir: path.join(root, 'neogeo'),
    filter: f => /\.zip$/i.test(f),
    contentType: 'application/zip'
  }
];

async function checkRemoteSize(key) {
  try {
    const res = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return res.ContentLength;
  } catch (e) {
    return null;
  }
}

async function uploadFile(item) {
  const localSize = fs.statSync(item.localFilePath).size;
  const remoteSize = await checkRemoteSize(item.r2Key);
  
  if (remoteSize === localSize) {
    return { skipped: true, key: item.r2Key };
  }

  const stream = fs.createReadStream(item.localFilePath);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: item.r2Key,
    Body: stream,
    ContentLength: localSize,
    ContentType: item.contentType,
  }));

  return { skipped: false, key: item.r2Key };
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
        uploadFile(item)
          .then((res) => {
            active--;
            completed++;
            onProgress(completed, total, item.file, true, res.skipped);
            if (completed === total) resolve();
            else next();
          })
          .catch((err) => {
            active--;
            completed++;
            console.error(`\n❌ Falha em ${item.r2Key}:`, err.message);
            onProgress(completed, total, item.file, false, false);
            if (completed === total) resolve();
            else next();
          });
      }
    }
    next();
  });
}

async function main() {
  console.log(`=======================================================`);
  console.log(`🚀 UPLOAD TURBO PARA CLOUDFLARE R2 (site-gamer-retro)`);
  console.log(`Bucket: ${BUCKET} | Concorrência: ${CONCURRENCY} workers`);
  console.log(`=======================================================\n`);

  const queue = [];
  for (const t of TARGETS) {
    if (!fs.existsSync(t.localDir)) continue;
    const files = fs.readdirSync(t.localDir).filter(t.filter);
    console.log(`📂 [${t.prefix}] Encontrados ${files.length} arquivos.`);
    for (const f of files) {
      queue.push({
        file: f,
        r2Key: `${t.prefix}/${f}`,
        localFilePath: path.join(t.localDir, f),
        contentType: t.contentType
      });
    }
  }

  console.log(`\n📦 Total de itens para processar: ${queue.length}`);
  const startTime = Date.now();
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  await runQueue(queue, CONCURRENCY, (done, total, file, ok, isSkipped) => {
    if (isSkipped) skipped++;
    else if (ok) uploaded++;
    else failed++;

    const percent = ((done / total) * 100).toFixed(1);
    const short = file.length > 32 ? file.substring(0, 29) + '...' : file;
    process.stdout.write(`\r[${done}/${total}] (${percent}%) ${isSkipped ? '⚡ Pula' : ok ? '✅' : '❌'} ${short.padEnd(33)} `);
  });

  const durationMin = ((Date.now() - startTime) / 60000).toFixed(2);
  console.log(`\n\n🎉 PROCESSO CONCLUÍDO em ${durationMin} minutos!`);
  console.log(`   Enviados: ${uploaded} | Já existiam (pulados): ${skipped} | Falhas: ${failed}\n`);
}

main().catch(console.error);
