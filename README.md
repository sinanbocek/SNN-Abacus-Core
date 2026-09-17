# 🧮 ABACUS Core Reference Engine (`SNN-Abacus-Core`)

> **ABACUS Engine Standard**: Tüm SNN projelerinde finansal hesaplama, Türkçe metin normalizasyonu, tarih biçimlendirme, PII gizleme, doğrulama ve BIST ticari işlemlerde **Tek Otorite (Single Source of Truth)** olan bağımsız referans çekirdek paketidir.

---

## ⚡ Hızlı Başlangıç & Kurulum

Projelerinize GitHub üzerinden doğrudan npm paketi olarak ekleyin:

```bash
npm install github:sinanbocek/SNN-Abacus-Core#semver:^3.0.0
```

> **Sürüm politikası:** `#semver:^3.0.0` aralığı ile bağlanın. Yama ve ek özellik sürümleri (2.1.1, 2.2.0) **otomatik gelir**; kırıcı major sürüm (4.0.0) **gelmez** ve elle geçilir. `package-lock.json` tam commit'i sabitlediği için build'ler tekrarlanabilir kalır. Ayrıntı: [INSTALL.md §4](INSTALL.md).

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

> **Kullanım kılavuzu:** [KILAVUZ.md](KILAVUZ.md) — her motor ve fonksiyon, çalışan örnekler, "hangisini kullanmalıyım?" karşılaştırmaları ve sık yapılan hatalar.
>
> Detaylı kurulum & kullanım rehberi: [INSTALL.md](INSTALL.md)
>
> **Çekirdeğe talep göndermeden önce [GERI-BILDIRIM-KAYDI.md](GERI-BILDIRIM-KAYDI.md) dosyasına bakın.**
> Gelmiş her talep ve verilen karar orada tutulur — **reddedilenler gerekçeleriyle birlikte.**
> Aradığınız şey daha önce değerlendirilip uygun görülmemiş olabilir.
>
> **v2.x kullanıyorsanız:** yükseltmeden önce [MIGRATION-v3.md](MIGRATION-v3.md) okuyun — v3.0.0 negatif yüzdelerin ve `text.suffix` çıktısının yazımını değiştirir, geçersiz hane sayısında hata fırlatmak yerine `'—'` döndürür.
> **v1.1.0 kullanıyorsanız:** önce [MIGRATION-v2.md](MIGRATION-v2.md).

---

## 📦 Motor Özeti (13 Çekirdek Motor)

Her fonksiyonun ne işe yaradığı, çalışan örnekleri ve **"hangisini kullanmalıyım?"**
karşılaştırmaları için: **[KILAVUZ.md](KILAVUZ.md)** — kılavuzdaki her örnek testte
gerçekten çalıştırılır.

