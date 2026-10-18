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
| 36 | `money.parseNumber` yalnız Türkçe biçim okusun | TB-010 (iç denetim + tüketici etki ölçümü) | ✅ Kabul — **kırıcı düzeltme** | 4.0.0 |
| 37A | `formatGroupedInput` nokta ile ondalığı **seçmeli** okusun | Talep #9 (issue #40) | ✅ Kabul | 4.1.0 |
| 37B | Nokta→ondalık **varsayılan** olsun | Talep #9 (elenen aday) | ❌ **Red** — binlik yazan kullanıcıyı bozar; tahmine dayalı |  |
| 37C | Eksi işaretinin silinmesi düzeltilsin | Talep #9 (bilgi notu) | ❌ **Red** (ertelendi) — gerçek ekran ihtiyacı bildirilmedi | — |
| 38 | `dotAsDecimal` karışık biçimi bozuyor (`1.234,56` → `1,23456`) | Talep #10 (issue #42) | ✅ Kabul — **hata düzeltmesi** | 4.1.1 |
| 39 | Para gösterim standardı: `₺1.234,56` (solda, boşluksuz), metin içinde `1.234,56 TL`; sondaki simge desteklenmez | Talep #11 (issue #47) | ✅ **Teyit** — TCMB aslından okundu; davranış zaten böyle | — |
| 39A | `money.display({ precision })` — tek gösterim kapısı | Talep #11 aday 1 | ❌ **Red** — `formatMajor`/`compactMajor` üstüne ikinci kapı (33C/33D emsali) | — |
| 39B | `money.withDefaults(opts)` — proje varsayılanı | Talep #11 aday 2 | ❌ **Red** (ertelendi) — tek tüketici; sondaki simgeyi önlemezdi | — |
| 39C | Sıfır tutarda simge (`zero: 'symbol'` → `₺0,00`) | Talep #11 aday 3 | ✅ Kabul — **seçenek olarak**; varsayılanı sonraki MAJOR'a aday | 4.3.0 |
| 39D | `compactMajor`: sabit hane (`digits`) ve alt ölçek sınırı (`minScale`) | Talep #11 aday 4 | ✅ Kabul · `space` seçeneği **ertelendi** (yazım kaynağı okunmadı) | 4.3.0 |
| 39E | `currency: 'TL'` takma adı ve kayıt defterine CHF | Talep #11 aday 5 | ❌ **Red** — anahtarlar ISO 4217; CHF'nin tek simgesi yok; tanım nesnesi var | — |
| 39F | Elle simge/`TL` birleştirmeyi yakalayan lint kuralı | Talep #11 aday 6 | ✅ Kabul — **`strict`** (madde 35) | 4.3.0 |
| 40A | `dotAsDecimal` kontrollü kutuda kendi çıktısını bozuyor (`8.534` + `0` → `8,5340`) | Talep #12 (issue #48) | ✅ Kabul — **hata**; çözüm `previous` seçeneği, talebin önerdiği kural DEĞİL | 4.2.0 |
| 40B | `formatGroupedInput` ondalık hane sınırı | Talep #12 aday 2 | ✅ Kabul — adı `maxDigits` (talepte `maxFraction`) | 4.2.0 |
| 40C | `parse` ile `parseNumber` hizalansın | Talep #12 aday 3 | ❌ **Red** — fark bilinçli; KILAVUZ'a "hangi okuyucu" notu eklendi | 4.2.0 (belge) |
| 41 | `compact` 1 trilyon ve üstünü milyona "terfi" ettiriyordu (`2e12` → `₺2M`) | 4.3.0 hazırlığı (ölçüm) | ✅ Kabul — **hata düzeltmesi**; en üst ölçek milyar | 4.3.0 |
| 42 | Aynı dönemin kabulleri tek sürümde çıksın (toplu sürüm) | Sahip (2026-09-24) | ✅ Kabul — `AI-RULES §4.3`, CI ve etiket kapısı | 4.3.0 |
| 43 | `properNounSuffix` rakamla biten adda eki sayının okunuşundan alsın (`2027'ye`) | Talep #13 (issue #51) | ✅ Kabul — **hata düzeltmesi**; `text.suffix` ile aynı kural | yayınlanmadı (main) |
| 43B | `date.suffix(iso, kind)` | Talep #13 (elenen aday) | ❌ **Red** — `properNounSuffix` düzelince tarih metni de doğru çekiliyor | — |
| 44A | Ünlüsüz kısaltma harf harf okunsun (`THY'de`, `TRT'den`) | TB-014 (iç bulgu) | ✅ Kabul — **hata düzeltmesi**; otorite TDK "Kısaltmalar" | yayınlanmadı (main) |
| 44B | "-aş" ile biten ad "AŞ" kısaltması sanılıyordu (`Kocataş'ne`) | TB-014 çalışılırken ölçüldü | ✅ Kabul — **hata düzeltmesi**; kısaltma yalnız ayrı kelime | yayınlanmadı (main) |
| 44C | Ünlü içeren harf harf kısaltma (`ABD'ye`) | TB-014 (sınır) | ❌ **Red** (ertelendi) — metinden ayırt edilemez; çekirdek tahmin etmez | — |
| 44D | K harfi "ka" okunsun (`SGK'da`, `SGK'ya`) | Sahip (2026-09-24) | ⚠️ **Kabul — sahip kararıyla istisna** (TDK: "ke", `TDK'den`) | yayınlanmadı (main) |
| 45 | `PlateResult.newRegistration` eklensin, `yeniKayit` eskisin (TB-013 adım 1) | TB-013 (iç denetim) | ✅ Kabul — **eklemeli**, kimse kırılmaz; silme bir sonraki MAJOR'da | yayınlanmadı (main) |
| 46A | Kurum ve şirket unvanını **gösterim için** adım adım kısaltan işlev (`… Başkanlığı` → `… Bşk.`, `Limited Şirketi` → `Ltd.Şti.`) | Talep #14 (sahip, üç tüketici taraması) | ✅ Kabul — **yalnız gösterim**; biçim TDK, TDK'da olmayan "fiilî uygulama"; `text.abbreviationSteps` | yayınlanmadı (main) |
| 46B | `text.company()` bağlamsız kısaltıyor, bitişik yazımı ve büyük harf kısaltmayı bozuyor, tam unvanı saklamıyor | Talep #14 (tarama ölçümü) | ✅ Kabul — **kırıcı düzeltme**; sonraki MAJOR'a ertelendi (TB-015) | sonraki MAJOR |
| 46C | Unvan eşleştirme anahtarı (`İBB` = `İstanbul Büyükşehir Belediyesi`, `Ltd. Şti.` = `Limited Şirketi`) | Talep #14 (aday) | ❌ **Red** (ertelendi) — tek somut kanıt var (Proje-Nakit) | — |
| 46D | EKAP'ın kendi kısaltmalarını açma (`FAB.SAN.VE TİC.AŞ` → tam unvan) | Talep #14 (aday) | ❌ **Red** (ertelendi) — yalnız elle yapılmış örnek var | — |
| 46E | Kuruma özgü kısaltmalar çekirdek sözlüğünde (`İBB`, `DSİ`, `Orman GM`) | Talep #14 (aday) | ❌ **Red** — §4.1: bunlar veri; tüketici kendi listesini seçenekle verir | — |
| 47 | `unit` motoruna `volume` kategorisi (`mm3` `ml` `cm3` `l` `dm3` `m3`) — madde 30'un yeniden başvurusu | Talep #15 (Nakit Akış piyasa arşivi; İKN 2026/1666260 sepeti) | ✅ Kabul — **eklemeli**, kimse kırılmaz | yayınlanmadı (main) |
| 47B | `cl` (santilitre) | Talep #15 (aday) | ❌ **Red** (ertelendi) — ölçümde görülmedi; sahip kararı | — |
| 47C | Ambalaj metni ayrıştırma (`"1.3LT"` → `{ value, unit }`) | Talep #15 (aday) | ❌ **Red** (ertelendi) — biçim çeşitliliği ölçülmedi; tüketici kendisi erteledi | — |
| 48A | `period.valueAt` + `period.accrual` — tarihli değer çizelgesi, dilimlenmiş basit birikim | Talep #16 A (Maliyet `rates.ts`; Nakit Faz 3) | ✅ Kabul — **eklemeli**; ikinci ve üçüncü kullanım ölçüldü | yayınlanmadı (main) |
| 48B | KDV dahil/hariç ayrıştırma (`grossToNet` / `taxOn`) | Talep #16 B | ❌ **Red** — tek satırlık bileşim; net + vergi = brüt politikası açık (madde 9, 10 emsali) | — |
| 48C | Birim fiyat oturtma çekirdeği (`fitUnitPrices`) | Talep #16 C | ❌ **Red** (ertelendi) — `allocate` varyantı değil; politika parametreli, yerel en iyi; tek tüketici | — |
| 48D | Genel kök bulucu (`solve`) | Talep #16 D | ❌ **Red** (ertelendi) — tek tüketici; çözücü alan sonucuna bağlı; talep #5 elemesi | — |
| 48E | `math.median` | Talep #16 E (Nakit emsal arşivi tasarımı) | ✅ Kabul — **eklemeli**; üç yerel kopya ölçüldü (GHS-Panel, Portföy) | yayınlanmadı (main) |
| 48F | Yüzdelik (`percentile`) | Talep #16 E | ❌ **Red** (ertelendi) — kod ve ekran yok; tanım bir tercihtir | — |
| 48G | Başlık biçiminde kısaltma koruma (`productName`, sözlük parametresi) | Talep #16 F | ❌ **Red** (ertelendi) — tek tüketici; madde 46A ile birlikte tasarlanacak | — |
| 48H | KDV dahil/hariç ayrıştırma — madde 48B'nin yeniden başvurusu | Nakit koordinatör oturumu (sahip talimatı, 2026-10-16) | ✅ Kabul — `money.taxFromGross` / `money.taxFromNet`; kural K17 (iç yüzde), mali müşavir onaylı, iki tüketici kabul etti | yayınlanmadı (main) |
| 49 | `fmtDecimalGrouped` -1 ile 0 arasında eksiyi düşürüyor (`-0,5` → `0,5`) | Talep #17 (issue #59, SNN-UI) | ✅ Kabul — **hata düzeltmesi**; ikinci yerel yama Nakit'te (37C notu) | yayınlanmadı (main) |
| 50 | Para birimsiz sayı kısaltma (`1,25Mn`) | Talep #18 (issue #60, SNN-UI) | ✅ Kabul — **eklemeli**; `money.compactNumber`, `compact` ile ortak çekirdek | yayınlanmadı (main) |

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

