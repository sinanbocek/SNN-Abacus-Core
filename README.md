# 🧮 ABACUS Core Reference Engine (`SNN-Abacus-Core`)

> **ABACUS Engine Standard**: Tüm SNN projelerinde finansal hesaplama, Türkçe metin normalizasyonu, tarih biçimlendirme, PII gizleme, doğrulama ve BIST ticari işlemlerde **Tek Otorite (Single Source of Truth)** olan bağımsız referans çekirdek paketidir.

---

## ⚡ Hızlı Başlangıç & Kurulum

Projelerinize GitHub üzerinden doğrudan npm paketi olarak ekleyin:

```bash
npm install github:sinanbocek/SNN-Abacus-Core#semver:^2.4.0
```

> **Sürüm politikası:** `#semver:^2.4.0` aralığı ile bağlanın. Yama ve ek özellik sürümleri (2.1.1, 2.2.0) **otomatik gelir**; kırıcı major sürüm (3.0.0) **gelmez** ve elle geçilir. `package-lock.json` tam commit'i sabitlediği için build'ler tekrarlanabilir kalır. Ayrıntı: [INSTALL.md §4](INSTALL.md).

```typescript
import { money, math, tradingMath, date, gold, silver, unit, period, collate } from '@snn/abacus-core';

// Para Biçimlendirme — ve geri okuma (AYNA KURALI)
money.format(150000);                          // "₺1.500"
money.parse('₺1.234,56');                      // 123456 (kuruş, float hatası yok)
money.format(123456, { currency: 'EUR', kurus: true });  // "€1.234,56"
date.parse('15.08.2026');                      // "2026-08-15"

// Hassas Kuruş Matematiği
math.add(10000, 5000);                         // 15000

// BIST Ticari Hesaplama
tradingMath.calculateThresholdDays(0.10, 35);  // 116

// Altın & Değerli Maden Motoru
gold.gramGoldPrice(2650, 34.20, 22);      // 266906 (kuruş) — 22 ayar gram altın
gold.ziynetPrice('quarter', 2650, 34.20); // 468153 (kuruş) — çeyrek altın
silver.gramSilverPrice(31, 34.20);        // 3405 (kuruş) — 999 külçe gram gümüş

// Birim Çevrimi
unit.convert(5000, 'm2', 'dönüm');        // 5
unit.dataSize(5242880);                   // "5 MB"

// Dönem Aritmetiği
period.addMonths('2026-01-31', 1);        // "2026-02-28" (ay sonuna kırpar)
period.quarterRange(2026, 3);             // { start: "2026-07-01", end: "2026-09-30" }

// Türkçe Sıralama
collate.sortBy(['zam', 'çam', 'dal']);    // ["çam", "dal", "zam"]
```

> Detaylı kurulum & kullanım rehberi: [INSTALL.md](INSTALL.md)
>
> **v1.1.0 kullanıyorsanız:** yükseltmeden önce [MIGRATION-v2.md](MIGRATION-v2.md) okuyun — v2.0.0 kırıcı değişiklikler içerir.

---

## 📦 Motor Özeti (13 Çekirdek Motor)

