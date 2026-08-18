# 🚀 ABACUS Core Entegrasyon ve Kullanım Rehberi (`INSTALL.md`)

Bu rehber, **ABACUS Engine** (`@snn/abacus-core`) çekirdek motorunu herhangi bir SNN projesine GitHub npm paketi olarak entegre etme adımlarını içerir.

---

## 📦 1. Kurulum (GitHub npm Package)

Projelerinizin kök dizininde aşağıdaki komutu çalıştırarak `@snn/abacus-core` paketini doğrudan GitHub deposundan kurun:

```bash
npm install github:sinanbocek/SNN-Abacus-Core#v1.1.0
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
import { money, math, date, text, validate, mask, currency, tradingMath } from '@snn/abacus-core';

// Para Biçimlendirme
console.log(money.format(150000));                          // ₺1.500

// Hassas Kuruş Matematiği (decimal.js)
console.log(math.add(10000, 5000));                         // 15000

// Ticari & BIST İşlem Matematiği
console.log(tradingMath.calculateThresholdDays(0.10, 35));  // 116

// Türkçe Tarih Biçimlendirme
console.log(date.format(new Date()));                       // 16 Ağustos 2026

// PII Gizleme
console.log(mask.vkn('1234567890'));                        // 123******0
```

---

## 🔄 4. Paket Güncelleme Süreci

Sürüm yükseltmek için tüketici projede pin'i elle yeni tag'e çekin (örn. `#v1.1.0` → `#v1.2.0`), sonra projenin karakterizasyon/birim testlerini çalıştırıp beklenmeyen değişiklik olmadığını doğrulayın. Otomatik `npm update` KULLANILMAZ — sürüm geçişi her zaman bilinçli ve test-korumalıdır.

---

## 🚨 5. KRİTİK Senkronizasyon Kuralı (Single Source of Truth)

1. **Tek Yönlü Değişiklik:** Çekirdek motorlardaki tüm matematik, format, doğrulama ve mantık değişiklikleri **SADECE VE SADECE `SNN-Abacus-Core` REPOSUNDA** yapılır, birim testleri yazılır ve `main` branch'e push edilir.
2. **Asla Proje İçinde Değişiklik Yapılamaz:** Tüketici projeler (`SNN-AI-BIST-Radar`, `SNN-PORTFOLIO-UI` vb.) içinde ABACUS kodlarına müdahale edilemez / fork'lanamaz. Projeler güncellemeleri yalnızca elle tag yükseltme ile çeker.

---

## 📜 6. ESLint Kısıtlama Kuralları (`eslint.config.js`)

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
      'no-restricted-globals': [
        'error',
        {
          name: 'parseFloat',
          message: 'Ham parseFloat kullanımı yasaktır. Lütfen ABACUS math/money motorunu kullanın.',
        },
      ],
    },
  },
];
```

---

## 🏛️ 7. Arşivlenmiş Yöntem (Manuel Klasör Kopyalama - Artık Gerekli Değil)

> ⚠️ **Arşiv Notu:** Eskiden uygulanan `cp -r SNN-Abacus-Core/src/abacus/ yeni-proje/src/domain/abacus/` kopyala-yapıştır yöntemi ve manuel `decimal.js` kurulumu, versiyon takibini imkansız kıldığı için **terk edilmiştir**. Artık standart `npm install github:sinanbocek/SNN-Abacus-Core` yöntemidir.
