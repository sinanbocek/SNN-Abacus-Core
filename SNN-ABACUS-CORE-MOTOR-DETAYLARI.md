# SNN-Abacus-Core — Motor Detayları

> Bu belge SNN-Abacus-Core'un (`@snn/abacus-core`) **derin API referansıdır**: her motorun
> gerçek imzaları, davranışı, kenar durumları ve tüketici projeler için entegrasyon notları.
> Kaynak koddan (v1.1.0) doğrulanmıştır.
>
> **Amaç:** Kütüphanenin resmi API referansı olmak; README/SPEC özetlerini beslemek ve tüm
> tüketici projelerin entegrasyonunda tek başvuru kaynağı olmak.
>
> **Sürüm:** v1.1.0 · **Kod dili:** İngilizce · **Bağımlılık:** yalnız `decimal.js` (yalnız `math` içinde)

---

## Genel İlkeler (tüm motorlar)

- **Saf / I/O yok:** Hiçbir motor veri çekmez (fetch/DB/localStorage/env/fs yok). Kur, oran,
  tarih, sabit — hepsi **parametre** olarak verilir.
- **Para = kuruş bazlı tam sayı (integer minor unit):** `2323223` kuruş = 23.232,23 TL.
  Float ile para yasak. Tüketici float birim kullanıyorsa adapter'da `×100` (girişte) / `÷100`
  (çıkışta) gerekir.
- **decimal.js yalnız `math` içinde:** Diğer motorlar `math` primitiflerini kullanır.
- **Yuvarlama = half-up (Türkiye usulü), işaret korumalı:** `2,49→2` · `2,50→3` · `-2,5→-3`.
- **Hata = `null` sentinel:** Hesaplanamazsa `null`. Gerçek `0` ile yokluk ayrılır. Sessiz
  `|| 0` yasak. Tüketici tarafında `null` mutlaka ele alınmalı.
- **Namespace barrel:** `import { math, money, ... } from '@snn/abacus-core'`.

Barrel (kök `index.ts`) şu 10 motoru açar:
`math`, `money`, `text`, `date`, `currency`, `validate`, `mask`, `tradingMath`, `gold`, `silver`.

---

## Motor: `math`

decimal.js kapsülü. Tüm para/oran aritmetiğinin temeli. IEEE-754 float tuzağını `String()`
köprüsüyle aşar (`Decimal(String(a))`). Varsayılan yuvarlama modu `ROUND_HALF_UP`.

**Bağımlılık:** `decimal.js` (core içinde yalnız burada import edilir).
**Ortak davranış:** Girdiler `number`; hesaplanamayan durumlarda ilgili fonksiyon `null` döner.

### `add(a: number, b: number): number`
İki sayıyı güvenle toplar (float köprülü). Örnek: `add(1000, 2500) → 3500`. IEEE-754 tuzağı
aşılır: `add(0.1, 0.2) → 0.3` (ham `0.1+0.2 = 0.30000...04` değil).

### `sub(a: number, b: number): number`
Güvenli çıkarma. Örnek: `sub(5000, 1500) → 3500`.

### `mul(a: number, b: number): number`
Güvenli çarpma. Örnek: `mul(150, 4) → 600`.

### `div(a: number, b: number): number | null`
Bölme. **Bölen `0` ise `null`** (sessiz hata yok). Örnek: `div(100, 8) → 12.5` · `div(10, 0) → null`.

### `round(x: number, d = 0): number`
Half-up yuvarlama, işaret korumalı. Ondalık basamak `d` (varsayılan 0). IEEE-754 tuzaklarını
aşar. Örnekler: `round(2.49) → 2` · `round(2.50) → 3` · `round(-2.5) → -3` · `round(-192.5) → -193`
· `round(1.005, 2) → 1.01` · `round(2.675, 2) → 2.68`.

### `abs(x: number): number`
Mutlak değer. Örnek: `abs(-2500) → 2500` · `abs(0) → 0`.

### `floor(x: number): number`
Taban (aşağı yuvarlama). Örnek: `floor(23.85) → 23` · `floor(23232.23) → 23232`.

### `mod(a: number, b: number): number | null`
Kalan. **Payda `0` ise `null`.** Örnek: `mod(2323223, 100) → 23` · `mod(2323250, 100) → 50` · `mod(100, 0) → null`.

### `ratio(pay: number, payda: number): number | null`
Katsayı (pay/payda). **Payda `≤ 0` ise `null`** (negatif dahil). Örnek: `ratio(300, 100) → 3`
· `ratio(5, 0) → null` · `ratio(5, -10) → null`.

### `percent(pay: number, payda: number): number | null`
Yüzde (pay/payda×100). **Payda `≤ 0` ise `null`.** Örnek: `percent(25, 100) → 25` · `percent(1, 0) → null`
· `percent(1, 3) → 33.333...` (`round(res, 4) → 33.3333`).

### `pow(base: number, exp: number): number | null`
Üs (base^exp). **`base < 0`, veya base/exp sonsuz/geçersizse `null`.** Örnek: `pow(2, 3) → 8`
· `pow(1.35, 1/365) → 1.000823...` · `pow(-2, 0.5) → null`.

### `log(x: number): number | null`
Doğal logaritma (ln). **`x ≤ 0` veya geçersizse `null`.** Örnek: `log(1.10) → 0.09531...`
· `log(0) → null` · `log(-5) → null`.

