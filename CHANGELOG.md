# Değişiklik Günlüğü

Bu projedeki tüm önemli değişiklikler bu dosyada belgelenir.
Format [Keep a Changelog](https://keepachangelog.com/tr/) temellidir;
sürümleme [Semantic Versioning](https://semver.org/lang/tr/) kurallarına uyar.

## [4.1.0] - 2026-09-19

> Eklemeli — **varsayılan davranış değişmedi**, hiçbir çağrı kırılmaz.
> Karar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md) madde 37 (talep #40, trade-kasa).

### Eklenenler

- **`money.formatGroupedInput(raw, opts?)`** — ikinci parametre `{ dotAsDecimal?: boolean }`.

  ```
  formatGroupedInput('98.50')                        -> '9.850'   (varsayılan, değişmedi)
  formatGroupedInput('98.50', { dotAsDecimal: true }) -> '98,50'
  ```

  **Neden:** risk hesabı yapan bir stop kutusuna `98.50` yazan kullanıcı `9.850`
  görüyordu — **100 kat** sapma. Nokta binlik sayılmıyor, **siliniyordu**
  (`/[^0-9,]/g`) ve kalan rakamlar yeniden gruplanıyordu.

  **Neden seçmeli, varsayılan değil:** `1.234` yazan bir kullanıcı bin iki yüz otuz dört
  de demiş olabilir, 1,234 de. İki niyet tek girdide ayırt edilemez; çekirdek tahmin
  etmez, kararı tüketiciye sorar.

  **TAKAS — açan bilsin:** `dotAsDecimal: true` olan kutuda binlik ayracı olarak nokta
  **yazılamaz**; `'1.234'` artık `1,234` olur. Serbest ondalık kutularında (fiyat, oran,
  stop) açın; binlik ayracını elle yazdıran kutularda kapalı bırakın.

### Ölçülmüş ama bu sürümde ELE ALINMAYAN

`formatGroupedInput` eksi işaretini de siliyor: `'-5'` -> `'5'`, `'(1.210,50)'` -> pozitif.
Talebi gönderen tüketici ölçtü ve *kendisi için sorun olmadığını* bildirdi (negatif kabul
eden alanları yok). Gerçek bir ekran ihtiyacı görülmeden çekirdeğe alınmadı
(`AI-RULES §4.1` Sınır durumu 3). İhtiyaç duyan tüketici ölçümüyle başvurur.

---

## [4.0.0] - 2026-09-19

> ⚠️ **KIRICI.** Tek davranış değişti; hiçbir ad kaldırılmadı, kodunuz derlenmeye devam eder.
> Geçiş rehberi: [MIGRATION-v4.md](MIGRATION-v4.md) · Karar: [`docs/teknik-borc.md`](docs/teknik-borc.md) TB-010.

### Kırıcı — `money.parseNumber` yalnız Türkçe biçim okur

v3 Türkçe olmayan yazımı **sessizce yanlış sayıya** çeviriyordu; JSDoc ise
*"çözümlenemeyen girdide `null` döner"* vaat ediyordu. Kod sözleşmeyi ihlal ediyordu.

```
                   v3.x        v4.0.0
'1.234,56'    ->   1234.56     1234.56    (değişmedi)
'1 234,56'    ->   1234.56     1234.56    (değişmedi)
'1.250.000'   ->   1250000     1250000    (değişmedi)
'1234.56'     ->   123456      null       <- 100 KAT yanlıştı
'1.5'         ->   15          null
'1e3'         ->   13          null
'12abc34'     ->   1234        null
'(1.210,50)'  ->   1210.5      null       <- işaret kaybı vardı
```

Kabul edilen dilbilgisi: isteğe bağlı eksi · 3'erli **nokta, boşluk veya U+00A0**
binlik grupları · virgülden sonra istenen kadar ondalık.

Dilbilgisi uydurulmadı: `SNN-Ihale-Maliyet` v3'ün gevşekliğine karşı kendi kapısını
(`readDecimalCell`) yazmış ve yorumunda *"Çekirdeğe talep adayı"* diye işaretlemişti.
Çekirdek o kapıyı aldı — böylece o projenin mevcut testleri de kırılmıyor.

### ⚠️ `?? 0` ile saranlar: sessiz sapma riski

Ölçüldü — iki tüketici sonucu `?? 0` ile sarıyor (`trade-kasa/format.ts:15`,
`SNN-Yonetici-Ozeti/mizanParser.ts:36`). Bu kalıpta v3'te *yanlış ama sıfırdan farklı*
dönen girdiler artık **0** olur ve toplam sessizce kayar. Rehberde açık `null` denetimine
çevirme reçetesi var.

### Neden MAJOR

`AI-RULES §4.0`: *"Ölçüt niyet değil, tüketicinin gördüğü çıktıdır. Şüphe varsa MAJOR."*
Bir tüketici v3'ün yanlış davranışını bir teste yazmıştı; şüphe yoktu.

**Major sürüm otomatik inmez** — `^3.x` ile bağlıysanız pin'i elle yükseltin.

---

## [3.5.1] - 2026-09-19

> **Düzeltme: `configs.recommended` eski hâline döndü.** v3.4.0'da oraya eklenen sessiz
> varsayılan kapısı **geri alındı** ve yeni `configs.strict` altına taşındı.

### Neden

v3.5.0 yayılınca **SNN-Proje-ve-Nakit-Akis-Yonetimi'nin CI'ı 92 hatayla kırmızıya döndü** —
o proje kendi koduna hiç dokunmamıştı. Sebep: tüketiciler `#semver:^3.x` ile bağlı,
minor sürüm onlara **otomatik** iniyor ve `recommended`'a yeni kapı eklemek kendiliğinden
CI kırıyor. `AI-RULES §4.0`: *"Ölçüt niyet değil, tüketicinin gördüğü çıktıdır."*

Kapı doğruydu — yakaladığı satırlar gerçek (`margin = (marginRes.data as number) || 0`).
Yanlış olan **yeriydi**.

### Kural (yeni)

`recommended` bir **major hat içinde sabit sözleşmedir**. Yeni kapı önce `strict`e girer;
`recommended`'a ancak MAJOR sürümde taşınır. Testle çivilendi.

### Tüketici için

- Bir şey yapmanız **gerekmez**: `recommended` v3.3.0'daki hâline döndü.
- Sessiz varsayılan korumasını istiyorsanız, hazır olduğunuzda açın:

  ```js
  // eslint.config.js
  ...abacusEslint.configs.strict   // recommended yerine
  ```

---

## [3.5.0] - 2026-09-19

> Eklemeli — mevcut hiçbir ad ya da davranış değişmedi.
> Karar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md) madde 34 (talep #23, GHS-Panel).

### Eklenenler

- **`text.properNounSuffix(name, kind)`** — özel ada hâl eki getirir ve adın **ekli
  hâlini** döner (ekin kendisini değil). `kind` mevcut `SuffixCase` sözlüğünü kullanır:
  `'loc' | 'dat' | 'abl' | 'acc' | 'gen'`.

  ```
  properNounSuffix('VakıfBank', 'loc')       -> "VakıfBank'ta"
  properNounSuffix('A.Ş.', 'abl')            -> "A.Ş.'nden"
  properNounSuffix('Ziraat Bankası', 'loc')  -> "Ziraat Bankası'nda"
  properNounSuffix('Ayşe', 'dat')            -> "Ayşe'ye"
  ```

  `suffix` eki **sayının** okunuşundan türetir; bu işlev **kelimenin** kendisinden.
  Geçersiz girdide `'—'` döner (madde 27 emsali).

  Üç tuzak testle çivilendi: kısaltmada uyum okunuşa bakar (`A.Ş.'nden`, `'ndan` değil),
  iyelik ekiyle biten ad kaynaştırma `n`si ister (`Bankası'nda`), iyelik `-I` biçimi
  `-sI` kalıbına uymaz (`Şirketi'nden`).

  **Bilinen sınırlar — gizlenmedi, testle belgelendi:**
  - İyelik tespiti **kurum adı sonu listesiyle** yapılır, genel desenle değil. Genel desen
    (`/(sı|si|su|sü)$/`) denendi ve yer adlarını iyelik sandı: `Gürsu` → `Gürsu'nda`
    (doğrusu `Gürsu'da`). Listede olmayan bir kurum sonu kaynaştırma almaz.
  - Harf harf okunan kısaltmalar (`TRT`, `BRT`) kapsam dışı; okunuş tablosu yalnız
    `a.ş`, `aş`, `şti` için var.

---

## [3.4.0] - 2026-09-19

> **Not:** 3.4.0 ayrı bir etiket olarak yayımlanmadı; içeriği **v3.5.0 ile birlikte**
> tüketicilere ulaştı. Sebebi kayda geçirildi: o sırada sürüm etiketi elle atılıyordu
> ve atılmadı. Etiketleme 2026-09-19'dan beri `surum-etiketi.yml` ile otomatiktir.

> Eklemeli — hiçbir ad ya da davranış değişmedi.
> **Ama yayınlanan ESLint yapılandırmasına bir kapı eklendi**; tüketicide yeni lint
> hatası çıkabilir. Karar: [`docs/teknik-borc.md`](docs/teknik-borc.md) TB-005.

### Değişenler — ESLint yapılandırması (tüketiciyi ilgilendirir)

- **Sessiz sayısal varsayılan yasağı artık pakette.** Bugüne dek yalnız `INSTALL §6.2`
  ev kuralı şablonundaydı; `configs.recommended` kullanan tüketiciler bu korumaya hiç
  sahip değildi. Ayrıca kural yalnız `0` literaline bakıyordu.

  Kapı iki kollu:

  ```js
  deger ?? 0            // hata — sıfır varsayılanı her yerde yasak (eski davranış)
  deger || 0            // hata
  GERI_GUN[kod] ?? 1    // hata — ARANMIŞ değere sayı varsayılanı (YENİ)
  toMinor(v) ?? 0       // hata — HESAPLANMIŞ değere sayı varsayılanı (YENİ)
  liste[0] ?? -1        // hata

  opts?.digits ?? 1     // serbest — meşru seçenek varsayılanı
  deger ?? 'yok'        // serbest — sayı uydurmuyor
  ```

  İkinci kolun neden dar tutulduğu ölçülerek belirlendi: "her sayıyı yakala" denendiğinde
  çekirdeğin **kendi** kodunda yanlış alarm verdi (`opts?.digits ?? 1`, `unit/index.ts:112`).

  **Bilinen sınır:** düz bir değişkene sıfır dışı sayı varsayılanı (`deger ?? 1`)
  yakalanmaz — sözdiziminden aranmış sonuç mu seçenek mi olduğu anlaşılmıyor.
  Gizlenmiyor, testle belgeleniyor.

  Yalnız bu kuralı almak isterseniz: `abacusEslint.silentDefaultGates`.

- **`INSTALL §6.2` ev kuralı şablonundan sessiz varsayılan bloğu çıkarıldı.** Aynı kural
  iki yerde iki farklı biçimde durmasın diye; şablon artık pakete yönlendiriyor.

---

## [3.3.0] - 2026-09-18

> Eklemeli — mevcut hiçbir ad veya davranış değişmedi.
> **Ama ESLint kuralları sertleşti**, aşağıya bakın.
> Karar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md) (madde 33, talep #7).

### Eklenenler

- **`text.toAsciiUpper(str)`** — `toAsciiLower` işinin büyütme ikizi. Yalnız `a-z` aralığını
  büyütür, Türkçe harfe dokunmaz.

  ```
  text.upper('irmaksasi')         -> 'İRMAKSASİ'   ← şasi numarası için YANLIŞ
  text.toAsciiUpper('irmaksasi')  -> 'IRMAKSASI'   ← doğru
  ```

  Şasi ve motor numarası, ürün kodu, barkod, IBAN öneki gibi ASCII KOD alanları içindir.
  Türkçe METİN için `text.upper` kullanılmaya devam edilir.
- **`text.digits(raw, maxLength?)`** — giriş kutusunda canlı süzme; yalnız rakam bırakır,
  `maxLength` verilirse keser. `digits('2o0a7') -> '207'` · `digits('20267', 4) -> '2026'`.
  Geçersiz `maxLength` (negatif, ondalıklı, güvenli tam sayı dışı) -> `'—'`.

### Değişenler — ESLint yapılandırması (tüketiciyi ilgilendirir)

`@snn/abacus-core/eslint` kural kümesine beş yeni kapı eklendi. Kuralları kullanan projelerde
**yeni hatalar çıkabilir** (kod davranışı değişmedi, yalnız denetim sertleşti):

| Yakalanan | Yerine |
|---|---|
| `Intl.*` (ör. `new Intl.NumberFormat`) | `money` / `date` motorları, `money.formatGroupedInput` |
| `toLocaleString` | `money.formatMajor` / `date.format` |
| `toFixed` | `math.round` / `money.fmtDecimalGrouped` |
| `toUpperCase` | `text.upper` (Türkçe metin) · `text.toAsciiUpper` (kod alanı) |
| `toLowerCase` | `text.lower` (Türkçe metin) · `text.toAsciiLower` (e-posta, web) |

Bilinçli kullanım `// eslint-disable-next-line no-restricted-properties -- gerekçe` ile geçer.

### Talep edilip ALINMAYANLAR

- **`groupedAmount` / `amountToNumber`:** karşılıkları zaten var —
  `money.formatGroupedInput` ve `money.parseNumber`. Talebin örnekleri bu ikisiyle
  çalıştırıldı, çıktılar birebir aynı. Kılavuza yönlendirme eklendi.
- **`input` motoru:** açılmadı. Süzme işi `text`e, para işi `money`de kaldı.
- **`input.code` (ASCII kod süzme):** tek ekrandan geldiği için ertelendi; `toAsciiUpper`
  ile tüketicide tek satır.

## [3.2.0] - 2026-09-15

> Eklemeli. Mevcut hiçbir ad veya davranış değişmedi.
> Karar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md) (madde 32, talep #6).

### Eklenenler

- **`date.relativeTime(fromMs, nowMs, { style })`** — dakika/saat çözünürlüklü göreli süre.

  ```
  relativeTime(now - 30_000, now)                       → 'az önce'
  relativeTime(now - 5 * 60_000, now)                   → '5 dakika önce'
  relativeTime(now - 3 * 3_600_000, now, { style: 'short' }) → '3 sa önce'
  relativeTime(now - 72 * 3_600_000, now)               → '3 gün önce'   (date.relative'e devir)
  ```

  Üç tüketicide (trade-kasa, GHS-Panel, Gunum-Var) dört ayrı kopya vardı ve hepsi farklı
  yazıyordu (`Az önce`/`az önce`, `sa`/`saat`, `dk`/`dakika`, `ay`/`yıl`); ikisi `Math.*` ve
  `Intl` kullanıyordu. Yazım politikası sahip kararıyla belirlendi:
  - `style: 'long'` (varsayılan: dakika/saat) · `'short'` (dk/sa). Harfler küçük.
  - 24 saat ve üstünde **`date.relative`'e devreder** (İstanbul günü); ay/yıl birimi yok.
  - Gelecek simetrik: `5 dk sonra`. Aşağı yuvarlar.
  - Girdi epoch ms, güvenli tam sayı; aksi `'—'`. `0` ve negatif damga **geçerlidir**.
  - ⚠️ Bilinçli sıçrama: 24 saat eşiğinde takvim gününe geçildiği için `23 saat önce`'den
    sonra `dün` atlanıp `2 gün önce` gelebilir. Testle çivilendi.
- Tip: `RelativeTimeStyle`.

### Tüketicilere not

- **trade-kasa** `rateAgeLabel` → `relativeTime(ts, now, { style: 'short' })`. Fark: saat
  `3 sa önce` yazılır (bugün `3 saat önce`). `null`/`0` → `'—'` kontrolü tüketicide kalır.
- **GHS-Panel** `formatRelativeTime` → `short`. `Az önce` küçük harfe iner; 7 gün sonrası
  tarih gösterimi isteniyorsa `date.format` ile tüketicide yapılır.
- **Gunum-Var** `timeAgo` → `long`. `ay`/`yıl` birimleri kaybolur (`92 gün önce`).

## [3.1.0] - 2026-09-14

> Eklemeli. Mevcut hiçbir ad veya davranış değişmedi.
> Kararlar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md) (madde 28–31, talep #5).

### Eklenenler

- **`math.allocate(total, weights, { residual })`** — havuz dağıtımı. Tam sayı bir
  tutarı ağırlıklara orantılı böler; **sonuçların toplamı tutara her zaman tam eşittir.**

  ```
  allocate(100000, [6080, 8160, 12080, …], LR)   → [107, 144, 212, …]   Σ = 100000
  her payı ayrı yuvarlamak                        → [107, 144, 213, …]   Σ = 100001 ✘
  ```

  Her payı ayrı yuvarlamak toplamı sessizce saptırıyordu: tüketicinin (SNN-Ihale-Maliyet)
  gerçek 9 kalemlik verisinde havuzların %55,0'ında, 20–55 kalemlik sepetlerde %77,2'sinde.
  Yöntem en büyük kalan; eşit kalanda küçük indis. `residual` **zorunludur**, şimdilik tek
  değeri `'largest-remainder'` — yeni politika eklemek MINOR kalır.
  - Ağırlıklar ondalıklı olabilir (m³, kg); ondalık yazımlarıyla okunur. `total` güvenli
    tam sayıdır, negatif olabilir (işaret-simetrik).
  - **Hesap tam aritmetiktir (`BigInt`).** 20 basamaklı `Decimal` bölmesi ~10^15
    büyüklüğündeki havuzlarda artığı yanlış kaleme veriyordu; ölçüldü ve üç vaka
    fixture'a girdi (`sapma-prec20-a/b/c`).
  - Garantiler: toplam, uzunluk, tam sayı, sıfır ağırlığa sıfır pay, belirlenimcilik,
    `w[i] > w[j] → r[i] >= r[j]`. Belgelenmiş sınır: havuz büyüyünce bir kalemin payı
    azalabilir (Alabama paradoksu).
  - Yeni tipler: `ResidualPolicy`, `AllocateOptions`.

### Testler

- 929 → **979 birim testi**. Yeni: `math/allocate.test.ts` (23 tüketici fixture'ı ·
  üslü ağırlık · `null` kapıları · 1.000 rastgele sepette 8 değişmez),
  `math/__fixtures__/allocate.json`.
- **Assert değerleri dış otoriteden:** fixture Python `fractions` ile tüketici tarafında
  üretildi, çekirdek tarafında ayrı bir uygulamayla 23/23 yeniden doğrulandı.
- **Mutasyon doğrulaması (AI-RULES §2.3):** 11 mutasyonun 10'u kırmızı verdi — artık
  döngüsü, indis sırası, 20 basamaklı `Decimal` bölmesi (yalnız `sapma-prec20-*` yakaladı),
  sıfır ağırlığa artık, işaret simetrisi, `-0`, politika / güvenli tam sayı / ağırlık /
  sıfır toplam kapıları. Hayatta kalan `weights.length === 0` koruması ölü kod olarak
  **kaldırıldı** (boş dizi `Σ = 0` kapısından geçer).
- API yüzeyi kilidi, `ABACUS-SPEC` §2 tablosu, README motor özeti ve `KILAVUZ` `math.allocate`
  ile güncellendi.

---

## [3.0.1] - 2026-09-14

> Yalnız belge. Kod ve genel API değişmedi.

### Düzeltilenler — belgeler

- **`MIGRATION-v3.md` tarama komutu yanlış alarm veriyordu.** Önerilen
  `grep "%-[0-9]\|%+[0-9]"` deseni, Tailwind sınıflarındaki `calc(100%+8px)` gibi
  ifadeleri de eski yüzde yazımı sanıyordu; bir tüketici projede 8 yanlış sonuç üretti.
  Yeni desen yalnız tırnak içindeki yüzde metnini arar:

  ```bash
  grep -rnE "['\"\`]%[-+][0-9]" src/ test/
  ```

  Komut belgede yazıldığı hâliyle kabukta çalıştırılarak doğrulandı: çekirdekte gerçek
  eski yazımları buluyor, Tailwind kullanan tüketici projede yanlış alarm vermiyor.

---

## [3.0.0] - 2026-09-14

> ⚠️ **KIRICI SÜRÜM.** Hiçbir ad kaldırılmadı veya yeniden adlandırılmadı; kod derlenmeye
> devam eder. Değişen, bazı fonksiyonların **görünen çıktısı** ve geçersiz hane sayısındaki
> davranışıdır; değişiklikler **sessizdir**.
> Göç: [`MIGRATION-v3.md`](MIGRATION-v3.md).
> Kararlar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md) (madde 24, 26, 27).

### Değişenler — KIRICI

- **`money.percent` — varsayılan işaret konumu artık `'leading'`.**

  ```
  percent(-4.3, 1)                     v2.x "%-4,3"  → "-%4,3"
  percent(4.3, 1, { sign: 'always' })  v2.x "%+4,3"  → "+%4,3"
  ```

  Yüzde işareti TDK gereği sayıdan önce yazılır (`%25`) ama TDK negatif için hüküm
  koymaz; v2.x eksiyi iki sembolün arasına sıkıştırıyordu. Unicode CLDR `tr-TR`
  (tarayıcılar, `Intl.NumberFormat`) `-%4,3` yazar. v2.9.0'da seçenek olarak geldi;
  varsayılan değişikliği AI-RULES §4.0 gereği bu MAJOR sürüme bırakılmıştı.
  Eski yazım: `signPosition: 'inner'`. Pozitif ve işaretsiz çıktılar değişmedi.

- **`text.suffix` — negatif ve ondalıklı sayılarda doğru ek, virgüllü ondalık.**

  ```
  suffix(-2, 'percent', 'dat')   v2.x "%-2'e"   → "-%2'ye"
  suffix(-2, 'number', 'dat')    v2.x "-2'e"    → "-2'ye"
  suffix(2.5, 'percent', 'dat')  v2.x "%2.5'e"  → "%2,5'e"
  ```

  Ek, sayının okunuşunun son kelimesine göre seçilir (TDK: `7,65'lik`). v2.x okunuşu
  `numberToWords` ile üretiyordu; o fonksiyon negatif ve ondalıklı sayıda boş döndüğü için
  **ek rastgele düşüyordu**. Artık negatif sayı "eksi iki", ondalıklı sayı "iki tam onda
  beş" gibi okunur. Yüzde işaretinin konumu `money.percent` varsayılanıyla aynıdır.
  Bu hata 3.0.0 hazırlanırken ölçüldü; mevcut hiçbir test negatif veya ondalıklı `suffix`
  değerine bakmıyordu. Eski (hatalı) davranışı geri getiren bir seçenek yoktur.
  Tam ve pozitif sayıların çıktısı değişmedi.

- **Geçersiz hane sayısı artık çökmez — `'—'` döner.** `money.decimal`, `money.percent`,
  `money.fmtDecimalGrouped` ve `unit.dataSize`.

  ```
  money.decimal(2.5, 1.5)                  v2.x fırlatır  → "—"
  money.percent(4.3, -1)                   v2.x fırlatır  → "—"
  unit.dataSize(5242880, { digits: NaN })  v2.x fırlatır  → "—"
  money.fmtDecimalGrouped(4.3, 21)         v2.x 21 hane   → "—"
  ```

  Bu fonksiyonlar `digits`'i doğrulamadan `math.round`'a veriyordu; decimal.js geçersiz
  değerde hata fırlatıyordu (ABACUS-SPEC §2.1 ihlali). Kural: `digits` **0–20 arası tam
  sayı**. Ortak doğrulama `internal/hane` yaprak modülünde. `money.formatMinorInput`
  değişmedi (zaten 0–4 dışını `'—'` döndürüyordu); `math.round` ilkel katmanda olduğu
  için bilinçli olarak değiştirilmedi. `try/catch` ile saran tüketiciyi etkilediği için
  kırıcı sayıldı.

### Belgeler

- **Yeni: [`MIGRATION-v3.md`](MIGRATION-v3.md)** — üç değişikliğin gerekçesi, tarama
  komutu, kontrol listesi. Örnekleri `docs-claims.test.ts` ile çivilidir.
- `ABACUS-SPEC.md` §2.2'ye hane sayısı parametresinin hangi katmanda doğrulandığı
  eklendi.
- Motor belgesi, kılavuz, INSTALL ve README yeni varsayılana göre güncellendi; sürüm
  aralıkları `^3.0.0`.

### Test

- Yeni dosyalar: `text/suffix-sayi.test.ts` (beklenen ekler TDK kurallarından
  türetildi) ve `money/hane.test.ts` (dört fonksiyon × yedi geçersiz hane değeri,
  sınırlar dâhil). Hane doğrulamasının 8 korumasının 8'i de mutasyonla ölçüldü.
- Eski varsayılana dayanan 14 test beklentisi bilinçli olarak güncellendi; beklenmedik
  bir kırılma olmadı. Liste göç belgesinin içeriğini oluşturdu.
- Mutasyon doğrulaması: yeni kodun 8 korumasının 7'si kırmızı verdi; kalan varsayılan
  değer (`tamKisim = ''`) yalnız TypeScript'in katı dizi erişimi için var, çalışma
  zamanında kullanılmıyor — yorumla belgelendi.

---

## [2.9.0] - 2026-09-14

> Tümü eklemelidir; hiçbir mevcut davranış değişmemiştir.
> Talep kaynağı ve kararlar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md) (madde 23–25).

