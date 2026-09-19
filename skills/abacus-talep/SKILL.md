---
name: abacus-talep
description: SNN-Abacus-Core çekirdeğine talep, hata bildirimi ya da eksik yetenek bildirimi gönderir. "Bu çekirdekte olmalı", "abacus'a ekleyelim", "çekirdekte şu eksik", "bunu her projede yeniden yazıyoruz" durumlarında kullan. Talebi hazırlar, §4.1 yerleştirme sınavını yazılı uygular, kullanıcıya gösterir, ONAYLA gönderir.
---

# Çekirdeğe talep gönder (SNN-Abacus-Core)

Bu beceri, bir tüketici projeden çekirdek depoya (`sinanbocek/SNN-Abacus-Core`) **talep iletir**.
Taleple birlikte gelen kanıt değerlendirme maliyetini belirler; kanıtsız talep değerlendirilemez.

> **Kural:** dış etkili iştir (başka bir depoda issue açılır). **Kullanıcı onayı olmadan gönderme.**

Çekirdeğin aile standardından **farkı**: buraya giren her şey 8 tüketici projeye giriyor ve
geri çıkarmak kırıcı sürüm demek (`AI-RULES §4.1` Sınır durumu 3). Bu yüzden burada dört değil
**beş** şart vardır; beşincisi §4.1 yerleştirme sınavıdır ve **atlanamaz**.

---

## 1. Önce karar defterini oku — aynı talep reddedilmiş olabilir

Defter: çekirdek deposundaki `GERI-BILDIRIM-KAYDI.md`. Yerelde çekirdek kopyası yoksa:

```bash
gh api repos/sinanbocek/SNN-Abacus-Core/contents/GERI-BILDIRIM-KAYDI.md \
  --jq '.content' | base64 -d
```

Aradığın şey orada **REDDEDİLDİ** olarak duruyorsa gerekçesini oku. **Aynı talep ikinci kez
değerlendirilmez.** Gerekçeyi değiştiren **yeni bir olgu** varsa (ikinci bir tüketici, ikinci bir
ekran, değişmiş bir kısıt) o olguyu **göstererek** yeniden başvurulur — madde numarasına atıf yap.

Defterde `⚠️ Kabul — sahip kararıyla istisna` diye işaretli satırlar vardır. Bunlar **emsal
değildir**; "şuna izin verilmişti" diye dayanak gösterme.

---

## 2. Talep türünü seç

| Tür | Ne zaman |
|---|---|
| **yeni-yetenek** | Çekirdekte olmayan bir fonksiyon/motor öneriliyor |
| **hata** | Çekirdek yanlış sonuç veriyor ya da çöküyor |
| **davranis-degisikligi** | Var olan fonksiyonun davranışı/varsayılanı değişsin |
| **belge** | Belge yanlış, eksik ya da yanıltıyor |
| **soru** | Kararın ya da davranışın gerekçesi anlaşılmadı |

---

## 3. Dört şartı topla — eksikse talep değerlendirilemez

Bu dört şart **defterden alınır** (`GERI-BILDIRIM-KAYDI.md` → "Talep nasıl gönderilir").
Kendi kelimelerinle yeniden türetme; iki yerde iki liste durursa hangisinin geçerli olduğu
tartışma konusu olur.

1. **Gerçek bir ekranda karşılaşılmış ihtiyaç.** Hangi dosya, hangi satır, hangi ekran.
   Varsayımsal genellik yeterli değildir.
2. **`AI-RULES §4.1` yerleştirme sınavı yazılı olarak uygulanmış.** → 4. adım.
3. **Ölçülmüş çıktı.** İddia değil, **çalıştırılmış komutun çıktısı**.
4. **Değerlendirilmiş alternatif.** Neden tüketicide kalamıyor?

Ayrıca **kullandığın çekirdek sürümünü** yaz (`package.json` içindeki `@snn/abacus-core`
satırı). Hangi sürümde yaşandığı önemlidir.

```bash
grep -n "abacus-core" package.json
```

---

## 4. §4.1 sınavını YAZILI uygula — beşinci şart, atlanamaz

Bu adım Abacus'a özgüdür. **Boşsa talep gönderilmez.** "Sonra bakarız" diye boş bırakılamaz.

> **SINAV:** Başka bir şirketin, başka bir alandaki uygulaması bu fonksiyonu
> **aynen** kullanabilir miydi?
>
> - **Evet** → çekirdeğe girer.
> - **Hayır** → tüketici projede kalır.

