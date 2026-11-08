const fs = require('fs');
const path = require('path');
const { S3Client, HeadObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const root = path.resolve(__dirname, '..');

// Carrega .env.r2 (site-gamer-roms - Conta 1)
const envRoms = {};
fs.readFileSync(path.join(root, '.env.r2'), 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) envRoms[k.trim()] = v.join('=').trim();
});

// Carrega .env.r2.retro (site-gamer-retro - Conta 2)
const envRetro = {};
fs.readFileSync(path.join(root, '.env.r2.retro'), 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) envRetro[k.trim()] = v.join('=').trim();
});

const s3Roms = new S3Client({
  region: 'auto',
  endpoint: `https://${envRoms.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: envRoms.R2_ACCESS_KEY_ID,
    secretAccessKey: envRoms.R2_SECRET_ACCESS_KEY,
  },
});

const s3Retro = new S3Client({
  region: 'auto',
  endpoint: `https://${envRetro.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: envRetro.R2_ACCESS_KEY_ID,
    secretAccessKey: envRetro.R2_SECRET_ACCESS_KEY,
  },
});

const pspDir = path.join(root, 'psp');
const filesToMigrate = [
  'Spider-Man - Freund oder Feind (Germany).iso',
  'Grand Theft Auto - Vice City Stories (USA).iso'
];

async function checkRemoteSize(s3Client, bucket, key) {
  try {
    const res = await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return res.ContentLength;
  } catch (err) {
    return null;
  }
}

async function uploadToRetro(fileName) {
  const filePath = path.join(pspDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado localmente: ${filePath}`);
  }
  const stats = fs.statSync(filePath);
  const totalMB = (stats.size / (1024 * 1024)).toFixed(1);
  const s3Key = `psp/${fileName}`;

  const existingSize = await checkRemoteSize(s3Retro, envRetro.R2_BUCKET, s3Key);
  if (existingSize === stats.size) {
    console.log(`⏩ [Já existe em ${envRetro.R2_BUCKET}]: ${s3Key} (${totalMB} MB)`);
    return;
  }

  console.log(`\n🚀 Enviando para ${envRetro.R2_BUCKET}: ${fileName} (${totalMB} MB)...`);
  const fileStream = fs.createReadStream(filePath);
  const parallelUpload = new Upload({
    client: s3Retro,
    params: {
      Bucket: envRetro.R2_BUCKET,
      Key: s3Key,
      Body: fileStream,
      ContentType: 'application/octet-stream',
    },
    partSize: 15 * 1024 * 1024,
    queueSize: 4,
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
  console.log(`\n✅ Concluído envio de ${fileName} para ${envRetro.R2_BUCKET}`);
}

async function deleteFromRoms(fileName) {
  const s3Key = `psp/${fileName}`;
  console.log(`🗑️ Removendo ${s3Key} de ${envRoms.R2_BUCKET} para liberar espaço...`);
  await s3Roms.send(new DeleteObjectCommand({
    Bucket: envRoms.R2_BUCKET,
    Key: s3Key,
  }));
  console.log(`✅ Removido de ${envRoms.R2_BUCKET}: ${s3Key}`);
}

async function getBucketStats(s3Client, bucket) {
  let isTruncated = true;
  let token;
  let totalBytes = 0;
  let count = 0;
  while (isTruncated) {
    const res = await s3Client.send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token }));
    (res.Contents || []).forEach(o => {
      totalBytes += o.Size;
      count++;
    });
    isTruncated = res.IsTruncated;
    token = res.NextContinuationToken;
  }
  return {
    count,
    gib: (totalBytes / (1024 * 1024 * 1024)).toFixed(3),
    decimalGb: (totalBytes / 1e9).toFixed(3)
  };
}

async function main() {
  console.log('=======================================================');
  console.log('🔄 MIGRAÇÃO DO PSP PARA BUCKET RETRO & LIBERAÇÃO DO R2');
  console.log(`Conta 1 (Origem): ${envRoms.R2_BUCKET}`);
  console.log(`Conta 2 (Destino): ${envRetro.R2_BUCKET}`);
  console.log('=======================================================\n');

  for (const file of filesToMigrate) {
    await uploadToRetro(file);
    const remoteSize = await checkRemoteSize(s3Retro, envRetro.R2_BUCKET, `psp/${file}`);
    const localSize = fs.statSync(path.join(pspDir, file)).size;
    if (remoteSize === localSize) {
      console.log(`✨ Verificação OK: psp/${file} intacto em ${envRetro.R2_BUCKET} (${(remoteSize / (1024*1024)).toFixed(1)} MB)`);
      await deleteFromRoms(file);
    } else {
      console.error(`❌ ERRO: Tamanho divergente no destino para ${file}. Não deletando da origem.`);
    }
  }

  console.log('\n=======================================================');
  console.log('📊 ESTATÍSTICAS FINAIS DE ARMAZENAMENTO R2');
  const statsRoms = await getBucketStats(s3Roms, envRoms.R2_BUCKET);
  const statsRetro = await getBucketStats(s3Retro, envRetro.R2_BUCKET);
  console.log(`Bucket 1 (${envRoms.R2_BUCKET}): ${statsRoms.count} objetos | ${statsRoms.decimalGb} GB (${statsRoms.gib} GiB)`);
  console.log(`Bucket 2 (${envRetro.R2_BUCKET}): ${statsRetro.count} objetos | ${statsRetro.decimalGb} GB (${statsRetro.gib} GiB)`);
  console.log('=======================================================');
}

main().catch(console.error);
