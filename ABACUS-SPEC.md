# ABACUS-SPEC.md — SNN-Abacus-Core Davranış Şartnamesi

> Bu dosya SNN-Abacus-Core'un **davranış tanımıdır**: motorların nasıl davrandığını,
> hangi sözleşmelere uyduğunu belirtir. Kütüphaneye özgüdür; herhangi bir tüketici
> uygulamanın (ör. mimari, veritabanı) kurallarını içermez.
>
> **Sürüm:** 2.0 · **Kod dili:** İngilizce · **Bağımlılık:** yalnız `decimal.js`
>
> Bu dosyadaki API adları **koddan doğrulanmıştır**. Fonksiyon imzalarının ve
> davranış ayrıntılarının tam dökümü için `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md`.

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
export * as unit       from './unit';
export * as period     from './period';
export * as collate    from './collate';
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

| Motor | Dışa açılan fonksiyonlar (tam liste) | Not |
|---|---|---|
| `math` | `add`, `sub`, `mul`, `div`\|null, `round` (half-up), `abs`, `floor`, `mod`\|null, `ratio`\|null, `percent`\|null, `pow`\|null, `log`\|null, `max`\|null | decimal.js kapsülü |
| `money` | `format`, `percent`, `parseNumber`\|null, `fmtDecimalGrouped`, `formatGroupedInput`, `toWords`, `compact` | kuruş → metin |
| `currency` | `convert(minor, rate)`\|null, `cross(minor, from, to)`\|null | kur parametreyle gelir |
| `date` | `format`, `monthName`, `daysBetween`\|null, `daysUntil`\|null, `relative`, `dayName` | Intl'siz, TR, Europe/Istanbul |
| `text` | `toAsciiLower`, `toTrLower`, `lower`, `upper`, `title`, `join`, `phone`, `whatsapp`, `email`, `website`, `websiteUrl`, `name`, `company`, `numberToWords`, `lastVowel`, `isBackVowel`, `isRoundedVowel`, `endsWithHardConsonant`, `endsWithVowel`, `suffix` | TR harf güvenli |
| `validate` | `vkn`, `tckn`, `ikn`, `iban`, `email` | resmî checksum, hepsi `boolean` |
| `mask` | `money`, `vkn`, `iban`, `phone` | PII gizleme |
| `tradingMath` | `volumeFromQty`, `qtyFromVolume`, `leverage`\|null, `calculateThresholdDays`\|null, `validateTradeDirections`, `computeRiskReward`, `computePortfolioRatios` | ticari |
| `gold` | `gramGoldPrice(onsUsd, usdTry, karat)`\|null, `ziynetPrice(type, onsUsd, usdTry)`\|null + `ONS_TO_GRAM`, `PURITY`, `ZIYNET_GRAM` | kuruş çıktı |
| `silver` | `gramSilverPrice(onsUsd, usdTry, millesimal=999)`\|null + `ONS_TO_GRAM`, `SILVER_PURITY` | kuruş çıktı |
| `unit` | `convert(value, from, to)`\|null, `categoryOf`\|null, `dataSize` + `ONS_TO_GRAM` | birim çevrimi |
| `period` | `addDays`\|null, `addMonths`\|null, `startOfMonth`\|null, `endOfMonth`\|null, `quarterOf`\|null, `quarterRange`\|null, `monthsBetween`\|null, `isBetween`\|null | tarih ÜRETİR (`date` biçimlendirir) |
| `collate` | `key`, `compare`, `sortBy` | Türkçe sıralama, `Intl.Collator` yok |

### 2.1 Dönüş Sözleşmeleri (normatif)

Motorlar tek bir hata dili kullanmaz; **hangi işin hangi sentineli döndürdüğü kuraldır**:

| İş türü | Geçersiz girdide | Örnek |
|---|---|---|
| **Hesap** (sayı üretir) | `null` | `math.div`, `currency.convert`, `gold.gramGoldPrice`, `unit.convert` |
| **Biçimlendirme** (metin üretir) | `'—'` (em dash) | `money.format`, `money.toWords`, `date.format`, `mask.*`, `unit.dataSize` |
| **Doğrulama** | `false` | `validate.*` |
| **Normalizasyon** | `{ valid: false, stored: '', display: '', raw }` | `text.phone`, `text.email`, `text.website` |
| **Metin dönüşümü** | `''` (boş dize) | `text.title`, `text.join`, `text.numberToWords` |

**İlkel katman istisnası (`math`):** `add`, `sub`, `mul`, `round`, `abs`, `floor`
sonlu olmayan girdide sonlu olmayan çıktı üretir (`add(NaN, 1) → NaN`). Bu
IEEE-754 yayılımıdır ve **bilinçlidir**: bu altı fonksiyon `number` döner, tanımsızlık
üretemez. Tanımsızlık üretebilenler (`div`, `mod`, `ratio`, `percent`, `pow`, `log`,
`max`) `null` döner. Girdi doğrulaması **motor katmanının** sorumluluğudur; her genel
motor kapısı `Number.isFinite` ile korunur. `NaN` hiçbir koşulda `0`'a çevrilmez.

**Yasak:** hiçbir fonksiyon geçersiz girdide `0` döndüremez; `|| 0` ve `?? 0`
sessiz varsayılanları ESLint `no-restricted-syntax` ile `error` seviyesinde engellenir.
`0` yalnızca **gerçek sıfır** anlamına gelir.


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

`ONS_TO_GRAM` sabiti `gold`, `silver` ve `unit` motorlarında **tek kaynaktan**
(`internal/constants`) gelir; üçü her zaman eşittir.

Hesap zinciri (her ikisi de): `div(onsUsd, 31.1034768) → mul(purity) → mul(usdTry) → round(×100, 0)` → kuruş.

---

## 4. Kırmızı Çizgiler (motor kodu)

1. **Ham `Math.*` yok** — `math` motoru kullanılır.
2. **`Intl` / `toLocale*` yok** — `date`/`money` motoru kullanılır.
3. **Ham `toUpperCase`/`toLowerCase` yok** — `text.upper`/`text.lower` (TR harf güvenliği).
4. **`.toFixed` / `parseFloat` yok** — `math`/`money` motoru.
5. **`|| 0` / `?? 0` sessiz varsayılan yok** — §2.1'deki sentinel kullanılır.

Tümü ESLint `error` ile zorlanır (eslint.config.js).