> **Yeniden başvuru kabul edildi → madde 47** (2026-09-28). Koşul dağıtım bağlamında
> yazılmıştı; gelen olgu karşılaştırma fiyatı bağlamında, ama koşulun özü (tek gerçek
> sepette birden çok hacim birimi) gösterildi.

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

### 39A · `money.display({ precision })` — tek gösterim kapısı

**Karar: red — aynı işin ikinci kapısı (33C/33D emsali).**

`precision`'ın üç değeri çekirdekte zaten var olan üç çağrının yeni adıdır:
`'full'` = `formatMajor(v, { kurus: true })`, `'whole'` = `formatMajor(v)`,
`'compact'` = `compactMajor(v)`. Yeni bir hesap ya da yeni bir karar taşımıyor. Talebin
asıl derdi (ekranın tek bir karar vermesi) tüketicide tek satırlık bir sarmalayıcıyla
karşılanır ve o sarmalayıcı madde 39C/39D gelince elle kısaltma ya da elle sıfır
yazmak zorunda kalmaz.

**Yeniden başvuru koşulu:** `formatMajor`/`compactMajor` ile ifade EDİLEMEYEN bir
gösterim kararı.

### 39B · `money.withDefaults(opts)` — proje varsayılanı

**Karar: red (ertelendi) — tek tüketici; gösterilen sorunu da çözmüyor.**

