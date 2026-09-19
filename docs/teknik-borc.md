# Teknik Borç Kütüğü

Fark edilen ama şimdi çözülmeyen sorunlar. **Açık borçlar için tek kaynak burasıdır.**
Kapanan kayıtlar: `docs/teknik-borc-arsiv.md`

> **Teknik borç nedir?** Bir işi hızlı bitirmek için kestirme yol kullanmak, sonradan
> ödenecek bir borç almak gibidir. Borç ödenmedikçe faizi (bakım zorluğu, hata riski) büyür.

> **Standart:** `~/.claude/standartlar/teknik-borc-standardi.md` · **Oluşturulma:** 2026-09-15 · **Açık:** 11 (P1: 0 · P2: 6 · P3: 5)

> **2026-09-15:** Kütük ilk kez oluşturuldu. Kayıtlar keşif turunda bulundu (dokümanlar, oturum günlüğü, kod, test/lint çıktıları); kritik iddialar bağımsız olarak yeniden ölçüldü. Ölçülemeyenler kayıt içinde "ölçülmedi/hipotez" diye belirtilmiştir.

## İçindekiler

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

---

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
- **Neden Şimdi Çözülmüyor:** Tek bir ad için ayrı bir major sürüm çıkarmak, 8 tüketiciyi yeni bir göçe zorlamak demektir; v4.0.0 ve v4.1.0 daha yeni yayıldı ve güncelleme PR'ları açık. Değer/maliyet oranı bir sonraki kırıcı sürümle birleştirmeyi gerektiriyor.
