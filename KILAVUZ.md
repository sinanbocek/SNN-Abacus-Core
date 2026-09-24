# 📘 ABACUS Kullanım Kılavuzu

Bu kılavuz `@snn/abacus-core` içindeki **her motoru ve her fonksiyonu** örnekleriyle
anlatır ve aynı iş için birden fazla seçenek olduğunda **hangisini seçeceğinizi**
gösterir.

> ✅ **Buradaki örnekler çalışır.** Kod bloklarındaki her `ifade // → sonuç` satırı
> `src/abacus/kilavuz.test.ts` tarafından gerçekten çalıştırılır ve sonuç
> karşılaştırılır. Kılavuz yanlış bir örnek içeremez; yeni bir fonksiyon eklenip
> buraya yazılmazsa da test kırılır.

Kurulum için [INSTALL.md](INSTALL.md) · her ayrıntı için
[SNN-ABACUS-CORE-MOTOR-DETAYLARI.md](SNN-ABACUS-CORE-MOTOR-DETAYLARI.md) ·
çekirdeğe talep göndermeden önce [GERI-BILDIRIM-KAYDI.md](GERI-BILDIRIM-KAYDI.md).

```ts
import { math, money, currency, date, period, text, validate, mask,
         collate, unit, gold, silver, tradingMath } from '@snn/abacus-core';
```

## İçindekiler

