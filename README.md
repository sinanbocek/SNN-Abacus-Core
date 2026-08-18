# 🧮 ABACUS Core Reference Engine (`SNN-Abacus-Core`)

> **ABACUS Engine Standard**: Tüm SNN projelerinde finansal hesaplama, Türkçe metin normalizasyonu, tarih biçimlendirme, PII gizleme, doğrulama ve BIST ticari işlemlerde **Tek Otorite (Single Source of Truth)** olan bağımsız referans çekirdek paketidir.

---

## ⚡ Hızlı Başlangıç & Kurulum

Projelerinize GitHub üzerinden doğrudan npm paketi olarak ekleyin:

```bash
npm install github:sinanbocek/SNN-Abacus-Core#v1.1.0
```

> **Üretim projeleri her zaman bir sürüm tag'ine pinlemelidir** (örn. `#v1.1.0`). Yükseltme, tag'i elle yeni sürüme çekip tüketici projenin testlerini çalıştırarak yapılır — otomatik güncelleme kullanılmaz.

```typescript
import { money, math, tradingMath, date, gold, silver } from '@snn/abacus-core';

// Para Biçimlendirme
money.format(150000);                          // "₺1.500"

// Hassas Kuruş Matematiği
math.add(10000, 5000);                         // 15000

// BIST Ticari Hesaplama
tradingMath.calculateThresholdDays(0.10, 35);  // 116

// Altın & Değerli Maden Motoru
gold.gramGoldPrice(2650, 34.20, 22);      // 266906 (kuruş) — 22 ayar gram altın
gold.ziynetPrice('quarter', 2650, 34.20); // 468153 (kuruş) — çeyrek altın
silver.gramSilverPrice(31, 34.20);        // 3405 (kuruş) — 999 külçe gram gümüş
```

> Detaylı kurulum & kullanım rehberi: [INSTALL.md](INSTALL.md)

---

## 📦 Motor Özeti (10 Çekirdek Motor)

| Motor | Klasör | Bir Satır Özeti |
|---|---|---|
| **`math`** | `src/abacus/math/` | `decimal.js` tabanlı hassas kuruş matematiği (IEEE-754 float hatasız toplama, çıkarma, çarpma, bölme, half-up yuvarlama). |
| **`money`** | `src/abacus/money/` | TCMB standartlarında para biçimlendirme (`format`), tutar yazısı (`toWords`) ve compact kısaltma (`compact`: 1M, 1.5Mn). |
| **`currency`** | `src/abacus/currency/` | Parametrik kur çevrimi (`convert`, `cross`). Kur enjeksiyon prensibiyle çalışır; dış HTTP/DB bağımlılığı yoktur. |
| **`date`** | `src/abacus/date/` | `Intl` bağımsız Türkçe ISO tarih biçimlendirme (`format`), bağıl zaman (`relative`), gün farkı (`daysBetween`) ve gün adı (`dayName`). |
| **`text`** | `src/abacus/text/` | Türkçe ek çekim fonetiği (`suffix`: 5 hâl + 6 iyelik + pronominal-n), harf dönüşümü (`upper`, `lower`, `title`), `join` ve metin normalizasyonları (`phone`, `email`, `website`, `name`, `company`). |
| **`validate`** | `src/abacus/validate/` | Türkiye resmi kurum checksum algoritmaları (`vkn`, `tckn`, `iban` TR mod-97), `ikn` formatı ve `email` doğrulaması. |
| **`mask`** | `src/abacus/mask/` | Gösterim amaçlı PII gizleme motoru (`money`, `vkn`, `iban`, `phone`). Saklanan veriyi asla mutasyona uğratmaz. |
| **`tradingMath`** | `src/abacus/trading-math/` | BIST & Ticari işlem matematiği, eşik gün hesabı, fırsat analizi ve pozisyon büyüklüğü hesaplamaları. |
| **`gold`** | `src/abacus/gold/` | Ons/USD ve USD/TRY üzerinden B-otorite saflıklarıyla gram altın (24K/22K/21K/18K) ve ziynet (çeyrek/yarım/tam). |
| **`silver`** | `src/abacus/silver/` | Ons/USD ve USD/TRY üzerinden milyem saflıklarıyla (999/925/800/1000) gram gümüş. |

---

## 🧪 Kalite & Test Kapsamı

- **225 Birim Testi:** %100 yeşil test güvencesi (`vitest`).
- **TypeScript Strict:** Sıfır `any`, tam tip emniyeti.
- **Sıfır Dış Bağımlılık (Hassas Matematik Hariç):** Yalnızca `decimal.js` kullanır.

---

## 🔒 Kalite ve Kırmızı Çizgiler (Zero Tolerance Rules)

1. **Sıfır Ham Math.\***: Tüm finansal hesaplamalar `math` motoru üzerinden yürütülür.
2. **Sıfır Intl / toLocale\***: Tarih ve para formatlamasında `Intl` ve `toLocale*` kullanımı yasaktır.
3. **Sıfır Ham toLowerCase / toUpperCase**: Türkçe harf dönüşümleri (`İ->i`, `I->ı`) `text.lower` ve `text.upper` ile yapılır.
4. **Parametresiz Date Yok**: `relative` ve `daysUntil` fonksiyonları bugün tarihini parametre olarak alır.
5. **Single Source of Truth**: Motor güncellemeleri yalnızca `SNN-Abacus-Core` reposunda yapılır; tüketici projeler pin'i elle yeni sürüm tag'ine çekerek alır (otomatik `npm update` kullanılmaz).
