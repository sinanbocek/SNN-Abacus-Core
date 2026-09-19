#!/usr/bin/env node
// Beceri ve issue şablonu bütünlük kontrolü.
//
// NEDEN: 2026-09-19'da SNN-Standartlar'da `borclar` ve `proje-kur` becerilerinin ikisi de
// çalışmıyordu — yeniden adlandırılmış betikleri çağırıyorlardı ve hiçbir testin kapsamında
// olmadıkları için kimse fark etmemişti. Bu betik o boşluğu kapatır: beceri metnindeki depo
// yollarının ve şablon alanlarının hâlâ var olduğunu ölçer.
//
// SINIRI: YAML'ı bir kütüphaneyle ayrıştırmaz (depoda YAML bağımlılığı yok); şablonu satır
// bazlı olarak sınar. Şablonun GitHub tarafından geçerli sayıldığını `gh api .../contents`
// ile ayrıca doğrulayın.

import fs from 'node:fs';
import path from 'node:path';

const kok = path.resolve(import.meta.dirname, '..');
const hatalar = [];
const olculen = [];
const hata = (m) => hatalar.push(m);

// Beceri metninde geçen ama bu depoda DURMAYAN, bilinçli dış yollar.
const DIS_YOLLAR = new Set(['core/propagate.js']);

// ─── 1. Beceriler ───────────────────────────────────────────────────────────
const beceriKok = path.join(kok, 'skills');
const beceriler = fs.existsSync(beceriKok)
  ? fs.readdirSync(beceriKok, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  : [];

if (beceriler.length === 0) hata('skills/ altında hiç beceri yok.');

for (const ad of beceriler) {
  const dosya = path.join(beceriKok, ad, 'SKILL.md');
  if (!fs.existsSync(dosya)) { hata(`${ad}: SKILL.md yok.`); continue; }
  const metin = fs.readFileSync(dosya, 'utf8');

  // \r?\n: dosya Windows'ta düzenlenince CRLF'e döner; kontrol satır sonuna duyarsız olmalı.
  const on = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(metin);
  if (!on) { hata(`${ad}: YAML frontmatter yok ya da dosyanın başında değil.`); continue; }
  const alanlar = Object.fromEntries(
    on[1].split('\n').map((s) => { const i = s.indexOf(':'); return i < 0 ? null : [s.slice(0, i).trim(), s.slice(i + 1).trim()]; }).filter(Boolean),
  );

  if (alanlar.name !== ad) hata(`${ad}: frontmatter name "${alanlar.name}" klasör adıyla uyuşmuyor.`);
  if (!alanlar.description) hata(`${ad}: frontmatter description boş — ajan beceriyi tanıyamaz.`);
  else if (!alanlar.description.includes('"')) hata(`${ad}: description tetikleyici cümle taşımıyor (tırnak içinde örnek bekleniyor).`);

  if (/[A-Za-z]:[\/]Users[\/]|\/home\/|\/Users\//.test(metin)) hata(`${ad}: makineye özel mutlak yol geçiyor.`);

  // Çitli blokları çıkar, kalan satır içi kod parçalarındaki depo yollarını sına.
  const govde = metin.replace(/```[\s\S]*?```/g, '');
  const yollar = new Set();
  for (const [, ic] of govde.matchAll(/`([^`\n]+)`/g)) {
    if (/^[\w./-]+\.(md|mjs|js|ts|json|ya?ml)$/.test(ic)) yollar.add(ic);
  }
  for (const y of yollar) {
    if (DIS_YOLLAR.has(y)) continue;
    if (!fs.existsSync(path.join(kok, y))) hata(`${ad}: SKILL.md "${y}" yoluna atıf yapıyor ama o dosya depoda yok.`);
  }
  olculen.push(`${ad}: frontmatter tamam, ${yollar.size} depo yolu sınandı`);
}

// ─── 2. Issue şablonu ───────────────────────────────────────────────────────
const sablon = path.join(kok, '.github/ISSUE_TEMPLATE/abacus-talep.yml');
if (!fs.existsSync(sablon)) {
  hata('.github/ISSUE_TEMPLATE/abacus-talep.yml yok.');
} else {
  const y = fs.readFileSync(sablon, 'utf8');
  const zorunlu = ['tur', 'tuketici', 'surum', 'gercek-olay', 'olculmus-cikti', 'alternatif', 'etki', 'yerlestirme-sinavi', 'beklenen'];
  for (const id of zorunlu) {
    if (!new RegExp(String.raw`^\s*id:\s*` + id + String.raw`\s*$`, 'm').test(y)) hata(`Şablonda "${id}" alanı yok.`);
  }
  const alanSayisi = (y.match(/^\s*id:\s/gm) || []).length;
  const zorunluSayisi = (y.match(/^\s*required:\s*true\s*$/gm) || []).length;
  if (zorunluSayisi !== alanSayisi) hata(`Şablonda ${alanSayisi} alan var ama ${zorunluSayisi} tanesi required:true — hepsi zorunlu olmalı.`);
  if (!/^\s*labels:\s*\["talep"\]\s*$/m.test(y)) hata('Şablon "talep" etiketini atamıyor.');
  olculen.push(`issue şablonu: ${alanSayisi} alan, ${zorunluSayisi} zorunlu`);

  // Beceri ile şablon aynı etiketi kullanmalı.
  const beceri = path.join(beceriKok, 'abacus-talep/SKILL.md');
  if (fs.existsSync(beceri)) {
    const beceriMetni = fs.readFileSync(beceri, 'utf8');
    if (!/--label talep\b/.test(beceriMetni)) {
      hata('abacus-talep becerisi şablonla aynı etiketi (talep) kullanmıyor.');
    }

    // Becerideki eşleme tablosu şablonun alanlarını BİREBİR karşılamalı.
    // `--body-file` ile gönderilen taslak web formundan geçmez, yani şablonun
    // `required: true` alanları göndereni durdurmaz; tek koruma bu eşlemedir.
    // Şablonda bir alan adı değişip beceri güncellenmezse burada kırılır.
    const esleme = new Map();
    for (const [, id, baslik] of beceriMetni.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*`(##[^`]+)`\s*\|/gm)) {
      esleme.set(id, baslik.trim());
    }
    if (esleme.size === 0) {
      hata('abacus-talep: şablon alanı → taslak başlığı eşleme tablosu bulunamadı.');
    } else {
      for (const id of zorunlu) {
        if (!esleme.has(id)) hata(`abacus-talep: eşleme tablosunda "${id}" alanı yok.`);
      }
      for (const id of esleme.keys()) {
        if (!zorunlu.includes(id)) hata(`abacus-talep: eşleme tablosunda şablonda olmayan alan var: "${id}".`);
      }
      olculen.push(`beceri↔şablon eşlemesi: ${esleme.size} alan karşılandı`);
    }
  }
}

// ─── Sonuç ──────────────────────────────────────────────────────────────────
olculen.forEach((s) => console.log(`  ok  ${s}`));
if (hatalar.length) {
  console.error('\nBeceri bütünlük kontrolü BAŞARISIZ:');
  hatalar.forEach((h) => console.error(`  ✗ ${h}`));
  process.exit(1);
}
console.log('\nBeceri bütünlük kontrolü tamam.');
