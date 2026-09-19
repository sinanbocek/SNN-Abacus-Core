# Geri Bildirim Kaydı

> **TALEP GÖNDERMEDEN ÖNCE BU DOSYAYA BAKIN.**
>
> Buradaki her satır, bir tüketici projeden gelmiş bir talebin ve o talebe
> verilmiş kararın kaydıdır. Aradığınız şey **REDDEDİLDİ** olarak burada
> duruyorsa, gerekçesini okuyun: aynı talebi yeniden göndermeniz gerekmez.
> Gerekçeyi değiştiren **yeni bir olgu** varsa (ikinci bir tüketici, ikinci bir
> ekran, değişmiş bir kısıt) o olguyu göstererek yeniden başvurabilirsiniz.

Bu dosya, geri bildirim ve alınan aksiyonların **tek kaydıdır**. `README.md`,
`CHANGELOG.md` ve motor belgeleri bu anlatıyı taşımaz; onlar ne olduğunu
anlatır, bu dosya **neden ve kimin isteğiyle** olduğunu anlatır.

- **Ne değiştiğini** öğrenmek için: [`CHANGELOG.md`](CHANGELOG.md)
- **Nasıl kullanılacağını** öğrenmek için: [`INSTALL.md`](INSTALL.md) ·
  [`SNN-ABACUS-CORE-MOTOR-DETAYLARI.md`](SNN-ABACUS-CORE-MOTOR-DETAYLARI.md)
- **Bir şeyin neden alınmadığını** öğrenmek için: **bu dosya**

---

## Talep nasıl gönderilir

Kabul edilen taleplerin ortak özelliği şu dördüydü. Bunlar olmadan gelen
talepler değerlendirilemiyor:

1. **Gerçek bir ekranda karşılaşılmış ihtiyaç.** Varsayımsal genellik yeterli
   değildir (`AI-RULES §4.1` Kural 3: emin değilsen çekirdeğe alma).
2. **`AI-RULES §4.1` yerleştirme sınavı yazılı olarak uygulanmış.**
   *"Başka bir şirketin, başka bir alandaki uygulaması bu fonksiyonu aynen
   kullanabilir miydi?"* — Hayır ise talep edilmez.
3. **Ölçülmüş çıktı.** İddia değil, çalıştırılmış kod çıktısı.
4. **Değerlendirilmiş alternatif.** Neden tüketicide kalamıyor?

Talebin **elenerek** geldiğini göstermek (kaç aday bakıldı, kaçı geçti,
elenenler neden elendi) değerlendirme maliyetini ciddi biçimde düşürüyor.

### Beşinci şart: `AI-RULES §4.1` sınavı yazılı olarak doldurulur

Yukarıdaki 2. şart bu depoda **ayrı ve zorunlu bir alandır**, çünkü çekirdeğe giren her şey
tüm tüketici projelere girer ve geri çıkarmak kırıcı sürüm gerektirir (`AI-RULES §4.1`
Sınır durumu 3). Sınav tablosu boş bırakılmış talep değerlendirilmez:

| Aday iş | İmzası | Başka alandaki uygulama aynen kullanır mıydı? | Karar |
|---|---|---|---|

**Elenen adaylar da yazılır.** Ayıraç `AI-RULES §4.1`'dedir ve değiştirilmeden uygulanır.

### Yolu

Talep **issue** ile gelir; çekirdeğe doğrudan kod yazılmaz.

- **Form:** [`.github/ISSUE_TEMPLATE/abacus-talep.yml`](.github/ISSUE_TEMPLATE/abacus-talep.yml)
  — "Çekirdeğe talep". Beş şartın hepsi zorunlu alandır.
- **Beceri:** `abacus-talep`. Tüketici projedeki ajan bu formu sizin için doldurur: önce bu
  defteri okur (reddedilmiş talebi tekrarlamamak için), türü seçer, beş şartı toplar, §4.1
  sınavını yazılı uygular, taslağı **size gösterip onay ister**, onay gelince issue'yu açar.
  Kaynağı: [`skills/abacus-talep/SKILL.md`](skills/abacus-talep/SKILL.md).
- **Elle:** `gh issue create -R sinanbocek/SNN-Abacus-Core --label talep ...`

**Kabul edilen talep kendiliğinden inmez.** Çekirdekte yeni bir sürüm çıkar, etiketlenir ve
tüketicilere bir **güncelleme PR'ı** olarak gelir; o PR'ı her tüketici kendi inceleyip
birleştirir. Sabit etikete bağlı tüketicilere (`#vX.Y.Z`) hiç gelmez, elle yükseltilir.

---

## Durum tablosu

