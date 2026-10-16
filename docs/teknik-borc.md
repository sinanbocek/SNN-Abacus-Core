# Teknik Borç Kütüğü

Fark edilen ama şimdi çözülmeyen sorunlar. **Açık borçlar için tek kaynak burasıdır.**
Kapanan kayıtlar: `docs/teknik-borc-arsiv.md`

> **Teknik borç nedir?** Bir işi hızlı bitirmek için kestirme yol kullanmak, sonradan
> ödenecek bir borç almak gibidir. Borç ödenmedikçe faizi (bakım zorluğu, hata riski) büyür.

> **Standart:** `~/.claude/standartlar-canli/standartlar/teknik-borc-standardi.md` · **Oluşturulma:** 2026-09-15 · **Açık:** 2 (P1: 0 · P2: 1 · P3: 1)

> **2026-09-15:** Kütük ilk kez oluşturuldu. Kayıtlar keşif turunda bulundu (dokümanlar, oturum günlüğü, kod, test/lint çıktıları); kritik iddialar bağımsız olarak yeniden ölçüldü. Ölçülemeyenler kayıt içinde "ölçülmedi/hipotez" diye belirtilmiştir.

## İçindekiler

- **🟡 P2 — Planlı:** TB-015
- **🟢 P3 — Fırsatta:** TB-013

## Öncelikler

| Kod | Adı | Benzetme |
|---|---|---|
| P1 | Acil | Evde su kaçağı: bekledikçe hasar büyür |
| P2 | Planlı | Arabanın periyodik bakımı: bugün yürüyor ama ertelenirse arıza çıkar |
| P3 | Fırsatta | Dağınık dolap: rahatsız eder ama zarar vermez |

## Sözlük

| Terim | Türkçe karşılığı |
|---|---|
| NaN | JavaScript'te "sayı değil" anlamına gelen bozuk değer |
| Infinity | Sonsuz; hesap sınırı aşılınca çıkan değer |
| Test kapsamı (coverage) | Kodun yüzde kaçının testlerle sınandığı |
| Lint kuralı | Kod yazım hatalarını otomatik yakalayan denetim kuralı |
| Tüketici proje | Bu kütüphaneyi kullanan proje (GHS, Portföy, Yönetici Özeti, Günüm Var, trade-kasa) |
| Kırıcı değişiklik (major) | Kullanan projelerde kodun değişmesini gerektiren sürüm |
| Tanımlayıcı | Kodda bir şeye verilen ad: dosya adı, değişken, fonksiyon, tip |
| Turnike (CI kapısı) | Her değişiklikte otomatik çalışan, kuralı sağlamayan işi geçirmeyen denetim |
| Ünlü uyumu | Ekin ünlüsünün kelimenin son ünlüsüne uyması: ev-de, okul-da |
| Hâl eki | Ada gelen -de, -den, -e, -in, -i ekleri (İstanbul'da, THY'den) |
| Unvan | Bir şirketin ya da kurumun resmî, tam adı (… Limited Şirketi, … Genel Müdürlüğü) |

---

---

## 🟡 P2 — Planlı

### TB-015 — Firma adı düzelticisi bağlama bakmadan kısaltıyor ve tam unvanı saklamıyor
- **Tespit Tarihi:** 2026-09-24 (resmî kısaltma ihtiyaç taraması sırasında, madde 46)
- **Öncelik:** P2 (Planlı)

