# Teknik Borç Kütüğü

Fark edilen ama şimdi çözülmeyen sorunlar. **Açık borçlar için tek kaynak burasıdır.**
Kapanan kayıtlar: `docs/teknik-borc-arsiv.md`

> **Teknik borç nedir?** Bir işi hızlı bitirmek için kestirme yol kullanmak, sonradan
> ödenecek bir borç almak gibidir. Borç ödenmedikçe faizi (bakım zorluğu, hata riski) büyür.

> **Standart:** `~/.claude/standartlar/teknik-borc-standardi.md` · **Oluşturulma:** 2026-09-15 · **Açık:** 11 (P1: 0 · P2: 6 · P3: 5)

> **2026-09-15:** Kütük ilk kez oluşturuldu. Kayıtlar keşif turunda bulundu (dokümanlar, oturum günlüğü, kod, test/lint çıktıları); kritik iddialar bağımsız olarak yeniden ölçüldü. Ölçülemeyenler kayıt içinde "ölçülmedi/hipotez" diye belirtilmiştir.

## İçindekiler

- **🟡 P2 — Planlı:** TB-001, TB-002, TB-003, TB-004, TB-005, TB-010
- **🟢 P3 — Fırsatta:** TB-006, TB-007, TB-008, TB-009, TB-011

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

### TB-001 — Toplama, çıkarma ve çarpma bozuk sayıyı sessizce geçiriyor
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P2 (Planlı)

#### 🟢 Sade Anlatım
- **Sorun ne?** Temel dört işlemden üçü, bozuk bir sayı (sayı olmayan değer ya da sonsuz) gelince "hata" demiyor; bozuk değeri sonuç olarak geri veriyor. Kütüphanenin kendi kuralı ise hatada boş (`null`) dönmek.
- **Benzetme:** Tartıya taş yerine boş kutu konunca "hata" demeyen, ekranda anlamsız bir işaret gösteren terazi.
- **Çözülmezse ne olur?** Kullanan bir projede bozuk bir girdi toplamlara karışırsa, raporda anlamsız tutar çıkar ve hatanın kaynağı zor bulunur.
- **Senden beklenen karar:** Dönüş tipi `number | null` olsun mu? Bu, kullanan tüm projeleri etkileyen büyük sürüm (v4) demek; alternatif: ayrı güvenli fonksiyonlar eklemek.

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/math/index.ts:13-25` `add`/`sub`/`mul` yalnızca `new D(String(a)).plus(...).toNumber()` yapıyor; `Number.isFinite`/`isSafeInteger` denetimi yok (aynı dosyada `div` ve `money/index.ts:107` denetliyor). **Ölçüm (2026-09-15, tsx):** `add(NaN,1)` → `NaN`; `add(1e308,1e308)` → `Infinity`; `div(1,0)` → `null`. Keşifte öne sürülen "`mul(9007199254740993,3)` sessizce saptı" örneği **yanlış**: girdi fonksiyona girmeden JavaScript tarafından `9007199254740992`'ye yuvarlanıyor; çarpma kendi başına doğru. Bu yüzden öncelik P1 değil P2. `add/sub/mul` için NaN/sınır testi yok.
- **Etki:** Tüm tüketici projeler; `trading-math/position.ts:14` (`volumeFromQty`) gibi `mul` zincirleri.
- **Çözüm yönü:** (1) Tüketicilerde `add/sub/mul` dönüşünün doğrudan kullanıldığı yerleri say. (2) NaN/Infinity için kırmızı test yaz. (3) Ya `addSafe/subSafe/mulSafe` ekle (küçük sürüm) ya da v4'te dönüş tipini `number | null` yap.
- **Neden Şimdi Çözülmüyor:** Kırıcı değişiklik gerektirebilir; karar bekliyor.

---

### TB-002 — Harfleri Türkçesiz büyüten fonksiyon (`toAsciiUpper`) yok
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P2 (Planlı)

#### 🟢 Sade Anlatım
- **Sorun ne?** Kütüphane harfleri Türkçe karakter kullanmadan küçültebiliyor ama büyütemiyor. GHS-Panel bu fonksiyonu bekliyor ve beklerken kendi içinde geçici yama yazmış.
- **Benzetme:** Takım çantasında vidayı sökmek için tornavida var, takmak için yok.
- **Çözülmezse ne olur?** GHS-Panel'deki harf işleme geçişi durmaya devam eder; geçici yama orada kalıcılaşır.
- **Senden beklenen karar:** Fonksiyon eklensin mi, hangi sürümle çıksın? (öneri: 3.2.0)

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/internal/tr-case.ts:41` yalnızca `toAsciiLower` içeriyor; `toAsciiUpper` `src/` içinde 0 geçiş (2026-09-15 ölçümü). `src/abacus/text/index.ts:99` yalnızca `toAsciiLower`'ı dışarı veriyor. Tüketici şu an `text.upper(...).replace(/İ/g,'I')` yapıyor (GHS-Panel `vehiclePlate.ts:46-47`).
- **Etki:** GHS-Panel TB-064 (harf işleme göçü) bu eksik yüzünden bloklu.
- **Çözüm yönü:** Testi önce yaz: `toAsciiLower` tablosunun büyük harf karşılığı. Sonra `internal/tr-case.ts`'e `toAsciiUpper` ekle, `text` üzerinden dışarı aç; `api-surface.test.ts`, `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md`, `CHANGELOG.md` güncellenir.
- **Neden Şimdi Çözülmüyor:** Keşif sırasında bulundu, planlanmadı.