| Motor | Klasör | Bir Satır Özeti |
|---|---|---|
| **`math`** | `src/abacus/math/` | `decimal.js` tabanlı hassas kuruş matematiği (float hatasız dört işlem, half-up yuvarlama), toleranslı eşitlik (`equals`) ve değişim yüzdesi (`percentChange`). |
| **`money`** | `src/abacus/money/` | Para biçimlendirme (`format`, `formatMajor`, `formatMinorInput`, `decimal`, `ratio`), metinden alt birime ayrıştırma (`parse`, `toMinor`), tutar yazısı (`toWords`), compact kısaltma (`compact`). **Para birimi veridir:** TRY/USD/EUR/GBP yerleşik, tüketici kendi birimini de verebilir. |
| **`currency`** | `src/abacus/currency/` | Parametrik kur çevrimi (`convert`, `cross`). Kur enjeksiyon prensibiyle çalışır; dış HTTP/DB bağımlılığı yoktur. |
| **`date`** | `src/abacus/date/` | `Intl` bağımsız Türkçe ISO tarih/saat biçimlendirme (`format`: short/long/dayMonth/monthYear/period/time/dateTime/dayMonthWeekday), ay adı (`monthName`), bağıl zaman (`relative`), gün farkı (`daysBetween`) ve gün adı (`dayName`). Saat dilimi: **Europe/Istanbul**. Takvim doğrulaması yapar (30 Şubat reddedilir). |
| **`text`** | `src/abacus/text/` | Arama anahtarı (`searchKey`), Türkçe ek çekim fonetiği (`suffix`: 5 hâl + 6 iyelik + pronominal-n), harf dönüşümü (`upper`, `lower`, `title`), `join` ve metin normalizasyonları (`phone`, `email`, `website`, `name`, `company`). |
| **`validate`** | `src/abacus/validate/` | Türkiye resmi kurum checksum algoritmaları (`vkn`, `tckn`, `iban` TR mod-97), `ikn` formatı ve `email` doğrulaması. |
| **`mask`** | `src/abacus/mask/` | Gösterim amaçlı PII gizleme motoru (`money`, `vkn`, `iban`, `phone`). Saklanan veriyi asla mutasyona uğratmaz. |
| **`tradingMath`** | `src/abacus/trading-math/` | BIST & Ticari işlem matematiği, eşik gün hesabı, fırsat analizi ve pozisyon büyüklüğü hesaplamaları. |
| **`gold`** | `src/abacus/gold/` | Ons/USD ve USD/TRY üzerinden B-otorite saflıklarıyla gram altın (24K/22K/21K/18K) ve ziynet (çeyrek/yarım/tam). |
| **`silver`** | `src/abacus/silver/` | Ons/USD ve USD/TRY üzerinden milyem saflıklarıyla (999/925/800/1000) gram gümüş. |
| **`unit`** | `src/abacus/unit/` | Birim çevrimi (`convert`, `categoryOf`) ve okunur veri boyutu (`dataSize`): uzunluk, ağırlık (troy ons dahil), alan (dönüm/dekar/hektar) ve veri (B→TB). |
| **`period`** | `src/abacus/period/` | Dönem aritmetiği: `addDays`, `addMonths` (ay sonuna kırpar), `startOfMonth`, `endOfMonth`, `quarterOf`, `quarterRange`, `monthsBetween`, `isBetween`. Tarih **üretir**. |
| **`collate`** | `src/abacus/collate/` | Türkçe alfabetik sıralama (`key`, `compare`, `sortBy`). `Intl.Collator` kullanmaz; ç/ğ/ı/ö/ş/ü doğru konumda. decimal.js taşımaz. |

---

## 🧪 Kalite & Test Kapsamı

- **504 Birim Testi:** %100 yeşil test güvencesi (`vitest`).
- **Ölçülen Kapsam:** statements %91,2 · branches %86,2 · functions %99,0 · lines %96,5 — CI'da eşiklerle korunur (`npm run test:coverage`).
- **TypeScript Strict:** Sıfır `any`, tam tip emniyeti.
- **Belge İddiaları Test Edilir:** README/INSTALL/SPEC/MOTOR-DETAYLARI içindeki her kod örneği `docs-claims.test.ts` ile doğrulanır; belge ile kod ayrışırsa CI kırılır.
- **Sıfır Dış Bağımlılık (Hassas Matematik Hariç):** Yalnızca `decimal.js` kullanır.

---

## 🔒 Kalite ve Kırmızı Çizgiler (Zero Tolerance Rules)

1. **Sıfır Ham Math.\***: Tüm finansal hesaplamalar `math` motoru üzerinden yürütülür.
2. **Sıfır Intl / toLocale\***: Tarih ve para formatlamasında `Intl` ve `toLocale*` kullanımı yasaktır.
3. **Sıfır Ham toLowerCase / toUpperCase**: Türkçe harf dönüşümleri (`İ->i`, `I->ı`) `text.lower` ve `text.upper` ile yapılır.
4. **Parametresiz Date Yok**: `relative` ve `daysUntil` fonksiyonları bugün tarihini parametre olarak alır. Girdi her zaman **ISO string**'dir, `Date` nesnesi değildir.
5. **Sıfır Sessiz Varsayılan**: `|| 0` ve `?? 0` kalıpları ESLint ile `error` seviyesinde yasaktır; geçersiz girdi ABACUS-SPEC §2.1'deki sentinel ile bildirilir.
6. **Single Source of Truth**: Motor güncellemeleri yalnızca `SNN-Abacus-Core` reposunda yapılır; tüketici projeler `#semver:^X.Y.Z` aralığıyla alır. Kırıcı (major) sürümler asla otomatik inmez.
7. **API Yüzeyi Kilitli**: Dışa açılan her ad `api-surface.test.ts` ile çivilenmiştir; bir ad silinirse test kırılır ve major sürüm gerektiği görülür.