### Eklenenler — money

- **`PercentOptions.signPosition: 'inner' | 'leading'`** — işaretin yüzde simgesine
  göre konumu. `'leading'` Unicode CLDR `tr-TR` biçimidir:
  `percent(-4.3, 1, { signPosition: 'leading' }) → "-%4,3"`.

  Varsayılan `'inner'` (`%-4,3`) TDK kuralının harfiyen uygulanmasıdır: yüzde işareti
  sayıdan önce yazılır (`%25`) ama TDK negatif için hüküm koymaz, eksi iki sembolün
  arasında kalır ve tabloda yön ilk karakterden okunamaz. Tarayıcılar ve
  `Intl.NumberFormat` Türkçe için `-%4,3` üretir (CLDR 48.0 ile ölçüldü).
  `sign: 'always'` ile artı da öne gelir (`+%4,3`).

- **`PercentOptions.fixed: boolean`** — ondalık kısmı her zaman `digits` haneye
  tamamlar: `percent(4.3, 2, { fixed: true }) → "%4,30"`. Tablolarda virgüllerin alt
  alta hizalanması içindir; önceden sondaki sıfır atılıyordu.

  İkisi birlikte: `percent(-4.3, 2, { signPosition: 'leading', fixed: true }) → "-%4,30"`.