---

### TB-003 — İşlem hesaplama bölümünde geçersiz girdi kolları test edilmemiş
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P2 (Planlı)

#### 🟢 Sade Anlatım
- **Sorun ne?** Pozisyon büyüklüğü ve fırsat hesabı yapan bölümde, sıfır ya da negatif girdi gelince çalışan kod kolları hiç sınanmamış.
- **Benzetme:** Arabanın frenini yalnızca düz yolda denemek, yokuşta hiç denememek.
- **Çözülmezse ne olur?** Bu kollar ileride değiştirilirse bozulma fark edilmez; kullanan projelerde yanlış pozisyon büyüklüğü çıkabilir.
- **Senden beklenen karar:** Yok.

#### 🔧 Teknik Detay
- **Açıklama:** `npm run test:coverage` (2026-09-15): `trading-math` satır %85,93 / dal %88,37; `position.ts` satır %82,35 (test edilmeyen: 12, 29, 34); `opportunity.ts` dal %73,68 (`:36`). Genel kapsam %93,19, eşiklerin üstünde → genel eşik tek dosyaları korumuyor. `qtyFromVolume` içindeki `denom <= 0` dalı testsiz.
- **Etki:** trade-kasa ve Portföy'ün pozisyon/risk hesapları.
- **Çözüm yönü:** Eksik dallar için test yaz; gerekirse `vitest.config.ts` içinde dosya başına eşik (`perFile`) tanımla.
- **Neden Şimdi Çözülmüyor:** Keşif sırasında bulundu, planlanmadı.

---

### TB-004 — 2016 öncesi tarihlerde saat bir saat kayıyor
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P2 (Planlı)

