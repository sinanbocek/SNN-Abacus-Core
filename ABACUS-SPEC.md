# ABACUS-SPEC.md — SNN-Abacus-Core Davranış Şartnamesi

> Bu dosya SNN-Abacus-Core'un **davranış tanımıdır**: motorların nasıl davrandığını,
> hangi sözleşmelere uyduğunu belirtir. Kütüphaneye özgüdür; herhangi bir tüketici
> uygulamanın (ör. mimari, veritabanı) kurallarını içermez.
>
> **Sürüm:** 1.0 · **Kod dili:** İngilizce · **Bağımlılık:** yalnız `decimal.js`

---

## 0. Temel İlkeler

1. **Saf, I/O yok.** Hiçbir motor veri çekmez (fetch/DB/localStorage/env/fs yok).
   Kur, oran, tarih, sabit — hepsi parametre olarak **verilir**.
2. **Para = kuruş bazlı tam sayı.** Girdi/çıktı `number` (minor unit). Float ile para yasak.
   Tüm aritmetik `math` motoru (decimal.js) üzerinden.
3. **decimal.js yalnız `math` içinde.** Diğer 9 motor decimal.js'i doğrudan import etmez;
   `math` primitiflerini (add/sub/mul/div/round) kullanır.
4. **Yuvarlama = half-up (Türkiye usulü).** `2,49→2`, `2,50→3`. Banker's DEĞİL.
5. **Hata = `null` sentinel.** Hesaplanamazsa `null`. `0` (gerçek sıfır) ile yokluk ayrılır.
   `|| 0` gibi sessiz varsayılan yasak.
6. **Tek kapı, tiplenmiş çağrı.** `money.format(x)` gibi. String dispatch yasak.
7. **Namespace barrel.** Her motor `export * as <engine> from './<engine>'` ile açılır.

---

## 1. Çağrı Deseni

Barrel (`src/abacus/index.ts`) her motoru namespace olarak açar:

```ts
export * as math       from './math';
export * as money      from './money';
export * as currency   from './currency';
export * as date       from './date';
export * as text       from './text';
export * as validate   from './validate';
export * as mask       from './mask';
export * as tradingMath from './trading-math';
export * as gold       from './gold';
export * as silver     from './silver';
```

Kullanım:

```ts
import { money, gold, silver } from '@snn/abacus-core';

money.format(2323223);                    // "₺23.232"
gold.gramGoldPrice(2650, 34.20, 22);      // 266906 (kuruş)
silver.gramSilverPrice(31, 34.20);        // 3405 (kuruş)
```

---

## 2. Motor Sözleşmeleri (API)

| Motor | Ana fonksiyonlar | Not |
|---|---|---|
| `math` | add, sub, mul, div\|null, round(half-up), abs, floor, mod\|null, ratio\|null, percent\|null, pow\|null, log\|null, max\|null | decimal.js kapsülü |
| `money` | format, percent, toWords, compact | kuruş → metin |
| `currency` | convert(minor, rate)\|null, cross(minor, from, to)\|null | kur ondalık |
| `date` | formatDate, formatDateTime, timeAgo, daysBetween | Intl'siz, TR |
| `text` | upper, lower, turkishSlug, numberToWords | TR harf güvenli |
| `validate` | isValidTCKN, isValidVKN, isValidIBAN | resmi checksum |
| `mask` | maskName, maskPhone, maskTCKN, maskIBAN | PII gizleme |
| `tradingMath` | calculateThresholdDays, calculatePositionSize | ticari |
| `gold` | gramGoldPrice(onsUsd, usdTry, karat)\|null, ziynetPrice(type, onsUsd, usdTry)\|null | kuruş çıktı |
| `silver` | gramSilverPrice(onsUsd, usdTry, millesimal=999)\|null | kuruş çıktı |

Tüm hesap motorları geçersiz girdide `null` döner.

---

## 3. Değerli Maden Sabitleri (B-Otorite)

Gold ve silver motorları aşağıdaki **piyasa/Darphane otoritesi** değerlerini kullanır:

**Ortak:** 1 troy ons = **31.1034768** gram (LBMA/COMEX evrensel).

**Altın saflık (sektör damgası):**
| Ayar | Katsayı | Kaynak |
|---|---|---|
| 24K | 0.995 | Külçe/has damgası |
| 22K | 0.916 | Sektör damgası (teorik 0.91667 değil) |
| 21K | 0.875 | Milyem standardı |
| 18K | 0.750 | Milyem standardı |

**Ziynet gramaj (Darphane):** çeyrek 1.754 g · yarım 3.508 g · tam 7.016 g (hepsi 22K/0.916).

**Gümüş milyem:** 999 (külçe, varsayılan) · 925 (sterling) · 800 · 1000.

Hesap zinciri (her ikisi de): `div(onsUsd, 31.1034768) → mul(purity) → mul(usdTry) → round(×100, 0)` → kuruş.

---

## 4. Kırmızı Çizgiler (motor kodu)

1. **Ham `Math.*` yok** — `math` motoru kullanılır.
2. **`Intl` / `toLocale*` yok** — `date`/`money` motoru kullanılır.
3. **Ham `toUpperCase`/`toLowerCase` yok** — `text.upper`/`text.lower` (TR harf güvenliği).
4. **`.toFixed` / `parseFloat` yok** — `math`/`money` motoru.
5. **`|| 0` sessiz varsayılan yok** — `null` sentinel.

Tümü ESLint `error` ile zorlanır (eslint.config.js).