- **`PercentSignPosition`** tipi dışa açıldı.

⚠️ **Varsayılan değişmedi.** `-%4,3` doğru yazım olsa da varsayılanı değiştirmek
tüketicinin gördüğü çıktıyı değiştirir (AI-RULES §4.0); **3.0.0'a ertelendi.**

**Bilinçli CLDR farkları:** sıfıra işaret konmaz (`%0`; CLDR varsayılanı `-%0`
yazabilir) ve binlik ayraç uygulanmaz (`%1234,5`; CLDR `%1.234,5`).

### Belgeler

- Motor belgesi, kılavuz (`KILAVUZ.md` — yeni örnekler ve "sık yapılan hatalar"
  satırı) ve INSTALL güncellendi.
- Geri bildirim kaydına üç madde: seçenek kabulü, varsayılan değişikliğinin
  ertelenmesi, yüzde işaretinin sağa yazılması talebinin reddi (TDK).

### Test

- Yeni dosya: `money/percent-cldr.test.ts`. Beklenen değerler Unicode CLDR 48.0'dan
  (depo dışında `Intl.NumberFormat('tr-TR')` ile) ölçüldü.
- Mutasyon doğrulaması: yeni mantığın 12 korumasının 11'i kırmızı verdi. Kalan
  `Number.isInteger(digits)` koruması **ölü koddu** — tam sayı olmayan hane
  sayısında `math.round` önce fırlatıyor — ve kaldırıldı.
