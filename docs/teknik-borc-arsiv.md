# Teknik Borç Kütüğü — Arşiv (kapanan kalemler)

> Bu dosya **kapanmış** teknik borç kayıtlarını tutar. Açık borçlar için
> **`docs/teknik-borc.md`** dosyasına bakın.
>
> Buradaki kayıtlar yalnızca tarihçe değildir; bir sonraki benzer işte okunması
> gereken **ders** içerir. Kapanış biçimi: `~/.claude/standartlar/teknik-borc-standardi.md` → Kapanış.
>
> **Kayıt sayısı:** 7 · **Oluşturulma:** 2026-09-15

---

## Kapanan Kalemler

- **Kapanış:** 2026-09-19 — **TB-005: Dağıtılan lint kuralı "eksik değere sessizce sayı koyma" hatasını kaçırıyor.**
  - **Ne yapıldı (sade):** "Hesaplanamadı" cevabını uydurma bir sayıyla değiştirmeyi yasaklayan kural, artık kütüphaneyle birlikte dağıtılıyor ve yalnız sıfırı değil aranmış bir değere konan **her** sayıyı yakalıyor.
  - **Ölçülen sonuç:** Kural `eslint/index.js`'e taşındı (`SILENT_DEFAULT_GATES`), `configs.recommended` içine girdi; `INSTALL §6.2`'deki kopya kaldırılıp pakete yönlendirildi. Yakaladıkları ve **yakalamadıkları** programatik ESLint koşumuyla çivilendi (11 test): `GERI_GUN[kod] ?? 1`, `toMinor(v) ?? 0`, `liste[0] ?? -1`, `deger ?? 0` yakalanıyor; `opts?.digits ?? 1`, `options.digits ?? 2`, `deger ?? 'yok'` geçiyor. Sürüm 3.4.0.
  - **Ders:** İlk yazdığım geniş kural ("her sayısal literali yakala") **çekirdeğin kendi kodunda** yanlış alarm verdi: `opts?.digits ?? 1` (`unit/index.ts:112`) meşru bir seçenek varsayılanıdır. Kapıyı yazarken önce **kendi kodunda** koştur; yanlış alarm veren kapı tüketicide susturulur ve gerçek hatayı da kör eder. Ayrım şu çıktı: *aranmış/hesaplanmış değer* (çağrı sonucu, tablo araması) ile *çağıranın atlayabileceği seçenek* farklı şeylerdir. Kaydın yanlış bir iddiası da düzeltildi: kural `eslint/index.js`'te değil, `INSTALL` şablonundaydı.

- **Kapanış:** 2026-09-19 — **TB-008: Oturum günlüğü bir aydır güncellenmemiş.**
  - **Ne yapıldı (sade):** Dosya silindi. Kayıt tutma işini fiilen `GERI-BILDIRIM-KAYDI.md` (neden) ve `CHANGELOG.md` (ne) üstlenmişti; üçüncü ve eskiyen bir anlatı gereksizdi. Sahip kararı.
  - **Ölçülen sonuç:** `.agent/session_log.md` 18 Ağustos'tan beri değişmemişti ve "v1.1.0" diyordu. **Kayıtta yazmayan bir olgu ölçüldü: dosya git tarafından hiç izlenmiyordu** (`git ls-files .agent` → 0); `.agent` zaten `.gitignore`'daydı. Yani kayıt boyunca "depoda eski bir günlük var" sanılan şey, aslında yalnız yerel bir dosyaydı. Silme işlemi bu yüzden commit'te görünmez.
  - **Ders:** "Depoda şu dosya var" demeden önce `git ls-files` ile bak. Çalışma klasöründe durmak ile depoda durmak aynı şey değil; kayıt bir ay boyunca bu ayrımı yapmadan durdu.

- **Kapanış:** 2026-09-19 — **TB-009: Depoda ilk sürümden kalma eski bir commit mesajı dosyası duruyor.**
  - **Ne yapıldı (sade):** `commit_msg.txt` depodan silindi ve bir daha girmesin diye yok sayılanlar listesine eklendi. Sahip kararı.
  - **Ölçülen sonuç:** `git rm commit_msg.txt`; `.gitignore`'a `commit_msg.txt` eklendi. Dosya ilk sürüme ait "7 motor… 163 unit test" diyordu; gerçek **45 dosya / 1021 test**. Depo public olduğu için yanlış bilgi dışarıdan okunabiliyordu.
  - **Ders:** Geçici dosyayı silmek yetmez, yok sayılanlara da yazılır; yoksa bir sonraki oturumda aynı ad yeniden commit'lenir. Kayıttaki karşılaştırma sayısının kendisi de eskimişti (43/979 yazıyordu) — kayıtlara sayı yazarken ölçüm tarihini de yazmak gerekiyor.