| # | Talep | Kaynak | Karar | Sürüm |
|---|---|---|---|---|
| 1 | Tarih ayrıştırıcı kesirli saniye kabul etsin | Rapor #1 §1 | ✅ Kabul | 2.5.0 |
| 2 | `money.percent` işaretsiz çıktı (`sign: 'never'`) | Rapor #1 §2 | ✅ Kabul | 2.5.0 |
| 3 | `money.compactMajor` | Rapor #1 §3 | ✅ Kabul | 2.5.0 |
| 4 | `date.format` `YYYY-MM` kabul etsin | Rapor #1 §4 | ✅ Kabul | 2.5.0 |
| 5a | `format`/`formatMajor` için lint kuralı | Rapor #1 §5a | ✅ Kabul | 2.5.0 |
| 5b | `format` → `formatMinor` yeniden adlandırma | Rapor #1 §5b | ❌ **Red** | — |
| 6 | `FormatMoneyOptions.digits` | Rapor #1 §6 | ✅ Kabul | 2.6.0 |
| 7 | `math.irr` | Rapor #2 §1 | ✅ Kabul | 2.6.0 |
| 8 | `math.npv` dışa açılsın | Rapor #2 §1 (ek not) | ❌ **Red** | — |
| 9 | `pmt` / `amortize` / `dayCount` | Rapor #2 §2 K1 | ❌ **Red** | — |
| 10 | KKDF/BSMV vergi mekaniği | Rapor #2 §2 K2 | ❌ **Red** | — |
| 11 | Ürün/sınıflandırma (kredi türü, vade, erken kapama) | Rapor #2 §2 K3 | ❌ **Red** | — |
| 12 | `date.weekday` + `date.isWeekend` | Rapor #3 §1 | ✅ Kabul | 2.7.0 |
| 13 | `math.ceil` | Rapor #3 §2 | ✅ Kabul | 2.7.0 |
| 14 | `math.log10` | Rapor #3 §3 | ✅ Kabul | 2.7.0 |
| 15 | `date` → `period` yönlendirme notu | Rapor #3 (belge) | ✅ Kabul | 2.7.0 |
| 16 | Türkiye tescil plakası normalizasyonu (`text.plate`) | Talep #4 | ✅ Kabul | 2.8.0 |
| 17 | `34 YK` yeni kayıt teamülü geçerli sayılsın | Talep #4 | ⚠️ **Kabul — sahip kararıyla istisna** | 2.8.0 |
| 18 | `34CD3455` reddedilsin | Talep #4 | ❌ **Red** | — |
| 19 | Q, W, X harfleri reddedilsin | Talep #4 | ✅ Kabul (sahip kararı) | 2.8.0 |
| 22 | Büyük `İ` de `I`'ya çevrilsin (Caps Lock) | Tasarım sırasında | ✅ Kabul (sahip kararı) | 2.8.0 |
| 23 | Negatif yüzde okunur yazılsın (`-%4,3`) ve sabit ondalık (`%4,30`) | Sahip | ✅ Kabul — **seçenek olarak** | 2.9.0 |
| 24 | `money.percent` varsayılanı `-%4,3` olsun | Sahip | ✅ Kabul — **kırıcı** | 3.0.0 |
| 25 | Yüzde işareti sağa yazılsın (`-4,30%`) | Sahip | ❌ **Red** | — |
| 26 | `text.suffix` negatif/ondalıklı sayıda doğru ek ve virgül | 3.0.0 hazırlığı (ölçüm) | ✅ Kabul — **kırıcı düzeltme** | 3.0.0 |
| 27 | Geçersiz hane sayısında çökme yerine `'—'` | v2.9.0 mutasyon testi (ölçüm) | ✅ Kabul — **kırıcı düzeltme** | 3.0.0 |
| 20 | Plaka türü sınıflandırması (resmî/diplomatik/yabancı/geçici) | Tasarım sırasında | ❌ **Red** | — |
| 21 | Başta `TR` önekine tolerans | Tasarım sırasında | ❌ **Red** (sahip kararı) | — |
| 28 | `math.allocate` (havuz dağıtımı, tam aritmetik) | Talep #5 A + Ek #1 | ✅ Kabul | 3.1.0 |
| 29 | `math.npv` dışa açılsın (madde 8 yeniden başvurusu) | Talep #5 B | ❌ **Red** (ertelendi) | — |
| 30 | `unit` motoruna `volume` kategorisi | Talep #5 C | ❌ **Red** (ertelendi) | — |
| 31 | `allocate` eşitlikte büyük ağırlık öncelikli | Ek #1 §3 | ❌ **Red** — yerine tam aritmetik | — |
| 32 | `date.relativeTime` — dakika/saat çözünürlüklü göreli süre | Talep #6 (trade-kasa TB-009 notu + tarama) | ✅ Kabul (yazım politikası sahip kararıyla) | 3.2.0 |
| 33A | `text.toAsciiUpper` — `toAsciiLower` ikizi | Talep #7 A | ✅ Kabul | 3.3.0 |
| 33B | `text.digits(raw, maxLength?)` — giriş süzme | Talep #7 B | ✅ Kabul (`input` motoru değil, `text`) | 3.3.0 |
| 33C | `input.groupedAmount` | Talep #7 C | ❌ **Red** — `money.formatGroupedInput` zaten var | — |
| 33D | `input.amountToNumber` | Talep #7 D | ❌ **Red** — `money.parseNumber` zaten var | — |
| 33E | `input.code` (ASCII kod süzme) | Talep #7 E | ❌ **Red** (ertelendi) — tek ekran | — |
| 33F | Ham `Intl`/`toLocaleString`/`toFixed`/`toUpperCase`/`toLowerCase` lint kuralı | Talep #7 F | ✅ Kabul — **hata**, kaçış kapısı açık | 3.3.0 |
| 34A | `text.properNounSuffix` — özel ada hâl eki | Talep #8 (issue #23) | ✅ Kabul | 3.5.0 |
| 34B | Uzun hâl adları (`locative`, `ablative`…) | Talep #8 | ❌ **Red** — mevcut `SuffixCase` sözlüğü (`loc`/`abl`/…) kullanılır |  |
| 34C | `locativeAdjective` (`VakıfBank'taki`) | Talep #8 (ertelenmiş aday) | ❌ **Red** (ertelendi) — tek ekran, madde 33E emsali | — |
| 34D | İyelik tespiti genel desenle (`/(sı\|si\|su\|sü)$/`) | Talep #8'in getirdiği uygulama | ❌ **Red** — yer adlarını iyelik sanıyor; kurum sonu listesi kullanıldı | — |
| 34E | Sessiz sayısal varsayılan kapısı pakete girsin | TB-005 (iç denetim) | ✅ Kabul | 3.4.0 |
| 35 | Kapı `configs.recommended`'a minor sürümde eklenmesin | v3.5.0 yayılım ölçümü | ✅ Kabul — **geri alma**; kapı `strict`e taşındı | 3.5.1 |

---

## REDDEDİLENLER — gerekçeleriyle

Bu bölüm dosyanın asıl sebebidir. Bir talebi yeniden göndermeden önce burayı
okuyun.