- ⚠️ Bu ölçüm önceden var olan bir hatayı gösterdi: `money.percent(4.3, 1.5)` ve
  `money.decimal(4.3, 1.5)` `'—'` döndürmek yerine **hata fırlatıyor**
  (ABACUS-SPEC §2.1 ihlali). Bu sürümde düzeltilmedi; ayrı iş olarak açıldı.

---

## [2.8.1] - 2026-09-13

> Yalnız belgeler ve testler. Kod ve genel API değişmedi.

### Belgeler

- **Yeni: [`KILAVUZ.md`](KILAVUZ.md) — kullanım kılavuzu.** 13 motorun ve dışa açılan
  her fonksiyonun çalışan örnekleri; aynı iş için birden fazla seçenek olduğunda
  **"hangisini kullanmalıyım?"** karşılaştırmaları (parayı yazmak, yüzde, metinden
  sayıya, yuvarlama, logaritma, `date`/`period`, harf dönüşümü/arama/sıralama,
  doğrulama/normalizasyon/maskeleme) ve sık yapılan hatalar tablosu.
- **README motor tablosu yeniden kuruldu.** Her motor satırında artık o motorun
  **tam fonksiyon listesi** ve sade bir "ne işe yarar" açıklaması var.
- `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md` başlığındaki eskimiş sürüm notu
  ("v2.0.0, yayımlanmamış") düzeltildi; belgeler arası "hangisini okumalıyım"
  yönlendirmesi eklendi.
