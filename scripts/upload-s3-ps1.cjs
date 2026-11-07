const fs = require('fs');
const path = require('path');
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// Carrega .env.r2 se existir
const envPath = path.resolve(__dirname, '..', '.env.r2');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '3bc3672f572c0bc9cf7f09176bc6e164';
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET || 'site-gamer-roms';

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error('❌ ERRO: R2_ACCESS_KEY_ID e R2_SECRET_ACCESS_KEY precisam ser definidos!');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const ps1Dir = path.resolve(__dirname, '..', 'ps1');

async function checkRemoteSize(s3Key) {
  try {
    const res = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: s3Key }));
    return res.ContentLength;
  } catch (err) {
    return null;
  }
}

async function uploadFile(fileName) {
  const filePath = path.join(ps1Dir, fileName);
  const stats = fs.statSync(filePath);
  const totalMB = (stats.size / (1024 * 1024)).toFixed(1);
  const s3Key = `ps1/${fileName}`;

  // Verifica se já existe com mesmo tamanho
  const remoteSize = await checkRemoteSize(s3Key);
  if (remoteSize === stats.size) {
    console.log(`⏩ [Já enviado]: ${fileName} (${totalMB} MB)`);
    return;
  }

  console.log(`\n🚀 Enviando: ${fileName} (${totalMB} MB)...`);

  const fileStream = fs.createReadStream(filePath);
  const parallelUpload = new Upload({
    client: s3,
    params: {
      Bucket: BUCKET,
      Key: s3Key,
      Body: fileStream,
      ContentType: fileName.endsWith('.cue') || fileName.endsWith('.CUE') ? 'text/plain' : 'application/octet-stream',
    },
    partSize: 10 * 1024 * 1024, // Fatias de 10MB
    queueSize: 4, // 4 partes paralelas
  });

  let lastPercent = 0;
  parallelUpload.on('httpUploadProgress', (progress) => {
    if (progress.total) {
      const percent = Math.round((progress.loaded / progress.total) * 100);
      if (percent >= lastPercent + 10 || percent === 100) {
        process.stdout.write(`⏳ ${percent}% (${(progress.loaded / (1024 * 1024)).toFixed(1)} / ${totalMB} MB)\r`);
        lastPercent = percent;
      }
    }
  });

  await parallelUpload.done();
  console.log(`\n✅ Concluído: ${fileName}`);
}

async function main() {
  const allFiles = fs.readdirSync(ps1Dir);
  const targetFiles = allFiles.filter(f => f.endsWith('.bin') || f.endsWith('.BIN') || f.endsWith('.cue') || f.endsWith('.CUE'));

  console.log(`=======================================================`);
  console.log(`📦 UPLOAD S3 MULTIPART - JOGOS DE PS1 PARA O CLOUDFLARE R2`);
  console.log(`=======================================================`);
  console.log(`Total de arquivos: ${targetFiles.length}\n`);

  for (let i = 0; i < targetFiles.length; i++) {
    const file = targetFiles[i];
    console.log(`\n[${i + 1}/${targetFiles.length}] Verificando ${file}...`);
    try {
      await uploadFile(file);
    } catch (err) {
      console.error(`❌ Falha no upload de ${file}:`, err.message);
    }
  }

  console.log('\n🎉 TODOS OS JOGOS DE PS1 FORAM PROCESSADOS COM SUCESSO NO CLOUDFLARE R2!');
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