#### 🟢 Sade Anlatım
- **Sorun ne?** Türkiye 2016'dan önce kışın saati bir saat geri alıyordu. Kütüphane her tarihe bugünkü sabit saat farkını uyguluyor, bu yüzden eski kayıtlarda saat bir saat yanlış görünüyor.
- **Benzetme:** Eski fotoğraflara bugünkü saat ayarıyla tarih basan bir fotoğraf makinesi.
- **Çözülmezse ne olur?** Eski işlem ya da fiyat kayıtlarında saat yanlış görünür; gece yarısına yakın kayıtlarda gün de kayabilir (hipotez).
- **Senden beklenen karar:** Bu sınır kalıcı olarak kabul mü, yoksa 2016 öncesi için küçük bir düzeltme tablosu mu eklensin?

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/date/index.ts:85` sabit UTC+3 kullanıyor. `GERI-BILDIRIM-KAYDI.md:351-356` örneği: `2015-01-15T12:00:00Z` çekirdekte `15:00`, doğrusu `14:00`. `Intl` yasağı nedeniyle bilinçli seçilmiş, belgelenmiş bir sınır.
- **Etki:** 2016 öncesi saat gösteren ekranı olan tüketici projeler (varlığı ölçülmedi).
- **Çözüm yönü:** Önce tüketicilerde 2016 öncesi saat gösteren ekran var mı ölç; varsa küçük sabit kural tablosu ekle ve testle sabitle.
- **Neden Şimdi Çözülmüyor:** Bilinçli kapsam sınırı olarak belgelenmiş.

---

### TB-005 — Dağıtılan lint kuralı "eksik değere sessizce sayı koyma" hatasını kaçırıyor
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P2 (Planlı)

#### 🟢 Sade Anlatım
- **Sorun ne?** Kütüphanenin diğer projelere dağıttığı denetim kuralı, eksik bir değerin yerine sessizce 0 konmasını yakalıyor ama 1 gibi başka bir sayı konmasını yakalamıyor.
- **Benzetme:** Duman dedektörünün yalnızca mutfakta çalışıp salonda çalışmaması.
- **Çözülmezse ne olur?** Kullanan projelerde yanlış varsayılan sayılar (ör. kur yoksa 1) fark edilmeden kalır ve hesaplar sessizce yanlış çıkar.
- **Senden beklenen karar:** Kural sıkılaştırılsın mı? Kullanan projelerde yeni lint hataları çıkaracaktır.

#### 🔧 Teknik Detay
- **Açıklama:** `GERI-BILDIRIM-KAYDI.md` kuralın yalnızca `0` literaline baktığını ve "kural boşluğu genel olarak durmaktadır" diye kaydediyor. Kural `eslint/index.js` içinde yayımlanıyor. Kural gövdesi bu turda satır satır okunmadı; bilgi projenin kendi kaydına dayanıyor.
- **Etki:** Kuralı kullanan tüm tüketici projeler (ör. Portföy'deki `|| 1` kur yedeği borcu).
- **Çözüm yönü:** Önce `eslint/index.js` kuralını oku; sonra `?? <sayı>` / `|| <sayı>` için seçici kural ve `eslint-config.test.ts` testi ekle.
- **Neden Şimdi Çözülmüyor:** Keşif sırasında bulundu, planlanmadı.

---

### TB-010 — `money.parseNumber` Türkçe olmayan yazımları hata vermeden yanlış sayıya çeviriyor
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P2 (Planlı)

#### 🟢 Sade Anlatım
- **Sorun ne?** Metni sayıya çeviren fonksiyon yalnızca Türkçe yazımı ("1.234,56") doğru okuyor. "1234.56" gibi farklı bir yazım gelince "okuyamadım" demek yerine sessizce yüz kat büyük bir sayı üretiyor; parantezli eksi tutarı da artı okuyor.
- **Benzetme:** Yabancı dilde yazılmış bir çeki okuyamayan veznedarın "anlamadım" demek yerine rakamları kafasına göre birleştirip ödeme yapması.
- **Çözülmezse ne olur?** Excel'den ya da başka bir kaynaktan gelen farklı biçimli bir sayı, kullanan projede hesaplara yanlış tutar olarak girer ve hata fark edilmez.
- **Senden beklenen karar:** Düzeltme `parseNumber`'ın davranışını değiştirir (bugün yanlış sayı dönen girdiler `null` döner) — kullanan projelerde kırıcı olabilir; ayrı katı bir `parseDecimal` mı eklensin, yoksa `parseNumber` mı düzeltilsin?

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/money/index.ts:275-281`: JSDoc "Türkçe biçimli sayı metnini sayıya çevirir… Çözümlenemeyen girdide `null` döner (ABACUS-SPEC §2.1)". Kod `:277` `val.replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '')` → tüm noktaları ve rakam dışı karakterleri siliyor. **Ölçüm (2026-09-15, v3.1.0, tsx):** `"1234.56"` → `123456`, `"1e3"` → `13`, `"(1.210,50)"` → `1210.5` (işaret kayboluyor), `"1.234,56"` → `1234.56` (doğru), `"abc"` → `null`. Sözleşme (çözümlenemeyende `null`) ile davranış çelişiyor.
- **Etki:** Tüketiciler: SNN-Ihale `src/infrastructure/excel/decimalCell.ts:25` (önüne kendi biçim kapısını koyarak korunuyor — o projenin kütüğünde TB-005); diğer tüketicilerdeki kullanım sayılmadı.
- **Çözüm yönü:** (1) Tüketicilerde `parseNumber` çağrılarını say. (2) Yukarıdaki beş girdiyle kırmızı test yaz. (3) Katı biçim doğrulaması ekle (Türkçe dışı → `null`, parantezli eksi ya reddedilir ya işaretli okunur) veya hane sınırsız ayrı `parseDecimal` yayımla; `GERI-BILDIRIM-KAYDI.md` sürecine göre sürüm ve CHANGELOG.
- **Neden Şimdi Çözülmüyor:** SNN-Ihale kütüğünden taşınan "çekirdek talep adayı" (2026-09-14); proje ayrımı gereği hatanın kendisi burada kayıtlı.