### 5b · `format` → `formatMinor` yeniden adlandırma

**Karar: red — yerine lint kuralı yayınlandı (5a).**

Sorun gerçekti: `format` alt birim (kuruş), `formatMajor` ana birim (lira) okur;
aynı sayı iki kapıda 100 kat farklı sonuç verir ve hata sessizdir. Ama çözüm
olarak yeniden adlandırma MAJOR sürüm ve **tüm tüketicilerde göç** demekti.

Bunun yerine çekirdek `@snn/abacus-core/eslint` altında bir kural yayınladı:
göç maliyeti sıfır, koruma daha geniş (`money.compact` kapısını da kapsıyor).

**Yeniden başvuru koşulu:** Lint kuralının yakalayamadığı gerçek bir hata
sahada oluşursa (kural **ada** bakar, **tipe** değil — `const f = money.format`
gibi dolaylı çağrıları yakalamaz). O zaman MAJOR sürüm planı açılabilir.

### 8 · `math.npv` dışa açılsın

**Karar: red — gerçek ekran ihtiyacı yok.**

`math.irr` içeride NPV hesaplıyor, yani kod zaten var. Buna rağmen dışa
açılmadı: talebi gönderen tüketici de `AI-RULES §4.1` Kural 3 gereği bunu
**açıkça talep etmemişti** ("gerçek bir ekranda ihtiyaç duymadan istemek çöplük
riskidir"). Kolaylık olsun diye kendi kuralımızı esnetmedik.

**Yeniden başvuru koşulu:** İskonto edilmiş değer hesabı gerektiren gerçek bir
ekran. O geldiğinde bu **tek satırlık bir MINOR sürümdür**; §4.1 sınavını yazıp
gönderin, hızlı çıkar.

### 9 · `pmt` / `amortize` / `dayCount`

**Karar: red — sınavı geçiyorlar ama tek tüketici var.**

Bu fonksiyonlar `AI-RULES §4.1` sınavını **geçiyor**: yalnız sayı ve dönem
biliyorlar, adlarında kredi geçmiyor. Talebi gönderen tüketici de bunu görmüş
ama Kural 3 gereği kendisi elemişti; katıldık.

Ek gerekçe — asıl belirleyici olan bu: annüite planında **artık kuruşun** son
taksite mi ilk taksite mi bindirileceği bir **TERCİHTİR**, tek doğrusu yoktur.
Tek tüketiciyle o politikayı çekirdeğe çivilersek, ikinci tüketici farklı bir
politika istediğinde onu **kırıcı sürümle** değiştirmek zorunda kalırız.

**Yeniden başvuru koşulu:** İkinci bir tüketici projede veya ikinci bir ekranda
aynı ihtiyaç doğarsa. O zaman yuvarlama politikasını **birlikte kararlaştırıp**
tek seferde alalım.

### 28 · `math.allocate` — KABUL (kayıt için)

**Karar: şartlı kabul, şartlar karşılandı — 3.1.0.**

Kural 1 dayanağı zayıftı: tüketici projenin kodu henüz yok. Kabulü taşıyan şeyler şunlar
oldu: gerçek bir müşterinin gerçek Excel dosyası, ölçülmüş sapma (%55,0 / %77,2) ve
fonksiyonun alandan tamamen bağımsız olması (kargo, kira, aidat, hesap bölme). Madde 9'un
"artık kuruş bir tercihtir" itirazı, politikanın **zorunlu parametre** yapılmasıyla
karşılandı; şimdilik tek politika var, ikincisi MINOR olarak eklenir.

Dört şart konuldu ve karşılandı: sorunu gösteren örnek · yanlış monotonluk iddiasının
(§2.7) geri çekilmesi · bağımsız fixture ve tarama kodu · değişmez ve mutasyon testleri.

### 29 · `math.npv` dışa açılsın — yeniden başvuru

**Karar: red — madde 8'in koşulu henüz karşılanmadı.**

Finansman ekranı tasarlanmış ama kodlanmamış; ölçülmüş çıktı yok. Talep bunu kendisi
yazdı. Kod hazır olduğu için reddin maliyeti düşük.

**Yeniden başvuru koşulu:** Finansman ekranı prototipi çalışır hâlde olsun ve çok tarihli
bir akışta basit faiz ile iskonto edilmiş değer arasındaki fark ölçülmüş olsun. Önerilen
imza (`npv(rate, cashflows)`, `cashflows[0]` iskonto edilmez) ve `irr` ile çapraz test
şimdiden kabul edilmiş sayılır — tek satırlık MINOR.

### 30 · `unit` motoruna `volume`

**Karar: red — sınavı geçiyor, ihtiyaç ölçülmedi.**

Hacim birimleri SI ve sabittir; §4.1 sorunu yok. Ama talep ihtiyacı "çok alanlı olma
hedefinden" türetti, sahadan ölçmedi.

**Yeniden başvuru koşulu:** Hacim sürücüsüyle dağıtım yapan gerçek bir sepette birden çok
hacim biriminin geldiğinin gösterilmesi. Önerilen tablo (`ml` tabanı; `cm3`, `l`, `dm3`,
`m3`, `mm3`) ve İngiliz/ABD birimlerinin kapsam dışı tutulması kabul edilmiş sayılır.

### 31 · `allocate` eşitlikte büyük ağırlık öncelikli

**Karar: red — teşhis doğru, çare yetersiz; yerine tam aritmetik.**

Tüketici, düşük hassasiyette iki yakın ağırlığın kalanlarının beraberliğe çöktüğünü ve
monotonluğun kırıldığını gösterdi (12 basamakta ölçüldü). Ama sorun beraberlikten
büyüktü: 20 basamaklı bölme ~10^15 havuzlarda artığı **beraberlik olmadan** yanlış kaleme
veriyordu. Ağırlık anahtarı bunu düzeltmez. Tam aritmetikte ise beraberlik yalnız eşit
ağırlıkta oluşur, anahtar hiç devreye girmez ve hiçbir mutasyon onu sınayamaz — sınanamayan
kod eklenmedi.

**Yeniden başvuru koşulu:** Yok; tam aritmetik sözleşmeye girdi.

### 32 · `date.relativeTime` — KABUL

**Karar: kabul — yazım politikası sahip kararıyla belirlendi (2026-09-15); 3.2.0 MINOR.**

**Nasıl geldi.** trade-kasa, Hero'daki kur yaşı etiketini application katmanına taşırken
(`c830a4b`, TB-009) şu notu düştü: *"`date.relative` yalnız gün çözünürlüğündedir;
dakika/saat desteği çekirdeğe eklenene kadar burada tutulur."* Resmî talep açılmadı;
not üzerine çekirdek tarafı tüketicileri taradı.

**Dört şart:**

1. **Gerçek ekran.** trade-kasa Hero (kur yaşı), GHS-Panel ve Gunum-Var listeleri.
2. **§4.1 sınavı.** Süreyi Türkçe metne çevirmek alan bilmez; kur, bildirim, yorum,
   senkron zamanı — başka şirketin başka alanı aynen kullanır. **Geçer.**
3. **Ölçüm.** 3 tüketicide 4 bağımsız kopya bulundu, hepsi farklı yazıyor:

   | Yer | Yazım | Sapma |
   |---|---|---|
   | trade-kasa `application/settings/rateAge.ts` | `az önce` · `5 dk önce` · `3 saat önce` | saf, `now` parametre |
   | GHS-Panel `src/utils/dateUtils.ts` | `Az önce` · `5 dk önce` · `3 sa önce` | 7 gün sonra `toLocaleDateString`; `Math.floor` |
   | Gunum-Var `src/utils/dateUtils.ts` `timeAgo` | `5 dakika önce` · `ay` · `yıl` | `new Date()` içeride, test edilemez |
   | Gunum-Var `src/utils/abacus/date.ts` | `Intl.RelativeTimeFormat` | geleceğe "az önce" der |

   Aynı kullanıcı üç uygulamada aynı bilgiyi üç yazımla görüyor; iki kopya §4 kırmızı
   çizgilerini (`Math.*`, `Intl`/`toLocale*`) ihlal ediyor.
4. **Alternatif.** Tüketicide kalması madde 9'un tersine yol açıyor: ikinci ve üçüncü
   tüketici **zaten** var ve **zaten** farklı politika seçmişler. Kalırsa ayrışma büyür.

**Madde 9 itirazı ("yazım bir tercihtir") nasıl karşılandı.** Politika tek tüketiciye
göre çivilenmedi; dört kopya yan yana konup sahip kararıyla belirlendi:

| Karar | Seçilen | Elenen |
|---|---|---|
| Kısaltma | `style: 'long' \| 'short'`, varsayılan `'long'` | yalnız tam / yalnız kısa |
| 1 dakikadan kısa | `az önce`, **küçük harf** (`date.relative` ile tutarlı; büyütme tüketicide `text.upper`) | `Az önce`, `şimdi` |
| 24 saat ve üstü | **`date.relative`'e devredilir** (`dün`, `3 gün önce`) — iki fonksiyon asla çelişmez | `ay`/`yıl` birimleri (ay uzunluğu yeni tercih doğurur), N gün sonra tarihe dönüş (eşik tüketicinin işi) |
| Gelecek | `5 dk sonra` / `3 saat sonra` (simetrik) | `az önce`ye kırpma (bozuk saati gizler), `'—'` (planlı olayı öldürür) |

**Sözleşme (taslak):**

```ts
date.relativeTime(fromMs: number, nowMs: number, opts?: { style?: 'long' | 'short' }): string
```

| Fark | `long` | `short` |
|---|---|---|
| geçersiz girdi (NaN, Infinity, tam sayı değil) | `—` | `—` |
| < 1 dk (iki yön) | `az önce` | `az önce` |
| 1–59 dk | `5 dakika önce` / `sonra` | `5 dk önce` / `sonra` |
| 1–23 sa | `3 saat önce` / `sonra` | `3 sa önce` / `sonra` |
| ≥ 24 sa | `date.relative(İstanbul günü)` | aynı |

Aşağı yuvarlama tam sayı aritmetiğiyle; `now` zorunlu (saf fonksiyon).

**Bilinen ve kabul edilen sıçrama.** 24 saat eşiğinde takvim gününe geçildiği için
`23 saat önce`'den sonra `dün` atlanıp `2 gün önce` görülebilir (ör. şimdi 01:00, kaynak iki
gün önce 19:00 = 30 saat). Tutarlılık pürüzsüzlüğe tercih edildi.

