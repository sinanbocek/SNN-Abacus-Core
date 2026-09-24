# Teknik Borç Kütüğü

Fark edilen ama şimdi çözülmeyen sorunlar. **Açık borçlar için tek kaynak burasıdır.**
Kapanan kayıtlar: `docs/teknik-borc-arsiv.md`

> **Teknik borç nedir?** Bir işi hızlı bitirmek için kestirme yol kullanmak, sonradan
> ödenecek bir borç almak gibidir. Borç ödenmedikçe faizi (bakım zorluğu, hata riski) büyür.

> **Standart:** `~/.claude/standartlar-canli/standartlar/teknik-borc-standardi.md` · **Oluşturulma:** 2026-09-15 · **Açık:** 2 (P1: 0 · P2: 1 · P3: 1)

> **2026-09-15:** Kütük ilk kez oluşturuldu. Kayıtlar keşif turunda bulundu (dokümanlar, oturum günlüğü, kod, test/lint çıktıları); kritik iddialar bağımsız olarak yeniden ölçüldü. Ölçülemeyenler kayıt içinde "ölçülmedi/hipotez" diye belirtilmiştir.

## İçindekiler

- **🟡 P2 — Planlı:** TB-014
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

---

---

## 🟡 P2 — Planlı

### TB-014 — Harf harf okunan kısaltmalar yanlış ek alıyor
- **Tespit Tarihi:** 2026-09-24 (issue #51, rakamla biten adların düzeltmesi sırasında)
- **Öncelik:** P2 (Planlı) — yanlış yazım kullanıcıya görünür; para ya da veri bozulmuyor.

#### 🟢 Sade Anlatım
- **Sorun ne?** Çekirdek kısaltmalara eki yanlış ekliyor: "THY'da" yazıyor, doğrusu "THY'de". Sebebi, eki harfin okunuşuna ("te-he-ye") göre değil, kısaltmanın içindeki harflere göre seçmesi.
- **Benzetme:** Birinin adını yazıdan tahmin edip yanlış telaffuz etmek gibi. "PTT"yi "pıt" diye okuyup "PTT'ta" demek.
- **Çözülmezse ne olur?** Kısaltma geçen mesajlarda (banka adları, kurum adları) ek yanlış çıkar. Okuyan anlar ama metin özensiz görünür.
- **Senden beklenen karar:** Yok. Çözüm yolu ölçülüp önerilecek; karar gerekirse o zaman sorulur.

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/text/index.ts` → `properNounSuffix`. Ünlü uyumu `lastVowel(sound) ?? 'a'`, sertlik `endsWithHardConsonant(sound)` ile ADIN HARFLERİNDEN alınıyor. Ölçüldü (2026-09-24, #51 düzeltmesinin üstünde): `3D'da` (doğrusu `3D'de`), `THY'da` (`THY'de`), `PTT'ta` (`PTT'de`), `BMW'a` (`BMW'ye`), `TBMM'dan` (`TBMM'den`), `SGK'ta` (`SGK'da`). Doğru çıkan: `NATO'da` (kelime gibi okunuyor). Ünlüsüz kısaltmada `lastVowel` `null` döner ve `'a'` varsayılanı kalın uyum verir; bu, 6 yanlışın çoğunu açıklıyor.
- **Etki:** GHS-Panel `properNounSuffix`'i banka ve şirket adlarıyla çağırıyor (`src/infrastructure/documentReader/bankReceipt/messages.ts:24,87`, `WhatsAppReminderModal.tsx:108,118,201,215`). Canlı veride ünlüsüz kısaltma adı geçiyor mu, ölçülmedi (hipotez: `HSBC`, `QNB` gibi banka adları).
- **Çözüm yönü:** Önce ölçülecek: tüketicilerde bu işleve giden adlarda kaç tanesi harf harf okunan kısaltma. Zorluk: `PTT` harf harf, `NATO` ve `TÜBİTAK` kelime gibi okunur; metinden ayırt edilemez. Madde 34D emsali: genel desen yerine kesinlik. Aday yol: yalnız **ünlüsüz** büyük harf dizisini harf harf oku (TDK harf adları: be, ce, çe, de, fe, ge, he, je, ke/ka, le, me, ne, pe, re, se, şe, te, ve, ye, ze), ünlü içerenleri bugünkü gibi bırak. `TEB` gibi ünlülü ama harf harf okunan kısaltmalar için sınır ölçülmeli.
- **Neden Şimdi Çözülmüyor:** #51'in kapsamı rakamla biten adlardı; talep "harfle biten adlar değişmesin" diyor. Kısaltma okunuşu ayrı bir tasarım kararı ve kelime listesi gerektirebilir (§4.1 Sınır durumu 3: emin değilsen alma).
- **Bağlı kalemler:** issue #51 (rakamla biten adlar, düzeltildi), `GERI-BILDIRIM-KAYDI.md` madde 34D.

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

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/text/index.ts:287` `PlateResult.yeniKayit: boolean`. Tarayıcı 19 geçiş sayıyor; hepsi bu tek alanın kullanımları (`docs-claims.test.ts`, `plate.test.ts`, `text/index.ts`). TB-012 temizliğinde 163 geçişin 144'ü kapatıldı, kalan yalnız bu.
- **Neden ayrı kayıt:** Yeniden adlandırma **genel API yüzeyini** değiştirir. `api-surface.test.ts` yalnız fonksiyon adlarını çiviler, dönüş tipi alanlarını değil — yani bu değişiklik testlerle yakalanmaz ama tüketicide derleme hatası verir. `AI-RULES §4.0`: kırıcı değişiklik daima MAJOR'dır.
- **Etki:** `text.plate` kullanan tüketiciler. Bugün ölçülmedi.
- **Çözüm yönü:** Bir sonraki MAJOR sürüme iliştir: `yeniKayit` → `newRegistration`, `MIGRATION-v5.md`'ye satır, `api-surface.test.ts`'e dönüş tipi alanlarını da çivileyen bir kontrol ekle (bu boşluk bu kayıtla ortaya çıktı).
- **Geçici istisna yazıldı (2026-09-19).** `.snn-kod-dili.json` içine `yeniKayit` için **geçiş istisnası** kondu; yoksa bu alanın bulunduğu satıra başka bir sebeple dokunmak bile kod dili kapısını kırıyor (ölçüldü: PR #43'te `text/index.ts:394`). İstisnanın gerekçesinde **kalıcı olmadığı** ve bu kayıtla birlikte silineceği yazılı. Tarayıcı artık eşleşmeyen istisnayı uyarıyor, yani gereksizleştiğinde görünür olacak.
- **Neden Şimdi Çözülmüyor:** Tek bir ad için ayrı bir major sürüm çıkarmak, 8 tüketiciyi yeni bir göçe zorlamak demektir; v4.0.0 ve v4.1.0 daha yeni yayıldı ve güncelleme PR'ları açık. Değer/maliyet oranı bir sonraki kırıcı sürümle birleştirmeyi gerektiriyor.
