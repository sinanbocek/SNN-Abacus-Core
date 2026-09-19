# Teknik Borç Kütüğü — Arşiv (kapanan kalemler)

> Bu dosya **kapanmış** teknik borç kayıtlarını tutar. Açık borçlar için
> **`docs/teknik-borc.md`** dosyasına bakın.
>
> Buradaki kayıtlar yalnızca tarihçe değildir; bir sonraki benzer işte okunması
> gereken **ders** içerir. Kapanış biçimi: `~/.claude/standartlar/teknik-borc-standardi.md` → Kapanış.
>
> **Kayıt sayısı:** 1 · **Oluşturulma:** 2026-09-15

---

## Kapanan Kalemler

- **Kapanış:** 2026-09-19 — **TB-002: Harfleri Türkçesiz büyüten fonksiyon (`toAsciiUpper`) yok.**
  - **Ne yapıldı (sade):** Çekirdeğe, harfleri büyütürken Türkçe harflere dokunmayan bir işlev eklendi; şasi numarası, ürün kodu, IBAN öneki gibi alanlar artık doğru büyüyor. İş bu kayıt açıldıktan sonra **talep #7 kapsamında** yapıldı ve v3.3.0 ile yayımlandı; kayıt kapatılmayı bekliyordu.
  - **Ölçülen sonuç:** `src/abacus/internal/tr-case.ts:61` `toAsciiUpper` var (kayıt "0 geçiş" diyordu). `src/abacus/text/index.ts:119` dışa açıyor. `api-surface.test.ts:41` yüzeyde sınıyor. `CHANGELOG.md` v3.3.0 ve `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md` (2 geçiş) belgeliyor. Kaydın "Çözüm yönü" maddelerinin **hepsi** karşılandı. Karar defterinde madde 33A.
  - **Ders:** Kayıt, işi yapan taleple (talep #7) aynı anda kapatılmadığı için **dört gün** yanlış bilgi taşıdı; issue #6 da açık kaldı. Bir talep bir TB'yi çözüyorsa, talebi işleyen PR **kütüğü de aynı commit'te** kapatmalı. Bu kayıt 2026-09-19'da ayrı bir denetimde yakalandı — denetim olmasa daha uzun sürerdi.


_Henüz kapanmış kayıt yok._