- **Kapanış:** 2026-09-19 — **TB-003: İşlem hesaplama bölümünde geçersiz girdi kolları test edilmemiş.**
  - **Ne yapıldı (sade):** Yatırım hesaplarında "girdi bozuksa ne olur" durumlarını sınayan testler yazıldı. İki kol savunma amaçlı sanılıyordu; ölçünce **ulaşılabilir** oldukları çıktı ve gerçek örneklerle çivilendi.
  - **Ölçülen sonuç:** `trading-math` satır %85,93 → **%90,62**, dal %88,37 → **%91,86**. `opportunity.ts` satır %100. `position.ts` %82,35 → **%94,11**. Test 1013 → 1017. Kapsam eşikleri 90/85/98/95'ten **93/89/100/98**'e çekildi (eşiğin ısırdığı ayrıca sınandı: 95 yapılınca `ERROR: Coverage for statements (93.42%) does not meet global threshold (95%)`).
  - **Ders:** "Bu kol zaten ulaşılamaz" demeden **önce ölç.** `mul(1e-200, 1e-200)` taban aşımıyla **0** döndüğü için `denom <= 0` koruması gerçekten çalışıyor; `calculateThresholdDays(0.1, 1e-300)` da `ln` kolunu tetikliyor. **Kalan iki yer gerçekten ulaşılamaz** (`position.ts:34`, `opportunity.ts:20-27,40`): `div` yalnız bölen 0 iken `null` döner, o noktada bölen pozitif olduğu garantili. Bunları "kapsamak" ancak savunma kodunu silmekle olur; bilerek bırakıldı. Kaydın asıl tespiti — *genel eşik tek dosyaları korumuyor* — hâlâ geçerli; dosya bazlı eşik ayrı bir iş.

- **Kapanış:** 2026-09-19 — **TB-006: Ana teknik dokümanın başlığı eski sürümü gösteriyor.**
  - **Ne yapıldı (sade):** Belgenin başlığı güncel sürümü gösteriyor; ayrıca başlık ile paket sürümünü karşılaştıran bir test eklendi, böylece bir dahaki sürümde kendiliğinden eskimeyecek.
  - **Ölçülen sonuç:** `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md:11` "v2.8 serisi" → **"v3.3 serisi"** (paket 3.3.0). Test `docs-claims.test.ts`'e eklendi; koruduğu mutasyonla doğrulandı: başlık v2.8'e döndürülünce `AssertionError: expected '2.8' to be '3.3'`.
  - **Ders:** Eskiyen bir sayıyı düzeltmek tek başına işe yaramaz — kayıt açıldığında fark 2.8↔3.1'di, kapanana kadar 2.8↔3.3'e **büyümüştü**. Düzeltmeyle birlikte onu yerinde tutan kapı da kurulmalı. Test dosyayı depodaki mevcut kalıpla (`?raw` içe aktarma, `kilavuz.test.ts`) okuyor; `node:fs` denendi ve `@types/node` olmadığı için `tsc` kırdı.

- **Kapanış:** 2026-09-19 — **TB-007: Bölme fonksiyonunun açıklaması koddan farklı şey söylüyor.**
  - **Ne yapıldı (sade):** Bölme işlevinin açıklaması düzeltildi: "bölünen" değil **bölen** sıfırsa boş sonuç döner. Açıklamaya örnek de eklendi.
  - **Ölçülen sonuç:** `div(0, 5)` → `0`, `div(1, 0)` → `null`. JSDoc artık kodla aynı şeyi söylüyor (`math/index.ts:27`).
  - **Ders:** Tek kelimelik bir belge hatası (bölen/bölünen) sessizdir: ne test ne lint yakalar, yalnız okuyan insanı yanıltır. Bu yüzden P3 sayıldı ama kapanması ucuzdu.


- **Kapanış:** 2026-09-19 — **TB-002: Harfleri Türkçesiz büyüten fonksiyon (`toAsciiUpper`) yok.**
  - **Ne yapıldı (sade):** Çekirdeğe, harfleri büyütürken Türkçe harflere dokunmayan bir işlev eklendi; şasi numarası, ürün kodu, IBAN öneki gibi alanlar artık doğru büyüyor. İş bu kayıt açıldıktan sonra **talep #7 kapsamında** yapıldı ve v3.3.0 ile yayımlandı; kayıt kapatılmayı bekliyordu.
  - **Ölçülen sonuç:** `src/abacus/internal/tr-case.ts:61` `toAsciiUpper` var (kayıt "0 geçiş" diyordu). `src/abacus/text/index.ts:119` dışa açıyor. `api-surface.test.ts:41` yüzeyde sınıyor. `CHANGELOG.md` v3.3.0 ve `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md` (2 geçiş) belgeliyor. Kaydın "Çözüm yönü" maddelerinin **hepsi** karşılandı. Karar defterinde madde 33A.
  - **Ders:** Kayıt, işi yapan taleple (talep #7) aynı anda kapatılmadığı için **dört gün** yanlış bilgi taşıdı; issue #6 da açık kaldı. Bir talep bir TB'yi çözüyorsa, talebi işleyen PR **kütüğü de aynı commit'te** kapatmalı. Bu kayıt 2026-09-19'da ayrı bir denetimde yakalandı — denetim olmasa daha uzun sürerdi.


_Henüz kapanmış kayıt yok._