| Motor | Fonksiyonlar | Ne işe yarar |
|---|---|---|
| **`math`** | `add` `sub` `mul` `div` `mod` · `round` `floor` `ceil` `abs` · `ratio` `percent` `percentChange` · `pow` `log` `log10` `max` · `equals` · `irr` · `allocate` | Float hatası olmayan hassas hesap (`decimal.js`). `allocate` bir tutarı ağırlıklara toplamı tam tutacak biçimde böler. `0.1 + 0.2` tam `0.3` olur; yuvarlama half-up. Hesaplanamayan işlem sessizce 0 değil `null` döner. |
| **`money`** | `format` `formatMajor` `formatMinorInput` · `compact` `compactMajor` · `decimal` `fmtDecimalGrouped` `ratio` `percent` · `parse` `parseNumber` `toMinor` `formatGroupedInput` · `toWords` · `knownCurrencyCodes` | Parayı Türkçe biçimde yazma ve geri okuma. ⚠️ `format`/`compact` **kuruş**, `formatMajor`/`compactMajor` **lira** okur. TRY/USD/EUR/GBP yerleşik; kendi biriminizi de verebilirsiniz. |
| **`currency`** | `convert` `cross` | Kur çevrimi. Kur parametre olarak verilir; motor internete çıkmaz. |
| **`date`** | `format` `parse` · `dayName` `monthName` `weekday` `isWeekend` · `daysBetween` `daysUntil` `relative` `relativeTime` · `isBefore` `isAfter` `isSameDay` | Türkçe tarih/saat biçimleme ve tarih **sorgulama**. Girdi ISO metni; saat dilimi Europe/Istanbul; 30 Şubat gibi var olmayan günleri reddeder. Tarih **üretmek** için `period`. |
| **`period`** | `addDays` `addMonths` · `startOfMonth` `endOfMonth` · `quarterOf` `quarterRange` · `monthsBetween` `isBetween` | Tarih **üretme**: gün/ay ekleme (ay sonuna kırpar), ay başı/sonu, çeyrekler. |
| **`text`** | `lower` `toTrLower` `toAsciiLower` `upper` `toAsciiUpper` `digits` `title` · `searchKey` `join` · `phone` `whatsapp` `email` `website` `websiteUrl` `name` `company` `plate` · `numberToWords` `suffix` · `lastVowel` `isBackVowel` `isRoundedVowel` `endsWithVowel` `endsWithHardConsonant` | Türkçe harf güvenli metin işleri (`i`→`İ`), arama anahtarı, telefon/e-posta/web/ad/unvan/**plaka** normalizasyonu, sayıyı yazıya çevirme ve Türkçe ek çekimi (`2026'da`). |
| **`validate`** | `tckn` `vkn` `iban` `ikn` `email` | Resmî checksum doğrulamaları (TC kimlik, vergi no, TR IBAN) ve biçim denetimi. Hepsi `true`/`false`. |
| **`mask`** | `money` `vkn` `iban` `phone` | Ekranda kişisel veriyi gizleme (`123****890`). Saklanan veriye dokunmaz. |
| **`collate`** | `compare` `sortBy` `key` | Türkçe alfabetik sıralama: `ç`, `ğ`, `ı`, `ö`, `ş`, `ü` doğru yerde. |
| **`unit`** | `convert` `categoryOf` `dataSize` `ONS_TO_GRAM` | Birim çevrimi (uzunluk, ağırlık, alan — dönüm/dekar dâhil) ve okunur dosya boyutu (`5 MB`). |
| **`gold`** | `gramGoldPrice` `ziynetPrice` `PURITY` `ZIYNET_GRAM` `ONS_TO_GRAM` | Ons fiyatı ve dolar kurundan gram altın (24/22/21/18 ayar) ve çeyrek/yarım/tam altın fiyatı, kuruş olarak. |
| **`silver`** | `gramSilverPrice` `SILVER_PURITY` `ONS_TO_GRAM` | Ons fiyatı ve dolar kurundan gram gümüş fiyatı (999/925/800), kuruş olarak. |
| **`tradingMath`** | `volumeFromQty` `qtyFromVolume` `leverage` · `validateTradeDirections` `computeRiskReward` `computePortfolioRatios` · `calculateThresholdDays` | BIST/VİOP işlem hesapları: pozisyon hacmi, kaldıraç, stop/hedef geçerliliği, risk-getiri oranı, portföy yoğunlaşması. |

---

## 🧪 Kalite & Test Kapsamı

- **929 Test:** %100 yeşil (`vitest`) — bunların 206'sı `KILAVUZ.md` örneklerinin çalıştırılmasıdır.
- **Ölçülen Kapsam:** statements %93,1 · branches %89,4 · functions %100 · lines %98,1 — CI'da eşiklerle korunur (`npm run test:coverage`).
- **TypeScript Strict:** Sıfır `any`, tam tip emniyeti.
- **Belge İddiaları Test Edilir:** README/INSTALL/SPEC/MOTOR-DETAYLARI içindeki her kod örneği `docs-claims.test.ts` ile doğrulanır; belge ile kod ayrışırsa CI kırılır.
- **Şartname ve README Kilitli:** `ABACUS-SPEC.md` §2'deki fonksiyon tablosu ile bu README'deki motor sayısı ve fonksiyon listeleri `spec-surface.test.ts` ile gerçek API'ye bağlıdır; yazılmayan bir ad dışa açılırsa CI kırılır.
- **Kılavuz Çalıştırılır:** `KILAVUZ.md`'deki her örnek `kilavuz.test.ts` tarafından çalıştırılıp sonucu karşılaştırılır; dışa açılan her fonksiyonun kılavuzda geçmesi de zorunludur.
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
8. **Alt Birim / Ana Birim Ayrımı**: `format` ve `compact` **kuruş**, `formatMajor` ve `compactMajor` **lira** okur — aynı sayı iki kapıda 100 kat farklı sonuç verir ve hata sessizdir. Çekirdek bu riski tüketicinin derleme hattına bağlayan bir ESLint yapılandırması yayınlar: `import abacus from '@snn/abacus-core/eslint'` (bkz. [INSTALL.md §6.1](INSTALL.md)).