Geçersiz girdi yalnız güvenli tam sayı olmayan değerdir (NaN, Infinity, ondalıklı). `0` ve
negatif damgalar **geçerlidir** (sahip kararı): çekirdek sıfıra "henüz yok" anlamı yüklemez;
o ayrımı tüketici `null` ile yapar. İstanbul günü 0001–9999 yılları dışına düşerse `'—'`.

**Tüketici etkisi.** trade-kasa: `short` ile karşılanır, **bir farkla** — bugün `5 dk önce`
ile `3 saat önce`yi karışık yazıyor; `short` saatte `3 sa önce` der (ilk değerlendirmede
"tam karşılanır" yazılmıştı, uygulama sırasında düzeltildi). Ayrıca `fetchedAt` `null`/`0`
için `'—'` kontrolünü kendisi korumalı. GHS-Panel: `short`; 7 gün
sonrası tarih isterse kendisi `date.format` ile yapar. Gunum-Var: `ay`/`yıl` kaybolur
(`92 gün önce`) — **itiraz gelirse yeniden görüşülecek tek nokta budur.**

### 33 · Giriş süzme katmanı — KABUL (A, B, F) · RED (C, D, E)

**Karar: 3.3.0 MINOR. Talebin altı maddesinden üçü alındı, ikisi zaten vardı, biri ertelendi.**
Belirsiz kalan tek nokta (lint sertliği) sahip tarafından çekirdeğe bırakıldı (2026-09-18).