Talebin kök neden tespiti "çekirdekte proje varsayılanı yok, sondaki simge bu boşluktan
doğdu" idi. Ölçülen olgu bunu desteklemiyor: sondaki simge panelin **kendi kararı**
(PR #169, CHANGELOG 1.7.2 "Simge sona alındı"); bir fabrika fonksiyonu o kararı
engellemezdi, sarmalayıcı yine `+ ' ₺'` yazabilirdi. Elle birleştirmeyi yakalayan şey
madde 39F'dir. `withDefaults` ayrıca tüketicide üç satırdır
(`(v, o) => money.formatMajor(v, { ...VARSAYILAN, ...o })`) ve yalnız bir tüketicide
ölçüldü (§4.1 Sınır durumu 3: emin değilsen alma).

**Yeniden başvuru koşulu:** ikinci bir tüketicide aynı seçenek kümesini tekrar yazan
ve birbirinden **sapan** sarmalayıcıların ölçülmesi.

### 39E · `currency: 'TL'` takma adı ve CHF

**Karar: red — tüketici veri sınırında eşler; talep bu sonucu önceden kabul etmişti.**

- **`'TL'`:** kayıt defterinin anahtarları ISO 4217 kodlarıdır. `TL`, TRY'nin **metin
  kısaltmasıdır** (`CurrencyDef.text`), para birimi kodu değildir. Takma ad kabul
  etmek bir kapı açar (`YTL`, `$`, `TRL`…) ve `resolveCurrency`'nin "tanınmayan kodda
  uydurma yapma" sözleşmesini bulanıklaştırır. Veride `'TL'` tutan tüketici onu okuma
  anında `'TRY'`ye eşler.
- **CHF:** tek ve evrensel bir simgesi yok (`CHF`, `Fr.`). Kayda eklemek çekirdeğin bir
  simge seçmesi demek. Kayıt defterinin tasarım ilkesi bu durum içindir: tüketici
  `{ code: 'CHF', symbol: …, text: 'CHF', minorDigits: 2 }` tanımını kendisi verir.

**Yeniden başvuru koşulu (CHF):** simgesi tartışmasız olan bir birim, ya da çekirdeğin
simge konumu ve boşluğunu okuyucu diline göre seçmeye başlaması (madde 25 notu).

### 40C · `parse` ile `parseNumber` hizalansın

**Karar: red — fark bilinçli; belge eksikti, belge düzeltildi (4.2.0).**

İki fonksiyon iki ayrı iş yapıyor:

| | `money.parse` | `money.parseNumber` |
|---|---|---|
| İş | para metni → **kuruş** | Türkçe sayı metni → sayı |
| `'1.234,567'` | `null` — üçüncü hane kuruşa sığmaz; yuvarlamak sessiz veri kaybı olurdu | `1234.567` |
| `'₺1.234,56'` | `123456` — ayna kuralı: çekirdeğin ürettiğini okur | `null` — para simgesi tanımaz |

Tüketicinin yaşadığı çelişki (kutu, `parse`'ın reddettiği metni üretebiliyordu) madde
40B ile kapandı: para kutusunda `maxDigits: 2` verilince kutu o metni hiç üretmez.
KILAVUZ'a "kutu metnini hangi okuyucu okumalı" notu eklendi.

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

**Talep #11 (GHS-Panel, para gösterimi):** 10 aday, 6'sı gönderildi. Elenenler:
`money.parse` sondaki `₺`'yi okusun (resmî olmayan biçimi meşrulaştırır; ayna kuralı) ·
`symbolPosition: 'trailing'` (madde 25 gerekçesi; TCMB kuralı) · `formatPremium` /
`formatCommission` (poliçe, komisyon: alan kavramı) · panelin kendi sarmalayıcıları
(tüketiciye özel varsayılan). Çekirdek dört elemeye de katılıyor.

**Talep #12 (GHS-Panel, tutar giriş kutusu):** 8 aday, 3'ü gönderildi. Elenenler:
`allowNegative` (madde 37C'ye yeni olgu yok; iade tutarları pozitif girilip işareti iş
kuralıyla veriliyor) · sondaki virgüle izin (`blur`'da tüketici çözüyor) ·
`parsePasted` tahmini (madde 37B) · `MoneyInput` bileşeni (arayüz katmanı) ·
`money.parseInput` (`parse` zaten kuruş döndürüyor). Çekirdek beş elemeye de katılıyor.

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
- **GHS-Panel: tedarikçi adı düzelticisi kelimenin içini değiştiriyor (talep #14 taraması).**
  `src/pages/FinancialManagement/utils/nameNormalization.ts` sözlüğü kelime sınırı aramadan
  uyguluyor (`new RegExp(pattern, 'gi')`). Aynı kural çekirdek dışında yeniden çalıştırılarak
  ölçüldü: `KASAP AHMET` → `KA.Ş.AP AHMET`, `Pasta Evi` → `PA.Ş.ta Evi`, `Hasan Usta Kasası` →
  `HA.Ş.an.Usta KA.Ş.A.Ş.ı`. Noktalı kelimeler sonradan harf düzenine girmediği için bozulma
  kalıcıdır. Yol: fiş okuyucudan gelen ad → `normalizeSupplierData` →
  `SupabaseFinanceRepository.findOrCreateSupplier` (tam ad eşleşmesiyle yeni tedarikçi açar).
  Canlı veride kaç kayıtta tetiklendiği **ölçülmedi**. Tüketicinin kendi işidir.
- **SNN-Proje-ve-Nakit-Akış: tam unvan kayıtta kısaltılıyor (talep #14 taraması).**
  `LangEngine.normalizeCompanyName` müşteri ve tedarikçi formlarında kayıttan önce çalışıyor
  (`ClientForm.tsx:42`, `SupplierForm.tsx:55`); `20260729220800_normalize_company_names.sql`
  var olan adları yerinde güncelliyor. Projenin kendi tasarım notu (commit `42faa2f`) tersini
  istiyor: "tam yasal ad saklanır, gösterimde kısaltılır". Çekirdekteki `company()` de aynı
  hatayı taşıdığı için (TB-015) bugün çekirdeğe geçmek bunu çözmez; 46A gelince gösterim
  kısaltması ondan alınabilir. Göçün canlıya uygulanıp uygulanmadığı **ölçülmedi**.

---

### Talep #18 — para birimsiz sayı kısaltma (madde 50, issue #60)

**Kaynak.** SNN-UI grafik bileşenleri (2026-10-15); ölçüm ve iletim SNN-Standartlar ana oturumu.
Eksen etiketi para olmayan sayıyı kısaltıyor ve bunu `compactMajor(v, { style: 'B/Mn/Mr' })
.replace('₺', '')` ile yapıyor (`registry/components/lib/chart-format.ts` 22–31).

**Ölçüm (çekirdek, `main` 4673d8f).** Tüketicinin çıktısı doğrulandı:
`compactMajor(1250000, { style: 'B/Mn/Mr', currency: 'USD' })` → `$1,25Mn`, `form: 'text'` ile
`1,25Mn TL`. Simge silme yolu kırılgan; iz kalıyor.

**§4.1 sınavı.** Aday `compactNumber(value, { style, digits, minScale })` yalnız sayı bilir;
başka alandaki uygulama aynen kullanır. **Zayıf nokta, kayda geçsin:** ölçülen tüketici tek
(SNN-UI). Tek tüketici kuralı (33E/34C emsali) bu kez uygulanmadı, çünkü:
1. Kuralın kendisi (ölçek eşikleri, harfler, `digits`, `minScale`, madde 41 terfi düzeltmesi)
   zaten çekirdekte. Yerel kopya bunların ikinci kopyası olurdu (33C/33D emsali).
2. SNN-UI aile kataloğudur; bileşenleri aile projelerine kurulur, kısaltma onlara da taşınır.
3. Sahip talimatı (2026-10-18): "59 ve 60'ı hazırla".

Tüketicinin elediği adaylar (`compact`'a `form: 'none'`, birim ekli kısaltma, SNN-UI
`formatCompact` eşiği) aynı gerekçeyle elendi. `compactMajor`'a `form: 'none'` da düşünüldü:
para işlevine para olmayan sayı vermek anlamı bozar ve ölçeğin altındaki tutar tam liraya
yuvarlanır (`0,5` → `1`). Ayrı ad seçildi.

**Uygulama.** `money.compactNumber`. Ölçekleme kodu `compact`'tan `scaleCompact` iç işlevine
alındı; iki işlev onu paylaşır. Kısaltılmış kısmın `compactMajor` çıktısından simge silinmiş
hâline birebir eşit olduğu testle çivili (`compact-number.test.ts`). Tek fark ölçeğin altında:
sayı `digits` yoksa en çok 2 haneyle yazılır, sondaki sıfır atılır; varsa sabit hane.

**Sürüm.** `main`'e girer, `[Yayınlanmadı]` altında bekler (madde 42). Sahip kararı
(2026-10-18): Nakit'ten gelecek talep değerlendirilene kadar sürüm yok.

### Talep #17 — `fmtDecimalGrouped` eksi işaretini düşürüyor (madde 49, issue #59)

**Kaynak.** SNN-UI grafik bileşenleri (2026-10-15). `slope-chart` iki dönem farkını yazıyor;
-0,5'lik düşüş "0,5" görünüyor, artış gibi okunuyor. SNN-UI sarmalayıcıyla yamıyor
(`lib/chart-format.ts` 12–20).

**Ölçüm (çekirdek, `main` 4673d8f).** Doğrulandı. Kök neden tüketicinin dediği gibi:
`String(-0.5).split('.')` tam kısmı `"-0"` verir, `groupThousands(Number("-0"))` işareti
kaybeder. `formatMinorInput` aynı işlevi çağırdığı için o da `-50` kuruşu `"0,50"` yazıyordu;
bu tüketicinin görmediği ikinci belirti.

**İkinci tüketici.** Nakit aynı hatayı yerelde yamıyor (`MathEngine.formatDecimal`, madde 37C
notu). trade-kasa `ReadOnlyRate.tsx`'in negatif değer alıp almadığı ölçülmedi.

**Karar.** Hata düzeltmesi. İşaret ayrı tutulur; sıfıra yuvarlanan değerde eksi yazılmaz
(`-0,4`, `digits: 0` → `"0"`). -1 ve altındaki doğru çıktılar değişmez; testte hepsi var
(`grouped-negative.test.ts`). Bu madde 37C'den (giriş kutusunda eksi, `parse` yönü) ayrıdır;
37C'nin durumu değişmedi.

**Sürüm.** `main`'e girer, `[Yayınlanmadı]` altında bekler (madde 42).

### Talep #16 — Nakit Akış ve İhale Maliyet adına altı aday (madde 48)

**Kaynak.** Sahip, SNN-Proje-ve-Nakit-Akış ("nakit") ve SNN-Ihale-Maliyet ("maliyet") adına
(2026-10-16). Issue açılmadı; sahip bu oturumda elle yürüttü. Bağlam: maliyet motoru Faz 3'te
nakit'e kopyalanacak, iki uygulama da yaşayacak. Kaynak kod maliyet `origin/main` b44c0c4'ten
okundu. İki tüketici de `^4.3.0`'a bağlı (ölçüldü, `package.json`).

**§4.1 sınavı (yazılı):**

| Aday iş | İmzası | Başka alandaki uygulama aynen kullanır mıydı? | Karar |
|---|---|---|---|
| A. Tarihli oran çizelgesi | `valueAt(schedule, iso)`, `accrual(schedule, from, to, basis)` | **Evet** — kira artışı, kredi, gecikme faizi; yalnız tarih ve sayı biliyor | **Al** (48A) |
| B. KDV dahil/hariç | `netAmountMinor(gross, rate, cur)`, `vatOnMinor(net, rate)` | Evet, ama çekirdekte zaten tek satırla yazılıyor | Reddet (48B) |
| C. Birim fiyat oturtma | `fitUnitPrices(rows, ruleSet)` | `RuleSet` ile hayır; ayrıştırılmış hâli evet, ama politika taşıyor | Ertele (48C) |
| D. Kök bulma | `solve(profitAt, current)` | Saf çözücü evet; bugünkü hâli kâr/zarar sonucuna bağlı | Ertele (48D) |
| E1. Ortanca | `median(values)` | **Evet** — yalnız sayı biliyor | **Al** (48E) |
| E2. Yüzdelik | — (kod yok) | Evet, ama tanımı bir tercih | Ertele (48F) |
| F. Başlık biçimi + kısaltma | `productName(name)` | Sözlük parametre olursa belki | Ertele (48G) |

**Elenenler (talep kendisi eledi, çekirdek katılıyor):** teklif bedeli çözücüsü
(`outputSolver.ts`, "teklif bedeli" alan kavramı) · damga vergisi, karar pulu, KİK payı,
teminat, gelir vergisi (mevzuat oranı, madde 10) · nakit döngüsü · gizli maliyet · revizyon
farkı. `npv` yeniden açılmadı: madde 29'un koşulu (çalışan finansman ekranı, ölçülmüş fark)
için yeni olgu yok.

#### A — KABUL: `period.valueAt`, `period.accrual`

**Ölçüm.** Maliyet'in `rateAt`/`accruedWeight` kodu çekirdek `date`/`math` üzerinde çalıştırıldı:
kaynak testlerinin değerleri birebir (6/73 = 0,0821917808219178; 139/1825 = 0,07616438356164383).
Kesirler ayrıca elle doğrulandı: 1 Eki → 15 Ara 2026 = 31 + 30 + 14 = 75 gün.

**Kaynak kodda üç kusur ölçüldü; çekirdeğe taşınmadı.**
1. Gün esası `0` → `ok(null)`; tip `number` dediği için çağıran `null`'u sayı sanar.
2. Gün esası negatif → negatif ağırlık (`-0,0761…`).
3. Sırasız çizelge sessizce okunuyor: `rateAt` doğrulamayı ayrı `validateRateSchedule`'a
   bırakıyor. Çekirdek çizelgeyi her çağrıda denetler, bozuksa `null` döner.

**Neden madde 9'un reddi burada geçerli değil.** Madde 9'u belirleyen, artık kuruşun hangi
taksite bineceği politikasıydı. `accrual` yuvarlanmamış bir ağırlık döner; kuruş politikası yok.
Gün esası parametredir. Geriye kalan iki kural standarttır: aralık `[from, to)`, değişim günü
yeni orana ait.

**İkinci ve üçüncü kullanım ölçüldü** (kardeş projeler, `origin/main`, salt okuma):
- Nakit `src/domain/abacus/MathEngine.ts:431`: `(totalAdat / 36500) * interestRate` — tek oranlı
  basit faiz; `accrual`'ın tek satırlık çizelgeli hâli. Bu, Faz 3 kopyasından bağımsız bir kullanım.
- Portföy `src/lib/abacus/cashFlowAnalytics.ts` `getRateForDate`: "tarihte ya da öncesindeki son
  değer" araması, `valueAt` ile aynı mekanizma. Fark: ilk satırdan önce en eski değere düşüyor.
  Çekirdek `null` döner; eskiye düşmek tüketicinin bilinçli kararı olarak kalır.

**Tasarım kararları.**
- Ters aralık `null`, sıfır değil. Maliyet'in "ödeme tahsilattan sonraysa nakit bağlanmaz: 0"
  kuralı iş kuralıdır; tüketicide bir satırla kalır.
- Yer `period`: yeni motor açılmadı. `date` sorgular, `period` takvim aritmetiği yapar; birikim
  takvim aritmetiğidir.
- Ad `valueAt`, `rateAt` değil: satır değeri oran olmak zorunda değil (maliyet'in kendi türü de
  "oran veya tutar (tavan)" diyor).

**Mutasyon testi.** On bir mutasyon (sekizi çizelge, üçü ortanca); onu kırmızı verdi. Kalan
`offset >= span` → `>` eşdeğer mutanttır (eşit günde eklenen dilim sıfır gündür); kırmayı tümden kaldırınca iki test kırılıyor.

#### B — RED: KDV dahil/hariç

**Ölçüm.** Çekirdek bileşimi kaynak testlerinin değerlerini birebir verdi:
`money.toMinor(math.div(gross, math.add(1, rate)), cur)` ve `math.round(math.mul(net, rate), 0)`.
Yani karşılığı çekirdekte zaten var (madde 33C/33D emsali).

**Asıl belirleyici: bir politika açık.** 1–100.000 kuruş × %1, %10, %20 tarandı:
300.000 vakanın **26.748'inde** `net + round(net × oran) ≠ brüt`. İlk vaka: 3 kuruş, %20 →
net 3 + KDV 1 = 4. Vergiyi `brüt − net` diye mi, `net × oran` diye mi almak bir **tercihtir**.
Tek tüketiciyle çivilenirse ikinci tüketici kırıcı sürüm ister (madde 9). Oran
parametreye çevrilince geriye `math`'in çarpma ve bölmesi kalıyor (madde 10).

**Yeniden başvuru koşulu:** İkinci bir tüketici aynı ayrıştırmayı gerçek bir ekranda yapıyor
olsun ve `net + vergi = brüt` politikası iki tüketiciyle birlikte kararlaştırılsın. Ad o zaman
genel tüketim vergisi olarak konur (`money.splitInclusive` gibi), "KDV" değil.

#### C — RED (ertelendi): birim fiyat oturtma

**`allocate`'ın varyantı değil, ayrı bir problem.** `allocate` bir tam sayıyı parçalara Σ tam
tutacak biçimde böler. Oturtma her kalem için tam sayı birim fiyat `p` arar ki Σ `p × miktar`
hedefe yaklaşsın. Tam tutmak çoğu zaman imkânsızdır: 1.000 kuruş, miktar 3 → `3p = 1000`'in
tam sayı çözümü yok. Bu bir tam sayı yaklaştırma problemidir.

**Ayrıştırılan çekirdek politika taşıyor.** `ruleSet`'ten iki şey gelir: kayma sınırı
(`maxUnitPriceShiftMinor`) ve artık yönü (`below_target` / en yakın). İkisi de seçimdir. Yöntem
yerel en iyiyi bulur; maliyet kendi kütüğünde (TB-014) ondalık miktarda genel en iyiden
sapabildiğini yazmış. Bilinen sınırı olan sezgisel, tek tüketiciyle çekirdeğe çivilenmez.

**Yeniden başvuru koşulu:** İkinci bir tüketici (Faz 3 kopyası değil, başka bir ekran) aynı
problemi yaşasın ve artık yönü ile kayma sınırı parametre olarak birlikte kararlaştırılsın.

#### D — RED (ertelendi): kök bulma

**Ölçüm.** `fx-break-even/index.ts` `solve` ikiye bölme değil, kiriş yöntemidir; kök aralığı
garantisi yok. Çözücü alan sonucuna bağlıdır (`loss_at_any_rate`, `profit_at_any_rate`) ve
`NEAR_ZERO_FACTOR` değişkenin pozitif olduğunu varsayar (kur). Saf çözücü çıkarılabilir, ama
tek tüketici var ve talep #5'te aynı aday ("başabaş çözücü") elenmişti.

**Yeniden başvuru koşulu:** İkinci bir tüketici tek değişkenli tekdüze bir fonksiyonun kökünü
arasın. O zaman çekirdek `irr`'in içindeki ikiye bölmeyi `math.solve(f, low, high)` olarak açar;
aralık garantisi olan yöntem tercih edilir.

#### E — ortanca KABUL, yüzdelik RED (ertelendi)

**Talep reddi önerdi; ölçüm yeni olgu buldu.** Nakit'te kod yok, ama kardeş projelerde üç ayrı
ortanca kopyası çalışıyor:

| Yer | Çift uzunluk `[1, 2, 3, 4]` | Boş dizi |
|---|---|---|
| GHS-Panel `quoteReader/tableRegion.ts:16` | `3` (üst orta) | `0` |
| GHS-Panel `quoteReader/vefaParser.ts:24` | `3` (üst orta) | `0` |
| Portföy `lib/abacus/cashFlowAnalytics.ts:70` | `2.5` | `0` |
| **Çekirdek `math.median`** | **`2.5`** | **`null`** |

Bu madde 34'ün emsalidir: aynı iş bağımsız kopyalanmış ve kopyalar birbirini tutmuyor. Üç
kopyada da boş dizi sessiz `0` veriyor (çekirdekte yasak). Ortancanın tanımı tektir; politika yok.

**Yüzdelik reddedildi.** Hiçbir projede kodu yok. Tanımı tek değil: ara değerleme yöntemi
(en yakın sıra, doğrusal…) bir tercihtir; çekirdek tahmin etmez.

**Yeniden başvuru koşulu (yüzdelik):** Nakit emsal arşivinin ekranı çalışsın ve hangi yöntemin
gerektiği o ekranın verisiyle gösterilsin.

#### F — RED (ertelendi): başlık biçimi ve kısaltma koruma

**Ölçüm.** `text.title` sözlüğünde olmayan kısaltmaları küçültüyor:
`text.title('PVC BORU VE TSE BELGELİ')` → `'Pvc Boru ve Tse Belgeli'`;
`'HDPE BORU DN 110'` → `'Hdpe Boru Dn 110'`. Boşluk gerçek.

**Neden alınmadı.** Maliyet'in `productName`'i yalnız sözlük değil, ürün adı politikası da
taşıyor: rakamlı kelime korunur, karışık harfli kelimeye dokunulmaz, başı işaretli kelime ayrı
biçimlenir. Bunlar genel mi, tek tüketiciyle bilinmiyor. Ayrıca kısaltma sözlüğü madde 46A'nın
(unvan kısaltma, kabul edildi, yazılmadı) da konusu; ikisi ayrı ayrı tasarlanırsa çekirdekte iki
sözlük doğar. Talebin kendisi "belki" dedi; §4.1 Sınır durumu 3.

**Yeniden başvuru koşulu:** İkinci bir tüketici büyük harf veriyi başlık biçimine çevirsin, ya
da 46A yazılırken kısaltma sözlüğü tasarlansın. Önerilen biçim:
`text.title(str, { preserve: Set<string> })`.

#### 48H — B'nin yeniden başvurusu: ikinci ekran (2026-10-16)

**Olgu (nakit bildirdi, çekirdek kodu okudu).** Nakit `ProjectSummaryTab.tsx:173` ihale tutarını
KDV ve net olarak gösteriyor; hesap `MathEngine.ts` `calculateVat` (oran yüzde, tutar kuruş).
KDV dahil girdide `net = round(brüt ÷ (1 + oran))`, **`KDV = brüt − net`**. Maliyet aynı girdide
**`KDV = round(net × oran)`** alıyor (`vat/index.ts`; çağıranlar `tenderCalculation.ts:137, 215`,
`manualUnitPrice.ts:70`). İki proje, iki ekran, iki kural; Faz 3'te aynı veride karşılaşacaklar.

**Ölçüm (çekirdek, iki kodun aynen çoğaltılmasıyla).** 1–100.000 kuruş × %1, %10, %20 = 300.000 vaka:

| | Maliyet | Nakit |
|---|---|---|
| Net tutar | aynı | aynı (300.000 / 300.000) |
| KDV | `round(net × oran)` | `brüt − net` |
| Net + KDV ≠ brüt | **26.748** | **0** |

Farklı çıkan 26.748 vakanın hepsinde maliyet KDV'yi **1 kuruş fazla** buluyor; ters yönde fark yok.
Oranlara göre: %1'de 990, %10'da 9.091, %20'de 16.667. İlk vaka: 50 kuruş, %1 → maliyet KDV 1,
nakit KDV 0. Nakit tarafındaki `Decimal` varsayılan yuvarlaması (half-up) ile çekirdeğinki aynı;
net tutarda hiç fark çıkmaması bunu doğruluyor.

**Durum.** Madde 48B'nin yeniden başvuru koşulunun ilk yarısı (ikinci proje, gerçek ekran)
karşılandı. İkinci yarısı (kuralın iki projeyle birlikte kararlaştırılması) karşılanmadı. Nakit,
kuralın dayanağını resmî kaynaktan araştırıyor (GİB, e-Fatura/VUK yuvarlama). Sonuç gelince kural
iki tüketiciyle kararlaştırılır; imza ondan sonra yazılır. Sahip kararıyla imza taslağı şimdi
yazılmadı: kural belli olmadan taslak bir kuralı varsaymış olur.

Bu satır kabul değildir; son sütunu "karar bekliyor"dur ve toplu sürüm kapısını tutmaz.

**Kural kararı — nakit tarafı (2026-10-16, nakit K17, sahip).** Nakit resmî kaynak taradı:
kuruş yuvarlaması için GİB e-Fatura/VUK kılavuzlarında kural yok (belirsiz). Yön belli: KDV dahil
bedelde KDV "iç yüzde" ile bulunur, net ondan sonra çıkar (KDV Kanunu md. 20 matrah tanımı, GİB
uygulama anlatımı; çekirdek bu kaynakları aslından okumadı). Karar:
- KDV dahil: `KDV = yarımYukarı(brüt × oran ÷ (1 + oran))`, `net = brüt − KDV`.
- KDV hariç: `KDV = yarımYukarı(net × oran)`, `brüt = net + KDV`.
- İki durumda da `net + KDV = brüt` (kuruş).

**Ölçüm (çekirdek, 1–200.000 kuruş, half-up).** KDV dahil girdide iç yüzde kuralı (K17) ile
bugünkü iki kod karşılaştırıldı:

| Oran | Nakit bugün (önce net) ≠ K17 | Maliyet bugün (`round(net × oran)`) ≠ K17 |
|---|---|---|
| %1 | 0 | 1.980 |
| %10 | 0 | 18.182 |
| %20 | 33.333 (altıda bir) | 0 |

Nakit'in iddiası doğrulandı: %1 ve %10'da iki yöntem hep aynı, %20'de altıda birinde 1 kuruş
farklı. Örnek de doğru: 1.002,99 TL dahil, %20 → önce net KDV 167,16 TL, iç yüzde 167,17 TL.
Beklenmedik bulgu: maliyetin bugünkü kodu %20'de K17 ile birebir aynı, %1 ve %10'da ayrışıyor.
Yani iki projenin de değişmesi gerekiyor, ama farklı oranlarda.

**Karar: beklet.** Yeniden başvuru koşulunun ikinci yarısı yalnız nakit tarafında karşılandı.
Bekleyenler: maliyet tarafının aynı kuralı kabul ettiğinin sahip teyidi ve mali müşavir onayı.
İkisi gelince tek satırlık MINOR olarak alınır; o zaman testler bu tablodan değil, onaylanan
kuralın elle hesaplanmış örneklerinden yazılır.

**KABUL (2026-10-16).** İki şart karşılandı. Nakit koordinatör oturumu bildirdi, çekirdek sahibi
bu oturumda doğrudan onayladı ("uygun"):
1. Mali müşavir K17 kuralını onayladı (sahibin sözü: "kdv kuralı mm onay").
2. Sahip (iki projenin de sahibi) maliyetin aynı kuralı kullanacağını teyit etti.

Uygulama yukarıdaki imzayla yazıldı. Testler elle hesaplanmış örneklerden: 120,00 TL → 20,00;
1.002,99 TL %20 → 16.716,5 → 167,17; 3 kuruş %20 → 1; 50 kuruş %1 → 0; hariç 7 kuruş → 1,
8 kuruş → 2. `net + vergi = brüt` 4 oran × 5.000 tutarda denetlendi. Negatif tutar (iade) işaret
korumalı yuvarlanır; oran 1'den büyük olabilir (ÖTV). Beş mutasyonun beşi kırmızı verdi; aralarında
"önce net" yöntemine dönüş de var (üç test kırılıyor).

**Tüketicilerin göçü.**

| Yerel | Çekirdek | Davranış değişir mi |
|---|---|---|
| Nakit `MathEngine.calculateVat` `included` | `money.taxFromGross(tutar, oran / 100)` | Evet: %20'de altıda bir vakada 1 kuruş (nakit G2) |
| Nakit `calculateVat` `excluded` | `money.taxFromNet(tutar, oran / 100)` | Hayır |
| Maliyet `vat/` `netAmountMinor` + `vatOnMinor` (dahil girdi) | `money.taxFromGross(money.toMinor(brüt, cur), oran)` | Evet: %1 ve %10'da (maliyet Faz 3) |
| Maliyet `vatOnMinor` (hariç tutar üstüne) | `money.taxFromNet` | Hayır |

Nakit oranı yüzde (20), çekirdek ondalık (0,2) bekler. Maliyet'in `netUnitPrice` işlevi (birim
fiyat yuvarlanmadan arındırma, ADR-0003) çekirdeğe girmedi; o bir tutar değil, ara değerdir.


**Önerilen imza (taslak, yazılmadı).** Genel tüketim vergisi adıyla, `money` motorunda; oran
ondalık (%20 = 0,2), tutar kuruş, ikisi birden döner ki `net + vergi = brüt` ayrı ayrı
yuvarlanarak bozulamasın:
- `money.taxFromGross(grossMinor, rate)` → `{ net, tax }` ya da `null`
- `money.taxFromNet(netMinor, rate)` → `{ tax, gross }` ya da `null`

Talepte önerilen `grossToNet` / `taxOn` alınmadı: tek sayı dönen iki işlev, çağıranı farkı
yeniden hesaplamaya iter ve madde 48B'deki 1 kuruşluk ayrışma orada yeniden doğar. Geçersiz oran
(negatif, sonlu değil) ve güvenli tam sayı olmayan tutar `null` döner.

#### Madde 37C — not (yeni olgu yok)

Nakit `fmtDecimalGrouped`'ın eksi işaretini sildiği durumu yerelde koruyor (`MathEngine.ts`
`formatDecimal`). Bugün nakit'te negatif değer gösteren ekran yok. Faz 3'te kâr/zarar ekranında
küçük negatif değer çıkarsa ölçümle başvurulacak. 37C'nin koşulu değişmedi.

#### Tüketicilerin göç adları

| Yerel | Çekirdek | Dikkat |
|---|---|---|
| Maliyet `rates.ts` `rateAt(schedule, iso)` | `period.valueAt(schedule, iso)` | Sırasız çizelgede `null` |
| Maliyet `rates.ts` `accruedWeight(...)` | `period.accrual(schedule, from, to, basis)` | `from ≥ to` için `0` kararı tüketicide kalır; `null` → `missing_parameter` eşlemesi tüketicide |
| Maliyet `validateRateSchedule` | — (tüketicide kalır) | Ekran için hata kodları üretir; çekirdek yalnız `null` der |
| GHS-Panel, Portföy yerel `median` | `math.median` | Çift uzunlukta ortalama; boş dizi `null` |
| Maliyet `vat/`, `unit-price/`, `fx-break-even/` `solve`, `productName` | — | Tüketicide kalır |

`RateSchedule` türü `period.Schedule` ile yapısal olarak uyumludur; `source` alanı okunmaz.

**Sürüm.** Kod `main`'e girer, `CHANGELOG.md` `[Yayınlanmadı]` altında bekleyen 43, 44A, 44B,
44D, 45 ve 47 ile birlikte çıkar (madde 42, `AI-RULES §4.3`). Sürüm numarası sahip onayıyla
değişir.

### Talep #15 — `unit` motoruna hacim (madde 47, madde 30'un yeniden başvurusu)

**Kaynak.** SNN-Proje-ve-Nakit-Akış, "piyasa arşivi" tasarımı (`docs/analiz/piyasa-arsivi-tasarim.md`
§4.4, §5): kamu ihalelerindeki geçmiş alım fiyatlarından **birim başına karşılaştırma fiyatı**
(TL/litre). Talep issue olarak açılmadı; sahip bu oturumda doğrudan karar verdi (2026-09-28:
"1a 2a 3b").

**Olgu (tüketicinin okuması, ihalebul.com, 2026-09-27).** İKN 2026/1666260, 145 kalem:
"Birimi" sütununda `litre` 23, `kilogram` 6; kalem adlarında `CAM TEMİZLEYİCİSİ 750 ML`,
`ENFEKTE ATIK KUTUSU … 1.3LT`, `ÇÖP KOVASI … 40 LT`. İKN 2026/1711235'te `1 Lt`, `5 Lt`, `30 Lt`.
Çekirdek EKAP'tan bağımsız doğrulamayı denedi, bağlantı reddedildi (HTTP 428); sayılar
tüketicinin okumasıdır.

**Ölçüm (çekirdek, `main` 79d94cc).** `convert(750,'ml','l')`, `convert(1.3,'l','ml')`,
`convert(1,'m3','l')` → `null`; `categoryOf('ml')` → `null`; `convert(1000,'g','kg')` → `1`.
Tüketicinin 4.1.1 ölçümüyle aynı.

**İki zayıf nokta, kayda geçsin.**
1. Ekran henüz yok; piyasa arşivi tasarım aşamasında. Veri gerçek.
2. Sütundaki birim zaten tektir (`litre`); `ml` yalnız kalem adlarında. Ad metnini ayrıştırma
   (47C) ertelendiği için `convert` bu veriye bugün yalnız kullanıcı girişinden ulaşır.

Bu ikisi reddi haklı çıkarmadı: tablo SI ve sabit, madde 30'da zaten kabul edilmişti,
kimseyi kırmıyor.

**Kırılma ölçümü.** Kardeş projeler tarandı: çekirdeğin `unit` motorunu kullanan tüketici yok.
`categoryOf` adıyla bulunan çağrılar GHS-Panel'in kendi işlevleri. `UnitCategory` türüne
değer eklemek yalnız tüm değerleri tek tek kapsayan `switch` yazan kodu etkilerdi; yok.

**Kapsam kararları.**
- `lt` yazımı birim adı olarak **eklenmedi**. Birim adları SI simgesidir (`l`); EKAP yazımını
  (`LT`, `Lt`, `litre`) okumak ayrıştırmanın (47C) işidir.
- Hacim kütleye çevrilmez (`convert(1,'l','kg') → null`). Yoğunluk ürüne bağlıdır.
- `cl` sahip kararıyla ertelendi (47B). Ölçümde görülmedi; `AI-RULES §4.1` Kural 3.

**Sürüm.** Sahip kararı (2026-09-28): "yeni sürüm çıkartma, öncekiler gibi beklesin."
`main`'e girer, `CHANGELOG.md` `[Yayınlanmadı]` altında bekler (madde 42, §4.3).

### Talep #14 — resmî kurum ve şirket unvanı kısaltması (madde 46)

**Kaynak.** Çekirdek sahibinin talebi (2026-09-24): resmî kısaltmalar (`Bşk.`, `Md.`,
`BŞB`) ve şirket unvanı kısaltması çekirdeğe girsin. Üç aday tüketici tarandı:
GHS-Panel, SNN-İhale-Maliyet-Teklif, SNN-Proje-ve-Nakit-Akış. Sahibin örnekleri:
`MANİSA BÜYÜKŞEHİR BELEDİYE BAŞKANLIĞI MEZARLIKLAR DAİRESİ BAŞKANLIĞI`,
`İstanbul Büyükşehir Belediyesi` → `İstanbul BŞB`,
`TYC Grup Yapı Peyzaj Orman Ürünleri Limited Şirketi` → `… Ltd.Şti.`

**Tarama üç ayrı ihtiyaç buldu; bugünkü kod bunları karıştırıyor.**

| İhtiyaç | Nerede görüldü | Karar |
|---|---|---|
| **Gösterimde kısaltma** — ad dar yere sığmıyor, kayıt değişmiyor | İhale: şartname özeti PDF'i (`print/abbreviate.ts`, 17 kural, sığana kadar adım adım). Proje-Nakit: dar sütunlar (`ProjectProfitRanking` 120px), veride elle yazılmış `Sakarya BŞB`, `Orman GM`. GHS-Panel: müşteri listesi 35, PDF raporu 27 karakterde kesiyor | 46A kabul |
| **Kayıtta düzeltme** — ad kaydedilmeden tek yazıma çevriliyor | Proje-Nakit `LangEngine.normalizeCompanyName` (form kaydında + veritabanı kopyası). GHS-Panel `nameNormalization.ts` ve çekirdek `text.company()` (dekont adları) | 46B, TB-015 |
| **Aynı adı tanıma** — eşleştirme anahtarı | Proje-Nakit belgesinde kritik risk: `İBB` ile tam adı iki ayrı müşteri kaydı oluyor. ihale-mcp yüklenici eşleştirmesi (Python; çekirdeği kullanamaz) | 46C ertelendi |

Şirket eki kısaltması şu an **dört ayrı kopyada** yazılı: çekirdek `text.company()`,
Proje-Nakit, GHS-Panel, ihale-mcp. Kurum kısaltması tek kopyada: İhale `abbreviate.ts`.

**§4.1 sınavı**

| Aday iş | İmzası | Başka alandaki uygulama aynen kullanır mıydı? | Karar |
|---|---|---|---|
| Unvanı gösterim için adım adım kısaltma | yalnız metin alır, metin döner | Evet — Türkçe kurum ve şirket unvanı dil kuralıdır; hiçbir iş kavramı bilmez | **46A kabul** |
| `company()` düzeltmesi | var olan imza | Evet — zaten çekirdekte | **46B kabul, MAJOR** |
| Eşleştirme anahtarı | metin → anahtar | Evet olabilir, ama tek somut ekran kanıtı var | **46C ertelendi** |
| EKAP kısaltmalarını açma | metin → metin | Belirsiz — yalnız fixture'da elle yapılmış örnek | **46D ertelendi** |
| `İBB`, `DSİ`, `Orman GM` sözlüğü | veri | Hayır — hangi kurumun hangi kısaltmayı aldığı veridir | **46E red** |

**Ölçülen `company()` kusurları** (`main` 79d94cc, 13 adla; ayrıntı TB-015):
`Sanayi Mahallesi Muhtarlığı` → `San. Mahallesi Muhtarlığı`, `Ticaret Odası` → `Tic. Odası`,
`XYZ İNŞ.SAN.TİC.LTD.ŞTİ.` → `Xyz İnş.san.tic.ltd.şti.`, `T.C. …` → `T.c. …`, `ABC` → `Abc`.
Sözlükte şirkete özgü `TYC` var. Kısaltılmış ad `stored` alanında dönüyor, tam unvan kayboluyor.
Kurum kelimelerine (`Başkanlığı`, `Müdürlüğü`) hiç dokunmuyor.

**46A — kabul edilen kapsam.** Sahip kararı (2026-09-24): "1a, 2a, 3 evet".

- **Yalnız gösterim.** Sonuç saklanmaz. Kayıttaki tam unvan değişmez.
- **Adım adım.** Kurallar sırayla uygulanır, her ara hâl döner (İhale `abbreviationSteps`
  emsali). Genişliği ölçmek çekirdeğin işi değildir (ekran ve yazı tipi bilgisi); çağıran,
  sığan ilk adımı seçer.
- **Kelime sınırı zorunlu.** GHS-Panel'in yerel kopyası sınır aramadığı için `KASAP` →
  `KA.Ş.AP` üretiyor (ölçüldü, aşağıdaki geri bildirim). Madde 44B'nin dersiyle aynı.
- **Harf düzeni korunur.** Büyük harfli EKAP adı büyük harfli kısalır (İhale emsali).
  Harf düzenini değiştirmek ayrı iştir (`title`).
- **Tüketici ek sözlük verebilir** (46E'nin karşılığı).

**Biçim kaynağı: TDK Kısaltmalar Dizini** (tdk.gov.tr, `Kısaltmalar_Dizini.pdf`, 24 sayfa;
aslından okundu, 2026-09-24). Sahip kararı 1a: TDK'da olan TDK yazımıyla, olmayan "fiilî
uygulama" etiketiyle (§4.1 Sınır durumu 4).

- **TDK'da olanlar:** `Bşk.` (başkan, başkanlık, başkanı, başkanlığı), `Md.` (müdür, müdürlük,
  müdürlüğü), `gn.` (genel), `Ltd.` (limitet), `AŞ` (anonim şirket), `tic.` (ticaret),
  `Ort.` (ortaklık, ortaklığı), `Şb.` (şube), `Mah.` (mahalle, mahallesi), `Bul.` (bulvar,
  bulvarı), `Fak.` (fakülte), `T.C.`
- **TDK'da olmayanlar (fiilî uygulama):** `BŞB`, `Bld.`, `Şti.`, `San.`, `İnş.`, `Dai.`,
  `Üniv.`, `Hiz.`
- **`Bşk.lığı` yazılmaz.** TDK'da `Bşk.` zaten "başkanlığı" demektir. Sahibin ilk örneğindeki
  `Belediye Bşk.lığı` bu yüzden `Belediye Bşk.` olur.
- **`A.Ş.` kalır, TDK `AŞ` değil.** Çekirdek (`company`, `properNounSuffix`) ve üç tüketicinin
  hepsi `A.Ş.` kullanıyor; değiştirmek tüketicinin gördüğü çıktıyı değiştirir. Fiilî uygulama
  diye işlenir.

**Uygulamada kesinleşecek sorular** (sahip kararı gerekirse o zaman sorulur): işlevin adı ve
imzası; kuralların sırası (`Büyükşehir Belediye Başkanlığı` önce `… Belediye Bşk.` mı olur,
yoksa doğrudan `BŞB` mi); `Genel Müdürlüğü` → `Gn. Md.` yazımında TDK'nın küçük harfli
`gn.`'si ad içinde büyük mü yazılır; İhale'nin `Bulv.` yazımı TDK'nın `Bul.`'u ile çelişiyor.
Beklenen değerler test olarak önce TDK'dan yazılır, sonra kod.

**Sürüm.** Sahip kararı (2026-09-24): sürüm değişmez, acele yok. 46B, TB-013 adım 2 ile aynı
ana sürümü bekler.

#### 46A — uygulandı: `text.abbreviationSteps` (2026-10-16)

**Açık soruların sahip kararları** (2026-10-16, "hepsi önerin"):
1. Ad ve biçim: `text.abbreviationSteps(value, { extra })`, adım listesi döner. Ad İhale'nin
   yerel işleviyle aynı; göç tek satır.
2. Sıra: önce kalıplar, sonra tek kelimeler; `Büyükşehir Belediye Başkanlığı` doğrudan `BŞB`.
3. `Genel Müdürlüğü` → `Gn. Md.` (unvan içinde baş harf büyük).
4. TDK dizini yeniden aslından okundu (indirildi, 24 sayfa).
5. `company()` düzeltmesi (46B) şimdi yapılmaz; ana sürümü bekler.

**TDK'nın ikinci okuması iki düzeltme getirdi.**
- Sokak TDK'da `Sok.`'tur, `Sk.` değil. İhale'nin yerel kodu `Sk.` yazıyordu; çekirdek `Sok.` yazar.
- Yukarıdaki listede `Hiz.` "TDK'da olmayan" diye geçiyordu; yanlış. TDK'da hizmet `Hz.`'dir,
  ama aynı kısaltma önce "Hazret" anlamındadır (`Hz. 1. Hazret, Hazreti 2. Hizmet`). `Defin Hz.`
  yanlış okunur. **Sahip kararı (2026-10-16): `Hizmetleri` → `Hiz.`** Fiilî uygulama; TDK'dan
  bilerek ayrılır. Bunu "TDK'ya uydurma" diye `Hz.`'e çevirmeyin.

**Olası kısaltmalar tarandı** (sahip isteği: "ileride karşımıza gelebilecek olanlar").
EKAP doğrudan denendi, yine reddetti (HTTP 428). Bunun yerine kardeş projelerdeki gerçek ihale
verisi (SNN-ihale-ozet, ihale-mcp, İhale-Maliyet, Proje-Nakit; 1.603 dosya) tarandı: 612 ayrı
idare ve firma adı. En sık kelimeler: `Müdürlüğü` 255, `Başkanlığı` 141, `Genel` 101,
`Bakanlığı` 47, `Belediyesi` 38+26, `Büyükşehir` 30+12, `Üniversitesi` 27+20, `Rektörlüğü` 27,
`Hizmetleri` 22, `Dairesi` 14+12, `Hastanesi` 14+12, `Şirketi` 14+13, `İnşaat` 12.

**Ölçülen bulgu: büyük harfli EKAP adlarında `İ` yerine `I` yazılıyor** (`BELEDIYESI`,
`BÜYÜKŞEHIR`, `DAIRESI`). Kural büyük harfte iki harfi de tanır; çıktı doğru `İ` ile yazılır.

**Kural listesi** (40 kural; sıra kod içinde, `ABBREVIATION_RULES`):

| Kaynak | Kısaltmalar |
|---|---|
| TDK | `Bşk.` `Md.` `Gn.` `Şb.` `Mah.` `Cad.` `Sok.` `Bul.` `Apt.` `Fak.` `Ens.` `Müh.` `Ort.` `Tic.` `T.C.` `Ltd.` |
| Fiilî uygulama | `BŞB` `Bld.` `OSB` `A.Ş.` `Şti.` `Rekt.` `Üniv.` `Dai.` `Hiz.` `Koop.` `San.` `İnş.` `Taah.` `Dan.` `Mak.` `Nak.` `İth.` `İhr.` `Paz.` |

**Bilerek alınmayanlar** (§4.1 Sınır durumu 3): `Bakanlığı`, `Hastanesi`, `Komutanlığı`,
`Kaymakamlığı`, `Valiliği`, `Başhekimliği`, `Merkezi`. Sık geçiyorlar, ama TDK'da kısaltmaları
yok ve yaygın tek bir yazım da yok. TDK'daki tek harfli `H` (hastane) ve `K` (komutanlık)
belirsiz. Gerekirse tüketici `extra` ile verir.

**`Ticaret Odası` → `Tic. Odası`.** Madde 46B'de bu `company()` için kusur sayılmıştı, çünkü
oradaki sonuç kayda giriyordu. Burada yalnız gösterim adımıdır ve tam unvan saklıdır; kabul edilir.

**Mutasyon testi.** Sekiz mutasyonun sekizi de kırmızı verdi: kelime sınırının iki yanı, `I`/`İ`
toleransı, büyük harf kuralı, kısaltmayan kural elemesi, düzenli ifade kaçışı, `$` kaçışı ve
`extra`'nın önce uygulanması. Testi kırmayan `long === ''` denetimi ölü koddu ve kaldırıldı.
Boş kalıbı uzunluk denetimi zaten eliyor.

**Tüketicilerin göçü.**

| Yerel | Çekirdek |
|---|---|
| İhale `print/abbreviate.ts` `abbreviationSteps(value)` | `text.abbreviationSteps(value)`; `fitText` tüketicide kalır (`steps.find(fits)`) |
| Proje-Nakit `LangEngine.normalizeCompanyName` (gösterim için kullanıldığı yerler) | `text.abbreviationSteps(ad).pop()` ya da sığan adım; kayıt için kullanımı 46B'yi bekler |
| GHS-Panel `nameNormalization.ts` (gösterim için kullanıldığı yerler) | aynı |

İhale'den farklar: `Bulv.` → `Bul.`, `Sk.` → `Sok.` (TDK); büyük harfte `I` toleransı; OSB, T.C.,
`Limited Şirketi` ve şirket sektör kelimeleri eklendi; `Hizmetleri` → `Hiz.` aynı.

### Madde 45 — `yeniKayit` → `newRegistration`, iki adımda (TB-013)

**Neden iki adım.** Alan genel API'dir; doğrudan yeniden adlandırmak MAJOR ister (§4.0).
Sahip aynı gün "sürüm çıkma, bekle" kararı vermişti (madde 42 uygulaması); bir MAJOR bu
kararla çelişirdi. Adım 1 eklemelidir: yeni ad eklenir, eski ad aynı değeri taşımaya devam
eder ve `@deprecated` işaretlenir. Adım 2 (silme) bir sonraki MAJOR'a kalır.

**Kırıcı olmadığı ölçüldü.** Alan eklemek, sonucu elle kuran (`const x: PlateResult = {...}`)
ya da bütünüyle karşılaştıran (`toEqual`) tüketiciyi kırar. Tarandı: çekirdek dışında hiçbir
proje bunu yapmıyor; `yeniKayit`'i yalnız GHS-Panel okuyor (6 kaynak + 3 test/betik satırı).
Tam nesne karşılaştırması yalnız çekirdeğin kendi testlerinde vardı; güncellendi.

**Kaydın ortaya çıkardığı boşluk kapatıldı.** `api-surface.test.ts` yalnız fonksiyon adlarını
çiviliyordu; dönüş nesnesinin alan adları değişse hiçbir test kırılmazdı. `result-shape.test.ts`
artık `text.plate`, `phone`, `email`, `website`, `name`, `company` alanlarını çiviliyor.

### Madde 44 — kısaltmaya hâl eki (TB-014, iç bulgu)

**Otorite TDK'nın kendisi** (tdk.gov.tr, Yazım Kuralları → Kısaltmalar): büyük harfli
kısaltmada ek son harfin okunuşuna göre gelir (`BDT'ye`, `TDK'den`, `THY'de`, `TRT'den`,
`TL'nin`); kelime gibi okunan kısaltmada okunuşa göre (`ASELSAN'da`, `BOTAŞ'ın`,
`NATO'dan`, `UNESCO'ya`), sert ünsüz yumuşamaz (`AGİK'in`, `RTÜK'e`). On bir örneğin on
biri test olarak çivilendi.

**44A — kabul, dar tutuldu.** TDK'nın iki türü aynı biçimde yazılıyor. Kesin olan tek durum:
**hiç ünlü içermeyen** büyük harf dizisi kelime gibi okunamaz. Yalnız o harf harf okunur.
Harf adları TDK'den: be, ce, çe, de, fe, ge, he, je, ke (bkz. 44D), le… Türkçe
alfabede olmayan Q, W, X için fiilî okunuş (kü, ve, iks; §4.1 Sınır durumu 4).

**44B — kabul; daha ciddi olan buydu.** TB-014 çalışılırken TDK örneği `BOTAŞ'ın` da kırmızı
çıktı. Sebep: noktasız "AŞ" yazımını tanıyan kural adın sonuna bakıyordu ve "-aş" ile biten
her adı şirket kısaltması sanıyordu. Ölçüldü: `Ahmet Kocataş'ne` (doğrusu `Kocataş'a`),
`Karataş'nin`, `Yavaş'nde`, `Arkadaş'nden`. v3.5.0'dan (madde 34A) beri vardı. Aktaş, Bektaş,
Karataş yaygın soyadlarıdır ve GHS-Panel'in WhatsApp hatırlatma penceresi bu işlevi müşteri
adıyla `dat` hâlinde çağırıyor (`WhatsAppReminderModal.tsx:108,118,201,215`). Canlı
veride kaç müşteride tetiklendiği **ölçülmedi** (canlı veritabanına dokunulmadı).

**44C — red (ertelendi).** `ABD` (a-be-de, doğrusu `ABD'ye`) ile `AGİK` (kelime, `AGİK'in`)
aynı biçimde yazılıyor. Bir kural ikisini ayıramaz; bugünkü davranış (kelime okunuşu)
kalır ve testte "BİLİNEN SINIR" diye çivilendi. **Yeniden başvuru koşulu:** bir tüketicide
ünlülü harf harf kısaltmanın gerçek bir ekranda yanlış çıktığı ölçülürse. O zaman aday
çözüm, çağıranın okunuşu belirttiği bir ipucu seçeneğidir; çekirdek yine tahmin etmez.

**44D — sahip kararıyla istisna, emsal değildir.** TDK'nın harf adı "ke"dir ve kendi
örneği `TDK'den`dir; uzun biçime göre ek yalnız küçük harfli kısaltmalarda geçer (`kg'dan`).
Çekirdek sahibi, halk arasındaki okunuşu ("es-ge-ka") ve kurumların yaygın yazımını
(`SGK'ya`, `BDDK'ya`, `TSK'ya`) esas aldı: **K "ka" okunur.** Sonuç: `SGK'da`, `SGK'ya`;
TDK'nın kendi örneği bilerek `TDK'dan` çıkar. Değerlendirmede madde 25 emsali (TDK kuralına
aykırı sahip talebi reddedilmişti) sahibe sunuldu; sahip istisnayı seçti. Madde 17 gibi
"sahip kararıyla istisna" olarak işlendi, kural sessizce esnetilmedi.

**Ders — beklenen değer de kaynaktan okunur.** Kayıt açılırken `SGK'da` gündelik okunuştan
yazılmıştı; TDK'ye bakınca `SGK'de` çıktı. İki kaynak çelişince karar sahibe götürüldü.

### Talep #13 — rakamla biten özel ada hâl eki (madde 43)

**İddialar bağımsız ölçüldü: 7 çıktının 7'si birebir aynı** (v4.3.0). Kök neden talepte doğru
tarif edilmişti: ek adın son HARFİNDEN alınıyor, sondaki rakamlar atlanıyordu.

**Düzeltme `text.suffix` ile aynı kuralı kullanır**, ikinci bir ek mantığı yazılmadı. Sondaki
sayının okunuşunun son kelimesi ses çözümlemesine verilir. Doğrulama bağımsız bir kaynağa
dayanır: `0`–`3000` arası her sayı, beş hâlin hepsinde `text.suffix(n, 'number', hâl)` ile
birebir aynı eki veriyor (15.005 karşılaştırma).

**Yan bulgu kütüğe yazıldı, kovalanmadı.** Kontrol listesine konan `3D` bugün `3D'da`
veriyordu (doğrusu `3D'de`). Harf harf okunan kısaltmalar da yanlış (`THY'da`, `PTT'ta`,
`BMW'a`). Talep "harfle biten adlar değişmesin" dediği ve kısaltmanın harf harf mi kelime
gibi mi okunduğu metinden anlaşılamadığı için (madde 34D emsali) ayrı kayıt açıldı:
`docs/teknik-borc.md` TB-014.

**Neden sürüm çıkmadı.** 4.3.0 güncelleme PR'ları tüketicilerde aynı gün açılmıştı; yeni
sürüm onları kapatıp yeniden açacaktı (madde 42). Talebi gönderen prototip çekirdeği `main`
klonundan kullanıyor, düzeltme ona `main`'de ulaşıyor. Canlı kullanıcıdaki etki (GHS-Panel;
şirket, müşteri ve banka adları) rakamla biten ad nadir olduğu için düşük; ölçülmedi.

### Madde 42 — toplu sürüm kuralı (sahip kararı, 2026-09-24)

**Ne oldu.** Talep #12 (issue #48) 4.2.0 olarak tek başına yayınlandı. Aynı gün kabul
edilen talep #11'in üç maddesi (39C/D/F) kayıtta "bekliyor"du ve dakikalar sonra 4.3.0
gerekti. Her etiket bütün tüketicilerde yeni bir güncelleme PR'ı açıyor
(`core/abacus-core-vX.Y.Z` dalı) ve bir öncekini "aşıldı" diye kapatıyor. Tüketiciler aynı
gün iki kez güncellemek zorunda kaldı.

**Sahip kararı:** "Aynı dönem içinde gelmiş talepler birden fazlaysa tek bir paket
güncellemesiyle hepsi aynı pakete konur. Her yeni güncelleme ek iş yükü ve ek maliyettir."

**Uygulama:** `AI-RULES §4.3`. Makine zorlaması `scripts/check-release-batching.mjs`: kayıtta
son sütunu `bekliyor` olan satır varken sürüm değiştiren PR'ın CI'ı kırılır ve `main`'de
etiket atılmaz. Geriye dönük sınandı: 4.2.0 çıkarken kapı olsaydı "39C, 39D, 39F bekliyor"
diyerek sürümü durdururdu.

**Ders — "X'i uygula" talimatı sürümün kapsamı değildir.** Talimat #48'i söylüyordu. Ama
sürüm kararı, dönemin bütün kabul edilmiş maddelerine bakılarak verilir. Bekleyen madde
varsa sürümden önce sahibe sorulur.

### Madde 41 — `compact` trilyonu milyona terfi ettiriyordu (4.3.0 hazırlığında ölçüldü)

**Kabul; çekirdeğin kendi kusuru, ilk sürümden beri.** Yuvarlama sonrası üst ölçeğe terfi
kararı birimin HARFİNE bakıyordu (`unit === 'K' || unit === 'B'`). Varsayılan stilde `'B'`
milyar olduğu için milyar ölçeğinde yuvarlanan değer 1000'e ulaşınca "bin"miş gibi milyona
terfi ediyordu:

```
compactMajor(2e12)            -> '₺2M'    (doğrusu '₺2000B': MİLYON kat küçük)
compactMajor(999999999999)    -> '₺1M'    (doğrusu '₺1000B')
compactMajor(2e12, { style: 'B/Mn/Mr' }) -> '₺2000Mr' (Türkçe stilde harfler ayrı, doğruydu)
```

Madde 39D'nin ölçtüğü aynı belirsizliğin ('B' iki anlamlı) çekirdeğin içindeki hâli.
Düzeltme: ölçekler sıralı bir tabloda tutulur, terfi sıraya bakar ve en üst ölçek (milyar)
aşılmaz. Çekirdekte trilyon birimi yok; trilyon eklemek ayrı bir karardır.

**Neden MINOR içinde:** çıktısı değişen girdiler yalnız varsayılan stilde 1 trilyon ve
üstü; eski çıktı milyon kat yanlıştı (madde 38 emsali: yanlış çıktının düzeltilmesi).

### Talep #12 — `dotAsDecimal` kontrollü kutuda kendi çıktısını bozuyor (madde 40)

**İddialar bağımsız ölçüldü: 18 çıktının 18'i birebir aynı** (`ae1630d`, temiz kurulum).

**40A — kabul; madde 38 ile AYNI sınıf hata, ikinci kez.** Kontrollü kutuda her tuşta
kutunun önceki çıktısı yeniden biçimlenir. 1.000 ve üzerindeki her tutarda o çıktı bir
binlik noktası taşır ve bir sonraki tuşta ondalık sanılır: `8.534` + `0` → `8,5340`
(10.000 kat). Çekirdeğin ölçümü talebin görmediği bir yol daha buldu: **silme de
bozuk.** `85.340,` kutusunda virgül silinince `85,340` (1000 kat).

**Talebin önerdiği kural ALINMADI — ölçüldü, hatayı düzeltmiyor.** Öneri "binlik grup
desenine uymayan nokta ondalıktır" idi. Ama geri beslenen metin `8.5340`, yani nokta
dört hanelik bir grubun önünde; desene uymuyor ve yine ondalık sayılıyor. Silmede
gelen `85.34` de desene uymuyor. Kural üstelik madde 37'nin TAKAS sözleşmesini
değiştiriyordu: yapıştırılan `1.234`, `1,234` yerine `1.234` kalıyordu.

**Kök neden: durumsuz bir fonksiyon bunu bilemez.** `85.34` metninde nokta kullanıcıdan
da gelmiş olabilir (yapıştırdı) kütüphaneden de (`85.340`'tan bir rakam sildi). İki
niyet aynı metinde. Cevap önceki metinde: **`previous` seçeneği.** Önceki ve yeni metnin
ortak başı ve sonu değişmemiş kısımdır, oradaki noktalar kütüphanenin binlik
ayraçlarıdır; yalnız eklenen parçadaki nokta ondalık sayılabilir. `previous`
fonksiyonun kendi çıktısı değilse (ör. `String(98.5)`) durumsuz kurala düşülür.

| | 4.1.1 | talebin önerisi | 4.2.0 (`previous`) |
|---|---|---|---|
| tuş tuş `85340.50` | `8,534050` | `8,534050` | `85.340,50` |
| `85.340,`'tan virgül silinir | `85,340` | `85.340` → sonra `85,34` | `85.340` → `8.534` |
| boş kutuya `1.234` | `1,234` | `1.234` (TAKAS değişti) | `1,234` |

`previous` verilmezse davranış değişmez; bu yüzden MINOR. Kontrollü kutuda
`dotAsDecimal` açan tüketici `previous`'u da vermelidir (KILAVUZ'da örnek var).

**40B — kabul, adıyla birlikte.** Talep `maxFraction` önerdi; çekirdekte ondalık hane
sayısı her yerde `digits` (`FormatMoneyOptions.digits`, `fmtDecimalGrouped(v, digits)`),
bu yüzden `maxDigits`. Fazla hane **kesilir**, yuvarlanmaz. `0` tam sayı kutusudur.
Geçersiz değerde `'—'` (`text.digits` emsali).

**Ders — bir giriş seçeneği, kutunun kendi döngüsünde sınanmadan kabul edilmez.**
37A ve 38'in testleri adımları ham metinle veriyordu (`['9', '98', '98.', …]`);
gerçek kutuda adım `f(önceki çıktı + tuş)`'tur. Madde 38'in dersi "yeni kolun eski
girdilerle ne yaptığını ölç" idi; bu kez eski girdi, kütüphanenin **bir önceki tuştaki
kendi çıktısıydı.** 4.2.0 testlerinin hepsi çıktıyı kutuya geri besliyor; yazma,
silme, araya ekleme ve yapıştırma ayrı ayrı sınanıyor.

**Canlı etki: yok.** GHS-Panel seçeneği hiç kullanmıyor. trade-kasa'nın `NumField`
bileşeni seçeneği destekliyor, ama 2026-09-24 itibarıyla onu yalnız testi açıyor.

### Talep #11 — para gösterimi (madde 39)

**İddialar bağımsız ölçüldü: çekirdek çıktısı olan 19 satırın 19'u birebir aynı** (`ae1630d`;
20. satır panelin elle birleştirmesi, çekirdek çıktısı değil).

**Standart TCMB'nin kendi sayfasından okundu** (§4.2; talep ikincil kaynağa dayanıyordu).
TCMB SSS: simge rakamın **solunda ve boşluksuz**; yazılı metinde `Türk lirası` ya da
`TL`; grafik ve tablolarda simge; ikisi **aynı anda kullanılmaz**. Çekirdeğin çıktısı
buna zaten uyuyor. Sondaki simge (`1.234,56 ₺`) desteklenmez ve `parse` onu okumaz.

**39C — sıfırda simge: çekirdeğin kendi tutarsızlığı çıktı.** Metin biçimi sıfırda
kısaltmayı KORUYOR (`0,00 TL`), simge biçimi simgeyi DÜŞÜRÜYOR (`0,00`). Üstelik
`formatMajor(0.005, { kurus: true })` → `₺0,01` ama `formatMajor(0, { kurus: true })`
→ `0,00`. İlk commit'ten beri yazılı bir gerekçesi yok ve TCMB tablolarda simge istiyor.
Varsayılanı değiştirmek tüketicinin gördüğü çıktıyı değiştirir (§4.0 → MAJOR), bu
yüzden önce **seçenek** gelir; varsayılan bir sonraki MAJOR'a adaydır (madde 23 → 24
emsali). `compact(0)` da kapsanmalıdır (bugün `form: 'text'`'te bile `'0'`).

**39D — kısa biçim.** `digits` (sabit hane: `₺1,20 Mr`) ve `minScale` (1 milyonun altı
kısaltılmaz) alınır. `minScale` ayrıca çekirdekteki bir belirsizliği giderir: `'B'`
varsayılan stilde **milyar**, `B/Mn/Mr` stilinde **bin** demektir. `space` açık kaldı:
Türkçede sayı ile `Mn` arasına boşluk konup konmadığı bir yazım kaynağından okunmadan
seçenek eklenmez.

**39F — lint kuralı; kapsamı panelden geniş.** Kaba bir desen taraması (ölçüm değil;
hata ve günlük metinleri de dahil) elle `₺`/`TL` eklemeyi başka tüketicilerin `src`
dizinlerinde de gösterdi: SNN-Portfoy-Yonetimi ~26, SNN-Yonetici-Ozeti ~7. Kural
`strict`e girer (madde 35). Uyarı: GHS-Panel çekirdeğin ESLint paketini hiç
kullanmıyor; kural orada paket benimsenmeden etkisizdir.

---

### Talep #10 — `dotAsDecimal` karışık biçimi bozuyor (madde 38)

**Kabul; bu bir hata ve çekirdeğin kendi kusuru.** 37A değerlendirilirken **karışık biçim
(nokta ve virgül birlikte) hiç ölçülmedi.** Çekirdeğin kendi testleri `'1.234,56'`
vakasını `dotAsDecimal` altında denemiyordu; eklenen 22 testin hiçbiri bu yolu geçmiyordu.

**Sapma 1000 kat ve girdi kütüphanenin KENDİ çıktısı.** `fmtDecimalGrouped(1234.56, 2)`
zaten `'1.234,56'` üretiyor. Kullanıcı ekrandaki tutarı kopyalayıp kutuya yapıştırınca
değer bozuluyordu — yani çıktı kendi girdisini bozuyordu.

**Ders — bir seçenek eklerken, o seçeneğin AÇIK olduğu yolda mevcut geçerli girdilerin
hepsi yeniden sınanır.** 37A'da varsayılan yolun bozulmadığını titizlikle ölçtüm
(9 vaka, hepsi yeşildi) ama **yeni yolun** eski girdilerle ne yaptığını ölçmedim.
Kırıcı olmamak yetmiyor; yeni kolun kendi içinde doğru olması da gerekiyor.

**Tüketici doğru yaptı:** seçeneği açarken kırmızı-önce testi yazdı, kırıldığını gördü,
**seçeneği açmadı** ve bildirdi. Açsaydı canlıda 1000 katlık bir risk sapması olacaktı.

---

### Talep #9 — nokta ile ondalık yazımı (madde 37)

**Neden kabul edildi.** İmza yalnız metin biliyor (§4.1). Varsayılan değişmediği için
kırıcı değil; seçenek **opt-in**. Gerçek ekran: risk hesabı yapan bir stop kutusu, ölçülen
sapma **100 kat**.

**İddialar bağımsız ölçüldü** (`AI-RULES §4.2`: "talebin iddiaları uygulanmadan önce
ölçülür"). Talep v3.2.0'da ölçmüştü; **v4.0.0 üzerinde 11 vakanın 11'i birebir aynı**
çıktı. Talebin mekanizma tarifi bir noktada eksikti ve kayda doğrusu yazılıyor: nokta
"binlik ayracı sayılmıyor", `/[^0-9,]/g` ile **siliniyor** ve kalan rakamlar yeniden
gruplanıyor. Sonuç aynı, sebep farklı.

**v4.0.0'ın bu sorunu çözmediği de ölçüldü.** `parseNumber` sıkılaştırıldı ama süzgeç
kendisinden **önce** geçerli Türkçe biçim ürettiği için (`'98.50'` -> `'9.850'`)
`parseNumber` reddedeceği bir şey hiç görmüyor. İki kapı ayrı; biri diğerini kurtarmıyor.

**Varsayılan yapmak reddedildi (37B).** `1.234` yazan kullanıcı bin iki yüz otuz dört de
demiş olabilir, 1,234 de. Çekirdek tahmin etmez; kararı tüketiciye sorar. Varsayılanı
değiştirmek ayrıca kırıcı olurdu.

**Eksi işareti ertelendi (37C).** Talep bunu *bilgi olarak* bildirdi ve kendi projesinde
negatif kabul eden alan olmadığını ölçerek gösterdi. §4.1 Sınır durumu 3 gereği gerçek bir
ekran ihtiyacı görülmeden alınmadı; ihtiyaç duyan tüketici ölçümüyle başvurur.

**Talep iyi geldi.** Beş aday bakılmış, dördü elenmiş ve elemeler defterin kendi
emsallerine dayandırılmış (33C/33D ikinci kopya, 33E/34C tek ekran). Reddedilirse ne
yapacağını da yazmış — değerlendirme maliyetini düşüren şey budur.

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
| #9 | 19 Eylül 2026 | trade-kasa: `formatGroupedInput` nokta ile ondalık (issue #40) | 4.0.0 → 4.1.0 |
| #10 | 19 Eylül 2026 | trade-kasa: `dotAsDecimal` karışık biçim hatası (issue #42) | 4.1.0 → 4.1.1 |
| #11 | 24 Eylül 2026 | GHS-Panel: para gösterimi, proje varsayılanı, elle simge ekleme (issue #47) | 4.1.1 → 4.3.0 |
| #12 | 24 Eylül 2026 | GHS-Panel: `dotAsDecimal` kontrollü kutu hatası + hane sınırı (issue #48) | 4.1.1 → 4.2.0 |
| #13 | 24 Eylül 2026 | TYC Grup şartname özeti (prototip): rakamla biten özel ada hâl eki (issue #51) | 4.3.0 → main (yayınlanmadı) |
| #14 | 24 Eylül 2026 | Sahip: resmî kurum ve şirket unvanı kısaltması; GHS-Panel, SNN-İhale, SNN-Proje-Nakit ihtiyaç taraması (issue yok, sözlü) | main (yayınlanmadı) |
