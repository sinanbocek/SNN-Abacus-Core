# Değişiklik Günlüğü

Bu projedeki tüm önemli değişiklikler bu dosyada belgelenir.
Format [Keep a Changelog](https://keepachangelog.com/tr/) temellidir;
sürümleme [Semantic Versioning](https://semver.org/lang/tr/) kurallarına uyar.

## [2.3.0] - 2026-08-30

> Tümü eklemelidir; hiçbir mevcut davranış değişmemiştir.

### Eklenenler

- **`text.searchKey(value)`** — ARAMA ANAHTARI. Denetim raporu B11-e'de sahadan
  bildirilen ve doğrulanan boşluk: `lower('Ismail')` = "ısmail" ile
  `lower('İsmail')` = "ismail" eşleşmiyordu, kullanıcı aradığını bulamıyordu.
  `searchKey` her ikisini de `"ismail"` yapar.
  Türkçe harfleri ASCII'ye katlar, ASCII küçültür, boşlukları teke indirir.
  **Kapsam sınırı (bilinçli):** noktalama ve boşluklar silinmez — daha agresif
  temizlik uygulamanın kararıdır.
  ⚠️ `collate.key` ile karıştırılmamalı: bu ARAMA anahtarıdır (ç = c),
  `collate.key` SIRALAMA anahtarıdır (ç ≠ c).

  > İki tüketici projede birbirinden bağımsız olarak elle yazılmış hâlde
  > bulundu (`normalizeStr`, `normalizeSearchKey`); yerleştirme kuralı
  > (AI-RULES §4.1) gereği çekirdeğe alındı.

- **`money.percent`'e `showPositiveSign` seçeneği** — pozitif değerlere `+`
  ekler (`"%+12,3"`). Sıfıra işaret eklenmez. Değişim/fark tablolarında yönü
  görünür kılmak içindir. Varsayılan davranış değişmedi.

## [2.2.0] - 2026-08-30

### Eklenenler — PARA BİRİMİ ARTIK VERİ

Eskiden `currency` seçeneği `'TRY' | 'USD'` biçiminde koda gömülüydü; EUR yazılamıyordu
bile. Yeni bir para birimi eklemek her seferinde çekirdek güncellemesi gerektiriyordu.

- **Yerleşik para birimleri:** TRY, USD, **EUR**, **GBP**.
- **Tüketici kendi birimini verebilir** — çekirdeğin hiç duymadığı bir birim dâhil:
  `money.format(x, { currency: { code: 'AZN', symbol: '₼', text: 'AZN', minorDigits: 2 } })`.
  Böylece yeni para birimi için **çekirdeğin güncellenmesi gerekmez**.
- **Farklı ondalık haneli birimler** desteklenir (JPY 0 hane, KWD 3 hane).
- **Sorumluluk ayrımı belgelendi** (`ABACUS-SPEC §2.0`): simge/kod/hane sayısı para
  birimine, ayraçlar okuyucunun diline aittir. ABACUS Türkçe yerellidir; dolar da
  `$1.234,56` yazılır. Amerikan biçimi kapsam dışıdır.
- `money.knownCurrencyCodes()` yerleşik kodları döner.

### Düzeltilenler

- **`money.compact` para birimi seçeneğini tümüyle yok sayıyordu.** `compact(x, {currency:'USD'})`
  bile `₺` basıyordu. Artık seçilen birimi kullanıyor.

### Eklenenler — money motoru tamamlandı

- **`formatMajor(major, opts)`** — ana birimdeki sayıyı biçimlendirir (`1234.56` → `₺1.234,56`).
- **`toMinor(major, currency?)`** — `parse`'ın sayısal ikizi: sayıyı alt birime çevirir.
  Geçersizde `null`; sessizce 0 üretmez.
- **`formatMinorInput(minor, digits)`** — giriş kutusunda gösterilecek sade metin.
  `parse` ile gidiş-dönüş uyumludur.
- **`decimal(value, digits)`** — düz ondalık gösterim, virgüllü (`2.5` → `"2,5"`).
- **`ratio(value)`** — `decimal`'in çifti (`8.712` → `"8,71x"`).

> Bu beş fonksiyon tüketici projelerde elle yazılmış hâlde bulunmuştu; yerleştirme
> kuralına göre (AI-RULES §4.1) genel oldukları için çekirdeğe alındı.
> `usd()` **alınmadı**: para biriminin veri olması onun yerini aldı.

## [Yayımlanmamış]

### Değişenler — sürüm ve güncelleme politikası

- **Tüketiciler artık `#semver:^X.Y.Z` aralığıyla bağlanır.** Yama ve ek özellik
  sürümleri otomatik iner; kırıcı major sürüm inmez ve elle geçilir.
  Önceki politika ("otomatik güncelleme kullanılmaz") bunun yerini aldı.
  `package-lock.json` tam commit'i sabitlediği için build'ler tekrarlanabilir
  kalır; güncelleme yalnız `npm update` ya da bot PR'ı ile iner.
  `INSTALL.md §4` yeniden yazıldı.
- **`AI-RULES §4.0`** — SemVer artık bir taahhüttür: minor otomatik indiği için
  kırıcı değişikliği minor olarak çıkarmak tüm tüketicileri sessizce bozar.

### Eklenenler

- **`api-surface.test.ts`** — genel API yüzeyi kilidi. Dışa açılan her ad
  çivilenmiştir: bir ad silinirse test "SİLİNEN ADLAR / MAJOR gerekir" diyerek
  kırılır, yeni ad eklenirse "YENİ ADLAR / MINOR gerekir" diyerek kırılır.
  Yeni sürüm politikasının makine zorlaması (AI-RULES §1).

## [2.1.0] - 2026-08-30

> Tümü **eklemeli**dir; hiçbir mevcut davranış değişmemiştir. v2.0.0'dan
> yükseltme için kod değişikliği gerekmez.

### Eklenenler — GİRİŞ KAPISI (parse yönü)

Çekirdek bugüne kadar tek yönlüydü: temiz veriden temiz çıktı üretiyor, ama
kirli girdiyi kabul etmiyordu. Kuruşa çevirme işi tüketiciye kalıyordu ve orada
float hatası oluşuyordu (`parseNumber('19,99') * 100` = 1998.9999999999998).

- **`money.parse(text)`** — Türkçe biçimli para metnini **kuruş tam sayısına**
  çevirir. Çevrim `math` üzerinden yapılır; float hatası oluşmaz.
- **`date.parse(text)`** — Türkçe biçimli tarih metnini ISO metnine çevirir.
  Takvim doğrulaması giriş kapısında da uygulanır (`"30.02.2024"` → `null`).

- **AYNA KURALI** (`ABACUS-SPEC §2.1`, normatif): *ABACUS kendi ürettiği her şeyi
  geri okuyabilmelidir; ne fazlasını, ne eksiğini.* `parse(format(x)) === x`.
  Kural iki özellik testiyle korunuyor: money için 5.000, date için 3.000 vaka.
  Yanında KAPALI ve belgelenmiş bir hoşgörü listesi var; İngilizce biçim
  (`"1,234.56"`) bilinçli olarak reddedilir.
  Bilgi kaybeden stiller (`monthYear`, `dayMonth`, `period`, `time`) geri
  okunamaz ve `null` döner — eksik bilgiyi tahmin etmek sessiz hata üretirdi.

### Eklenenler — yerleştirme kuralı

- **`AI-RULES §4.1`** — bir fonksiyonun çekirdeğe mi uygulamaya mı ait olduğu
  artık sınanır: *"Başka bir şirketin, başka alandaki uygulaması bunu aynen
  kullanabilir miydi?"* Tüketici proje taramasından gerçek örneklerle.
  Hedef ölçütü netleştirildi: yerel kodun %100'ü değil, **genel kodun %100'ü
  çekirdeğe, alan kodunun %0'ı.**

## [2.0.0] - 2026-08-24

> **Kırıcı değişiklikler içerir** (aşağıda ayrı başlıkta listelenmiştir).
> Tüketici projeler pin'i `#v1.1.0` → `#v2.0.0` yükseltmeden önce
> "Kırıcı değişiklikler" başlığını okumalı ve kendi testlerini çalıştırmalıdır.
>
> Adım adım geçiş rehberi: [MIGRATION-v2.md](MIGRATION-v2.md)

### Eklenenler (yeni motorlar)

- **period motoru** — dönem/periyot aritmetiği. `date` biçimlendirir, `period`
  **tarih üretir**: `addDays`, `addMonths`, `startOfMonth`, `endOfMonth`,
  `quarterOf`, `quarterRange`, `monthsBetween`, `isBetween`.
  `addMonths('2026-01-31', 1) → '2026-02-28'` (hedef ayda gün yoksa ay sonuna
  kırpılır — takvim aritmetiğinin standart davranışı). Geçersizde `null`.
- **collate motoru** — Türkçe alfabetik sıralama: `key`, `compare`, `sortBy`.
  `Intl.Collator` KULLANILMAZ (§4.2); sıra sabit alfabe tablosundan üretilir,
  sonuç her ortamda aynıdır. ç/ğ/ı/ö/ş/ü doğru konumdadır; alfabede olmayan
  q/w/x z'den sonra sıralanır; şapkalı harfler (â/î/û) şapkasızıyla aynı sırada.
  `sortBy` girdiyi değiştirmez ve kararlıdır.
  ⚠️ `collate.key` SIRALAMA içindir, arama anahtarı değildir (ç ≠ c korunur).

### Değişenler (paket ağırlığı — rapor B9)

- **`package.json`'a `"sideEffects": false` eklendi** ve Türkçe harf haritaları
  `internal/tr-case` yaprak modülüne taşındı. Bu ikisi, döngü kırma ve
  `Decimal.clone` değişikliğiyle birleşince decimal.js'in artık **yalnızca
  gerçekten kullanıldığında** pakete girmesini sağlıyor.

  Ölçüm (vite lib, minify, ESM):

  | Tüketim | v1.1.0 | şimdi |
  |---|---|---|
  | `text.upper` tek başına | 42.815 B | **506 B** |
  | `validate.tckn` tek başına | 43.018 B | **790 B** |
  | `collate.sortBy` tek başına | (yoktu) | **1.366 B** |
  | `math.round` (decimal gerekli) | 42.474 B | 42.661 B |

  `sideEffects: false`'ın yuvarlama davranışını bozmadığı, paketlenmiş kod
  çalıştırılarak doğrulanmıştır (`round(2.5) === 3`).

### Düzeltilenler (denetim raporu blokerları)

- **B1 — Takvim doğrulaması eklendi.** `date` motoru artık var olmayan günleri
  reddediyor: `2024-02-30`, `2025-02-29`, `2026-04-31` gibi girdiler `'—'`
  (`daysBetween` için `null`) döner. Artık yıl kuralı yüzyıl istisnasıyla
  birlikte uygulanır (1900 artık yıl değil, 2000 artık yıl).
  Önceden bu tarihler geçerli sayılıyor ve `daysBetween` sessizce kayıyordu.
- **B2 — Sayı→yazı ölçek tavanı kapatıldı.** `Katrilyon` (10^15) ölçeği eklendi.
  Güvenli tam sayı sınırının (`Number.MAX_SAFE_INTEGER`) ötesindeki girdiler
  sessizce yanlış üretmek yerine boş dize döner. Önceden `numberToWords(1e15)`
  sessizce `"Bir"` dönüyordu.
- **B3 — Sessiz varsayılan yasağı makineye bağlandı.** ESLint
  `no-restricted-syntax` ile `|| 0` ve `?? 0` kalıpları `error` seviyesinde
  yasaklandı. Kodda bulunan **19 ihlal** (money, text, validate, trading-math)
  temizlendi; her biri null durumunu artık açıkça ele alıyor.
  `validate.tckn`/`vkn`/`iban` yeniden yazıldı; davranış eşdeğerliği 40.000
  üretilmiş girdide referans algoritmayla karşılaştırılarak kanıtlandı.
- **B4 — `money.toWords` geçersiz girdi ve negatif işaret düzeltildi.**
  `NaN`/`Infinity`/ondalıklı kuruş artık `'—'` döner (önceden `"Yalnız Sıfır..."`
  yazıyordu). Negatifte "Eksi" ibaresi dilbilgisel doğru konuma alındı.
- **B5 — Dönüş sözleşmeleri hizalandı.** `money.parseNumber` artık
  `number | null` döner (çözümlenemeyen girdide `null`); önceden `0` dönerek
  "değer yok" ile "değer sıfır"ı karıştırıyordu. `money.fmtDecimalGrouped`
  geçersiz girdide `'0'` yerine `'—'` döner. Sözleşmenin tamamı
  `ABACUS-SPEC.md §2.1`'de normatif olarak yazılıdır; `math` ilkel katmanının
  IEEE-754 `NaN` yayılımı bilinçli istisna olarak belgelenmiş ve test edilmiştir.
- **B6 / B7 — Belge çelişkileri giderildi.** `ABACUS-SPEC.md §2` API tablosu
  koddan doğrulanmış tam listeyle değiştirildi (önceden kodda olmayan 12 ad
  sayıyordu) ve normatif **§2.1 Dönüş Sözleşmeleri** bölümü eklendi.
  `INSTALL.md §3`'teki üç hatalı örnek düzeltildi, §6 lint bloğu çekirdekle
  hizalandı.

### Eklenenler (tarih motoru)

- `date.format` yeni stiller: `'time'` (`"00:30"`), `'dateTime'`
  (`"25.08.2026 00:30"`), `'dayMonthWeekday'` (`"13 Ağustos Per."`).
- `date.monthName(month, form?)` — tek başına ay adı (`"Ağustos"` / `"Ağu"`).
- `date.dayName(iso, form?)` — uzun gün adı desteği (`"Pazartesi"`).
- Saat dilimi: **Europe/Istanbul (sabit UTC+3)**. Saat dilimi eki taşıyan ISO
  değerleri (`Z`, `±HH:MM`) İstanbul saatine çevrilir; eki olmayanlar İstanbul
  duvar saati kabul edilir ve kaydırılmaz.

### Kırıcı değişiklikler

1. **Var olmayan takvim günleri artık reddediliyor** (B1). Bu tarihleri
   biçimlendiren veya gün farkı hesaplayan tüketici kodu artık `'—'` / `null` alır.
2. **Saat dilimli ISO değerlerinde tarih kayabilir.** `date.format('2026-08-15T21:30:00Z')`
   v1.1.0'da `"15.08.2026"` dönerdi; artık `"16.08.2026"` döner (İstanbul'da
   ertesi gün 00:30'dur). `relative`, `dayName` ve `daysBetween` da bu dönüşümü
   uygular. Saat dilimi eki OLMAYAN girdilerde davranış değişmemiştir.
3. **`money.toWords` negatif çıktısı değişti:** `"-Yalnız YüzElliTürkLirası"` →
   `"Yalnız EksiYüzElliTürkLirası"`.
4. **`text.phone` sabit hattı kabul ediyor** (aşağıda).
5. **`money.parseNumber` dönüş tipi `number` → `number | null`** oldu;
   `money.fmtDecimalGrouped` geçersiz girdide `'0'` yerine `'—'` dönüyor.

> ⚠️ **Bilinen sınır:** Sabit UTC+3 varsayımı Türkiye'nin 2016 sonrası
> düzenine uygundur. **2016 öncesi** tarihlerde yaz saati dönemleri için
> saat/tarih bir saat sapabilir. `Intl` yasağı nedeniyle tarihsel saat dilimi
> veritabanı çekirdeğe taşınmamıştır.

### Eklenenler
- **unit motoru** — birim çevrimi. Uzunluk (mm/cm/m/km), ağırlık (g/kg/ton/ons),
  alan (m²/dönüm/dekar/hektar/km²) ve veri boyutu (B/KB/MB/GB/TB).
  `convert`, `categoryOf`, `dataSize`. Kategori uyuşmazlığında ve geçersiz girdide
  `null`; `dataSize` biçimlendirme olduğu için `'—'` döner.
  `dönüm = dekar = 1000 m²` (metrik standart), veri birimleri ikili taban (1 KB = 1024 B).
- **text.phone BTK sınıflandırması** — sabit hat (2/3/4) ve coğrafi olmayan (8/9)
  numaralar artık geçerli. Dönüş tipi `PhoneResult`; yeni `kind` alanı
  (`'mobile' | 'landline' | 'special' | null`). Kaynak: BTK Milli Numaralandırma Planı.
- **Kapsam ölçümü** — `@vitest/coverage-v8` (devDependency), `npm run test:coverage`,
  CI kapısında eşiklerle. 2026-08-24 ölçümü: statements %90,6 · branches %82,4 ·
  functions %97,4 · lines %95,1.

### Değişenler
- **Dairesel import kaldırıldı.** v1.1.0'daki `text ↔ money` ve `text ↔ validate`
  karşılıklı bağımlılıkları, ortak parçalar `internal/` yaprak modüllerine taşınarak
  giderildi. **Genel API değişmedi** — `money.format` ve `validate.email` aynı adla,
  aynı davranışla çalışır.
- **`math` artık global `Decimal`'i değiştirmiyor.** `Decimal.set(...)` yerine
  `Decimal.clone(...)` kullanılır; böylece kendi decimal.js'ini kullanan tüketici
  projelerin ayarı bozulmaz. Yuvarlama davranışı birebir korunmuştur.
- **`ONS_TO_GRAM` tekilleştirildi.** `gold` ve `silver` sabiti ayrı ayrı tanımlamayı
  bıraktı; üçü de `internal/constants`'tan gelir (test ile çivilendi).
- `whatsapp()` yalnız cep numaraları için link üretir (sabit hat/850'de `''`).
- `mask.phone` cep dışındaki geçerli numaraları da maskeler. **Cep çıktısı değişmedi.**

### Kırıcı olabilecek tek nokta
- `text.phone('02123334455')` v1.1.0'da `valid:false` dönerdi, artık `valid:true`
  döner; `mask.phone` aynı numara için `'—'` yerine maske basar. Cep numarası
  davranışı hiç değişmemiştir (regresyon testleriyle çivilenmiştir).

## [1.1.0] - 2026-08-18

### Eklenenler
- **gold motoru** — Ons/USD ve USD/TRY üzerinden gram altın (24K/22K/21K/18K)
  ve ziynet (çeyrek/yarım/tam) hesaplama. B-otorite saflık katsayıları:
  24K=0.995, 22K=0.916, 21K=0.875, 18K=0.750; ons→gram=31.1034768 (troy).
- **silver motoru** — Ons/USD ve USD/TRY üzerinden gram gümüş hesaplama.
  Milyem saflıkları: 999 (külçe, varsayılan), 925 (sterling), 800, 1000.
- gold ve silver için 20 birim testi (toplam 225).

## [1.0.0] - 2026

### Eklenenler
- Çekirdek motorlar: math, money, currency, date, text, validate, mask, tradingMath.
- decimal.js tabanlı kuruş matematiği, half-up yuvarlama, null sentinel deseni.
- Tam saf (I/O'suz) kütüphane mimarisi, vitest test altyapısı, CI (lint + tsc + test).