**Şart 1 (ekran) karşılandı, madde 9 itirazı düşüyor:** GHS-Panel araç formu (2026-09-17,
finansal alana `121212scca` girilebiliyordu) ve SNN-İhale gün kutusu (2026-09-16, `3asa`).
İki proje, iki ayrı gün, birbirinden habersiz iki ayrı çözüm.

#### C ve D — RED: karşılıkları çekirdekte zaten var

Talebin kendi örnekleri, mevcut fonksiyonlarla çalıştırıldı (2026-09-18, v3.2.0):

```
money.formatGroupedInput('121212scca') => "121.212"    (istenen groupedAmount ile aynı)
money.formatGroupedInput('1250000')    => "1.250.000"
money.formatGroupedInput('000')        => "0"
money.formatGroupedInput('')           => ""
money.parseNumber('1.250.000')         => 1250000      (istenen amountToNumber ile aynı)
money.parseNumber('abc')               => null
```

Tek fark: `formatGroupedInput` virgülü de kabul eder (serbest ondalık kutu). Tam sayı kutusu
isteyen tüketici ya sonucu `parseNumber` ile okuyup yeniden biçimler ya da virgülü kendi
tarafında engeller. Yeni ad açmak aynı işin iki kapısı demekti.

**Asıl teşhis eksik fonksiyon değil, BULUNAMAMA.** Talebin kendi kanıtı bunu gösteriyor:
`SNN-Portfoy-Yonetimi/src/NewApp/components/FormattedInput.tsx` giriş kutusunu
`Intl.NumberFormat` ile kuruyor. Çare madde 15 emsali: kılavuza yönlendirme (eklendi) +
madde F'deki lint kuralı (Intl ve toLocaleString artık hata).

#### A — KABUL: ölçülmüş boşluk

`text.upper('irmaksasi')` -> `'İRMAKSASİ'` (doğrulandı). Şasi/motor numarası gibi ASCII kod
alanlarında kodu bozar. `toAsciiLower` vardı, büyütme ikizi yoktu; tüketici ya yanlış harf
üretmek ya da ham `toUpperCase` ile §4.3'ü çiğnemek zorundaydı. `toAsciiUpper` yalnız a-z
aralığına dokunur — `toAsciiLower` ile aynı bilinçli sınır (Türkçe harf değişmez).

#### B — KABUL, ama yeni motor DEĞİL

`input` motoru açılmadı: B metin->metin işidir, `text`e girer; C ve D zaten `money`dedir.
İmza `text.digits(raw, maxLength?)`. Geçersiz `maxLength` (negatif, ondalıklı, güvenli tam
sayı dışı) `'—'` döner (madde 27 emsali). `gecerliHane` KULLANILMADI: oradaki 20 sınırı
ondalık hane içindir, alan uzunluğu için değil.

#### E — RED (ertelendi)

§4.1 sınavını geçiyor ama tek ekrandan (GHS şasi alanı) geliyor — madde 30 emsali.
A geldikten sonra tüketicide tek satırdır. **Yeniden başvuru koşulu:** ikinci bir tüketicide
ASCII kod alanı. O geldiğinde imza `text.code(raw, maxLength)` olarak kabul edilmiş sayılır.

#### F — KABUL: hata seviyesi, kaçış kapısı açık

Kapılar: `toLocaleString`, `toFixed`, `toUpperCase`, `toLowerCase` (no-restricted-properties)
ve `Intl.*` (no-restricted-syntax). Uyarı değil **hata** seçildi: uyarılar birikip görünmez
olur, oysa ham `toUpperCase` bugün SESSİZCE yanlış harf üretiyor. Kod alanında bilinçli
kullanım `eslint-disable-next-line` ile geçer ve o satır "burada ASCII isteniyor" diye belge
bırakır; v3.3.0'dan sonra o satır bile gerekmez (`toAsciiUpper`). Madde 5a emsali; kural yine
ADA bakar, TİPE değil.

#### Ölçüm uyuşmazlığı (kayda geçirilir)

Talep 6 projede **129 geçiş / 41 dosya** dedi. Çekirdek tarafının bağımsız ölçümü
(2026-09-18, rakam süzme kalıpları, `src` altı): **63 geçiş / 45 dosya** — üstelik bunun bir
kısmı `GHS-Panel-bes-test` ve `GHS-Panel-borc-bes` kopya depolarından geliyor; kopyalar
çıkarılınca ~**43 geçiş / 27 dosya**. SNN-Yonetici-Ozeti için iddia edilen 59 geçiş
bulunamadı (o projede rakam süzme kalıbı yok; `toUpperCase` + `Intl` dahil toplam 8 geçiş).
**Kararı değiştirmedi** — tekrar her hâlükârda gerçek ve yaygın. Talep sahibine not: sayım
kopya depoları ve `dist/` çıktılarını dışarıda bırakmalı.

Ayrıca değerlendirme sırasında `toAsciiLower`'ın büyük `İ` harfini dönüştürmemesi önce kusur
sanıldı; kod okununca bunun belgelenmiş bilinçli sınır olduğu görüldü (yalnız A-Z).
`toAsciiUpper` aynı sınırla yazıldı.

### 10 · KKDF/BSMV vergi mekaniği

**Karar: red — sabit değil, `gold.PURITY` emsali tutmuyor.**