#### 🟢 Sade Anlatım
- **Sorun ne?** Çekirdekteki firma adı düzelticisi, "Sanayi" ve "Ticaret" kelimelerini nerede görürse kısaltıyor. "Sanayi Mahallesi" "San. Mahallesi" oluyor, "Ticaret Odası" "Tic. Odası" oluyor. Bitişik yazılmış "İNŞ.SAN.TİC.LTD.ŞTİ." bozuluyor. "T.C." "T.c." oluyor, "ABC" "Abc" oluyor. Üstelik kısaltılmış adı "saklanacak ad" olarak veriyor; tam unvan kayboluyor.
- **Benzetme:** Nüfus cüzdanına lakabınızı yazan bir memur gibi. Günlük hayatta işe yarar ama resmî bir belgede tam adınız lazım olduğunda elinizde yoktur.
- **Çözülmezse ne olur?** Bu işlevi kullanan projeler tam unvanı veritabanına yazamaz. Faturada ya da resmî yazıda tam unvan gerektiğinde elde yoktur. Mahalle, oda gibi adlar yanlış kısalır.
- **Senden beklenen karar:** Yok. Sahip kararı (2026-09-24, madde 46B): işlev şimdi olduğu gibi kalır, düzeltme bir sonraki ana sürümde yapılır.

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/text/index.ts:484` `company()`, sözlükler `:68-99` (`PRESERVED_ABBREVIATIONS`, `MULTI_WORD_COMPANY_MAP`, `SINGLE_WORD_COMPANY_MAP`). Ölçüldü (2026-09-24, `main` 79d94cc, 13 adla):
  - `Sanayi Mahallesi Muhtarlığı` → `San. Mahallesi Muhtarlığı`; `Ticaret Odası` → `Tic. Odası`. Tek kelime sözlüğü bağlamsız uygulanıyor.
  - `XYZ İNŞ.SAN.TİC.LTD.ŞTİ.` → `Xyz İnş.san.tic.ltd.şti.`. Noktayla bitişik yazım tek kelime sayılıyor, sözlüğe uymuyor, `title()`'a düşüyor.
  - `T.C. ÇEVRE, …` → `T.c. Çevre, …`; `ABC İNŞAAT …` → `Abc İnş. …`. Büyük harf kısaltma korunmuyor; yalnız `PRESERVED_ABBREVIATIONS` listesindekiler korunuyor.
  - `PRESERVED_ABBREVIATIONS` içinde `'TYC'` var. Bu tek bir şirketin adı; `AI-RULES §4.1` sınavından geçmez.
  - `NormalizeResult.stored` kısaltılmış adı taşıyor, `display` ile aynı. Tam unvan yalnız `raw`'da kalıyor (temizlenmemiş hâliyle).
- **Etki:** Çekirdek dışında yalnız GHS-Panel çağırıyor: `src/infrastructure/documentReader/bankReceipt/fields.ts:92` (dekonttaki gönderen, alıcı ve banka adı; `.stored` alınıyor). SNN-Proje-ve-Nakit-Akış ve SNN-İhale çağırmıyor. Proje-Nakit'in kendi kopyası (`LangEngine.normalizeCompanyName`) aynı "kayıtta kısalt" sorununu taşıyor; o tüketicinin işidir (madde 46 geri bildirimi). Dekontlarda "Sanayi Mahallesi" gibi bir adın geçip geçmediği **ölçülmedi**.
- **Çözüm yönü:** Bir sonraki MAJOR'da: (1) `stored` tam unvanı tutsun (yalnız boşluk ve harf düzeni), kısaltma madde 46A'nın gösterim işlevine devredilsin; (2) `Sanayi`/`Ticaret` yalnız unvan sonundaki ek dizisinde kısaltılsın; (3) noktayla bitişik yazım parçalanarak okunsun; (4) büyük harf kısaltma (`T.C.`, harf dizisi) korunsun; (5) `'TYC'` listeden çıkarılsın. Her biri önce kırmızı test olarak yazılır. Beklenen değerler TDK Kısaltmalar Dizini'nden ve madde 46'daki derlemden alınır. `MIGRATION-v5.md`'ye GHS-Panel satırı yazılır.
- **Neden Şimdi Çözülmüyor:** Beş düzeltmenin hepsi tüketicinin gördüğü çıktıyı değiştirir; `AI-RULES §4.0` gereği MAJOR ister. Sahip kararı (2026-09-24): sürüm acelesi yok; düzeltme bir sonraki ana sürümde, TB-013 adım 2 ile birlikte yapılır.
- **Bağlı kalemler:** TB-013 (aynı ana sürümü bekliyor). Madde 46A, 46B (`GERI-BILDIRIM-KAYDI.md`).

---

## 🟢 P3 — Fırsatta

### TB-013 — `text.plate` çıktısındaki `yeniKayit` alanı Türkçe
- **Tespit Tarihi:** 2026-09-19 (TB-012 temizliğinden arta kalan tek ad)
- **Öncelik:** P3 (Fırsatta)

#### 🟢 Sade Anlatım
- **Sorun ne?** Plaka okuyucunun döndürdüğü sonuçta bir alanın adı Türkçe: `yeniKayit`. Aile kuralı adların İngilizce olmasını istiyor. Ama bu ad **dışarıya açık**: kütüphaneyi kullanan projeler doğrudan bu adı yazıyor.
- **Benzetme:** Bir ürünün üstündeki etiketi değiştirmek kolaydır; ama o etiketi kullanan sekiz mağazanın raf düzenini de değiştirmek gerekir.
- **Çözülmezse ne olur?** Tek bir ad Türkçe kalır. Çalışma zamanı etkilenmez.
- **Senden beklenen karar:** Yok — bir sonraki kırıcı sürümle birlikte yapılır.
- **Durum (2026-09-24):** Yarısı yapıldı. İngilizce ad `newRegistration` eklendi, eski ad "eskidi" diye işaretlendi; ikisi aynı değeri taşıyor. Kalan tek iş, bir sonraki ana sürümde eski adı silmek.

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/text/index.ts:287` `PlateResult.yeniKayit: boolean`. Tarayıcı 19 geçiş sayıyor; hepsi bu tek alanın kullanımları (`docs-claims.test.ts`, `plate.test.ts`, `text/index.ts`). TB-012 temizliğinde 163 geçişin 144'ü kapatıldı, kalan yalnız bu.
- **Neden ayrı kayıt:** Yeniden adlandırma **genel API yüzeyini** değiştirir. `api-surface.test.ts` yalnız fonksiyon adlarını çiviler, dönüş tipi alanlarını değil — yani bu değişiklik testlerle yakalanmaz ama tüketicide derleme hatası verir. `AI-RULES §4.0`: kırıcı değişiklik daima MAJOR'dır.
- **Etki:** Ölçüldü (2026-09-24): çekirdek dışında yalnız GHS-Panel okuyor — 6 kaynak satırı (`vehiclePlate.ts:35`, `legacyPlateClassifier.ts:42`, `useQuoteOpportunities.ts:45`, `quoteState.ts:167-168`, `CustomerInfoCard.tsx:65`) + 3 test/betik satırı. Hiçbir tüketici `PlateResult`'ı elle kurmuyor ya da bütünüyle karşılaştırmıyor.
- **Çözüm yönü:** İki adım. **Adım 1 — YAPILDI (2026-09-24, MINOR, `main`'de yayınlanmadı):** `PlateResult.newRegistration` eklendi, `yeniKayit` `@deprecated` işaretlendi, ikisinin eşitliği `plate-new-registration.test.ts` ile çivili; dönüş nesnesi alanlarını çivileyen kilit eklendi (`result-shape.test.ts` — bu kaydın ortaya çıkardığı boşluk). **Adım 2 — bir sonraki MAJOR:** `yeniKayit` alanını ve `.snn-kod-dili.json`'daki geçiş istisnasını sil, `result-shape.test.ts` listesinden çıkar, `MIGRATION-v5.md`'ye satır yaz (GHS-Panel'in 6 satırı `yeniKayit` → `newRegistration`); sonra kaydı kapat.
- **Geçici istisna yazıldı (2026-09-19).** `.snn-kod-dili.json` içine `yeniKayit` için **geçiş istisnası** kondu; yoksa bu alanın bulunduğu satıra başka bir sebeple dokunmak bile kod dili kapısını kırıyor (ölçüldü: PR #43'te `text/index.ts:394`). İstisnanın gerekçesinde **kalıcı olmadığı** ve bu kayıtla birlikte silineceği yazılı. Tarayıcı artık eşleşmeyen istisnayı uyarıyor, yani gereksizleştiğinde görünür olacak.
- **Neden Şimdi Çözülmüyor:** Tek bir ad için ayrı bir major sürüm çıkarmak, 8 tüketiciyi yeni bir göçe zorlamak demektir. Sahip kararı (2026-09-24): sürüm çıkmaz, bekleyenler bir sonraki taleplerle toplu yayınlanır. Adım 1 bu sürede tüketicilerin kendi hızlarında geçmesine izin verir; adım 2 ancak bir MAJOR ile yapılabilir.
