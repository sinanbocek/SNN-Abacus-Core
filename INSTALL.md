# 🚀 ABACUS Core Entegrasyon ve Kullanım Rehberi (`INSTALL.md`)

Bu rehber, **ABACUS Engine** (`@snn/abacus-core`) çekirdek motorunu herhangi bir SNN projesine GitHub npm paketi olarak entegre etme adımlarını içerir.

---

## 📦 1. Kurulum (GitHub npm Package)

Projelerinizin kök dizininde aşağıdaki komutu çalıştırarak `@snn/abacus-core` paketini doğrudan GitHub deposundan kurun:

```bash
npm install github:sinanbocek/SNN-Abacus-Core#semver:^2.6.0
```

> 💡 **Bağımlılık Notu:** Paket, hassas matematiksel işlemler için gereken `decimal.js` bağımlılığını otomatik olarak indirip projenize bağlar. Ekstra bir `decimal.js` kurulumu gerekmez.

---

## ⚙️ 2. Gereksinimler & Tüketim Modeli

- **Ham TS Tüketimi:** `@snn/abacus-core`, derlenmiş JS çıktısı (dist) sunmaz; ham TypeScript (`.ts`) dosyaları üzerinden doğrudan tüketilir.
- **Bundler Desteği:** Projeniz TypeScript kodlarını işleyebilen modern bir bundler kullanmalıdır (örn. **Vite**, **Rollup**, **Webpack**, **esbuild**, **Next.js**).

---

## 💻 3. Kullanım Örneği

Tüm motorlar tek bir barrel export (`@snn/abacus-core`) üzerinden projelerinize aktarılır:

```typescript
import {
  money, math, date, text, validate, mask, currency,
  tradingMath, gold, silver, unit, period, collate,
} from '@snn/abacus-core';

// Para Biçimlendirme
console.log(money.format(150000));                          // ₺1.500

// Hassas Kuruş Matematiği (decimal.js)
console.log(math.add(10000, 5000));                         // 15000

// Ticari & BIST İşlem Matematiği
console.log(tradingMath.calculateThresholdDays(0.10, 35));  // 116

// Türkçe Tarih Biçimlendirme — GİRDİ ISO STRING'DİR, Date NESNESİ DEĞİL
console.log(date.format('2026-08-16'));                     // 16.08.2026  (varsayılan: short)
console.log(date.format('2026-08-16', 'long'));             // 16 Ağustos 2026
console.log(date.format('2026-08-24T21:30:00Z', 'dateTime')); // 25.08.2026 00:30  (Europe/Istanbul)

// PII Gizleme
console.log(mask.vkn('1234567890'));                        // 123****890

// Birim Çevrimi
console.log(unit.convert(5000, 'm2', 'dönüm'));             // 5
console.log(unit.dataSize(5242880));                        // 5 MB

// Dönem Aritmetiği
console.log(period.addMonths('2026-01-31', 1));             // 2026-02-28
console.log(period.quarterRange(2026, 3));                  // { start: 2026-07-01, end: 2026-09-30 }

// Türkçe Sıralama
console.log(collate.sortBy(['zam', 'çam', 'dal']));         // [ çam, dal, zam ]
```

> ⚠️ **Sık yapılan hata:** `date.format(new Date())` **çalışmaz** — motor `Date`
> nesnesi değil ISO string bekler ve `'—'` döner. Ayrıca saat dilimi eki taşıyan
> ISO değerleri (`...Z`, `...+02:00`) **Europe/Istanbul** saatine çevrilir; bu
> tarihi de bir gün ileri/geri alabilir.

### Supabase / PostgREST zaman damgaları (v2.5.0)

Postgres `timestamptz` alanları mikrosaniye taşır; PostgREST bunu JSON'a
`2026-08-31T06:17:08.317236+00:00` biçiminde yazar. Motor bu biçimi **doğrudan**
kabul eder — tüketicinin `iso.slice(0, 10)` gibi bir kırpma yapması gerekmez:

```typescript
console.log(date.format('2026-08-31T06:17:08.317236+00:00'));   // 31.08.2026
console.log(date.format('2026-07-21 10:00:00+00', 'dayMonth')); // 21 Tem.
```

Kabul edilen ayırıcılar: `T` veya boşluk. Kabul edilen saat dilimi ekleri:
`Z` · `+HH` · `+HHMM` · `+HH:MM`. Kesirli saniye ayrıştırılır ve **atılır**
(çekirdek dakika çözünürlüğünde biçimlendirir).

### Aylık gruplama anahtarı `YYYY-MM` (v2.5.0)

Gün bileşenini zaten kullanmayan iki stil ay anahtarını okur:

```typescript
console.log(date.format('2026-09', 'monthYear'));  // Eylül 2026
console.log(date.format('2026-09', 'period'));     // 09/2026
console.log(date.format('2026-09'));               // —  (gün gösteren stil kabul etmez)
```

