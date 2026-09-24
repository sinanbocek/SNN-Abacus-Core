#!/usr/bin/env node
// Toplu sürüm kuralı (AI-RULES §4.3): kabul edilmiş ama uygulanmamış madde varken sürüm çıkmaz.
//
// NEDEN: her sürüm etiketi BÜTÜN tüketicilerde yeni bir güncelleme PR'ı açar; bir önceki
// "aşıldı" diye kapatılır ve tüketici süreci baştan başlatır. 2026-09-24'te talep #12
// (issue #48) 4.2.0 olarak tek başına yayınlandı; aynı gün kabul edilen talep #11
// maddeleri (39C/D/F) "bekliyor" durumundaydı ve dakikalar sonra 4.3.0 gerekti.
// Tüketiciler iki kez güncellemek zorunda kaldı. Bu betik o durumu makinede durdurur.
//
// KULLANIM:
//   node scripts/check-release-batching.mjs                  -> bekleyen madde varsa hata (etiket anı)
//   node scripts/check-release-batching.mjs --base 4.2.0     -> yalnız sürüm DEĞİŞİYORSA denetler (PR)
//
// "Bekliyor" = GERI-BILDIRIM-KAYDI.md durum tablosunda son sütunu (Sürüm) `bekliyor` olan satır.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Durum tablosundaki bekleyen satırların madde numaralarını döner.
 * Yalnız "## Durum tablosu" bölümü okunur; başka tablolardaki kelimeler sayılmaz.
 */
export function findPending(logText) {
  const lines = logText.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === '## Durum tablosu');
  if (start === -1) throw new Error("GERI-BILDIRIM-KAYDI.md içinde '## Durum tablosu' bulunamadı.");
  const pending = [];
  for (const line of lines.slice(start + 1)) {
    const t = line.trim();
    if (t.startsWith('## ') || t === '---') break;
    if (!t.startsWith('|')) continue;
    const cells = t.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    if (cells[cells.length - 1].toLowerCase() === 'bekliyor') pending.push(cells[0]);
  }
  return pending;
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  const baseAt = process.argv.indexOf('--base');
  const base = baseAt === -1 ? null : process.argv[baseAt + 1];

  if (base !== null && base === version) {
    console.log(`Sürüm değişmiyor (${version}); toplu sürüm denetimi gerekmiyor.`);
    return 0;
  }

  const pending = findPending(fs.readFileSync(path.join(root, 'GERI-BILDIRIM-KAYDI.md'), 'utf8'));
  if (pending.length > 0) {
    console.error(
      `HATA: ${version} çıkarılamaz — kabul edilmiş ama uygulanmamış madde var: ${pending.join(', ')}.\n` +
        'AI-RULES §4.3: aynı dönemde kabul edilen maddeler TEK sürümde çıkar. Ya bu maddeleri\n' +
        'bu sürüme alın ya da sahibin kararıyla durumlarını "ertelendi" yapın (gerekçesiyle).'
    );
    return 1;
  }
  console.log(`Toplu sürüm denetimi geçti: ${version} için bekleyen kabul yok.`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