Talep, çekirdeğin zaten Türkiye farkında olduğunu (`validate.tckn`,
`text.toTrLower`, `gold.PURITY`, `collate`) haklı olarak gösteriyordu. Ama o
örnekler çekirdekte **Türk oldukları için değil, SABİT oldukları için**
duruyor — `AI-RULES §4.1` Kural 2'nin ölçütü budur. Darphane saflığı her
uygulamada aynı sayıdır ve hiçbir mevzuat onu değiştirmez.

KKDF/BSMV oranları öyle değil; talebin kendisi de "oranlar mevzuatla değişir,
parametre olmalı" diyordu. Oranı parametreye çevirdiğinizde geriye
`taxedInterest(rawInterest, rates)` kalıyor — bu bir alan algoritması değil,
`math`'in zaten sunduğu çarpma ve toplama. Çekirdeğe girecek bir çekirdek
kalmıyor; geriye yalnızca **alan kavramı taşıyan bir ad** kalıyor.

> **Kural olarak:** sabit olan çekirdeğe girer, Türk olan değil.
> Türklük tesadüfi, sabitlik nitelik.

**Yeniden başvuru koşulu:** Yok denecek kadar dar. Formülün kendisi mevzuattan
bağımsız, evrensel ve **sabit** bir hesaba dönüşürse.

### 11 · Ürün ve sınıflandırma

**Karar: red — §4.1'e doğrudan takılıyor. Tartışma yok.**

Bireysel/ticari ayrımı, kredi türleri, konut kredisinde KKDF muafiyeti,
kısa/uzun vade ayrımı, rotatif dönem faizi, erken kapama cezası.

Hepsi "bireysel", "konut", "vade" gibi **alan kavramları** taşıyor. Talebi
gönderen tüketici bunları zaten kendisi elemişti.

**Yeniden başvuru koşulu:** Yok.

### 17 · `34 YK` yeni kayıt teamülü — İSTİSNA

**Karar: kabul — ama bu bir §4.1 istisnasıdır, emsal DEĞİLDİR.**

`YK` (Yeni Kayıt) resmî bir plaka değildir. Sigorta sektöründe, tescili henüz
yapılmamış sıfır araçlara kasko/trafik poliçesi kesilirken plaka alanına yazılan,
**yazılı olmayan** bir teamüldür: il kodu + `YK`, arkasında rakam yoktur.

Çekirdek geliştirme önerisi **isteğe bağlı kabul**dü (varsayılan red, tüketici açarsa
kabul): §4.1 sınavında başka sigortacılar bu kuralı aynen kullanır, ama bir otopark
veya belediye uygulaması `34 YK`'yı geçerli plaka saymamalıdır. **Çekirdek sahibi her
zaman kabul edilmesine karar verdi.** Zarar azaltmak için sonuç `yeniKayit: true`
bayrağıyla işaretlenir; tüketiciler plakası çıkmış araçla yeni kaydı metinden değil
bu bayraktan ayırt eder.

**Bu maddeyi emsal göstererek başka bir resmî olmayan sektör teamülü talep
etmeyin.** İstisna kararı bu teamüle özeldir.

### 18 · `34CD3455` reddedilsin

**Karar: red — biçim geçerli.**

Talep, bu girdinin reddedilmesi gerektiğini söylüyordu; talep sahibi de emin
değildi. 2 harf + 4 rakam fiilen kullanılan bir biçimdir ve `CD` diplomatik
seridir. Tüketici özel serileri kabul ettiği için reddetmek için bir gerekçe yoktur.
Sonuç: `34 CD 3455`, `valid: true`.

**Yeniden başvuru koşulu:** 2 harf + 4 rakam biçiminin kullanılmadığını gösteren
yetkili bir liste (İçişleri Bakanlığı / Türkiye Noterler Birliği).

### 20 · Plaka türü sınıflandırması

**Karar: red — metin türü belirleyemez.**

Özel seriler (makam, diplomatik, yabancı, geçici, gümrük) standart biçimlerin içine
düşer. Ama plaka metni türü tek başına belirleyemez: örneğin tek harf + 4 rakam hem
geçici bir plaka hem sıradan bir plaka olabilir; ayrım plakanın renginde ve
belgesindedir. Metinden tür çıkaran bir fonksiyon **yanlış bilgi verir**. Ayrıca bu
serileri tanımlayan eski yönetmelik maddesi (KTY Madde 55) yürürlükten kaldırılmıştır.
Talep sahibi de özel serilerin tamamını kabul ettiği için tür ayrımına ihtiyacı yoktur.

**Yeniden başvuru koşulu:** Türün metinden güvenilir biçimde belirlenebildiğini
gösteren güncel yetkili bir kaynak **ve** tür ayrımı gerektiren gerçek bir ekran.

### 21 · `TR` önekine tolerans

**Karar: red — sahip kararı.**

`TR 34 ABC 23` geçersizdir. Kabul edilen toleranslar: boşluk/nokta/tire ayraçları,
küçük harf, tek haneli il kodu.

**Yeniden başvuru koşulu:** Sahada `TR` önekli girdilerin gerçekten geldiğini gösteren
ölçüm (ör. plaka tanıma sistemi çıktısı).

### 24 · `money.percent` varsayılanı `-%4,3` olsun — 3.0.0'DA YAPILDI

**Karar: v2.9.0'da ertelendi, sahip kararıyla 3.0.0'da yapıldı.** Göç: [`MIGRATION-v3.md`](MIGRATION-v3.md).

Aşağıdaki gerekçe erteleme kararının kaydıdır:

Doğru yazım `-%4,3` (Unicode CLDR `tr-TR`). Ama varsayılanı değiştirmek tüketicinin
gördüğü çıktıyı değiştirir: `^2.x` ile bağlı herkese otomatik iner ve örneğin çıktıda
`%-` arayan bir test sessizce bozulur. AI-RULES §4.0 gereği bu MAJOR'dur. v2.9.0'da
`signPosition: 'leading'` seçeneği eklendi; **3.0.0'da varsayılan `'leading'` olacak**
ve göç belgesine yazılacak.

