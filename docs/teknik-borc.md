# Teknik Borç Kütüğü

Fark edilen ama şimdi çözülmeyen sorunlar. **Açık borçlar için tek kaynak burasıdır.**
Kapanan kayıtlar: `docs/teknik-borc-arsiv.md`

> **Teknik borç nedir?** Bir işi hızlı bitirmek için kestirme yol kullanmak, sonradan
> ödenecek bir borç almak gibidir. Borç ödenmedikçe faizi (bakım zorluğu, hata riski) büyür.

> **Standart:** `~/.claude/standartlar/teknik-borc-standardi.md` · **Oluşturulma:** 2026-09-15 · **Açık:** 11 (P1: 0 · P2: 6 · P3: 5)

> **2026-09-15:** Kütük ilk kez oluşturuldu. Kayıtlar keşif turunda bulundu (dokümanlar, oturum günlüğü, kod, test/lint çıktıları); kritik iddialar bağımsız olarak yeniden ölçüldü. Ölçülemeyenler kayıt içinde "ölçülmedi/hipotez" diye belirtilmiştir.

## İçindekiler

- **🟡 P2 — Planlı:** TB-012

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

## 🟡 P2 — Planlı




### TB-012 — Kod dili standardına uyum yok: 43 Türkçe tanımlayıcı var, turnike hiç kurulmamış
- **Tespit Tarihi:** 2026-09-19 (abacus-talep yolu kurulurken kanca uyarısı; ardından bağımsız ölçüm)
- **Öncelik:** P2 (Planlı)

#### 🟢 Sade Anlatım
- **Sorun ne?** Aile kuralı şunu diyor: kodun içinde şeylere verilen adlar İngilizce olur; açıklamalar, belgeler ve kullanıcının gördüğü yazılar Türkçe kalır. Bu depoda 43 ad bu kurala uymuyor. Asıl sorun sayı değil: **kuralı kontrol eden kapı hiç kurulmamış**, bu yüzden her yeni iş sessizce birkaç tane daha ekliyor.
- **Benzetme:** Depoda "girişte kask takılır" yazısı asılı ama kapıda kimse yok. Kask takmayan giriyor, kimse saymıyor; yazı kendi kendine çalışmıyor.
- **Çözülmezse ne olur?** Sayı büyümeye devam eder ve bir gün topluca düzeltmek pahalı hâle gelir. Ayrıca bu kütüphaneyi kullanan 8 projeye "kurala uyun" demek zorlaşır; çekirdek kendisi uymuyorsa kural gevşer.
- **Senden beklenen karar:** Yok — ikisi de 2026-09-19'da karara bağlandı. Kapı kuruldu, plaka adları istisna yazıldı. Geriye kalan 38 adın çevrilmesi planlı iş.

#### 🔧 Teknik Detay
- **Açıklama:** `node <ev>/.claude/standartlar-canli/quality/code-language-scan.js --tumu` (2026-09-19, v3.3.0) **43 farklı tanımlayıcı / 103 satır atfı** buluyordu. **Güncel: 37 ayrı ad / 163 geçiş, 15 dosya** (2026-09-19 akşam ölçümü). Sayı iki kez değişti: plaka istisnası 5 düşürdü (43→38), sonra ortak tarayıcının kök listesi genişledi (38→37 ad ama geçiş sayısı arttı). **Kütüğe yazılan sayı ortak tarayıcıya bağlıdır ve kendiliğinden değişir.**
- **Kapsam ölçüldü ve kayıttakinden BÜYÜK.** Tarayıcının kök listesi her Türkçe adı görmüyor: yalnız `math/index.ts`'te tarayıcı 6 ad işaretliyor ama dosyada **28** Türkçe tanımlayıcı var (`fark`, `paylar`, `artik`, `akis`, `aday`, `olcek`, `kesir`… listede yok). İşaretlileri çevirip ötekileri bırakmak dosyayı yarı Türkçe bırakır — iki uçtan da kötü.
- **Metin tabanlı toplu değiştirme ÇALIŞMAZ; denendi ve geri alındı (2026-09-19).** `math/index.ts` sözcük sınırlı `sed` ile çevrildi, 1037 test geçti, ama **Türkçe yorumlar bozuldu**: *"toplam 1–2 birim sapar"* → *"sum 1–2 birim sapar"*, *"alt birim: kuruş"* → *"low birim: kuruş"*. Aile standardı yorumların Türkçe kalmasını şart koşuyor. Ölçüm: tek dosyada **43 kod + 10 yorum** satırı el denetimi ister; 15 dosyada ~150 + ~150. Oturum kancası "129 bulgu" diyor; bu sayı tarayıcının kendi çıktısıyla **tutmuyor**, aradaki farkın nereden geldiği ölçülmedi. Dosya dağılımı: `scripts/beceri-dogrula.mjs` 8, `src/abacus/text/index.ts` 6, `src/abacus/math/index.ts` 6, `src/abacus/kilavuz.test.ts` 4, `src/abacus/spec-surface.test.ts` 3, `src/abacus/money/index.ts` 3, `src/abacus/math/allocate.test.ts` 3, `src/abacus/date/index.ts` 2, kalanlar 1'er. Eksik olan iki altyapı: `.github/workflows/kod-dili.yml` **yok** (aile standardı `ornek/kod-dili.yml` şablonu sunuyor) ve `.snn-kod-dili.json` istisna dosyası **yok**.
- **Etki:** Kod okunabilirliği ve aile standardı uyumu. Çalışma zamanı davranışı etkilenmiyor — hiçbiri hata üretmiyor.
- **Çözüm yönü:** (1) ~~Turnikeyi kur~~ **YAPILDI (2026-09-19):** `.github/workflows/kod-dili.yml` kuruldu. Turnike yalnız **eklenen satırları** tarıyor, bu yüzden mevcut 43 ad için geçiş istisnası yazmak gerekmedi — yenilerin girişi kapandı, geçmiş açık kaldı. (2) ~~Plaka adlarına istisna yaz~~ **YAPILDI (2026-09-19):** `.snn-kod-dili.json` içinde `plaka` kökü, dayanağı GERI-BILDIRIM-KAYDI.md talep #4. **Not:** standardın tablosu `plaka → plate` çevirisini öneriyor, örnek JSON'u ise `plaka`yı istisna gösteriyor; ikisi çelişiyor. Sahip kararı istisna yönünde. Çelişki SNN-Standartlar'a bildirilmedi — bildirilirse bu satır güncellenir. (3) Kalanları dosya dosya çevir; test dosyası adları (`giris-suzme.test.ts`, `suffix-sayi.test.ts`) yeniden adlandırılırken `vitest.config.ts` include deseni ve kapsam eşikleri kontrol edilsin.
- **Neden Şimdi Çözülmüyor:** Kapı ve istisna 2026-09-19'da kapandı; **geriye kalan 38 adın çevrilmesi** açık. Toplu değiştirme kuralı gereği dosya dosya yapılır ve turnike yenileri zaten engellediği için aceleye gerek yok.

---
