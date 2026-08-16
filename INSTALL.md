# 🚀 ABACUS Core Yeni Projeye Entegrasyon Rehberi (`INSTALL.md`)

Bu rehber, ABACUS çekirdek motorunu herhangi bir yeni SNN projesine sıfır çabayla entegre etme adımlarını içerir.

---

## Adım 1: Klasörü Kopyala
`SNN-Abacus-Core/src/abacus/` klasörünün tamamını yeni projenizin `src/domain/abacus/` dizinine kopyalayın:

```bash
cp -r SNN-Abacus-Core/src/abacus/ yeni-proje/src/domain/abacus/
```

Klasör Yapısı:
```
src/domain/abacus/
├── index.ts
├── math/
│   ├── index.ts
│   └── math.test.ts
├── money/
│   ├── index.ts
│   └── money.test.ts
├── currency/
│   ├── index.ts
│   └── currency.test.ts
├── date/
│   ├── index.ts
│   └── date.test.ts
├── text/
│   ├── index.ts
│   └── text.test.ts
├── validate/
│   ├── index.ts
│   └── validate.test.ts
└── mask/
    ├── index.ts
    └── mask.test.ts
```

---

## Adım 2: Dış Bağımlılığı Yükle
ABACUS yalnızca `decimal.js` paketine bağımlıdır.

```bash
npm install decimal.js@^10.6.0
```

---

## Adım 3: TypeScript Ayarlarını Ekle (`tsconfig.json`)
Projenizin `tsconfig.json` dosyasında `compilerOptions` altına şu ayarları ekleyin:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2020",
    "moduleResolution": "bundler"
  }
}
```

---

## Adım 4: ESLint Kısıtlama Kurallarını Ekle (`eslint.config.js`)
Frontend veya domain katmanlarında ABACUS dışı ham matematik/format ve string dönüşümü kullanımını engellemek için tam kural bloğunu ekleyin:

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

## Adım 5: Anayasa Dokümanlarını Kök Dizine Koy
Proje köküne `.agent/` veya proje kökenine `AI-RULES.md` ve `ABACUS-SPEC.md` anayasa dokümanlarını kopyalayın.

---

## Adım 6: Testleri Çalıştırıp Doğrula
Projenizde Vitest ile testleri çalıştırarak entegrasyonu onaylayın:

```bash
npm test
```

163+ ABACUS birim testinin %100 YEŞİL geçtiğini doğrulayın.