**Pratik ayıraç** (AI-RULES'tan, değiştirilmeden alınır): fonksiyonun adında ya da imzasında
**işe ait bir kavram** geçiyorsa (kasa, trade, pozisyon, ödeme, proje, tedarikçi, abone,
sipariş, ihale, araç…) **uygulamaya aittir**. Yalnızca **sayı, para, metin, tarih, birim**
biliyorsa **çekirdeğe aittir**.

Tabloyu doldur:

| Aday iş | İmzası | Başka alandaki uygulama aynen kullanır mıydı? | Karar |
|---|---|---|---|
| | | | |

**Elenen adayları da yaz.** İyi talebin işareti, talebin **elenerek** geldiğini göstermesidir;
defter bunu açıkça söylüyor ("kaç aday bakıldı, kaçı geçti, elenenler neden elendi").

Referans — 2026-09-17 giriş süzme talebi (defterde madde 33, sürüm 3.3.0):

- `digitsOnly(raw, maxLength?)` → **çekirdek** önerildi, `text.digits` olarak alındı:
  yalnız metin ve sayı bilir.
- `vehicleValueInput(...)` → **elendi**: "araç" alan kavramı, uygulamaya ait.
- `input.groupedAmount` / `input.amountToNumber` → **elendi** (red): `money.formatGroupedInput`
  ve `money.parseNumber` zaten vardı. Önermeden önce çekirdekte var mı diye bak.

**Sahip kararı istisnası.** `AI-RULES §4.2`: çekirdek sahibi bir §4.1 önerisini geçersiz
kılarsa karar uygulanır ve deftere *"sahip kararıyla istisna — emsal değildir"* diye işlenir.
Red ya da beklenmedik kabul gelirse kullanıcıya bunu böyle aktar.

---

## 5. Taslağı kullanıcıya göster

Göndermeden önce sohbete **olduğu gibi** dök ve onay iste. Eksik şart varsa söyle:

> *"§4.1 sınavı yazılmadı; böyle gönderirsem değerlendirilemez."*

Taslağı geçici bir dosyaya yaz (çalışma alanı dışına, oturumun scratchpad klasörüne).
Depoya talep taslağı commit'leme.

---

## 6. Onay gelince gönder

```bash
gh issue create -R sinanbocek/SNN-Abacus-Core \
  --title "[<tür>] <tek cümlelik özet>" \
  --label talep \
  --body-file <taslak-dosyası>
```

Gövde, issue şablonundaki başlıkları taşır: **Tür · Tüketici proje · Kullanılan çekirdek
sürümü · 1. Gerçek olay · 2. Ölçülmüş çıktı · 3. Denenen alternatif · 4. Kaç tüketiciyi
etkiliyor · 5. §4.1 sınavı · Beklenen sonuç**.

Etiket yoksa `gh` hata verir; bir kez açılır:

```bash
gh label create talep -R sinanbocek/SNN-Abacus-Core --color 0E8A16 \
  --description "Tuketici projeden gelen talep"
```

Sonra kullanıcıya **tek satır** bildir: `Talep gönderildi: #<no> — <başlık>` + adres.
Ardından **asıl işe dön**; cevabı bekleme.

---

## Cevap nasıl gelir? — aile standardından FARKLI

SNN-Standartlar'da kabul edilen düzeltme birleşir ve **kendiliğinden** tüm projelere ulaşır.
**Abacus'ta böyle değildir:**

```
talep kabul edilir
  → çekirdekte kod + test yazılır
  → CHANGELOG + sürüm yükseltilir, etiket atılır (vX.Y.Z)
  → SNN-Standartlar'dan `node core/propagate.js --surum vX.Y.Z --uygula` çalıştırılır
  → tüketicilerde GÜNCELLEME PR'ı açılır
  → her tüketici kendi PR'ını inceler ve birleştirir      ← insan kararı, otomatik değil
```

Kullanıcıya tek cümleyle söyle:

> **"Kabul edilirse çekirdeğe yeni bir sürümle girer; bu projeye bir güncelleme PR'ı olarak
> gelir, kendiliğinden inmez."**

`Gunum-Var` **sabit etikete** bağlıdır (`#v3.2.0`, `semver:` değil) — ona güncelleme PR'ı hiç
gelmez; elle yükseltilir. Talep Gunum-Var'dan geliyorsa bunu ayrıca söyle.

Karar her hâlükârda **`GERI-BILDIRIM-KAYDI.md`'ye** yazılır — kabul sürümüyle, red gerekçesi ve
yeniden başvuru koşuluyla.

---

## Yapma

- **Onaysız gönderme.** Başka bir depoda issue açmak dış etkili iştir.
- **Çekirdeğe doğrudan kod yazma.** Talep issue ile gelir; kodu çekirdeğin kendi oturumu yazar.
- **Tüketici projelerin dosyalarına dokunma.** Ölçüm için okunur; değişiklik o projenin ajanına aittir.
- **§4.1 sınavını atlama.** Boşsa talep gönderilmez.
- **Ölçmediğini iddia etme.** Ölçmediysen "ölçmedim" yaz, tahmin yazma.
- **Reddedilmiş talebi yeni olgu göstermeden tekrarlama.**