### Alt birim / ana birim — 100 kat hata riski

```typescript
console.log(money.formatMajor(1500));   // ₺1.500   ← ana birim (lira)
console.log(money.format(1500));        // ₺15      ← alt birim (kuruş)
console.log(money.compactMajor(1500000, { style: 'B/Mn/Mr' }));  // ₺1,5Mn
```

Tutarlarınız ana birimde saklanıyorsa `formatMajor` / `compactMajor` kullanın.
Bu karışıklığı derleme hattınızda yakalamak için §6'daki yayınlanan ESLint
yapılandırmasını ekleyin.

### Dört haneli tutarlar — `digits` (v2.6.0)

Yerleşik bir para biriminin yalnız hane sayısını değiştirmek için tanımın
tamamını kopyalamak gerekmez; simge ve kısaltma çekirdekte kalır:

```typescript
console.log(money.formatMajor(1.2345, { currency: 'TRY', digits: 4, kurus: true })); // ₺1,2345
```

Geçerli aralık 0..4 arası tam sayıdır; dışında `'—'` döner.

### Gerçek maliyet / getiri — `math.irr` (v2.6.0)

Bir kredinin gerçek maliyeti yalnız faiz değildir; dosya masrafı ve sigorta da
nakit akışındadır. `irr` akışın tamamı üzerinden **dönemsel** oranı verir:

```typescript
// 900.000 TL kredi, 450 TL dosya masrafı, 12 × 75.000 TL taksit
const aylik = math.irr([899550, ...Array<number>(12).fill(-75000)]);  // ≈ 0.0000769
const yillik = math.pow(1 + (aylik as number), 12);                   // ≈ 1.000924
```

Dönen oran **dönemseldir** — yıllığa çevirmek çağıranın işidir. İşaret değişimi
olmayan akışta `null` döner; sessizce 0 dönmez.

### Yüzde işareti — renkle anlatılan arayüzler

```typescript
console.log(money.percent(-3.2, 1));                      // %-3,2
console.log(money.percent(-3.2, 1, { sign: 'never' }));   // %3,2   ← yön renkle anlatılır
console.log(money.percent(3.2, 1, { sign: 'always' }));   // %+3,2
```

---

## 🔄 4. Sürüm ve Güncelleme Politikası

Çekirdek **SemVer**'e uyar. Tüketici projeler `#semver:^X.Y.Z` aralığıyla bağlanır;
bu, güvenli güncellemelerin otomatik gelmesini, kırıcı olanların gelmemesini sağlar.

| Çekirdekte çıkan | Örnek | Tüketiciye ne olur |
|---|---|---|
| **Yama** (patch) | 2.1.0 → 2.1.1 | **otomatik gelir** |
| **Ek özellik** (minor) | 2.1.0 → 2.2.0 | **otomatik gelir** |
| **Kırıcı** (major) | 2.x → 3.0.0 | **GELMEZ** — `package.json` elle değiştirilir |

### Bağlanma biçimleri

```jsonc
// ÖNERİLEN — minor ve yamalar otomatik, major asla
"@snn/abacus-core": "github:sinanbocek/SNN-Abacus-Core#semver:^2.6.0"

// Yalnız yama otomatik (daha muhafazakâr)
"@snn/abacus-core": "github:sinanbocek/SNN-Abacus-Core#semver:~2.1.0"

// Tam sabit — hiçbir güncelleme gelmez
"@snn/abacus-core": "github:sinanbocek/SNN-Abacus-Core#v2.1.0"
```

> Doğrulandı (2026-08-30): `^2.0.0` aralığı 2.1.0'a çözülür, `~2.0.0` ve
> `#v2.0.0` 2.0.0'da kalır.

### Güncelleme ne zaman iner?

`^` yazmak, her `npm install`'da sürümün değişeceği anlamına **gelmez**.
`package-lock.json` tam commit'i sabitler; CI `npm ci` ile kurduğu sürece
build'ler **tekrarlanabilir** kalır. Güncelleme yalnızca şu iki durumda iner:

1. Biri `npm update @snn/abacus-core` çalıştırdığında
2. Bir bot (Renovate / Dependabot) yeni etiketi görüp PR açtığında

İkinci yol önerilir: PR açılır → **o projenin kendi testleri çalışır** →
yeşilse birleştirilir. Otomatik ama körü körüne değil.

### Major sürüme geçiş

Otomatik gelmez ve gelmemelidir. Geçiş için `MIGRATION-*.md` belgesi okunur,
pin elle yükseltilir, projenin testleri çalıştırılır.
v1.1.0 → v2.0.0 için: [MIGRATION-v2.md](MIGRATION-v2.md).

---

## 🚨 5. KRİTİK Senkronizasyon Kuralı (Single Source of Truth)