### 25 · Yüzde işareti sağa yazılsın (`-4,30%`)

**Karar: red — Türkçe yazım kuralına aykırı.**

TDK Yazım Kılavuzu yüzde ve binde işaretini sayıdan önce, boşluksuz ister (`%25`,
`‰50`). `4,30%` İngilizce (`en-US`) yazımdır. Talebin asıl gerekçesi olan okunabilirlik
sorunu işaretin **solda** olmasından değil, eksinin iki sembol **arasında** kalmasından
kaynaklanıyordu; bu, `signPosition: 'leading'` ile çözüldü (madde 23).

**Yeniden başvuru koşulu:** TDK kuralının değişmesi veya çekirdeğin Türkçe dışında bir
okuyucu dilini desteklemeye başlaması (bkz. `internal/currency-registry` — ayraçlar ve
simge konumu okuyucunun diline bağlıdır ve şu an kapsam dışıdır).

### 26 · `text.suffix` negatif ve ondalıklı sayılar — 3.0.0'A DAHİL EDİLDİ

**Karar: kabul — kırıcı düzeltme, sahip kararıyla 3.0.0'a dahil edildi.**

3.0.0 hazırlanırken ölçüldü: `text.suffix` yüzde işaretini kendisi yazıyordu ve negatif
ile ondalıklı sayılarda **yanlış ek** üretiyordu (`%-2'e`, `%2.5'e`). Sebep, okunuşun
`numberToWords` ile üretilmesi ve o fonksiyonun bu sayılarda boş dönmesiydi. Yalnız
`money.percent` değişseydi iki motor aynı sayıyı farklı yazacaktı; `suffix`'i sonra
düzeltmek ise yine kırıcı olup 4.0.0 gerektirecekti. Kırıcı değişiklikler tek MAJOR'da
toplandı.

### 27 · Geçersiz hane sayısında çökme — 3.0.0'A DAHİL EDİLDİ

**Karar: kabul — sahip kararıyla 3.0.0'a dahil edildi.**

v2.9.0'da `money.percent` üzerinde mutasyon testi yapılırken ölçüldü: `money.decimal`,
`money.percent`, `money.fmtDecimalGrouped` ve `unit.dataSize` geçersiz `digits`
değerinde (`1.5`, `-1`, `NaN`, `Infinity`) `'—'` yerine **hata fırlatıyordu**
(ABACUS-SPEC §2.1 ihlali). Çözüm: ortak `internal/hane` doğrulaması, 0–20 arası tam sayı.
Hata fırlatan bir çağrının `'—'` döndürmeye başlaması `try/catch` ile saran tüketiciyi
etkilediği için kırıcı sayıldı ve 3.0.0 ile birlikte verildi.

`math.round(x, d)` bilinçli olarak değiştirilmedi: ilkel katmandadır ve doğrulamayı
motor kapılarına bırakır (ABACUS-SPEC §2.2).

---

## Tüketicinin kendi eleyip göndermediği adaylar

Bu kayıt, **gönderilmemiş** ama değerlendirilmiş adayları da tutar; aynı aday
başka bir tüketiciden gelirse tekrar tartışılmasın diye.

**Rapor #2 (borç/kredi modülü incelemesi):** 9 aday §4.1 sınavından geçirildi,
1'i geçti (`math.irr`). Elenenler: YMO sarmalayıcısı · amortisman planı · vade
kırılımı · nakit akışı etiket üretimi · **taksit tarihi hesabı (çekirdekte
`period.addMonths` zaten karşılıyordu)** · kredi türü tabloları · erken kapama ·
rotatif faiz · bireysel/ticari ayrımı.

**Rapor #3:** Tüketici, ilk taslağında "çekirdekte takvim aritmetiği yok"
maddesini yazmış, sonra `period` modülünü fark edip **kendisi geri çekmişti**.
`period.addDays` / `quarterOf` / `quarterRange` zaten mevcuttu. Bu, 15 numaralı
belge talebini doğurdu.

> **Ders:** Talep yazmadan önce yalnız adı benzeyen modüle değil, **komşu
> modüllere de** bakın. `date` sorgular, `period` üretir.