1. [Önce bunları bilin](#1-önce-bunları-bilin)
2. [Hangisini kullanmalıyım?](#2-hangisini-kullanmalıyım)
3. [`math` — hassas hesap](#3-math--hassas-hesap)
4. [`money` — para](#4-money--para)
5. [`currency` — kur çevrimi](#5-currency--kur-çevrimi)
6. [`date` — tarih biçimleme ve sorgulama](#6-date--tarih-biçimleme-ve-sorgulama)
7. [`period` — tarih üretme](#7-period--tarih-üretme)
8. [`text` — Türkçe metin](#8-text--türkçe-metin)
9. [`validate` — doğrulama](#9-validate--doğrulama)
10. [`mask` — kişisel veriyi gizleme](#10-mask--kişisel-veriyi-gizleme)
11. [`collate` — Türkçe sıralama](#11-collate--türkçe-sıralama)
12. [`unit` — birim çevrimi](#12-unit--birim-çevrimi)
13. [`gold` ve `silver` — değerli maden](#13-gold-ve-silver--değerli-maden)
14. [`tradingMath` — işlem hesapları](#14-tradingmath--işlem-hesapları)
15. [Sık yapılan hatalar](#15-sık-yapılan-hatalar)

---

## 1. Önce bunları bilin

**Para kuruş olarak tutulur.** `150000` kuruş = 1.500 TL. Float ile para tutmak
(`15.99 * 100`) kuruş kaybettirir; çekirdek bunun için var.

**Hata sessizce 0 olmaz.** Hesaplanamayan işlem ne döndürüyorsa işin türü belirler:

| İş | Geçersiz girdide | Örnek |
|---|---|---|
| Hesap (sayı üretir) | `null` | `math.div(1, 0)` |
| Biçimleme (metin üretir) | `'—'` | `money.format(NaN)` |
| Doğrulama | `false` | `validate.tckn('123')` |
| Normalizasyon | `{ valid: false, ... }` | `text.phone('123')` |

```js
math.div(1, 0)            // → null
money.format(NaN)         // → '—'
validate.tckn('123')      // → false
text.phone('123').valid   // → false
```

**Tarih bir ISO metnidir, `Date` nesnesi değildir.** `'2026-08-15'` verin,
`new Date()` vermeyin. Saat taşıyan değerler **Europe/Istanbul** saatine göre
değerlendirilir, bu yüzden gün kayabilir:

```js
date.format('2026-08-15T21:30:00Z')   // → '16.08.2026'
```

---

## 2. Hangisini kullanmalıyım?

### Parayı yazmak

| Elinizdeki | İstediğiniz | Kullanın |
|---|---|---|
| Kuruş (`150000`) | `₺1.500` | `money.format` |
| Lira (`1500`) | `₺1.500` | `money.formatMajor` |
| Kuruş, büyük tutar | `₺1,5M` | `money.compact` |
| Lira, büyük tutar | `₺1,5M` | `money.compactMajor` |
| Kuruş, giriş kutusu için | `1.500` (simgesiz) | `money.formatMinorInput` |
| Sıradan sayı | `1.234,5` | `money.fmtDecimalGrouped` / `money.decimal` |

```js
money.format(150000)          // → '₺1.500'
money.formatMajor(1500)       // → '₺1.500'
money.format(1500)            // → '₺15'
```

⚠️ Son satır en sık yapılan hatadır: tutarınız **lira** iken `format` çağırırsanız
sonuç **100 kat küçük** çıkar. Bunu derleme sırasında yakalamak için çekirdeğin ESLint
kuralını ekleyin ([INSTALL.md §6.1](INSTALL.md)).

### Yüzde

| İstediğiniz | Kullanın | Sonuç türü |
|---|---|---|
| Bir oranın yüzdesi (`25 / 100`) | `math.percent` | sayı |
| İki ölçüm arasındaki değişim (`100 → 150`) | `math.percentChange` | sayı |
| Ekranda yüzde yazmak | `money.percent` | metin |

```js
math.percent(25, 100)          // → 25
math.percentChange(150, 100)   // → 50
money.percent(12.345, 1)       // → '%12,3'
```

### Metinden sayıya

| Girdi | İstediğiniz | Kullanın |
|---|---|---|
| `'₺1.234,56'` | kuruş `123456` | `money.parse` |
| `'1.234,56'` | sayı `1234.56` | `money.parseNumber` |
| sayı `1234.56` | kuruş `123456` | `money.toMinor` |

```js
money.parse('₺1.234,56')       // → 123456
money.parseNumber('1.234,56')  // → 1234.56
money.toMinor(1234.56)         // → 123456
```

### Yuvarlamak

```js
math.round(2.5)     // → 3
math.round(-2.5)    // → -3
math.floor(2.7)     // → 2
math.ceil(2.1)      // → 3
```

⚠️ `math.round` **half-up** yuvarlar; ham JS farklı sonuç verir:

```js
Math.round(-2.5)    // → -2
```

Bir toplamı parçalara bölüp **parçaları** yuvarlıyorsanız `round` değil `math.allocate`
kullanın — ayrı yuvarlanan parçaların toplamı tutmaz (bkz. §3 Havuz dağıtımı).

### Logaritma

`math.log` doğal logaritmadır. Basamak sayısı veya büyüklük mertebesi için **`math.log10`**
kullanın; `log(x) / log(10)` ile taklit etmeyin — tam onluk kuvvetlerde bir basamak kayar:

```js
math.log10(1000)                           // → 3
math.div(math.log(1000), math.log(10))     // → 2.9999999999999996
```

### Tarih: `date` mi `period` mi?

**`date` sorgular ve biçimler, `period` yeni tarih üretir.**

| İstediğiniz | Kullanın |
|---|---|
| Tarihi ekrana yazmak | `date.format` |
| İki tarih arası gün | `date.daysBetween` |
| "Yarın", "3 gün önce" | `date.relative` |
| "5 dk önce", "3 saat önce" | `date.relativeTime` |
| Haftanın günü (ekran) | `date.dayName` |
| Haftanın günü (karar) | `date.weekday` / `date.isWeekend` |
| Bir tarihe gün/ay eklemek | `period.addDays` / `period.addMonths` |
| Ay başı / ay sonu | `period.startOfMonth` / `period.endOfMonth` |
| Çeyrek | `period.quarterOf` / `period.quarterRange` |

⚠️ İş kuralını **gün adına** bağlamayın (`dayName(iso) === 'Cts'`); ad bir gösterimdir.
Karar için `weekday` veya `isWeekend` kullanın.

### Küçük/büyük harf, arama, sıralama

| İstediğiniz | Kullanın |
|---|---|
| Türkçe küçük harf (ekranda gösterilecek metin) | `text.lower` / `text.toTrLower` |
| E-posta, web adresi (Türkçe kural uygulanmamalı) | `text.toAsciiLower` |
| ASCII KOD alanı büyütme (şasi, motor no, ürün kodu, barkod) | `text.toAsciiUpper` |
| Kutuya yalnız rakam girsin (canlı süzme) | `text.digits` |
| Para kutusu canlı biçim / geri okuma | `money.formatGroupedInput` / `money.parseNumber` |
| Arama / eşleştirme (Türkçe harfler katlanır) | `text.searchKey` |
| Alfabetik sıralama | `collate.sortBy` |

```js
text.lower('IŞIK')                 // → 'ışık'
text.toAsciiLower('ISIK')          // → 'isik'
text.toAsciiLower('INFO@X.COM')    // → 'info@x.com'
text.searchKey('Çağrı Öztürk')     // → 'cagri ozturk'
```

Aynı `I` harfi iki fonksiyonda farklı sonuç verir: Türkçe kuralda `I`'nın küçüğü `ı`,
ASCII kuralda `i`'dir. E-postada Türkçe kural uygulanırsa adres bozulur.

`searchKey` Türkçe harfleri ASCII'ye **katlar** (`ç`→`c`); arama kutusunda "cagri"
yazan kullanıcı "Çağrı"yı bulur. Sıralamada ise `ç` ve `c` **ayrı harflerdir**; o yüzden
sıralamak için `searchKey` değil `collate` kullanın.

### Doğrulama mı, normalizasyon mu, maskeleme mi?

| İstediğiniz | Kullanın | Döner |
|---|---|---|
| "Bu geçerli mi?" | `validate.*` | `true` / `false` |
| Temizleyip saklamak | `text.phone`, `text.email`, `text.plate`… | `{ stored, display, valid }` |
| Ekranda gizlemek | `mask.*` | `'123****890'` |

---

## 3. `math` — hassas hesap

`decimal.js` üzerinde çalışır; float hatası yoktur. Kuruş ve birim ayrımı yapmaz —
ne verirseniz onu hesaplar.

**Dört işlem ve kalan**

```js
math.add(0.1, 0.2)      // → 0.3
math.sub(0.3, 0.1)      // → 0.2
math.mul(19.99, 100)    // → 1999
math.div(10, 4)         // → 2.5
math.div(1, 0)          // → null
math.mod(10, 3)         // → 1
math.mod(10, 0)         // → null
```

Aynı işlemler ham JS'te:

```js
0.1 + 0.2           // → 0.30000000000000004
19.99 * 100         // → 1998.9999999999998
```

**Yuvarlama ve mutlak değer**

```js
math.round(2.345, 2)    // → 2.35
math.floor(-2.1)        // → -3
math.ceil(-2.1)         // → -2
math.abs(-5)            // → 5
```

**Oran, yüzde, değişim**

```js
math.ratio(1, 4)                // → 0.25
math.ratio(1, 0)                // → null
math.percent(1, 0)              // → null
math.percentChange(50, 100)     // → -50
math.percentChange(100, 0)      // → null
```

`percentChange` önceki değer 0 veya negatifse `null` döner: "değişim yok" ile
"hesaplanamadı" karışmasın.

**Üs, logaritma, en büyük**

```js
math.pow(2, 3)          // → 8
math.pow(-2, 0.5)       // → null
math.round(math.log(1.1), 5)   // → 0.09531
math.log10(1700000) > 6        // → true
math.log(0)             // → null
math.max(1, 5, 10, 3)   // → 10
math.max()              // → null
```

**Toleranslı eşitlik**

Float karşılaştırmasında `===` yanıltıcıdır:

```js
math.equals(0.1 + 0.2, 0.3)           // → false
math.equals(0.1 + 0.2, 0.3, 1e-7)     // → true
```

**İç verim oranı (IRR)**

Nakit akışının tamamı üzerinden **dönemsel** getiri veya maliyet oranı. Giren para
pozitif, çıkan negatif (ya da tersi). Kredinin gerçek maliyetini bulmak için faizi
değil, masraflar dâhil tüm akışı verin.

```js
math.round(math.irr([1000, -600, -600]), 6)   // → 0.130662
math.irr([1000, -500, -500])                   // → 0
math.irr([1000, 500])                          // → null
```

Dönen oran dizinin dönem birimindedir; aylık akıştan yıllığa: `math.pow(1 + r, 12) - 1`.

**Havuz dağıtımı**

Bir tutarı (navlun, kira, indirim) ağırlıklara göre kalemlere bölmek için
**`math.allocate`** kullanın. Tutar alt birimde (kuruş/cent) tam sayıdır; sonuçların
toplamı tutara **her zaman tam eşittir**.

```js
math.allocate(100000, [6080, 8160, 12080, 62360, 80120, 1560160, 133200, 120, 3820800], { residual: 'largest-remainder' })   // → [107, 144, 212, 1097, 1410, 27453, 2344, 2, 67231]
math.allocate(10, [1, 1, 1], { residual: 'largest-remainder' })               // → [4, 3, 3]
math.allocate(2000000, [3.7, 12.45, 0.08, 140.2], { residual: 'largest-remainder' })   // → [47305, 159177, 1023, 1792495]
math.allocate(-10, [1, 1, 1], { residual: 'largest-remainder' })              // → [-4, -3, -3]
math.allocate(1000, [0, 0], { residual: 'largest-remainder' })                // → null
```

Her payı ayrı yuvarlamak aynı veride havuzu **1 cent aşar** — hata sessizdir:

```js
[6080, 8160, 12080, 62360, 80120, 1560160, 133200, 120, 3820800].map((w) => math.round(100000 * w / 5683080)).reduce((a, b) => a + b)   // → 100001
```

| Soru | Cevap |
|---|---|
| Ağırlık ondalıklı olabilir mi? | **Evet** (m³, kg). Yalnız tutar tam sayı olmalı. |
| Artık birim kime gider? | En büyük kesirli kalana; eşitlikte önceki kaleme. `residual` zorunludur, şimdilik tek değeri `'largest-remainder'`. |
| Büyük ağırlık daha az pay alabilir mi? | **Hayır**, tek dağıtım içinde garantidir. |

⚠️ **Havuz büyüyünce bir kalemin payı azalabilir** (Alabama paradoksu). Hata değildir:

```js
math.allocate(40, [160, 4, 136, 17], { residual: 'largest-remainder' })   // → [20, 1, 17, 2]
math.allocate(41, [160, 4, 136, 17], { residual: 'largest-remainder' })   // → [21, 0, 18, 2]
```

---

## 4. `money` — para

**Kuruştan yazmak**

```js
money.format(150000)                           // → '₺1.500'
money.format(123456, { kurus: true })          // → '₺1.234,56'
money.format(150000, { form: 'text' })         // → '1.500 TL'
money.format(-150000, { negative: 'paren' })   // → '(₺1.500)'
money.format(123456, { currency: 'EUR', kurus: true })   // → '€1.234,56'
```

**Liradan yazmak**

```js
money.formatMajor(1234.56, { kurus: true })                    // → '₺1.234,56'
money.formatMajor(1.2345, { currency: 'TRY', digits: 4, kurus: true })   // → '₺1,2345'
```

`digits` para biriminin hane sayısını geçersiz kılar; simge ve kısaltma çekirdekte kalır.

**Sıfır tutar (tablo sütunu)**

```js
money.formatMajor(0, { kurus: true })                     // → '0,00'
money.formatMajor(0, { kurus: true, zero: 'symbol' })     // → '₺0,00'
```

Tabloda `₺1.234,56` ile `0,00` yan yana tutarsız durur; sütunda `zero: 'symbol'` verin.
Sıfırı elle yazmayın.

⚠️ **Simgeyi elle eklemeyin** (`tutar + ' ₺'`). Simge rakamın solunda ve boşluksuz
yazılır (`₺1.234,56`); metin içinde `formatMajor(v, { form: 'text' })` → `1.234,56 TL`.
Sondaki simge (`1.234,56 ₺`) resmî biçim değildir ve `money.parse` onu okumaz.
Yayınlanan ESLint yapılandırmasının `strict` seti bunu yakalar.

**Kısaltmak (grafik ekseni, özet kartları)**

```js
money.compact(150000000)                              // → '₺1,5M'
money.compact(150000000, { style: 'B/Mn/Mr' })        // → '₺1,5Mn'
money.compactMajor(1500000, { style: 'B/Mn/Mr' })     // → '₺1,5Mn'
money.compactMajor(1200000, { style: 'B/Mn/Mr', digits: 2 })           // → '₺1,20Mn'
money.compactMajor(1500, { style: 'B/Mn/Mr', minScale: 'million' })    // → '₺1.500'
```

Tablo sütununda `digits` verin, hepsi aynı hanede yazılır. `'B'` harfi varsayılan stilde
milyar, `B/Mn/Mr` stilinde bin demektir; Türkçe ekranda `minScale: 'million'` ile bin
ölçeği hiç kullanılmaz.

**Sayı ve yüzde yazmak**

```js
money.decimal(2.5)               // → '2,5'
money.decimal(2.5, 1.5)          // → '—'
money.fmtDecimalGrouped(70000)   // → '70.000'
money.ratio(8.712)               // → '8,71x'
money.percent(-3.2, 1)                        // → '-%3,2'
money.percent(-3.2, 1, { sign: 'never' })     // → '%3,2'
money.percent(3.2, 1, { sign: 'always' })     // → '+%3,2'
```

Yönü **renkle** anlatan arayüzlerde `sign: 'never'` kullanın; eksi işareti kırmızı
renkle üst üste binmez.

**Negatif yüzdeyi okunur yazmak ve tabloda hizalamak**

```js
money.percent(-4.3, 2)                                          // → '-%4,3'
money.percent(4.3, 2, { fixed: true })                          // → '%4,30'
money.percent(-4.3, 2, { fixed: true })                         // → '-%4,30'
money.percent(-4.3, 2, { signPosition: 'inner' })               // → '%-4,3'
```

`%` Türkçede sayının **solunda** durur (TDK: `%25`); `4,3%` İngilizce yazımdır.
Eksi ise en başa gelir (`-%4,3`) — tarayıcıların Türkçe biçimi, v3.0.0'dan beri
varsayılan. Tablolarda sütun hizası için `fixed: true` kullanın. v2.x'in `%-4,3`
yazımı gerekiyorsa `signPosition: 'inner'` verin.

**Metinden okumak**

```js
money.parse('₺1.234,56')          // → 123456
money.parse('abc')                // → null
money.parseNumber('1.234,56')     // → 1234.56
money.toMinor(19.99)              // → 1999
```

**Giriş kutuları**

```js
money.formatMinorInput(123456, 2)     // → '1.234,56'
money.formatGroupedInput('1234567')   // → '1.234.567'
```

`formatMinorInput` kutuda görünecek simgesiz metni üretir; `formatGroupedInput` kullanıcı
yazarken binlik ayraçları ekler.

**Tutarı yazıyla (dekont, fatura)**

```js
money.toWords(150000)                      // → 'Yalnız BinBeşYüzTürkLirası'
```

**Para birimleri**

```js
money.knownCurrencyCodes()     // → ['EUR', 'GBP', 'TRY', 'USD']
```

Listede olmayan bir birimi tanımıyla verebilirsiniz:
`{ code: 'AZN', symbol: '₼', text: 'AZN', minorDigits: 2 }`.

---

## 5. `currency` — kur çevrimi

Kur **parametre olarak** verilir; motor internete çıkmaz. Girdi ve çıktı kuruştur.

```js
currency.convert(10000, 34.25)     // → 342500
currency.convert(10000, 0)         // → null
currency.cross(10000, 34, 37)      // → 9189
```

`convert`: 100 birim × 34,25. `cross`: 100 USD → TRY → EUR (USD/TRY 34, EUR/TRY 37).

---

## 6. `date` — tarih biçimleme ve sorgulama

**Biçimleme**

```js
date.format('2026-08-15')                    // → '15.08.2026'
date.format('2026-08-15', 'long')            // → '15 Ağustos 2026'
date.format('2026-08-15', 'dayMonth')        // → '15 Ağu.'
date.format('2026-08-15', 'monthYear')       // → 'Ağustos 2026'
date.format('2026-08-15', 'period')          // → '08/2026'
date.format('2026-08-24T21:30:00Z', 'time')      // → '00:30'
date.format('2026-08-24T21:30:00Z', 'dateTime')  // → '25.08.2026 00:30'
date.format('2024-02-30')                    // → '—'
```

Supabase/PostgREST damgaları doğrudan kabul edilir; aylık gruplamada `YYYY-MM` yeterlidir:

```js
date.format('2026-08-31T06:17:08.317236+00:00')   // → '31.08.2026'
date.format('2026-09', 'monthYear')                // → 'Eylül 2026'
```

**Metinden okumak** — `format`'ın tersi:

```js
date.parse('15.08.2026')      // → '2026-08-15'
date.parse('31.02.2026')      // → null
```

**Ad ve hafta günü**

```js
date.monthName(8)                       // → 'Ağustos'
date.monthName(8, 'short')              // → 'Ağu'
date.dayName('2026-09-05')              // → 'Cts'
date.dayName('2026-09-05', 'long')      // → 'Cumartesi'
date.weekday('2026-09-05')              // → 6
date.isWeekend('2026-09-05')            // → true
```

`weekday`: 0 = Pazar … 6 = Cumartesi. `isWeekend` takvim bilgisidir; resmî tatilleri bilmez.

**Gün farkı ve bağıl zaman**

"Bugün" daima parametre olarak verilir; motor saati kendisi okumaz.

```js
date.daysBetween('2026-08-15', '2026-08-18')        // → 3
date.daysUntil('2026-08-18', '2026-08-15')          // → 3
date.relative('2026-08-16', '2026-08-15')           // → 'yarın'
date.relative('2026-08-12', '2026-08-15')           // → '3 gün önce'
date.relative('2026-08-22', '2026-08-15', 'natural')   // → 'haftaya Cumartesi'
```

**Dakika/saat çözünürlüğü** — `relativeTime` epoch milisaniye alır; `now` yine parametredir.
24 saatten sonra `relative`'e devreder (İstanbul günü), ay/yıl birimi yoktur.

```js
// Uygulamada: const now = Date.now();  — saati TÜKETİCİ okur
// Aşağıda now = 1789466400000 (15 Eylül 2026, 13:00 İstanbul)
date.relativeTime(1789466370000, 1789466400000)                     // → 'az önce'
date.relativeTime(1789466100000, 1789466400000)                     // → '5 dakika önce'
date.relativeTime(1789455600000, 1789466400000, { style: 'short' }) // → '3 sa önce'
date.relativeTime(1789467600000, 1789466400000, { style: 'short' }) // → '20 dk sonra'
```

⚠️ `0` geçerli bir damgadır (1970). "Henüz çekilmedi" gibi bir durumu `null` ile
ayırın; çekirdek `0`'a `'—'` demez.

**Karşılaştırma** — gün düzeyinde; saat yok sayılır. Geçersiz tarihte `null`, `false` değil.

```js
date.isBefore('2026-08-15', '2026-08-16')                       // → true
date.isAfter('2026-08-15', '2026-08-16')                        // → false
date.isSameDay('2026-08-15T09:00:00', '2026-08-15T23:00:00')    // → true
date.isBefore('2024-02-30', '2026-01-01')                       // → null
```

---

## 7. `period` — tarih üretme

Girdi ve çıktı `YYYY-AA-GG` metnidir; geçersizde `null`.

```js
period.addDays('2026-12-30', 3)          // → '2027-01-02'
period.addMonths('2026-01-31', 1)        // → '2026-02-28'
period.startOfMonth('2026-08-15')        // → '2026-08-01'
period.endOfMonth('2024-02-10')          // → '2024-02-29'
period.quarterOf('2026-08-15')           // → 3
period.quarterRange(2026, 3)             // → ({ start: '2026-07-01', end: '2026-09-30' })
period.monthsBetween('2026-01-15', '2026-04-15')     // → 3
period.isBetween('2026-08-15', '2026-08-01', '2026-08-31')   // → true
```

`addMonths` ay sonuna **kırpar**: 31 Ocak + 1 ay, 3 Mart değil 28 Şubat'tır.

---

## 8. `text` — Türkçe metin

**Harf dönüşümü**

```js
text.upper('iğne')              // → 'İĞNE'
text.lower('İSTANBUL')          // → 'istanbul'
text.toTrLower('IŞIK')          // → 'ışık'
text.toAsciiLower('ISIK')       // → 'isik'
text.toAsciiUpper('irmaksasi')  // → 'IRMAKSASI'
text.title('ahmet yılmaz')      // → 'Ahmet Yılmaz'
```

**Giriş kutusu süzme (kullanıcı yazarken)**

```js
text.digits('2o0a7')                  // → '207'
text.digits('20267', 4)               // → '2026'
money.formatGroupedInput('121212scca')  // → '121.212'
money.parseNumber('1.250.000')          // → 1250000
money.formatGroupedInput('98.50')                         // → '9.850'
money.formatGroupedInput('98.50', { dotAsDecimal: true })  // → '98,50'
money.formatGroupedInput('1234,567', { maxDigits: 2 })     // → '1.234,56'
money.formatGroupedInput('1234,56', { maxDigits: 0 })      // → '1.234'
// Kontrollü kutu: önceki metin verilince kutunun kendi binlik noktası ondalık sanılmaz
money.formatGroupedInput('8.5340', { dotAsDecimal: true, previous: '8.534' })  // → '85.340'
money.formatGroupedInput('8.5340', { dotAsDecimal: true })                     // → '8,5340'
```

⚠️ **Para kutusu için yeni bir fonksiyon aramayın.** Canlı biçim
`money.formatGroupedInput`, geri okuma `money.parseNumber` — ikisi de v2.x'ten beri
çekirdekte. Harf ve simge ikisinde de kendiliğinden süzülür.

⚠️ **`dotAsDecimal` açık bir kontrollü kutuda `previous` zorunludur.** 1.000 ve üzerindeki
her tutarda kutunun kendi çıktısı bir binlik noktası taşır; `previous` verilmezse bir
sonraki tuşta o nokta ondalık sanılır (`8.534` + `0` → `8,5340`, 10.000 kat küçük).

```ts
<input
  inputMode="decimal"
  value={value}
  onChange={(e) =>
    setValue(money.formatGroupedInput(e.target.value, { dotAsDecimal: true, previous: value, maxDigits: 2 }))
  }
/>
```

**Kutu metnini hangi okuyucu okumalı?** Tutar kuruş olarak saklanacaksa `money.parse`
(kuruş döner, en çok 2 ondalık hane okur; üçüncü hane kuruşa sığmadığı için `null`).
Oran, fiyat gibi serbest ondalıklı bir sayıysa `money.parseNumber` (her hane okunur,
para simgesi tanınmaz). Para kutusunda `maxDigits: 2` verin; kutu `parse`'ın
reddedeceği bir metin hiç üretmez.

⚠️ Ham `toUpperCase()` Türkçede yanlıştır (`'i'` → `'I'`). `lower` ile `toTrLower` aynı
fonksiyondur.

**Arama anahtarı ve listeler**

```js
text.searchKey('  Ali   Veli  ')                 // → 'ali veli'
text.searchKey('İSMAİL')                         // → 'ismail'
text.join(['Ali', 'Veli', 'Can'])                // → 'Ali, Veli ve Can'
```

**Normalizasyon** — `{ stored, display, raw, valid }` döner: `stored` veritabanına,
`display` kullanıcıya.

```js
text.phone('05321234567').stored     // → '+905321234567'
text.phone('05321234567').display    // → '+90 (532) 123 45 67'
text.phone('05321234567').kind       // → 'mobile'
text.whatsapp('05321234567')         // → 'https://wa.me/905321234567'
text.email('  Info@X.CoM ').stored   // → 'info@x.com'
text.website('https://www.example.com/').stored   // → 'example.com'
text.websiteUrl('example.com')       // → 'https://example.com'
text.name('  MEHMET   ali  ÖZ ').stored           // → 'Mehmet Ali Öz'
text.company('xyz inşaat anonim şirketi').stored  // → 'Xyz İnş. A.Ş.'
```

**Araç plakası**

```js
text.plate('34-acb-23').display      // → '34 ACB 23'
text.plate('34-acb-23').stored       // → '34ACB23'
text.plate('34 ABİ 12').display      // → '34 ABI 12'
text.plate('82 AB 123').valid        // → false
text.plate('34yk').yeniKayit         // → true
```

İl kodu 01–81; Ç Ğ Ö Ş Ü ve Q W X reddedilir. `34 YK` sigorta sektöründe tescili
yapılmamış araç için kullanılır; "plakası çıktı mı?" kararını metinden değil
`yeniKayit` bayrağından verin. Harf/rakam grupları yönetmelikte listelenmediği için
rakam grubu bilinçli olarak gevşektir.

**Sayıyı yazıya çevirmek**

```js
text.numberToWords(345)                      // → 'ÜçYüzKırkBeş'
text.numberToWords(1000)                     // → 'Bin'
text.numberToWords(1000000)                  // → 'BirMilyon'
text.numberToWords(2026, { spaced: true })   // → 'İki Bin Yirmi Altı'
```

**Türkçe ek çekimi** — sayıdan sonra doğru eki üretir (ünlü uyumu ve yumuşama dâhil):

```js
text.suffix(2026, 'year', 'loc')      // → "2026'da"
text.properNounSuffix('VakıfBank', 'loc')      // → "VakıfBank'ta"
text.properNounSuffix('A.Ş.', 'abl')           // → "A.Ş.'nden"
text.properNounSuffix('Ziraat Bankası', 'loc') // → "Ziraat Bankası'nda"
text.suffix(2, 'percent', 'dat')      // → "%2'ye"
text.suffix(150000, 'money', 'loc')   // → "₺1.500'da"
text.suffix(-2, 'percent', 'dat')     // → "-%2'ye"
text.suffix(2.5, 'number', 'dat')     // → "2,5'e"
```

Negatif ve ondalıklı sayılarda ek okunuşa göre seçilir: "eksi iki" → iki**ye**,
"iki tam onda beş" → beş**e**.

**Ses bilgisi yardımcıları** — kendi ek kuralınızı yazarken:

```js
text.lastVowel('kitap')               // → 'a'
text.isBackVowel('a')                 // → true
text.isRoundedVowel('ö')              // → true
text.endsWithVowel('elma')            // → true
text.endsWithHardConsonant('kitap')   // → true
```

---

## 9. `validate` — doğrulama

Resmî algoritmalar; hepsi `true` / `false` döner.

```js
validate.tckn('10000000078')     // → true
validate.tckn('11111111111')     // → false
validate.vkn('1111111114')       // → true
validate.iban('TR40 0006 2000 0000 0000 0000 01')   // → true
validate.iban('DE400006200000000000000001')         // → false
validate.ikn('2026/1298071')     // → true
validate.email('a@b.com')        // → true
validate.email('a@b')            // → false
```

`validate` yalnız "geçerli mi?" diye sorar. Girdiyi temizleyip saklamak için `text.*`
normalizasyonlarını kullanın.

---

## 10. `mask` — kişisel veriyi gizleme

Yalnız gösterim içindir; saklanan veriye dokunmaz. Geçersiz girdide `'—'`.

```js
mask.vkn('1234567890')                    // → '123****890'
mask.iban('TR400006200000000000000001')   // → 'TR** **** **** **** **** **01'
mask.phone('05321234567')                 // → '+90 5** *** ** 67'
mask.money()                              // → '****'
```

---

## 11. `collate` — Türkçe sıralama

Ham `Array.sort()` Türkçe harfleri alfabenin sonuna atar. `collate` doğru sıralar.

```js
['zam', 'çam', 'dal'].sort()                 // → ['dal', 'zam', 'çam']
collate.sortBy(['zam', 'çam', 'dal'])        // → ['çam', 'dal', 'zam']
collate.compare('can', 'çan')                // → -1
collate.compare('kâr', 'kar')                // → 0
collate.key('çam') < collate.key('dal')      // → true
```

Nesne dizilerini sıralamak için seçici verin: `collate.sortBy(kisiler, k => k.ad)`.
`sortBy` girdiyi değiştirmez, yeni dizi döner. `key`, veritabanında sıralama sütunu
olarak saklanabilecek bir anahtar üretir.

---

## 12. `unit` — birim çevrimi

```js
unit.convert(5000, 'm2', 'dönüm')    // → 5
unit.convert(1, 'km', 'm')           // → 1000
unit.convert(1, 'km', 'kg')          // → null
unit.categoryOf('dekar')             // → 'area'
unit.dataSize(5242880)               // → '5 MB'
unit.dataSize(5242880, { digits: -1 })   // → '—'
unit.ONS_TO_GRAM                     // → 31.1034768
```

Farklı kategoriler arasında çevrim yapılmaz (`km` → `kg` `null`). `ONS_TO_GRAM` troy
onstur ve `gold`, `silver` ile aynı tek kaynaktan gelir:

```js
unit.ONS_TO_GRAM === gold.ONS_TO_GRAM   // → true
```

---

## 13. `gold` ve `silver` — değerli maden

Ons fiyatı (USD) ve dolar kurundan **kuruş** olarak gram fiyat.

```js
gold.gramGoldPrice(2650, 34.20, 22)       // → 266906
gold.gramGoldPrice(2650, 34.20, 19)       // → null
gold.ziynetPrice('quarter', 2650, 34.20)  // → 468153
gold.PURITY[22]                           // → 0.916
gold.ZIYNET_GRAM.quarter                  // → 1.754
gold.ONS_TO_GRAM                          // → 31.1034768
silver.gramSilverPrice(31, 34.20)         // → 3405
silver.gramSilverPrice(31, 34.20, 925)    // → 3153
silver.SILVER_PURITY[925]                 // → 0.925
silver.ONS_TO_GRAM === gold.ONS_TO_GRAM   // → true
```

Ziynet türleri: `'quarter'` (çeyrek), `'half'` (yarım), `'full'` (tam).

---

## 14. `tradingMath` — işlem hesapları

Fiyatlar ve tutarlar **kuruş**tur.

**Pozisyon büyüklüğü ve kaldıraç**

```js
tradingMath.volumeFromQty(100, 14550, 1)               // → 1455000
tradingMath.qtyFromVolume(1500000, 14550, 1, false)    // → 103
tradingMath.leverage(10000000, 2000000)                // → 5
tradingMath.leverage(10000000, 0)                      // → null
```

**Stop ve hedef**

```js
tradingMath.validateTradeDirections(10000, 9500, 11000, true)   // → ({ stopValid: true, tpValid: true })
tradingMath.validateTradeDirections(10000, 10500, 11000, true)  // → ({ stopValid: false, tpValid: true })
tradingMath.computeRiskReward(10000, 9500, 11000, 10, 1, true, true, true, 34).rr   // → 2
```

**Portföy yoğunlaşması**

```js
tradingMath.computePortfolioRatios(100000000, 100000000, 5000000, 5000000, 1000000000, 500000000)   // → ({ exposurePctTotal: 10, exposurePctSub: 20, riskPctTotal: 0.5, riskPctSub: 1 })
```

**Eşik gün** — hedeflenen getiriye risksiz faiz oranıyla, bileşik faizle kaç günde
ulaşılacağı. İlk parametre hedef getiri oranı (`0.10` = %10), ikincisi yıllık faiz
yüzdesi (`35` = %35). Bir işlemin bu süreden uzun sürmesi, risksiz getiriyi kaçırmak
demektir. Sonuç en az 1 gündür.

```js
tradingMath.calculateThresholdDays(0.10, 35)    // → 116
tradingMath.calculateThresholdDays(0, 35)       // → null
```

---

## 15. Sık yapılan hatalar

| Hata | Sonuç | Doğrusu |
|---|---|---|
| Lira tutarla `money.format(1500)` | `₺15` — 100 kat küçük | `money.formatMajor(1500)` |
| `date.format(new Date())` | `'—'` | ISO metni verin |
| `dayName(iso) === 'Cts'` ile karar | kısaltma değişirse sessizce bozulur | `date.isWeekend(iso)` |
| `math.div(log(x), log(10))` | tam kuvvetlerde bir basamak kayma | `math.log10(x)` |
| `text.upper` ile plaka büyütmek | `'34ABİ12'` — geçersiz | `text.plate` |
| `text.searchKey` ile sıralamak | `ç` ile `c` karışır | `collate.sortBy` |
| `x ?? 0` ile `null` gizlemek | "hesaplanamadı" 0 görünür | `null`'ı açıkça ele alın |
| Hane sayısını hesaplayıp doğrudan vermek (`decimal(v, n / 2)`) | tam sayı değilse `'—'` | hane sayısı 0–20 arası tam sayı olmalı |
| Negatif yüzdeyi `4,3%` gibi sağa yazmak | İngilizce yazım; Türkçede `%` soldadır | `money.percent(-4.3, 1)` → `-%4,3` |
| Ham `0.1 + 0.2` | `0.30000000000000004` | `math.add(0.1, 0.2)` |