---

## 🟢 P3 — Fırsatta

### TB-006 — Ana teknik dokümanın başlığı eski sürümü gösteriyor
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P3 (Fırsatta)

#### 🟢 Sade Anlatım
- **Sorun ne?** Motor detayları dokümanının başında "v2.8 serisi" yazıyor, oysa kütüphane v3.1.0 ve dokümanın içi de v3.1.0'ı anlatıyor.
- **Benzetme:** Kapağında 2. baskı yazan ama içi 3. baskı olan kitap.
- **Çözülmezse ne olur?** Okuyan kişi ya da yapay zeka, yeni özelliklerin olmadığını sanabilir.
- **Senden beklenen karar:** Yok.

#### 🔧 Teknik Detay
- **Açıklama:** `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md:11` "Sürüm: v2.8 serisi"; `package.json` `3.1.0`; aynı doküman `:163`'te v3.1.0 içeriği. `docs-claims.test.ts`'in başlık sürümünü denetlemediği test adına bakılarak çıkarıldı (içerik okunmadı).
- **Etki:** Dokümanı okuyan tüketici projeler ve yapay zeka oturumları.
- **Çözüm yönü:** Başlığı düzelt; `package.json` sürümüyle karşılaştıran bir test ekle.
- **Neden Şimdi Çözülmüyor:** Keşif sırasında bulundu, planlanmadı.

---

### TB-007 — Bölme fonksiyonunun açıklaması koddan farklı şey söylüyor
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P3 (Fırsatta)

