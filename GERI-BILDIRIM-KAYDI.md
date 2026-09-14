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
| 24 | `money.percent` varsayılanı `-%4,3` olsun | Sahip | ⏳ **Ertelendi — sonraki MAJOR** | — |
| 25 | Yüzde işareti sağa yazılsın (`-4,30%`) | Sahip | ❌ **Red** | — |
| 20 | Plaka türü sınıflandırması (resmî/diplomatik/yabancı/geçici) | Tasarım sırasında | ❌ **Red** | — |
| 21 | Başta `TR` önekine tolerans | Tasarım sırasında | ❌ **Red** (sahip kararı) | — |

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

### 24 · `money.percent` varsayılanı `-%4,3` olsun — ERTELENDİ

**Karar: ertelendi — sonraki MAJOR sürümde yapılacak.**

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