**Talep #5 (ihale teklif maliyetlendirme):** 11 aday değerlendirildi, 3'ü gönderildi.
Elenenler: `tender`/`costing` motoru (alan adı, madde 11) · damga vergisi, karar pulu,
teminat oranları (mevzuata bağlı, madde 10) · finansman giderinin matrahtan önce düşülmesi
(iş kuralı) · `simpleInterest` (`dayCount` madde 9'da reddedildi; `date.daysBetween` var) ·
kademeli araç maliyeti (`math.ceil` + `mul` karşılıyor) · başabaş çözücü (sınavı geçiyor,
tek tüketici, analitik çözüm var) · `currency.breakEvenRate` (tek bölme) · kalem başına
teklif fiyatı (alan kavramı).

---

## Çekirdeğin tüketiciye geri bildirdiği noktalar

Akış tek yönlü değildir. Çekirdek de tüketici raporlarını denetlerken bulgu
bildirir:

- **2016 öncesi saat dilimi sapması (rapor #3 denetimi).** Tüketici,
  `date.format`'ın `toLocaleTimeString` ile birebir eşleştiğini ölçmüştü —
  güncel tarihler için doğru. Çekirdek sabit UTC+3 kullanır; Türkiye 2016'da
  kalıcı UTC+3'e geçtiği için **2016 öncesi kış tarihlerinde bir saat sapar**
  (`2015-01-15T12:00:00Z` → çekirdek `15:00`, gerçek `14:00`). Belgelenmiş
  bilinçli kapsam sınırıdır (`Intl` yasağı); geçmiş tarih taşıyan ekranlarda
  bilinmelidir.
- **Plaka kuralının dayanağı değişti (talep #4 araştırması).** İkincil kaynakların
  hâlâ gösterdiği Karayolları Trafik Yönetmeliği Madde 55 (Harf ve Rakam Grupları),
  **4/11/2025 tarihli ve 33067 sayılı Resmî Gazete ile yürürlükten kaldırılmıştır.**
  Güncel dayanak (Araçların Satış, Devir ve Tescil Hizmetlerinin Yürütülmesi Hakkında
  Yönetmelik, Madde 34) grupları listelemez, İçişleri Bakanlığına bırakır. Plaka
  kuralı yazan her tüketici bunu bilmelidir: 2014 tarihli metne dayanan
  "altı biçim + özel seriler" bilgisi güncel bir mevzuat hükmü değildir.
- **`?? 1` sessiz varsayılanı (rapor #3 denetimi).** Tüketicinin kırılgan
  bulduğu satır (`GERI_GUN[...] ?? 1`), ne çekirdeğin yayınladığı lint
  kuralınca ne de `INSTALL §6.2`'deki ev kurallarınca yakalanıyordu; ikisi de
  yalnız `0` literaline bakıyor. 12 numaralı talep o satırı zaten sildi, ama
  kural boşluğu genel olarak durmaktadır.
- **Fixture notları ve tarama kodu (talep #5 denetimi).** Tüketicinin 23 vakalık fixture'ının
  beklenen değerleri bağımsız hesapla 23/23 doğrulandı, ama iki vakanın notu yanlıştı
  (`maxsafe-ondalikli`, `maxsafe-yakin-agirlik`: "20 basamaklı bölme sapar / beraberliğe
  çöker" — sapmıyordu). Çekirdek notları düzelterek aldı. `tarama.py`'de iki hata bulundu,
  yayımlanan ölçümleri etkilemiyor: `tam_dagitim` üslü yazımda (`1e-07`) ölçeği 0 alıyor;
  `basit_yuvarlama` ondalıklı ağırlık toplamında `InvalidOperation` fırlatıyor. Aynı üslü
  yazım tuzağı JS'te de vardır (`String(1e-7) === "1e-7"`); çekirdek bunu testle çiviledi.

---

### Talep #8 — özel ad hâl eki (madde 34)

**Neden kabul edildi.** İmza yalnız **metin** biliyor; işe ait hiçbir kavram geçmiyor
(`AI-RULES §4.1` ayıracı). Talep elenerek geldi: 7 aday bakılmış, 5'i elenmişti ve
elenenlerin ikisi (`toTurkishTitleCase`, `formatNaturalDate`) çekirdekte **zaten
vardı** — bu, talebin gerçekten sınandığını gösteriyor. İkinci tüketici (Gunum-Var)
ölçülerek gösterilmişti: aynı iş bağımsız kopyalanmış ve dört addan üçünde yanlış
üretiyordu.

**Sahip kararı — kelime listesi.** İyelik tespiti bir Türkçe kurum sözcüğü listesi
gerektiriyor. Liste alan kavramı değildir (kasa/trade/dekont değil), dil bilgisidir;
`text.plate` emsaline (§4.1 Sınır durumu 4) benzer biçimde "fiilî uygulama" olarak
kabul edildi. Liste eksik olabilir; eksik sonu bildirmek bu defter üzerinden yapılır.

**Taşınan kod olduğu gibi ALINMADI — ve iyi ki alınmamış.** Talep, tüketicinin 119
satırlık ve 18 testi geçen uygulamasını "taşınmaya hazır" diye sunmuştu. Ölçüldü:
o kod `/(sı|si|su|sü|…)$/` deseniyle **yer adlarını iyelik sanıyor** —
`Gürsu` → `Gürsu'nda`, `Aksu` → `Aksu'nda`, `Karasu` → `Karasu'nda`; doğrusu
`Gürsu'da`. 18 test bir yer adını hiç denememişti. Çekirdek deseni atıp kurum sonu
listesi kullandı ve geri gidişi testle çiviledi.

**Ders:** "çalışıyor, 18 testi var" bir kodu ölçmeden almak için yeterli değildir;
testin neyi denemediği, neyi denediği kadar önemlidir.

---

## Kaynak raporlar

Raporların kendisi tüketici deposunda tutulur; çekirdek onların **kararını**
tutar. Bu kayıt, rapor metinlerine bağımlı olmadan okunabilecek biçimde
yazılmıştır.

| Rapor | Tarih | Kapsam | Çekirdek sürümü |
|---|---|---|---|
| #1 | 1 Eylül 2026 | İlk entegrasyon, SNN Fon üye ekstresi | 2.4.0 → 2.5.0 / 2.6.0 |
| #2 | 1 Eylül 2026 | Borç/kredi modülü, uçtan uca inceleme | 2.5.0 → 2.6.0 |
| #3 | 1 Eylül 2026 | SNN Fon ekranları (masaüstü + mobil), zincirin tamamı | 2.6.0 → 2.7.0 |
| #4 | 13 Eylül 2026 | Sigorta tüketicisi: Türkiye plakası standardı (sözlü talep) | 2.7.0 → 2.8.0 |
| #5 | 14 Eylül 2026 | SNN-Ihale-Maliyet: havuz dağıtımı + Ek #1 (fixture, tarama kodu) | 3.0.1 → 3.1.0 |
| #6 | 15 Eylül 2026 | trade-kasa TB-009 notu + çekirdek taraması (trade-kasa, GHS-Panel, Gunum-Var): dakika/saat göreli süre | 3.1.0 → 3.2.0 |
| #7 | 18 Eylül 2026 | Giriş süzme katmanı (SNN-Standartlar/giris-alanlari-standardi.md; GHS-Panel araç formu + SNN-İhale gün kutusu) | 3.2.0 → 3.3.0 |
| #8 | 19 Eylül 2026 | GHS-Panel: özel adlara hâl eki (issue #23; ikinci tüketici olarak Gunum-Var ölçüldü) | 3.4.0 → 3.5.0 |