#### 🟢 Sade Anlatım
- **Sorun ne?** Açıklama "üstteki sayı sıfırsa boş döner" diyor, kod ise "alttaki sayı sıfırsa" kontrol ediyor. Kod doğru, açıklama yanlış.
- **Benzetme:** Kapıda "itiniz" yazması ama kapının çekilerek açılması.
- **Çözülmezse ne olur?** Açıklamayı okuyan biri 0÷5 işleminin boş döneceğini sanıp gereksiz kontrol yazabilir.
- **Senden beklenen karar:** Yok.

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/math/index.ts:27` JSDoc "Bölünen 0 ise null döner"; `:29` `if (b === 0) return null;`. Ölçüm (2026-09-15): `div(0,5)` → `0`, `div(1,0)` → `null`.
- **Etki:** Yalnızca dokümantasyon.
- **Çözüm yönü:** JSDoc'u "Bölen 0 ise null döner" yap.
- **Neden Şimdi Çözülmüyor:** Keşif sırasında bulundu, planlanmadı.

---

### TB-008 — Oturum günlüğü bir aydır güncellenmemiş
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P3 (Fırsatta)

#### 🟢 Sade Anlatım
- **Sorun ne?** Yapılan işlerin günlüğü 18 Ağustos'tan (v1.1.0) beri tutulmamış; arada iki büyük sürüm çıkmış.
- **Benzetme:** Gemi seyir defterine bir aydır hiçbir şey yazılmaması.
- **Çözülmezse ne olur?** "Nerede kalmıştık?" sorusu yalnızca kod geçmişinden cevaplanabilir.
- **Senden beklenen karar:** Bu dosya tutulmaya devam edecek mi, yoksa `GERI-BILDIRIM-KAYDI.md` + `CHANGELOG.md` yeterli mi?

#### 🔧 Teknik Detay
- **Açıklama:** `.agent/session_log.md` tek oturum: 2026-08-18, "Versiyon: v1.1.0". O tarihten sonra v2.7.0–v3.1.0 arası en az 10 commit var. Kayıt görevini fiilen `GERI-BILDIRIM-KAYDI.md` ve `CHANGELOG.md` üstlenmiş görünüyor (gözlem).
- **Etki:** Süreç kaydı.
- **Çözüm yönü:** Karar verildikten sonra dosyayı kaldır ya da güncelle.
- **Neden Şimdi Çözülmüyor:** Keşif sırasında bulundu, planlanmadı.

---

### TB-009 — Depoda ilk sürümden kalma eski bir commit mesajı dosyası duruyor
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P3 (Fırsatta)

#### 🟢 Sade Anlatım
- **Sorun ne?** Geçici olması gereken bir not dosyası kalıcı olarak depoya girmiş ve artık yanlış bilgi (eski test sayısı) içeriyor. Depo herkese açık.
- **Benzetme:** Vitrinde geçen yılın fiyat etiketinin durması.
- **Çözülmezse ne olur?** Depoyu inceleyen kişi yanlış test sayısı görür.
- **Senden beklenen karar:** Silinsin mi?

#### 🔧 Teknik Detay
- **Açıklama:** `git ls-files` içinde `commit_msg.txt`; içeriği ilk sürüme ait ("7 motor… 163 unit test"). Güncel: 43 test dosyası, 979 test. `.gitignore` kapsamıyor.
- **Etki:** Yalnızca depo düzeni.
- **Çözüm yönü:** `git rm commit_msg.txt` ve `.gitignore` kaydı.
- **Neden Şimdi Çözülmüyor:** Keşif sırasında bulundu, planlanmadı.

---

### TB-011 — Ata (Cumhuriyet) altınının saflık ve ağırlığı çekirdekte yok
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P3 (Fırsatta)

#### 🟢 Sade Anlatım
- **Sorun ne?** Ortak hesap kütüphanesi altını yalnızca ayara göre (24, 22, 21, 18) ve çeyrek/yarım/tam ziynet olarak tanıyor. Ata altınının kendine özgü saflığı ve ağırlığı yok; bu yüzden Portföy projesi bu değerleri kendi içinde elle yazmak zorunda kalmış.
- **Benzetme:** Resmî fiyat listesinde olmayan bir ürünü her dükkânın kendi defterinden satması.
- **Çözülmezse ne olur?** Bugün Portföy'deki elle yazılmış değerler doğru; ama başka bir proje ata altını hesaplarsa farklı değer kullanabilir.
- **Senden beklenen karar:** Yok.

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/gold/index.ts:14-19` `PURITY` yalnız ayar anahtarlı (`24: 0.995, 22: 0.916, 21: 0.875, 18: 0.750`); `:21-25` `ZIYNET_GRAM` yalnız `quarter 1.754 / half 3.508 / full 7.016`. `src/abacus/gold*` içinde `0.917`, `917`, `ata`, `cumhuriyet`, `7.216` geçişi **0** (2026-09-15, v3.1.0). Tüketici: SNN-Portfoy-Yonetimi `src/config/goldTypes.ts:11, 39-40` 0,917 saflık ve 7,216 gr elle yazılı (o projenin kütüğünde TB-026).
- **Etki:** Ata altını değerleyen tüketici projeler (bugün SNN-Portfoy-Yonetimi).
- **Çözüm yönü:** Ata altınının resmî saflık (0,917) ve ağırlık (7,216 gr) değerlerini kaynağıyla doğrula; `gold` modülüne ayar dışı bir tür (ör. `ZIYNET_GRAM.ata` + ayrı saflık) olarak ekle; test + `api-surface.test.ts` + CHANGELOG; tüketiciye sürüm notu.
- **Neden Şimdi Çözülmüyor:** SNN-Portfoy-Yonetimi tüketici raporu #3 §4 ile iletilmiş; proje ayrımı gereği eksikliğin kendisi burada kayıtlı (2026-09-15).