### `max(...values: number[]): number | null`
En büyük değer. **Boş dizi veya tüm değerler geçersizse `null`** (sonsuz değerler elenir).
Örnek: `max(1, 5, 10, 3) → 10` · `max(-10, 1) → 1` · `max() → null`.

### `math` — entegrasyon notları
- Bu motor saf sayısal; kuruş/birim ayrımı yapmaz — çağıran birim tutarlılığından sorumlu.
- Ham `Math.*` kullanan kod bu motora taşınabilir. **Half-up farkına dikkat:** JS `Math.round(-2.5) = -2`,
  ama `math.round(-2.5) = -3`. Bu bir davranış değişikliğidir; taşımada testle doğrulanmalı.
- `null` dönüş: ham bölme (`a/b`) `div`/`ratio`/`percent`'e geçerken `null` ele alma eklenmeli
  (eskiden `Infinity`/`NaN` dönen yerler artık `null`).

---

## Motor: `money`

TCMB kurallarına uygun para biçimlendirme. **Girdi kuruş bazlı tam sayıdır** (`2323223` kuruş
= 23.232,23 TL). Tüm aritmetik `math` motoru üzerinden (ham `Math.*`/`Intl`/`toLocale*` yok).

**Motor-içi bağımlılık:** `math` (add/sub/div/floor/mod/round) ve `text` (`numberToWords`, yalnız
`toWords` için). Yani `money` tek başına değil — `text` motoruna bağımlıdır.
**Ortak yokluk davranışı:** `null`/`undefined`/`NaN` girdide `format`/`percent`/`compact` → `'—'`
(em-dash); `fmtDecimalGrouped` → `'0'`.

### `format(kurus: number | null | undefined, opts?: FormatMoneyOptions): string`
Kuruş tam sayısını para metnine çevirir.
`FormatMoneyOptions`:
- `kurus?: boolean` — kuruş göster (varsayılan `false`).
- `form?: 'symbol' | 'text'` — simge solda (`₺23.232`) veya kod sağda (`23.232 TL`); varsayılan `symbol`.
- `negative?: 'minus' | 'paren'` — negatifte `-₺..` veya `(₺..)`; varsayılan `minus`.
- `currency?: 'TRY' | 'USD'` — simge `₺`/`$`, kod `TL`/`USD`; varsayılan `TRY`.

