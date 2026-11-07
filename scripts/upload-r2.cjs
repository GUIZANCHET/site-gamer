#!/usr/bin/env node

/**
 * Arcade Continue? — Uploader de Jogos para o Cloudflare R2
 * Sobe ROMs de SNES, Neo Geo e PS1 direto para o bucket site-gamer-roms
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const BUCKET = 'site-gamer-roms';

// Coleção de diretórios a subir
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

async function main() {
  console.log(`\n============================================================`);
  console.log(`  ☁️  CONTINUE? — UPLOADER AUTOMÁTICO PARA CLOUDFLARE R2     `);
  console.log(`  Bucket: ${BUCKET}`);
  console.log(`============================================================\n`);

  let totalFiles = 0;
  let successCount = 0;
  let failCount = 0;

  for (const target of TARGETS) {
    if (!fs.existsSync(target.localDir)) continue;

    const files = fs.readdirSync(target.localDir).filter(target.filter);
    console.log(`📂 [${target.prefix}] Encontrados ${files.length} arquivos para upload...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const localFilePath = path.join(target.localDir, file);
      const r2Key = `${target.prefix}/${file}`;
      totalFiles++;

      process.stdout.write(`  [${i + 1}/${files.length}] Subindo: ${file.substring(0, 40)}... `);

      try {
        execSync(`npx -y wrangler r2 object put "${BUCKET}/${r2Key}" --file="${localFilePath}" --remote`, {
          stdio: 'pipe',
          timeout: 120000
        });
        process.stdout.write(`✅ OK\n`);
        successCount++;
      } catch (err) {
        process.stdout.write(`❌ Erro\n`);
        failCount++;
      }
    }
  }

  console.log(`\n🎉 Upload finalizado! Total: ${totalFiles} | Sucessos: ${successCount} | Falhas: ${failCount}`);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