1. **Tek Yönlü Değişiklik:** Çekirdek motorlardaki tüm matematik, format, doğrulama ve mantık değişiklikleri **SADECE VE SADECE `SNN-Abacus-Core` REPOSUNDA** yapılır, birim testleri yazılır ve `main` branch'e push edilir.
2. **Şartname KOPYALANMAZ, REFERANS VERİLİR:** `ABACUS-SPEC.md`, `AI-RULES.md` ve
   `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md` tüketici projelere **kopyalanmaz**. Bu
   dosyaların tek geçerli nüshası kurulu paketin içindedir:
   `node_modules/@snn/abacus-core/ABACUS-SPEC.md`. Tüketici projede aynı adlı bir
   dosya bulunması bir **tek-doğruluk-kaynağı ihlalidir** ve silinmelidir; çünkü
   pin farklı bir tag'e çekildiğinde kopya sessizce eskir.
3. **Asla Proje İçinde Değişiklik Yapılamaz:** Tüketici projeler (`SNN-AI-BIST-Radar`, `SNN-PORTFOLIO-UI` vb.) içinde ABACUS kodlarına müdahale edilemez / fork'lanamaz. Projeler güncellemeleri yalnızca elle tag yükseltme ile çeker.

---

## 📜 6. ESLint Kısıtlama Kuralları (`eslint.config.js`)

### 6.1 Çekirdeğin yayınladığı yapılandırma (v2.5.0) — ÖNCE BUNU EKLEYİN

Çekirdek artık `@snn/abacus-core/eslint` alt yolundan paylaşılabilir bir flat
config yayınlar. Bu, alt birim / ana birim karışıklığını (`money.format` ile
`money.formatMajor` arasındaki 100 kat farkı) derleme hattınıza bağlar:

```js
// eslint.config.js
import abacus from '@snn/abacus-core/eslint';

export default [
  ...abacus.configs.recommended,
  // ... kendi yapılandırmanız (aşağıdaki §6.2)
];
```

Tutarları gerçekten kuruş olarak tutan kod için kural bilinçli olarak geçilir:

```ts
// eslint-disable-next-line no-restricted-properties -- tutar kuruş cinsinden
const etiket = money.format(satir.tutar_kurus);
```

Ayrıntı: [SNN-ABACUS-CORE-MOTOR-DETAYLARI.md § Yayınlanan ESLint yapılandırması](SNN-ABACUS-CORE-MOTOR-DETAYLARI.md).

### 6.2 Ev kuralları (elle eklenir)

Frontend veya domain katmanlarında ABACUS dışı ham matematik/format ve string dönüşümü kullanımını engellemek için projenize aşağıdaki ESLint kısıtlamalarını eklemeniz önerilir:

```js
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-restricted-properties': [
        'error',
        {
          property: 'toLocaleString',
          message: 'toLocaleString kullanımı yasaktır. Lütfen ABACUS motorunu (money/date) kullanın.',
        },
        {
          property: 'toFixed',
          message: 'toFixed kullanımı yasaktır. Lütfen ABACUS math/money motorunu kullanın.',
        },
        {
          property: 'toLowerCase',
          message: 'Ham toLowerCase kullanımı yasaktır. Lütfen ABACUS text (lower/toTrLower/toAsciiLower) kullanın.',
        },
        {
          property: 'toUpperCase',
          message: 'Ham toUpperCase kullanımı yasaktır. Lütfen ABACUS text (upper) kullanın.',
        },
      ],
      // Sessiz varsayılan yasağı (ABACUS-SPEC §2.1)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'LogicalExpression[operator="||"][right.type="Literal"][right.value=0]',
          message: 'Sessiz `|| 0` varsayılanı yasaktır. null durumunu açıkça ele alın.',
        },
        {
          selector: 'LogicalExpression[operator="??"][right.type="Literal"][right.value=0]',
          message: 'Sessiz `?? 0` varsayılanı yasaktır. null durumunu açıkça ele alın.',
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'parseFloat',
          message: 'Ham parseFloat kullanımı yasaktır. Lütfen ABACUS math/money motorunu kullanın.',
        },
        {
          name: 'Math',
          message: 'Ham Math kullanımı yasaktır. Lütfen ABACUS math motorunu kullanın.',
        },
        {
          name: 'Intl',
          message: 'Ham Intl kullanımı yasaktır. Lütfen ABACUS date/money motorunu kullanın.',
        },
      ],
    },
  },
];
```

---

## 🏛️ 7. Arşivlenmiş Yöntem (Manuel Klasör Kopyalama - Artık Gerekli Değil)

> ⚠️ **Arşiv Notu:** Eskiden uygulanan `cp -r SNN-Abacus-Core/src/abacus/ yeni-proje/src/domain/abacus/` kopyala-yapıştır yöntemi ve manuel `decimal.js` kurulumu, versiyon takibini imkansız kıldığı için **terk edilmiştir**. Artık standart `npm install github:sinanbocek/SNN-Abacus-Core` yöntemidir.