- `AI-RULES.md` §4.0: yeni bir fonksiyonun README ve kılavuza da yazılması zorunlu.

### Test

- 659 → **872 test** (198'i kılavuz örneği, 15'i README kilidi). Kılavuz örnekleri daha
  önce hiçbir testin çalıştırmadığı yolları çalıştırdığı için kapsam da yükseldi:
  functions %99,3 → **%100**, lines %97,2 → %98,0.
- **`kilavuz.test.ts`** — kılavuzdaki her ```js örneğini gerçekten çalıştırır ve
  sonucu karşılaştırır (198 örnek); dışa açılan her adın kılavuzda geçmesini ve
  kod bloklarında denetlenmeyen satır bulunmamasını zorunlu kılar. Beş yönde
  meta-doğrulandı: yanlış sonuç, `null` yerine `0`, denetlenmeyen satır,
  kılavuzdan silinmiş fonksiyon ve yanlış nesne alanı ayrı ayrı kırmızı verdi.
- **`spec-surface.test.ts` genişletildi** — README başlığındaki motor sayısı, tablodaki
  motorlar ve her motorun fonksiyon listesi gerçek API ile karşılaştırılır.

---

## [2.8.0] - 2026-09-13

> Tümü eklemelidir; hiçbir mevcut davranış değişmemiştir.
> Talep kaynağı ve kararlar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md) (talep #4).

### Eklenenler — text

- **`text.plate(raw): PlateResult`** — Türkiye tescil plakası normalizasyonu.
  `NormalizeResult`'a `yeniKayit: boolean` ekler. `display` gruplu
  (`34 ABC 23`), `stored` boşluksuz (`34ABC23`).

  ```
  plate('54apy281')    -> display '54 APY 281'
  plate('34.ABD.344')  -> display '34 ABD 344'
  plate('6abc12')      -> display '06 ABC 12'
  plate('34yk')        -> display '34 YK', yeniKayit: true
  plate('82 AB 123')   -> valid: false
  ```

  - İl kodu 01–81 (katı), tek haneli yazılabilir.
  - 1–3 harf, yalnız 23 harften; **Ç Ğ Ö Ş Ü ve Q W X reddedilir.**
  - 2–5 rakam — **bilinçli olarak gevşek.**
  - Ayraç olarak yalnız boşluk, nokta, tire (kapalı liste). `TR` öneki yok.
  - Türkçe klavyenin I harfleri — `i`, `ı` ve (Caps Lock açıkken yazılan) `İ` —
    ASCII `I` olur; üçü de aynı `stored` değerini verir.

  ⚠️ **Harf/rakam grupları yönetmelikte yazılı değildir.** Karayolları Trafik
  Yönetmeliği Madde 55, 4/11/2025 tarihli ve 33067 sayılı Resmî Gazete ile
  kaldırıldı; güncel dayanak grupları İçişleri Bakanlığına bırakıyor. Kurallar
  fiilî uygulamadan derlendi ve rakam grubu, Bakanlığın yeni bir kombinasyon
  açması gerçek plakaları reddettirmesin diye gevşek tutuldu. Bedeli: fiilen
  görülmeyen `34 A 12` gibi biçimler de geçer.

  ⚠️ **`YK` resmî bir plaka değildir** — sigorta sektörünün tescili yapılmamış
  araçlar için kullandığı yazılı olmayan teamüldür. Çekirdek sahibinin kararıyla
  her zaman kabul edilir ve `yeniKayit` ile işaretlenir.

- **`internal/constants.IL_SAYISI = 81`** — il kodu üst sınırı, veri olarak.
  Yeni il kurulursa artırılır ve MINOR sürüm çıkar; geçerli plaka kümesi yalnız
  genişler.

### Belgeler

- **`ABACUS-SPEC.md` §2 fonksiyon tablosu düzeltildi — üç sürümdür eskimişti.**
  "Tam liste" iddiasına rağmen `compactMajor` (2.5.0), `irr` (2.6.0), `ceil`,
  `log10`, `weekday`, `isWeekend` (2.7.0) tabloda yoktu. Sentinel kuralları
  bölümündeki `null` dönen ve IEEE yayılımı yapan fonksiyon listeleri de
  güncellendi.
- **Yeni kilit: `spec-surface.test.ts`.** Şartname tablosunu gerçek barrel ile
  karşılaştırır; tabloya yazılmayan bir ad dışa açılırsa kırılır. Eskimenin kök
  nedeni tablonun bir zorlayıcısının olmamasıydı (AI-RULES §1).
- **`AI-RULES.md` §4.2 eklendi — tüketici talepleri.** Talep değerlendirmeden önce
  geri bildirim kaydı okunur; her karar kayda işlenir; talep iddiaları uygulanmadan
  ölçülür; mevzuata dayanan kurallarda aslı okunur; sahip istisnaları "emsal değildir"
  diye kaydedilir. §4.1'e Kural 4 eklendi: sabitliğini gösteren yürürlükteki metin
  yoksa kural "fiilî uygulama" olarak etiketlenir ve gevşek tutulur.

### Test

- 610 → **659 birim testi**. Yeni dosyalar: `text/plate.test.ts`,
  `spec-surface.test.ts`.
- Mutasyon doğrulaması: `plate`'in 19 korumasının 19'u da bozulduğunda kırmızı
  veriyor. Doğrulama sırasında bir ölü dal bulundu ve kaldırıldı (küçük `i` için
  ayrı dal — ASCII yolu zaten `I` üretiyordu); boş girdi koruması için `null`
  girdisi testi eklenerek ölçülür hâle getirildi.
- `text.upper('34abi12') === '34ABİ12'` belge iddiası çivilendi: plakada Türkçe
  büyük harf fonksiyonu kullanmanın neden yanlış olduğunun kanıtı.
- API yüzeyi kilidi `text.plate` ile güncellendi (eklemeli → MINOR).

---

## [2.7.0] - 2026-09-01

> Tümü eklemelidir; hiçbir mevcut davranış değişmemiştir.
> Talep kaynağı ve kararlar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md).

### Eklenenler — date

- **`date.weekday(iso)`** — haftanın günü SAYI olarak: **0 = Pazar … 6 = Cumartesi**.
  Geçersiz tarihte `null` (`0` değil — 0 geçerli bir gündür).

  `dayName`'in sayısal ikizi. Haftanın günü çoğu zaman bir gösterim değil bir
  KARAR girdisidir; sayısal karşılık olmadığı için iş kuralları görüntü metnine
  bağlanıyordu (`dayName(iso) === 'Cts'`). Kısaltma bir gün değişse o kural
  sessizce yanlış çalışırdı: ne tip hatası ne test kırmızısı.

- **`date.isWeekend(iso)`** — Cumartesi/Pazar mı. Geçersiz tarihte `null`
  (`false` değil): "hayır" ile "karşılaştıramadım" ayrılır.

  ⚠️ Bu **takvim** bilgisidir, **iş günü** bilgisi değildir. Resmî tatiller
  kapsam dışıdır ve öyle kalacaktır: tatil takvimi sabit değildir
  (AI-RULES §4.1 Kural 2).

  İkisi de saat dilimi çevrimini uygular; saat taşıyan damgada gün kayabilir.

### Eklenenler — math

- **`math.ceil(x)`** — yukarı yuvarlama. `floor`'un simetriği
  (`ceil(x) === -floor(-x)`). Yuvarlamanın üç yönünden ikisi çekirdekteydi,
  bu üçüncüsü.

- **`math.log10(x)`** — ONLUK logaritma. `x <= 0` veya geçersizde `null`.

  ⚠️ **`log(x) / log(10)` ile taklit edilemez** ve bu sessiz bir hatadır.
  `math.log` sonucunu `toNumber()` ile float'a düşürür; hassasiyet orada
  kaybolur ve tam onluk kuvvetlerde bölme bir epsilon aşağıda kalır:

  ```
  div(log(1000), log(10))     -> 2.9999999999999996  → floor -> 2  ✘
  div(log(1000000), log(10))  -> 5.999999999999999   → floor -> 5  ✘
  log10(1000)                 -> 3                   → floor -> 3  ✔
  ```

  Büyüklük mertebesi bir basamak kayar; ondan türetilen grafik eksen adımı on
  kat yanlış olur. `decimal.js` 10 tabanını doğrudan hesapladığı için `log10`'da
  bu kayma yoktur.

### Belgeler

- **`date` motoru başlığına `period` yönlendirmesi eklendi.** İki modülün
  ayrımı tüketici tarafında görünmüyordu: `date` tarih işlerinin doğal ilk
  durağı olduğu için gün/ay aritmetiğinin komşu modülde olduğu fark edilmiyor
  ve `addDays` / `quarterOf` / `quarterRange` elle yeniden yazılıyordu.
  **`date` sorgular, `period` üretir.**

- **Yeni dosya: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md).** Tüketici
  talepleri ve verilen kararlar artık tek bir kayıtta tutuluyor —
  **reddedilenler gerekçeleriyle birlikte.** Amaç, aynı talebin yeniden
  gönderilmesini önlemek: talep göndermeden önce oraya bakılır. `README.md` ve
  `CHANGELOG.md` bu anlatıyı artık taşımıyor; onlar ne olduğunu anlatır, kayıt
  neden ve kimin isteğiyle olduğunu.

### Test

- 583 → **610 birim testi**. Yeni dosyalar: `date/weekday.test.ts`,
  `math/ceil-log10.test.ts`.
- Mutasyon doğrulaması (AI-RULES §2.3): dört fonksiyonun 6 korumasının 6'sı da
  bozulduğunda kırmızı veriyor; ölü kod yok.
- Gün indeksleri bağımsız bir takvim kitaplığından alındı, bu motorun
  çıktısından değil (AI-RULES §2).
- API yüzeyi kilidi dört ad ile güncellendi (eklemeli → MINOR).

---

## [2.6.0] - 2026-09-01

> Tümü eklemelidir; hiçbir mevcut davranış değişmemiştir.
> Talep kaynağı ve kararlar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md).

### Eklenenler — math

- **`math.irr(cashFlows, guess?)`** — iç verim oranı. Nakit akışını sıfır
  bugünkü değere eşitleyen **dönemsel** oranı bulur.

  **Neden:** Kredinin gerçek maliyeti yalnız faiz değildir. Tüketicinin
  ekranı %0 faizli ama 450 TL masraflı bir kredide **%0,00** gösteriyordu;
  masraf 20.000 TL olsaydı yine %0,00 gösterecekti (gerçek maliyet ≈ %4,3).

  Sözleşme: işaret değişimi yoksa · 2'den az eleman · sonlu olmayan değer ·
  kök kuşatılamazsa · yakınsamazsa → **`null`** (sessiz 0 değil).
  Dönen oran **dönemseldir**; yıllığa çevirmek çağıranın işidir.

  Yöntem ikiye bölmedir (bisection): Newton-Raphson yatık akışlarda `r = -1`
  tekilliğine savrulabilirken bisection kök kuşatıldığında yakınsamayı
  garanti eder. Arama tavanı dönemsel %100.000'dir; ötesi `null` döner.

  ⚠️ Birden çok kök varsa **ilk bulunan** döner (standart yaklaşım). Böyle
  akışlarda IRR anlamlı bir ölçüt değildir; MIRR gerekir, o ayrı bir iştir.

### Eklenenler — money

- **`FormatMoneyOptions.digits`** — yerleşik para biriminin ondalık hane
  sayısını geçersiz kılar; **simge ve kısaltma çekirdekte kalır**.

  Önceden dört haneli TL yazmak isteyen tüketici tanımın tamamını yeniden
  yazmak zorundaydı, yani çekirdeğin sahip olduğu `₺` ve `TL` verilerini
  kopyalıyordu. Bu, tüketicide "görünen TL etiketinin tek sahibi vardır"
  kuralını çiğniyordu.

  Geçerli aralık 0..4 arası tam sayı; dışında `'—'`. `formatMajor`'da alt
  birime çevrim de bu hane sayısıyla yapılır.

  ⚠️ `money.parse` alt birim hanesini 2 kabul eder; `digits` ile üretilen
  dört haneli çıktı `parse` ile geri okunamaz (JPY/KWD ile aynı kapsam sınırı).

> Bu sürümde değerlendirilip **alınmayan** talepler ve gerekçeleri
> [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md) dosyasındadır
> (`npv`, KKDF/BSMV, `pmt`/`amortize`/`dayCount`, ürün sınıflandırma).

### Test

- 552 → **583 birim testi**. Yeni dosyalar: `math/irr.test.ts`,
  `money/digits.test.ts`.
- **Mutasyon doğrulaması (AI-RULES §2.3):** `irr`'in 7 korumasının 7'si de
  bozulduğunda kırmızı veriyor. Bu sırada **dört ölü koruma bulundu ve
  kaldırıldı** (`rate <= -1`, `iskonto.isZero()`, ayrı `length < 2` ve
  `Number.isFinite` kontrolleri, zıt-işaret kontrolü, ipucu erken dönüşü) —
  hepsi tek bir işaret-değişimi kapısı tarafından zaten karşılanıyordu.
  §2.4: kırmızı vermeyen koruma ölü koddur. `math.equals`'ta da aynı karar
  verilmişti.
- **Assert değerleri dış otoriteden:** `irr([1000,-600,-600])` kökü kapalı
  formdan gelir (`3x²+3x-5=0`, `x=(√69-3)/6`); üretim vakası bağımsız bir
  50 basamaklı çözücüyle doğrulandı. Hiçbir beklenen değer kodun çıktısından
  kopyalanmadı.
- API yüzeyi kilidi `math.irr` ile güncellendi (eklemeli → MINOR).

---

## [2.5.0] - 2026-09-01

> **Tümü eklemelidir; hiçbir mevcut davranış değişmemiştir.**
> Talep kaynağı ve kararlar: [`GERI-BILDIRIM-KAYDI.md`](GERI-BILDIRIM-KAYDI.md).

### Düzeltmeler — date (rapor §1, YÜKSEK öncelik)

- **Kesirli saniye artık kabul edilir.** Postgres `timestamptz` alanları
  mikrosaniye taşır; PostgREST bunu JSON'a
  `2026-08-31T06:17:08.317236+00:00` biçiminde yazar. v2.4.0 bu girdiyi
  reddediyordu ve sonuç **sessizdi** — ekranda yalnızca `'—'` beliriyordu.
  Supabase tabanlı her tüketici bu duvara çarpıyordu.
  Kesirli kısım ayrıştırılır ve **atılır**; çekirdek dakika çözünürlüğünde
  biçimlendirir.
- **Çıplak `+HH` saat dilimi eki artık kabul edilir** (`...10:00:00+00`).
  Boşluklu Postgres ayırıcısı (`YYYY-MM-DD HH:MM:SS`) v2.4.0'da zaten
  çalışıyordu; kırılan yalnızca iki haneli offset'ti. Kabul edilen ekler:
  `Z` · `+HH` · `+HHMM` · `+HH:MM`.

### Eklenenler — date (rapor §4)

- **`format` artık `YYYY-MM` girdisini kabul eder** — ama YALNIZ `monthYear` ve
  `period` stillerinde; bu ikisi gün bileşenini zaten kullanmıyor. Aylık
  gruplama yapan ekranların doğal anahtarı budur.
  Gün GÖSTEREN stiller (`short`, `long`, `dayMonth`, `dayMonthWeekday`, `time`,
  `dateTime`) ve gün aritmetiği (`daysBetween`, `dayName`, `relative`) onu
  **kabul etmez** — ayın 1'ini uydurmak sessiz bir hata olurdu.

### Eklenenler — money (rapor §2 ve §3)

- **`money.percent` için `sign` seçeneği** — `PercentSign = 'auto' | 'always' | 'never'`.
  `'never'` hiç işaret yazmaz; yönü **renkle** (yeşil/kırmızı) anlatan finansal
  arayüzler içindir. Onsuz tüketici `percent(abs(v), 1)` yazmak zorunda
  kalıyordu ve o sarmalama unutulunca eksi işareti kırmızı renkle üst üste
  binip çift olumsuzlama gibi okunuyordu. İşaretsizleştirme **yuvarlamadan
  sonra** yapılır: `percent(-0.04, 1, { sign: 'never' })` → `"%0"`, asla `"%-0"`.
  `showPositiveSign` **@deprecated** ama çalışmaya devam eder; `sign`
  verildiğinde yok sayılır.
- **`money.compactMajor(amountMajor, opts?)`** — `compact`'in ana birim ikizi,
  `format` / `formatMajor` çiftiyle simetrik. Tüketici
  `compact(money.toMinor(v) ?? 0, opts)` çevrimini elle yazıyordu; o `?? 0`
  kalıbı geçersiz girdiyi sessizce sıfıra çeviriyordu (ABACUS-SPEC §0.5
  ihlali). `compactMajor` geçersiz girdide `'—'` döner.

### Eklenenler — yayınlanan ESLint yapılandırması (rapor §5, a seçeneği)

- **`@snn/abacus-core/eslint`** — çekirdek artık paylaşılabilir bir ESLint flat
  config yayınlar. Daha önce hiç yoktu: `eslint.config.js` ne `files[]` içinde
  ne de `exports` altındaydı.
  `money.format` ve `money.compact` **alt birim** (kuruş), `formatMajor` ve
  `compactMajor` **ana birim** (lira) okur; aynı sayı iki kapıda **100 kat**
  farklı sonuç verir ve hata sessizdir. Kural bu riski tüketicinin derleme
  hattına bağlar; bilinçli alt birim kullanımı `eslint-disable` ile geçilir.
  Kırıcı yeniden adlandırma (`formatMinor`/`formatMajor`, rapor §5-b) yerine
  seçildi — o MAJOR sürüm ve tüm tüketicilerde göç demektir.
  Yapılandırmanın kendisi testlidir: `eslint-config.test.ts` ESLint'i
  programatik koşturup kuralın gerçekten ne yakaladığını ölçer.

### Belgeler

Rapor haklı olarak şunu söyledi: bir davranış belgede yoksa tüketici onu
bilemez. Boşluklu Postgres biçiminin zaten çalıştığı hiçbir yerde yazmıyordu.

- **`date` motoruna KABUL EDİLEN GİRDİ BİÇİMLERİ tablosu eklendi** — motorun ne
  yediği ilk kez açıkça belgelendi (ayırıcı, saniye, kesirli saniye, saat
  dilimi eki).
- **Bayat belge satırı düzeltildi:** MOTOR-DETAYLARI `format` girişi hâlâ
  v1.1.0'dan kalma "ISO'nun saat kısmı yok sayılır" diyordu; bu satır v2.0.0'dan
  beri yanlıştı ve hemen altındaki örnekle çelişiyordu.
- Alt birim / ana birim ayrımı `formatMajor` girişinde uyarı kutusuna alındı.
- INSTALL.md'ye Supabase damgaları, `YYYY-MM` anahtarı, birim ayrımı ve yüzde
  işaret modu için çalışan örnekler eklendi; §6 yayınlanan yapılandırmayla
  başlayacak şekilde ikiye ayrıldı.
- Yeni bölüm: **Yayınlanan ESLint yapılandırması** (MOTOR-DETAYLARI).
- Eklenen belge örneklerinin tamamı `docs-claims.test.ts` ile çivilendi.

### Test

- 473 → **552 birim testi**. Yeni dosyalar: `date/timestamp.test.ts`,
  `money/compact-major.test.ts`, `eslint-config.test.ts`.
- API yüzeyi kilidi `money.compactMajor` ile güncellendi (eklemeli → minor).

---

## [2.4.0] - 2026-08-30

> Tümü eklemelidir; hiçbir mevcut davranış değişmemiştir.
> Dördü de SNN-Gunum-Var denetiminde elle yazılmış hâlde bulundu ve
> yerleştirme kuralı (AI-RULES §4.1) gereği genel oldukları için alındı.

### Eklenenler — math

- **`math.equals(a, b, tolerance = 0)`** — toleranslı eşitlik, sınır dâhil (`<=`).
  Float karşılaştırmasında `a === b` yanıltıcıdır (`0.1 + 0.2 !== 0.3`).
  Sonlu olmayan girdi ve negatif tolerans `false` üretir; bunun için ayrı koruma
  YOKTUR — `abs()` negatif olmaz, `NaN <= x` zaten false. Mutasyon testi ayrı
  korumanın ölü kod olduğunu gösterdi ve kaldırıldı.
- **`math.percentChange(current, previous)`** — iki ölçüm arasındaki değişim
  yüzdesi. `percent(pay, payda)` ile karıştırılmamalı.
  **`previous <= 0` → `null`** (`percent` ile aynı kural). Sahadaki yerel sürüm
  burada sessizce `0` dönüyordu ve "değişim yok" ile "hesaplanamadı" karışıyordu.

### Eklenenler — date

- **`date.isBefore` / `isAfter` / `isSameDay`** — GÜN düzeyinde karşılaştırma.
  Saat yok sayılır; Europe/Istanbul çevrimi sonrası gün esas alınır.
  **Geçersiz girdide `null`**, `false` değil: "hayır" ile "karşılaştıramadım"
  ayrılır. `period.isBetween`'in eksik çiftini tamamlar.
- **`date.relative`'e `style` parametresi** — `'natural'` yakın geleceği gün
  adıyla söyler: 2-6 gün → `"Perşembe günü"`, 7-13 gün → `"haftaya Perşembe"`,
  14+ → sayıya döner. Varsayılan `'plain'` davranışı değişmedi.
  ⚠️ Yalnız GELECEĞİ zenginleştirir; geçmiş sayısal kalır — "geçen Perşembe"
  belirsiz olduğu için çekirdek tahmin etmez (bilinçli kapsam sınırı).

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