---

### TB-012 — Kod dili standardına uyum yok: 43 Türkçe tanımlayıcı var, turnike hiç kurulmamış
- **Tespit Tarihi:** 2026-09-19 (abacus-talep yolu kurulurken kanca uyarısı; ardından bağımsız ölçüm)
- **Öncelik:** P2 (Planlı)

#### 🟢 Sade Anlatım
- **Sorun ne?** Aile kuralı şunu diyor: kodun içinde şeylere verilen adlar İngilizce olur; açıklamalar, belgeler ve kullanıcının gördüğü yazılar Türkçe kalır. Bu depoda 43 ad bu kurala uymuyor. Asıl sorun sayı değil: **kuralı kontrol eden kapı hiç kurulmamış**, bu yüzden her yeni iş sessizce birkaç tane daha ekliyor.
- **Benzetme:** Depoda "girişte kask takılır" yazısı asılı ama kapıda kimse yok. Kask takmayan giriyor, kimse saymıyor; yazı kendi kendine çalışmıyor.
- **Çözülmezse ne olur?** Sayı büyümeye devam eder ve bir gün topluca düzeltmek pahalı hâle gelir. Ayrıca bu kütüphaneyi kullanan 8 projeye "kurala uyun" demek zorlaşır; çekirdek kendisi uymuyorsa kural gevşer.
- **Senden beklenen karar:** İki ayrı soru var. (1) Kapıyı şimdi kuralım mı? (2) Plaka kuralındaki `PLAKA_HARFLERI` gibi Türkiye'ye özgü adlar çevrilsin mi, yoksa gerekçesiyle istisna mı yazılsın?

#### 🔧 Teknik Detay
- **Açıklama:** `node <ev>/.claude/standartlar-canli/quality/code-language-scan.js --tumu` (2026-09-19, v3.3.0) **43 farklı tanımlayıcı / 103 satır atfı** buluyor. Oturum kancası "129 bulgu" diyor; bu sayı tarayıcının kendi çıktısıyla **tutmuyor**, aradaki farkın nereden geldiği ölçülmedi. Dosya dağılımı: `scripts/beceri-dogrula.mjs` 8, `src/abacus/text/index.ts` 6, `src/abacus/math/index.ts` 6, `src/abacus/kilavuz.test.ts` 4, `src/abacus/spec-surface.test.ts` 3, `src/abacus/money/index.ts` 3, `src/abacus/math/allocate.test.ts` 3, `src/abacus/date/index.ts` 2, kalanlar 1'er. Eksik olan iki altyapı: `.github/workflows/kod-dili.yml` **yok** (aile standardı `ornek/kod-dili.yml` şablonu sunuyor) ve `.snn-kod-dili.json` istisna dosyası **yok**.
- **Etki:** Kod okunabilirliği ve aile standardı uyumu. Çalışma zamanı davranışı etkilenmiyor — hiçbiri hata üretmiyor.
- **Çözüm yönü:** (1) `ornek/kod-dili.yml` turnikesini kur — **önce** kur, yoksa temizlik sırasında yenileri girer. (2) Türkiye'ye özgü olanları (`PLAKA_HARFLERI`, `PLAKA_AYRACLARI`, `YENI_KAYIT_HARFLERI`, `PLAKA_RAKAM_EN_AZ/COK`) `.snn-kod-dili.json`'a gerekçesiyle istisna yaz — bunlar Türkiye tescil plakası kavramına ait (dayanağı GERI-BILDIRIM-KAYDI.md talep #4 notunda yazılı), İngilizce karşılıkları kavramı bozar. (3) Kalanları dosya dosya çevir; test dosyası adları (`giris-suzme.test.ts`, `suffix-sayi.test.ts`) yeniden adlandırılırken `vitest.config.ts` include deseni ve kapsam eşikleri kontrol edilsin.
- **Neden Şimdi Çözülmüyor:** `abacus-talep` yolu kurulurken yan bulgu olarak çıktı; asıl işi (talep yolu + talep #23) bölmemek için kaydedildi. Ayrıca istisna kararı (madde 2) proje sahibinin kararını gerektiriyor.

---