**DİKKAT — isim çakışması:** `kurus` hem 1. parametredir (girdi tutarı, integer) hem de opsiyon
alanıdır (`opts.kurus`, "kuruş basamağı göster" boolean'ı). İkisi ayrıdır.

Örnekler:
- `format(2323223) → "₺23.232"` (varsayılan, kuruşsuz)
- `format(2323223, { kurus: true }) → "₺23.232,23"`
- `format(2323223, { form: 'text' }) → "23.232 TL"`
- `format(2323223, { form: 'text', kurus: true }) → "23.232,23 TL"`
- `format(-2323223, { negative: 'paren' }) → "(₺23.232)"`
- `format(-2323223) → "-₺23.232"`
- `format(0) → "0"` · `format(0, { kurus: true }) → "0,00"`
- `format(null) → "—"` · `format(undefined) → "—"`
- `format(100) → "₺1"` (100 kuruş = 1 TL) · `format(50, { kurus: true }) → "₺0,50"`
- `format(2323250) → "₺23.233"` (kuruşsuz gösterimde half-up: 23.232,50 → 23.233)
- `format(22075, { currency: 'USD' }) → "$221"` · `format(22075, { currency: 'USD', kurus: true }) → "$220,75"`

### `percent(value: number | null | undefined, digits = 1): string`
Yüzde biçimi. Ondalık ayraç virgül. Örnek: `percent(12.345, 1) → "%12,3"` · `percent(2.5678, 2) → "%2,57"`
· `percent(null) → "—"`.

### `parseNumber(val: string): number`
Binlik-ayraçlı metni ham sayıya çevirir (nokta binlik, virgül ondalık). Geçersizse `0`.
Örnek: `"23.232,50" → 23232.5`. (Not: yokluk/hatada `null` değil `0` döner — bu fonksiyon giriş
ayrıştırıcı olduğu için istisnadır.)

### `fmtDecimalGrouped(value: number | null | undefined, digits = 0): string`
Ondalıklı sayıyı binlik-ayraçlı (nokta) + ondalık (virgül) gösterir; sondaki sıfırları korur.
Yoklukta `'0'`. Örnek: `fmtDecimalGrouped(47.89, 4) → "47,8900"` · `fmtDecimalGrouped(34.5, 4) → "34,5000"`
· `fmtDecimalGrouped(70000.5, 2) → "70.000,50"`.

### `formatGroupedInput(raw: string): string`
Serbest ondalık giriş kutuları için canlı biçimlendirme (kullanıcı yazarken). Örnek: ham girişten
binlik-ayraçlı çıktı üretir; boş girişte `''`.

### `toWords(kurus: number, opts?: ToWordsOptions): string`
Çek/sözleşme "Yalnız..." tutar yazısı. Girdi kuruş. `ToWordsOptions.spaced?: boolean` (boşluklu yazım).
Negatifte `-` "Yalnız" önüne gelir. `text.numberToWords`'e bağımlı.
Örnekler:
- `toWords(32000000) → "Yalnız ÜçYüzYirmiBinTürkLirası"`
- `toWords(334533454) → "Yalnız ÜçMilyonÜçYüzKırkBeşBinÜçYüzOtuzDörtLiraElliDörtKuruş"`
- `toWords(100) → "Yalnız BirTürkLirası"` · `toWords(150) → "Yalnız BirLiraElliKuruş"`
- `toWords(0) → "Yalnız SıfırTürkLirası"` · `toWords(1) → "Yalnız SıfırLiraBirKuruş"`
- `toWords(334533454, { spaced: true }) → "Yalnız Üç Milyon Üç Yüz Kırk Beş Bin Üç Yüz Otuz Dört Lira Elli Dört Kuruş"`
- `toWords(-15000) → "-Yalnız YüzElliTürkLirası"`

### `compact(kurus: number | null | undefined, opts?: CompactMoneyOptions): string`
Büyük tutar kısaltma. `CompactMoneyOptions`:
- `style?: 'K/M' | 'B/Mn/Mr'` — bin/milyon/milyar birim etiketi; varsayılan `K/M`.
- `form?: 'symbol' | 'text'`.

**1.000 TL altı** kısaltmasız standart `format`'a düşer. Yuvarlama sonucu üst ölçeğe ulaşırsa
terfi eder (ör. 999.999 TL → ₺1M). Örnekler:
- `compact(123456789) → "₺1,23M"` · `compact(123456789, { style: 'B/Mn/Mr' }) → "₺1,23Mn"`
- `compact(100000000) → "₺1M"` (gereksiz sıfır yok) · `compact(150000000) → "₺1,5M"`
- `compact(1234500) → "₺12,35K"` · `compact(1234500, { style: 'B/Mn/Mr' }) → "₺12,35B"`
- `compact(100000000000) → "₺1B"` (K/M) · `compact(100000000000, { style: 'B/Mn/Mr' }) → "₺1Mr"`
- `compact(50000) → "₺500"` (1.000 TL altı, normal format) · `compact(-123456789) → "-₺1,23M"`
- `compact(0) → "0"` · `compact(null) → "—"` · `compact(123456789, { form: 'text' }) → "1,23M TL"`
- Ölçek sınırı: `compact(99999900) → "₺1M"` · `compact(99999990000) → "₺1B"` · `compact(99990000) → "₺999,9K"` (atlamaz)

### `money` — entegrasyon notları
- **Girdi kuruş, integer.** Float birim kullanan tüketici, `format`'a vermeden önce `×100` + `math.round`; çıktı zaten string.
- `format(null) → "—"` davranışı, boş-string/`|| 0` default'larından farklıdır — taşımada gösterim
  değişebilir (boş yerine "—"). Testle doğrulanmalı.
- `toWords` ve `format` **çakışan `kurus` isimlendirmesine** dikkat (parametre vs opsiyon).
- `parseNumber`/`formatGroupedInput` giriş-kutusu (form input) yardımcılarıdır.

---

## Motor: `currency`

Parametrik kur çevrimi. **Motor hiçbir yerden kur çekmez — kur her zaman parametre.** Tüm
tutarlar kuruş (minor unit) tam sayı. Sonuç `math.round(..., 0)` ile kuruşa yuvarlanır (half-up).

**Bağımlılık:** `math` (mul/div/round).

### `convert(amountMinor: number, rate: number): number | null`
Tekli kur çevrimi: `amountMinor × rate`, kuruşa yuvarlanmış.
**Null durumu:** `rate ≤ 0`, `rate`/`amountMinor` sonsuz/NaN → `null`. `amountMinor === 0` → `0` (null değil).
Örnekler:
- `convert(10000, 34.25) → 342500` (100,00 birim × 34,25)
- `convert(10000, 1) → 10000`
- `convert(333, 34.25) → 11405` (3,33 × 34,25 = 114,0525 → half-up 11405 kuruş)
- `convert(10000, 0) → null` · `convert(10000, -5) → null` · `convert(10000, NaN) → null`
- `convert(0, 34.25) → 0`

### `cross(amountMinor: number, fromRate: number, toRate: number): number | null`
Çapraz çevrim: `amountMinor × fromRate ÷ toRate`, kuruşa yuvarlanmış. (Ör. USD→TRY→EUR.)
**Null durumu:** `fromRate ≤ 0` veya `toRate ≤ 0` veya herhangi biri sonsuz/NaN → `null`. `amountMinor === 0` → `0`.
Örnekler:
- `cross(10000, 34, 37) → 9189` (100 USD × 34 = 3400 TRY ÷ 37 = 9189,18... → 9189 kuruş EUR)
- `cross(3700, 37, 34) → 4026` (half-up)
- `cross(10000, 34, 0) → null` · `cross(10000, 0, 37) → null`

### `currency` — entegrasyon notları
- **Kur enjeksiyonu:** Kur dış kaynaktan (ör. günlük kur tablosu) okunur; motora **parametre** olarak
  verilir (motor DB/API bilmez).
- Girdi/çıktı **kuruş**. Float birim ile çalışan tüketici `×100` giriş / `÷100` çıkış adapter'ı ekler.
- `rate ≤ 0 → null`: ham çarpım (`rate * amount`) veya `|| 0` kullanan kod, geçişte null ele almalı.

---

## Motor: `gold`

Ons/USD ve USD/TRY üzerinden standart saflıklarla gram altın ve ziynet. **Çıktı tamsayı kuruş.**
1 ons = **31.1034768** gram (troy).

**Bağımlılık:** `math` (div/mul/round).

**Export sabitler:**
- `ONS_TO_GRAM = 31.1034768`
- `PURITY: Record<number, number> = { 24: 0.995, 22: 0.916, 21: 0.875, 18: 0.750 }`
- `ZIYNET_GRAM: Record<string, number> = { quarter: 1.754, half: 3.508, full: 7.016 }`

Hesap zinciri: `div(onsUsd, 31.1034768) → mul(purity) → mul(usdTry) → round(×100, 0)` → kuruş.

### `gramGoldPrice(onsUsd: number, usdTry: number, karat: number): number | null`
Gram altın fiyatı (kuruş). `karat` ∈ {24, 22, 21, 18}.
**Null durumu:** `onsUsd ≤ 0`, `usdTry ≤ 0`, herhangi biri NaN/sonsuz, veya `karat` haritada yok → `null`.
Örnekler (ons=2650, usdTry=34.20):
- `gramGoldPrice(2650, 34.20, 24) → 289925` (0.995)
- `gramGoldPrice(2650, 34.20, 22) → 266906` (0.916)
- `gramGoldPrice(2650, 34.20, 21) → 254959` (0.875)
- `gramGoldPrice(2650, 34.20, 18) → 218537` (0.750)
- `gramGoldPrice(2650, 34.20, 19) → null` (geçersiz karat)
- `gramGoldPrice(0, 34.20, 22) → null` · `gramGoldPrice(-2650, ...) → null` · `gramGoldPrice(NaN, ...) → null`

### `ziynetPrice(type: string, onsUsd: number, usdTry: number): number | null`
Ziynet fiyatı (kuruş). `type` ∈ {'quarter', 'half', 'full'}. **Daima 22 ayar (0.916) üzerinden**
hesaplanır: `gram22 × ziynet_gramaj`. (İçeride `gramGoldPrice` çağırmaz, 22K'yı kendi hesaplar.)
**Null durumu:** `onsUsd ≤ 0`, `usdTry ≤ 0`, geçersiz/NaN, veya `type` haritada yok → `null`.
Örnekler (ons=2650, usdTry=34.20):
- `ziynetPrice('quarter', 2650, 34.20) → 468153` (1.754 g)
- `ziynetPrice('half', 2650, 34.20) → 936307` (3.508 g)
- `ziynetPrice('full', 2650, 34.20) → 1872613` (7.016 g)
- `ziynetPrice('bilinmeyen', ...) → null` · `ziynetPrice('quarter', 0, 34.20) → null`

### `gold` — entegrasyon notları
- **Standart saflıklar B-otoritedir** (24K=0.995, 22K=0.916, 21K=0.875, 18K=0.750). Tüketicinin eski
  saflık değerleri farklıysa, taşımada bilinçli düzeltmeler testle tek tek onaylanmalı.
- **Ziynet daima 22K:** İnline `gram × 1.754` çarpımı yapan kod, `ziynetPrice` ile değiştirilebilir
  (aynı mantık + kuruş-çıktı + null-güvenli).
- Çıktı **kuruş**; float birim bekleyen taraf `÷100` adapter ekler.

---

## Motor: `silver`

Ons/USD ve USD/TRY üzerinden milyem saflıklarıyla gram gümüş. **Çıktı tamsayı kuruş.**
1 troy ons = **31.1034768** gram (altınla aynı evrensel troy ons).

**Bağımlılık:** `math` (div/mul/round).

**Export sabitler:**
- `ONS_TO_GRAM = 31.1034768`
- `SILVER_PURITY: Record<number, number> = { 999: 0.999, 925: 0.925, 800: 0.800, 1000: 1.000 }`

### `gramSilverPrice(onsUsd: number, usdTry: number, millesimal = 999): number | null`
Gram gümüş fiyatı (kuruş). `millesimal` ∈ {999, 925, 800, 1000}; varsayılan **999** (külçe saf).
**Null durumu:** `onsUsd ≤ 0`, `usdTry ≤ 0`, NaN/sonsuz, veya `millesimal` haritada yok → `null`.
Örnekler (ons=31, usdTry=34.20):
- `gramSilverPrice(31, 34.20, 999) → 3405` (0.999 külçe)
- `gramSilverPrice(31, 34.20, 925) → 3153` (0.925 sterling)
- `gramSilverPrice(31, 34.20, 800) → 2727` (0.800)
- `gramSilverPrice(31, 34.20, 1000) → 3409` (1.000 teorik saf)
- `gramSilverPrice(31, 34.20) → 3405` (varsayılan 999)
- `gramSilverPrice(31, 34.20, 700) → null` (haritada yok)
- `gramSilverPrice(0, ...) → null` · `gramSilverPrice(31, 0, ...) → null`

### `silver` — entegrasyon notları
- İnline `(ons / ONS_TO_GRAM) × usdTry × saflık × 100` hesabı yapan kod, `gramSilverPrice` ile
  değiştirilebilir (aynı mantık + null-güvenli + milyem parametrik).
- Tek saflık (0.999) kullanan tüketici, core varsayılanı 999 ile eşleşir.
- Çıktı **kuruş**; float birim bekleyen taraf `÷100` adapter ekler.

---

## Motor: `date`

`Intl` bağımsız Türkçe tarih biçimlendirme ve gün aritmetiği. **Girdi ISO string** ("2026-08-15"
veya "2026-08-15T21:30:00Z"), `Date` nesnesi DEĞİL. Ay/gün isimleri sabit dizilerden gelir (locale
bağımsız, deterministik).

**Bağımlılık:** `math` (abs/div/round/sub).

**⚠️ KRİTİK — UTC tabanlı:** Motor tarihleri **UTC** olarak yorumlar (`Date.UTC`, `getUTCDay`).
Yerel saat dilimi kullanmaz. Bir tüketici tarih işlemlerini yerel TZ ile yapıyorsa, bu motora
geçişte **gün kayması** riski vardır (özellikle gece yarısı/gün sınırında).

**Tip:** `DateFormatStyle = 'short' | 'long' | 'dayMonth' | 'monthYear' | 'period'`.

### `format(iso: string | null | undefined, style: DateFormatStyle = 'short'): string`
ISO tarihi Türkçe metne çevirir. ISO'nun saat kısmı (`T...`) yok sayılır. Geçersiz/null/boş/hatalı → `'—'`.
Stiller (örnek: `2026-08-15`):
- `short` (varsayılan) → `"15.08.2026"` (GG.AA.YYYY, sıfır-dolgulu)
- `long` → `"15 Ağustos 2026"` (GG Ay YYYY, gün sıfır-dolgusuz: `2026-12-01` → `"1 Aralık 2026"`)
- `dayMonth` → `"15 Ağu."` (GG kısaAy.)
- `monthYear` → `"Ağustos 2026"`
- `period` → `"08/2026"` (AA/YYYY)
Diğer örnekler:
- `format('2026-01-05') → "05.01.2026"` (tek hane sıfır-dolgulu)
- `format('2026-08-15T21:30:00Z') → "15.08.2026"` (saat yok sayılır)
- `format(null) → "—"` · `format('') → "—"` · `format('abc') → "—"` · `format('2026-13-45') → "—"`

### `daysBetween(isoA: string, isoB: string): number | null`
Gün farkı (`isoB - isoA`), UTC gün bazında. Geçersiz girdide `null`.
Örnek: `daysBetween('2026-08-10', '2026-08-15') → 5` · `daysBetween('2026-08-15', '2026-08-10') → -5`
· `daysBetween('2026-01-01', '2026-12-31') → 364` · `daysBetween('abc', ...) → null`.

### `daysUntil(iso: string, today: string): number | null`
Bugünden hedefe gün farkı (`iso - today`); `daysBetween(today, iso)` sarmalayıcısı. **Bugün parametre.**
Örnek: `daysUntil('2026-08-20', '2026-08-15') → 5` · `daysUntil('2026-08-10', '2026-08-15') → -5`.

### `relative(iso: string, today: string): string`
Türkçe bağıl zaman. **Bugün parametre** (saf/deterministik). Geçersizde `'—'`.
Örnek: `relative('2026-08-15', '2026-08-15') → "bugün"` · `dün` (-1) · `yarın` (+1)
· `relative('2026-08-12', '2026-08-15') → "3 gün önce"` · `relative('2026-08-18', '2026-08-15') → "3 gün sonra"`.

### `dayName(iso: string): string`
Türkçe kısa gün adı (Paz/Pzt/Sal/Çar/Per/Cum/Cts), **UTC gününe göre**. Geçersizde `'—'`.
Örnek: `dayName('2026-08-15') → "Cts"` · `dayName('2026-08-17') → "Pzt"` · `dayName('invalid') → "—"`.

### `date` — entegrasyon notları
- **⚠️ TZ tuzağı (en kritik):** Core UTC yorumlar; yerel-TZ tabanlı tarih kodu bu motora geçince
  **gün kayması** üretebilir. Taşıma testle dikkatli yönetilmeli; gece yarısı sınır case'leri test edilmeli.
- **Girdi ISO string:** `Date` nesnesi geçiren kod önce ISO'ya çevirmeli (`.toISOString()` + TZ farkına
  dikkat). `date.format(new Date())` **yanlıştır** — `Date` değil ISO string beklenir.
- `daysUntil`/`relative` **bugünü parametre** alır — çağıran `today`'i açıkça vermeli (saf motor `new Date()` çağırmaz).
- Geçersizde `'—'`: boş-string/null default'larından farklı, gösterim değişebilir.

---

## Motor: `text`

Türkçe metin işleme: harf dönüşümü (İ/ı güvenli), normalizasyon (telefon/e-posta/web/ad/firma),
sayı→yazı ve Türkçe ek çekimi. En kapsamlı motor.

**Motor-içi bağımlılıklar (KRİTİK — döngüsel):**
- `text` → `math` (div/floor/mod — numberToWords için)
- `text` → `money` (`format` — suffix 'money' türü için)
- `text` → `validate` (`email` — email normalizasyonu SSOT için)
- **Ters yön:** `money` → `text` (`numberToWords` — toWords için).
Yani `text` ↔ `money` **karşılıklı bağımlı**. Taşımada biri geçerse diğeri de tutarlı olmalı.

**Normalizasyon dönüş tipi:** `NormalizeResult { stored, display, raw, valid }`.
`stored` = kanonik/DB formu, `display` = gösterim formu, `raw` = ham girdi, `valid` = geçerli mi.
Geçersizde `stored`/`display` boş, `valid: false`, `raw` korunur.

### Harf dönüşümü

**`toAsciiLower(str): string`** — ASCII küçültme (I→i, Türkçe ı değil). E-posta/web için.
**`toTrLower(str): string`** ve takma adı **`lower`** — Türkçe küçültme (İ→i, I→ı harita).
Örnek: `lower('İSTANBUL') → "istanbul"` · `lower('IŞIK') → "ışık"`.
**`upper(str): string`** — Türkçe büyütme (i→İ, ı→I). Örnek: `upper('iğne') → "İĞNE"` · `upper('ışık') → "IŞIK"`.
**`title(str): string`** — Başlık biçimi + istisna sözlüğü. Bağlaçlar (ve/ile/veya...) küçük
(ama ilk kelimeyse büyük), kısaltmalar (TYC/A.Ş.) korunur. Örnek: `title('ahmet yılmaz') → "Ahmet Yılmaz"`
· `title('iSTANBUL') → "İstanbul"` · `title('abc san ve tic') → "Abc San ve Tic"` · `title('ve abc') → "Ve Abc"`
· `title('tyc grup') → "TYC Grup"`.

### `join(items: string[]): string`
Türkçe liste bağlama ("A, B ve C"). Boş elemanlar elenir. Örnek: `join(['Ali','Veli']) → "Ali ve Veli"`
· `join(['Ali','Veli','Can']) → "Ali, Veli ve Can"` · `join(['Ali','','Can']) → "Ali ve Can"` · `join([]) → ""`.

### Normalizasyon (hepsi `NormalizeResult` döner)

**`phone(raw): NormalizeResult`** — TR cep normalizasyonu. 4 giriş formatı kabul: `05...` (11h),
`5...` (10h), `+90...`/`90...` (12h). `stored` = `+90` + 10 hane, `display` = `+90 (5XX) XXX XX XX`.
Örnek: `phone('05321234567').stored → "+905321234567"`, `.display → "+90 (532) 123 45 67"`, `.valid → true`.
Geçersiz (`phone('123')`): boş stored/display, `valid: false`.

**`whatsapp(raw): string`** — wa.me linki. Örnek: `whatsapp('05321234567') → "https://wa.me/905321234567"` · geçersizde `""`.

**`email(raw): NormalizeResult`** — `toAsciiLower` + trim + `validate.email` doğrulaması (SSOT).
Örnek: `email('  Info@X.CoM ').stored → "info@x.com"`, `.valid → true` · `email('abc').valid → false`.

**`website(raw): NormalizeResult`** — çıplak host (https://, www., sondaki / temizlenir).
Örnek: `website('https://www.example.com/').stored → "example.com"`.
**`websiteUrl(raw): string`** — `https://` + host. Örnek: `websiteUrl('example.com') → "https://example.com"` · geçersizde `""`.

**`name(raw): NormalizeResult`** — boşluk temizleme + `title` casing. Örnek: `name('  MEHMET   ali  ÖZ ').stored → "Mehmet Ali Öz"`
· `name('ışık deniz').stored → "Işık Deniz"` · `name('').valid → false`.

**`company(raw): NormalizeResult`** — firma unvanı + kısaltma sözlüğü (sanayi→San., ticaret→Tic.,
limited şirketi→Ltd.Şti., anonim şirketi→A.Ş., inşaat→İnş., ithalat→İth., pazarlama→Paz.).
Örnek: `company('abc sanayi ve ticaret limited şirketi').stored → "Abc San. ve Tic. Ltd.Şti."`
· `company('xyz inşaat anonim şirketi').stored → "Xyz İnş. A.Ş."` · `company('tyc grup pazarlama').stored → "TYC Grup Paz."`.

### `numberToWords(n: number, opts?: { spaced?: boolean }): string`
Sayı → Türkçe yazı. "Bir düşme" kuralı: 100→Yüz, 1000→Bin, ama 1.000.000→BirMilyon.
Örnek: `numberToWords(0) → "Sıfır"` · `numberToWords(345) → "ÜçYüzKırkBeş"` · `numberToWords(1000) → "Bin"`
· `numberToWords(2000) → "İkiBin"` · `numberToWords(1000000) → "BirMilyon"` · `numberToWords(1001) → "BinBir"`
· `numberToWords(100100) → "YüzBinYüz"` · `numberToWords(3345334, { spaced: true }) → "Üç Milyon Üç Yüz Kırk Beş Bin Üç Yüz Otuz Dört"`.

### `suffix(value: number, kind: SuffixKind, arg: SuffixArg): string`
Türkçe ek çekimi. Ekler değerin **okunuşunun son sesine** göre (ünlü uyumu + sert ünsüz).
Kesme işareti (`'`) daima eklenir.
- `SuffixKind = 'number' | 'money' | 'percent' | 'year'` — money → `₺` formatı + "lira" okunuşu; percent → `%` öneki.
- `SuffixArg` = ya string hâl (`'loc'|'dat'|'abl'|'acc'|'gen'`) ya da `{ hal?, iyelik? }`.
- `SuffixCase`: loc (bulunma -de), dat (yönelme -e), abl (çıkma -den), acc (belirtme -i), gen (tamlama -in).
- `Iyelik`: benim/senin/onun/bizim/sizin/onların. onun/onların'da pronominal-n araya girer.

**Hâl örnekleri:**
- loc: `suffix(2026,'year','loc') → "2026'da"` · `suffix(2025,'year','loc') → "2025'te"` · `suffix(40,'number','loc') → "40'ta"` · `suffix(3,'number','loc') → "3'te"`
- abl: `suffix(2026,'year','abl') → "2026'dan"` · `suffix(5,'number','abl') → "5'ten"`
- dat: `suffix(2,'number','dat') → "2'ye"` · `suffix(40,'number','dat') → "40'a"` · `suffix(3,'number','dat') → "3'e"`
- acc: `suffix(3,'number','acc') → "3'ü"` · `suffix(2,'number','acc') → "2'yi"` · `suffix(40,'number','acc') → "40'ı"`
- gen: `suffix(3,'number','gen') → "3'ün"` · `suffix(2,'number','gen') → "2'nin"` · `suffix(2026,'year','gen') → "2026'nın"`

**kind örnekleri:** `suffix(150000,'money','loc') → "₺1.500'da"` · `suffix(2,'percent','dat') → "%2'ye"`.

**İyelik (yalın):** `suffix(3,'number',{iyelik:'benim'}) → "3'üm"` · `suffix(2,'number',{iyelik:'onun'}) → "2'si"`
· `suffix(40,'number',{iyelik:'bizim'}) → "40'ımız"` · `suffix(40,'number',{iyelik:'onların'}) → "40'ları"`.

**İyelik + hâl (pronominal-n):** `suffix(3,'number',{iyelik:'onun',hal:'dat'}) → "3'üne"`
· `suffix(3,'number',{iyelik:'onun',hal:'loc'}) → "3'ünde"` · `suffix(40,'number',{iyelik:'benim',hal:'loc'}) → "40'ımda"`
· `suffix(40,'number',{iyelik:'onların',hal:'dat'}) → "40'larına"` · `suffix(150000,'money',{iyelik:'onun',hal:'dat'}) → "₺1.500'sına"`.

### Fonetik yardımcılar (dahili amaçlı, nadiren doğrudan kullanılır)
`lastVowel(word) → string|null` (son ünlü), `isBackVowel(v) → boolean` (kalın: a/ı/o/u),
`isRoundedVowel(v) → boolean` (yuvarlak: o/ö/u/ü), `endsWithHardConsonant(word) → boolean` (f/s/t/k/ç/ş/h/p),
`endsWithVowel(word) → boolean`. `suffix`'in ünlü uyumu altyapısı.

### `text` — entegrasyon notları
- **Karşılıklı bağımlılık `text↔money`:** İkisini ayrı ayrı taşımak zor; birlikte planlanmalı.
- **`stored` vs `display` ayrımı:** DB'ye ne yazıldığı ve ekrana ne basıldığı normalizasyon taşınırken
  doğru eşlenmeli (DB'ye `stored`, UI'a `display`).
- **`upper`/`lower` harf farkı:** Ham `toUpperCase`/`toLowerCase` kullanan kod (İ/ı hataları) bu motora
  geçince Türkçe harf davranışı **değişir** (düzelir) — testle yakalanmalı.
- Ayrı bir doğrulama katmanı (checksum + normalize) varsa, `text.name`/`text.phone` + `validate` üçlüsü
  bunların yerini alabilir.

---

## Motor: `validate`

Türkiye resmi checksum doğrulamaları + e-posta. Hepsi **boolean** döner (geçersizde `false`).

**Bağımlılık:** `text` (`upper` — iban normalizasyonu için).

### `vkn(s: string): boolean`
Vergi Kimlik No (10 hane) resmi checksum. Örnek: `vkn('1111111114') → true` · `vkn('1111111115') → false`
· `vkn('123') → false` · `vkn('') → false`.

### `tckn(s: string): boolean`
T.C. Kimlik No (11 hane) resmi checksum. İlk hane 0 olamaz; tüm haneleri aynı olanlar geçersiz.
Örnek: `tckn('10000000078') → true` · `tckn('11111111111') → false` (hepsi aynı) · `tckn('01000000078') → false` (ilk 0)
· `tckn('1000000007') → false` (eksik hane).

### `ikn(s: string): boolean`
İhale Kayıt No, biçim `YYYY/N...` (4 hane yıl / 5-7 hane numara). Örnek: `ikn('2026/1298071') → true`
· `ikn('2026-1298071') → false` (yanlış ayraç) · `ikn('26/12') → false`.

### `iban(s: string): boolean`
TR IBAN mod-97. Boşluk temizlenir, `text.upper` ile büyütülür. TR + 24 rakam = 26 karakter.
Örnek: `iban('TR40 0006 2000 0000 0000 0000 01') → true` · `iban('TR400006200000000000000001') → true`
· `iban('DE400006200000000000000001') → false` (TR değil) · `iban('TR12345') → false`.

### `email(s: string): boolean`
E-posta format (user@domain.tld). Örnek: `email('a@b.com') → true` · `email('abc') → false` · `email('a@b') → false`.

### `validate` — entegrasyon notları
- vkn/tckn/iban checksum'ları resmi TR standardıdır (B-otorite). Ham regex/checksum kullanan kod
  bu motora taşınabilir; davranış farkı testle yakalanmalı.
- `text.email` bu motorun `email`'ini SSOT olarak kullanır — ikisi tutarlı.

---

## Motor: `mask`

PII gizleme (gösterim amaçlı). **Saklanan gerçek veriyi mutasyona uğratmaz** — sadece maskeli string üretir.
Geçersizde `'—'` (em-dash).

**Bağımlılık:** `text` (`phone`/`upper`).

### `money(): string`
Sabit `"****"` döner (tutar gizleme). Parametresiz. Örnek: `money() → "****"`.

### `vkn(s: string): string`
VKN maskeleme: ilk 3 + `****` + son 3. Boşluk temizlenir. Örnek: `vkn('1234567890') → "123****890"`
· `vkn(' 123 456 7890 ') → "123****890"` · `vkn('12') → "—"` · `vkn('') → "—"`.

### `iban(s: string): string`
TR IBAN maskeleme: son 2 hane açık. Örnek: `iban('TR400006200000000000000001') → "TR** **** **** **** **** **01"`
· `iban('tr40 0006 2000 0000 0000 0000 01') → "TR** **** **** **** **** **01"` (normalize) · `iban('DE...') → "—"`.

### `phone(s: string): string`
TR cep maskeleme: +90, ilk 5, son 2 açık. `text.phone` ile normalize. Örnek: `phone('+905321234567') → "+90 5** *** ** 67"`
· `phone('05321234567') → "+90 5** *** ** 67"` · `phone('123') → "—"` · `phone('02123456789') → "—"` (cep değil).

### `mask` — entegrasyon notları
- **Gösterim-only:** DB'ye maskeli değer YAZILMAZ; gerçek veri (`stored`) korunur, `mask.*` sadece ekran.
- PII gösteren kod (telefon/IBAN) bu motora taşınabilir; ham veri korunur.

---

## Motor: `tradingMath`

BIST/VİOP ticari işlem matematiği: yön geçerliliği, risk/ödül, portföy oranları, fırsat eşiği, pozisyon.
3 alt-modül (`engine-math`, `opportunity`, `position`), tek namespace altında.
**Parasal değerler kuruş integer.**

**Bağımlılık:** `math`, `currency`.

**Kapsam:** Bu motor BIST/trading işlemleri içindir; finansal işlem/portföy uygulamaları için tasarlanmıştır.

### `validateTradeDirections(priceMinor, stopMinor, tpMinor, isLong: boolean): DirectionValidity`
Yön geçerliliği. Long: stop < price, tp > price. Short: stop > price, tp < price. Fiyat/stop/tp ≤ 0 → ilgili bayrak false.
Dönüş: `{ stopValid, tpValid }`. Örnek (long): `validateTradeDirections(10000, 9500, 11000, true) → { stopValid: true, tpValid: true }`.

### `computeRiskReward(priceMinor, stopMinor, tpMinor, qty, multiplier, isLong, stopValid, tpValid, rate: number | null): RiskRewardResult`
Olası kayıp/kazanç (native + TRY kuruş) ve R:R oranı. `rate === null` → TRY alanları `null` (sessiz 0 yok).
Dönüş: `{ potentialLossNative, potentialProfitNative, potentialLossTRY, potentialProfitTRY, rr }`.
Örnek (long, rate=1): `computeRiskReward(10000, 9500, 11000, 10, 1, true, true, true, 1)` →
`{ potentialLossNative: 5000, potentialProfitNative: 10000, potentialLossTRY: 5000, potentialProfitTRY: 10000, rr: 2 }`.
rate=34 → TRY alanları 170000/340000. rate=null → TRY alanları null. tpValid=false → profit 0, rr null.

### `computePortfolioRatios(volumeTRY, volumeNative, potentialLossTRY, potentialLossNative, totalKasaTRY, subKasaNative): PortfolioRatios`
Portföy yoğunlaşma + risk yüzdeleri. Pay/payda null veya payda ≤ 0 → ilgili oran `null`; pay 0 → geçerli `0%`.
Dönüş: `{ exposurePctTotal, exposurePctSub, riskPctTotal, riskPctSub }`.
Örnek: `computePortfolioRatios(100_000_000, 100_000_000, 5_000_000, 5_000_000, 1_000_000_000, 500_000_000)` →
`{ exposurePctTotal: 10, exposurePctSub: 20, riskPctTotal: 0.5, riskPctSub: 1 }`. `totalKasaTRY = null` → total oranları null.

### `calculateThresholdDays(targetReturnRatio: number, annualRate: number): number | null`
Fırsat maliyeti eşik günü (bileşik faiz). `(1 + annualRate/100)^(1/365) - 1` günlük oran; hedefe kaç gün.
`≤ 0`/geçersiz girdi → `null`; sonuç en az 1. Örnek: `calculateThresholdDays(0.10, 35) → 116` · `calculateThresholdDays(0.01, 35) → 12`
· `calculateThresholdDays(0, 35) → null`.

### `volumeFromQty(qty, priceMinor, multiplier): number`
Hacim = qty × fiyat × çarpan (kuruş). Geçersiz (≤0) → 0. Örnek: `volumeFromQty(100, 14550, 1) → 1455000`
· `volumeFromQty(10, 10000, 100) → 10000000` (VİOP).

### `qtyFromVolume(volumeMinor, priceMinor, multiplier, fractional: boolean): number`
Hacimden miktar. `fractional=false` → floor (tam sayı), `true` → ondalık. Geçersiz/payda≤0 → 0 (sentinel).
Örnek: `qtyFromVolume(1_455_000, 14550, 1, false) → 100` · `qtyFromVolume(1_500_000, 14550, 1, false) → 103` (floor)
· `qtyFromVolume(1_500_000, 14550, 1, true) → 103.0927...`.

### `leverage(volumeNativeMinor, capitalUsedNativeMinor): number | null`
Kaldıraç = hacim ÷ teminat. Teminat ≤ 0 → `null` (sessiz 1 yok). Örnek: `leverage(10_000_000, 2_000_000) → 5`
· `leverage(10_000_000, 0) → null`.

### `tradingMath` — entegrasyon notları
- Parasal girdiler kuruş integer; float birim kullanan taraf `×100`/`÷100` adapter ekler.
- BIST-Radar, portföy/pozisyon yönetimi gibi trading projeleri için tasarlanmıştır.
