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

const root = path.resolve(import.meta.dirname, '..');
const errors = [];
const measured = [];
const addError = (m) => errors.push(m);

// Beceri metninde geçen ama bu depoda DURMAYAN, bilinçli dış yollar.
const EXTERNAL_PATHS = new Set(['core/propagate.js']);

// ─── 1. Beceriler ───────────────────────────────────────────────────────────
const skillsRoot = path.join(root, 'skills');
const skills = fs.existsSync(skillsRoot)
  ? fs.readdirSync(skillsRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  : [];

if (skills.length === 0) addError('skills/ altında hiç beceri yok.');

for (const name of skills) {
  const file = path.join(skillsRoot, name, 'SKILL.md');
  if (!fs.existsSync(file)) { addError(`${name}: SKILL.md yok.`); continue; }
  const text = fs.readFileSync(file, 'utf8');

  // \r?\n: dosya Windows'ta düzenlenince CRLF'e döner; kontrol satır sonuna duyarsız olmalı.
  const on = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
  if (!on) { addError(`${name}: YAML frontmatter yok ya da dosyanın başında değil.`); continue; }
  const fields = Object.fromEntries(
    on[1].split('\n').map((s) => { const i = s.indexOf(':'); return i < 0 ? null : [s.slice(0, i).trim(), s.slice(i + 1).trim()]; }).filter(Boolean),
  );

  if (fields.name !== name) addError(`${name}: frontmatter name "${fields.name}" klasör adıyla uyuşmuyor.`);
  if (!fields.description) addError(`${name}: frontmatter description boş — ajan beceriyi tanıyamaz.`);
  else if (!fields.description.includes('"')) addError(`${name}: description tetikleyici cümle taşımıyor (tırnak içinde örnek bekleniyor).`);

  if (/[A-Za-z]:[\/]Users[\/]|\/home\/|\/Users\//.test(text)) addError(`${name}: makineye özel mutlak yol geçiyor.`);

  // Çitli blokları çıkar, kalan satır içi kod parçalarındaki depo yollarını sına.
  const body = text.replace(/```[\s\S]*?```/g, '');
  const paths = new Set();
  for (const [, ic] of body.matchAll(/`([^`\n]+)`/g)) {
    if (/^[\w./-]+\.(md|mjs|js|ts|json|ya?ml)$/.test(ic)) paths.add(ic);
  }
  for (const y of paths) {
    if (EXTERNAL_PATHS.has(y)) continue;
    if (!fs.existsSync(path.join(root, y))) addError(`${name}: SKILL.md "${y}" yoluna atıf yapıyor ama o dosya depoda yok.`);
  }
  measured.push(`${name}: frontmatter tamam, ${paths.size} depo yolu sınandı`);
}

// ─── 2. Issue şablonu ───────────────────────────────────────────────────────
const template = path.join(root, '.github/ISSUE_TEMPLATE/abacus-talep.yml');
if (!fs.existsSync(template)) {
  addError('.github/ISSUE_TEMPLATE/abacus-talep.yml yok.');
} else {
  const y = fs.readFileSync(template, 'utf8');
  const requiredIds = ['tur', 'tuketici', 'surum', 'gercek-olay', 'olculmus-cikti', 'alternatif', 'etki', 'yerlestirme-sinavi', 'beklenen'];
  for (const id of requiredIds) {
    if (!new RegExp(String.raw`^\s*id:\s*` + id + String.raw`\s*$`, 'm').test(y)) addError(`Şablonda "${id}" alanı yok.`);
  }
  const fieldCount = (y.match(/^\s*id:\s/gm) || []).length;
  const requiredCount = (y.match(/^\s*required:\s*true\s*$/gm) || []).length;
  if (requiredCount !== fieldCount) addError(`Şablonda ${fieldCount} alan var ama ${requiredCount} tanesi required:true — hepsi zorunlu olmalı.`);
  if (!/^\s*labels:\s*\["talep"\]\s*$/m.test(y)) addError('Şablon "talep" etiketini atamıyor.');
  measured.push(`issue şablonu: ${fieldCount} alan, ${requiredCount} zorunlu`);

  // Beceri ile şablon aynı etiketi kullanmalı.
  const skillFile = path.join(skillsRoot, 'abacus-talep/SKILL.md');
  if (fs.existsSync(skillFile)) {
    const skillText = fs.readFileSync(skillFile, 'utf8');
    if (!/--label talep\b/.test(skillText)) {
      addError('abacus-talep becerisi şablonla aynı etiketi (talep) kullanmıyor.');
    }

    // Becerideki eşleme tablosu şablonun alanlarını BİREBİR karşılamalı.
    // `--body-file` ile gönderilen taslak web formundan geçmez, yani şablonun
    // `required: true` alanları göndereni durdurmaz; tek koruma bu eşlemedir.
    // Şablonda bir alan adı değişip beceri güncellenmezse burada kırılır.
    const mapping = new Map();
    for (const [, id, heading] of skillText.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*`(##[^`]+)`\s*\|/gm)) {
      mapping.set(id, heading.trim());
    }
    if (mapping.size === 0) {
      addError('abacus-talep: şablon alanı → taslak başlığı eşleme tablosu bulunamadı.');
    } else {
      for (const id of requiredIds) {
        if (!mapping.has(id)) addError(`abacus-talep: eşleme tablosunda "${id}" alanı yok.`);
      }
      for (const id of mapping.keys()) {
        if (!requiredIds.includes(id)) addError(`abacus-talep: eşleme tablosunda şablonda olmayan alan var: "${id}".`);
      }
      measured.push(`beceri↔şablon eşlemesi: ${mapping.size} alan karşılandı`);
    }
  }
}

// ─── Sonuç ──────────────────────────────────────────────────────────────────
measured.forEach((s) => console.log(`  ok  ${s}`));
if (errors.length) {
  console.error('\nBeceri bütünlük kontrolü BAŞARISIZ:');
  errors.forEach((h) => console.error(`  ✗ ${h}`));
  process.exit(1);
}
console.log('\nBeceri bütünlük kontrolü tamam.');
