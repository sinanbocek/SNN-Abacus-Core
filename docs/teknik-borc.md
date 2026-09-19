# Teknik Borç Kütüğü

Fark edilen ama şimdi çözülmeyen sorunlar. **Açık borçlar için tek kaynak burasıdır.**
Kapanan kayıtlar: `docs/teknik-borc-arsiv.md`

> **Teknik borç nedir?** Bir işi hızlı bitirmek için kestirme yol kullanmak, sonradan
> ödenecek bir borç almak gibidir. Borç ödenmedikçe faizi (bakım zorluğu, hata riski) büyür.

> **Standart:** `~/.claude/standartlar/teknik-borc-standardi.md` · **Oluşturulma:** 2026-09-15 · **Açık:** 11 (P1: 0 · P2: 6 · P3: 5)

> **2026-09-15:** Kütük ilk kez oluşturuldu. Kayıtlar keşif turunda bulundu (dokümanlar, oturum günlüğü, kod, test/lint çıktıları); kritik iddialar bağımsız olarak yeniden ölçüldü. Ölçülemeyenler kayıt içinde "ölçülmedi/hipotez" diye belirtilmiştir.

## İçindekiler

- **🔴 P1 — Acil:** TB-010
- **🟡 P2 — Planlı:** TB-001, TB-004, TB-012
- **🟢 P3 — Fırsatta:** TB-011

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


### TB-010 — `money.parseNumber` Türkçe olmayan yazımları hata vermeden yanlış sayıya çeviriyor
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P1 (Acil) — *2026-09-19 denetiminde P2'den yükseltildi.*
  **Gerekçe:** kütüğün P1 tanımı parayı ve **sessiz hatayı** kapsıyor (bkz. yukarıdaki Öncelikler tablosu). Ölçüm ikisini de veriyor: `parseNumber("1234.56")` → `123456` (**100 kat yanlış para**, hata yok, uyarı yok) ve `parseNumber("12abc34")` → `1234` — oysa JSDoc *"Çözümlenemeyen girdide `null` döner (ABACUS-SPEC §2.1)"* diyor. İkincisi belgelenmiş bir sınır değil, **sözleşme ihlali**: çağıran `null` denetimi yazmışsa o denetim hiç çalışmaz. Çekirdek 8 projede kullanılıyor ve dışarıdan (API, CSV, kopyala-yapıştır) `1234.56` biçimi gelmesi olağan.

#### 🟢 Sade Anlatım
- **Sorun ne?** Metni sayıya çeviren fonksiyon yalnızca Türkçe yazımı ("1.234,56") doğru okuyor. "1234.56" gibi farklı bir yazım gelince "okuyamadım" demek yerine sessizce yüz kat büyük bir sayı üretiyor; parantezli eksi tutarı da artı okuyor.
- **Benzetme:** Yabancı dilde yazılmış bir çeki okuyamayan veznedarın "anlamadım" demek yerine rakamları kafasına göre birleştirip ödeme yapması.
- **Çözülmezse ne olur?** Excel'den ya da başka bir kaynaktan gelen farklı biçimli bir sayı, kullanan projede hesaplara yanlış tutar olarak girer ve hata fark edilmez.
- **Senden beklenen karar:** Düzeltme `parseNumber`'ın davranışını değiştirir (bugün yanlış sayı dönen girdiler `null` döner) — kullanan projelerde kırıcı olabilir; ayrı katı bir `parseDecimal` mı eklensin, yoksa `parseNumber` mı düzeltilsin?

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/money/index.ts:275-281`: JSDoc "Türkçe biçimli sayı metnini sayıya çevirir… Çözümlenemeyen girdide `null` döner (ABACUS-SPEC §2.1)". Kod `:277` `val.replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '')` → tüm noktaları ve rakam dışı karakterleri siliyor. **Ölçüm (2026-09-15, v3.1.0, tsx; 2026-09-19 v3.3.0'te yeniden ölçüldü, sonuç aynı):** `"1234.56"` → `123456`, `"1e3"` → `13`, `"(1.210,50)"` → `1210.5` (işaret kayboluyor), `"1.234,56"` → `1234.56` (doğru), `"abc"` → `null`. Sözleşme (çözümlenemeyende `null`) ile davranış çelişiyor.
- **TÜKETİCİ ETKİSİ ÖLÇÜLDÜ (2026-09-19, salt okuma).** 8 tüketicinin **4'ü** çağırıyor,
  toplam **40 çağrı**: trade-kasa 19 · SNN-Ihale-Maliyet 9 · GHS-Panel 8 · SNN-Yonetici-Ozeti 4.
  Çağırmayanlar: Gunum-Var, SNN-Piyasa-Core, SNN-Portfoy, SNN-Proje-ve-Nakit-Akis (0).

  **Düzeltme KIRICIDIR — kanıt:** `SNN-Ihale-Maliyet` bugünkü yanlış davranışı bir teste
  yazmış ve etrafına koruma (`readDecimalCell`) örmüş
  (`src/infrastructure/excel/decimalCell.test.ts:1-7`):

  > *"Çekirdeğin ölçülmüş davranışı (2026-09-14): `parseNumber("1234.56") = 123456`,
  > `parseNumber("1.5") = 15`, `parseNumber("1e3") = 13`…"*

  Yani bir tüketici bu davranışa **bilerek dayanıyor**. `AI-RULES §4.0`: *"Ölçüt niyet
  değil, tüketicinin gördüğü çıktıdır… Şüphe varsa MAJOR seçilir."* Şüphe yok: MAJOR.

  **İkinci bulgu — `?? 0` zinciri.** trade-kasa (`format.ts:15`) ve SNN-Yonetici-Ozeti
  (`mizanParser.ts:36`) sonucu `?? 0` ile sarıyor. Düzeltmeden sonra bugün *yanlış ama
  sıfırdan farklı* dönen girdiler **0** dönecek — mizan toplamında sessiz sapma demek.
  Bu iki satır sürüm notunda ayrıca uyarılmalı.

  **Üçüncü bulgu — açık risk.** GHS-Panel `besService.ts:189-228` ve SNN-Yonetici
  `mizanParser.ts` **Excel sütunlarını** ayrıştırıyor. Dış kaynaklı bir hücre `1234.56`
  yazımıyla gelirse bugün sessizce **100 kat** yanlış okunuyor. Bunun canlıda gerçekleşip
  gerçekleşmediğini **ölçmedim** — o iki projenin işi.
- **Etki:** Tüketiciler: SNN-Ihale `src/infrastructure/excel/decimalCell.ts:25` (önüne kendi biçim kapısını koyarak korunuyor — o projenin kütüğünde TB-005); diğer tüketicilerdeki kullanım sayılmadı.
- **Çözüm yönü:** (1) Tüketicilerde `parseNumber` çağrılarını say. (2) Yukarıdaki beş girdiyle kırmızı test yaz. (3) Katı biçim doğrulaması ekle (Türkçe dışı → `null`, parantezli eksi ya reddedilir ya işaretli okunur) veya hane sınırsız ayrı `parseDecimal` yayımla; `GERI-BILDIRIM-KAYDI.md` sürecine göre sürüm ve CHANGELOG.
- **Neden Şimdi Çözülmüyor:** SNN-Ihale kütüğünden taşınan "çekirdek talep adayı" (2026-09-14); proje ayrımı gereği hatanın kendisi burada kayıtlı.

---

## 🟢 P3 — Fırsatta





### TB-011 — Ata (Cumhuriyet) altınının saflık ve ağırlığı çekirdekte yok
- **Tespit Tarihi:** 2026-09-15 (keşif turu: salt okunur inceleme + bağımsız ölçüm)
- **Öncelik:** P3 (Fırsatta)

#### 🟢 Sade Anlatım
- **Sorun ne?** Ortak hesap kütüphanesi altını yalnızca ayara göre (24, 22, 21, 18) ve çeyrek/yarım/tam ziynet olarak tanıyor. Ata altınının kendine özgü saflığı ve ağırlığı yok; bu yüzden Portföy projesi bu değerleri kendi içinde elle yazmak zorunda kalmış.
- **Benzetme:** Resmî fiyat listesinde olmayan bir ürünü her dükkânın kendi defterinden satması.
- **Çözülmezse ne olur?** Bugün Portföy'deki elle yazılmış değerler doğru; ama başka bir proje ata altını hesaplarsa farklı değer kullanabilir.
- **Senden beklenen karar:** Yok.

#### 🔧 Teknik Detay
- **Açıklama:** `src/abacus/gold/index.ts:14-19` `PURITY` yalnız ayar bazlı (`24: 0.995, 22: 0.916, 21: 0.875, 18: 0.750`); `:21-25` `ZIYNET_GRAM` yalnız `quarter 1.754 / half 3.508 / full 7.016`. `src/abacus/gold*` içinde `0.917`, `917`, `ata`, `cumhuriyet`, `7.216` geçişi **0** (2026-09-15, v3.1.0). Tüketici: SNN-Portfoy-Yonetimi `src/config/goldTypes.ts:11, 39-40` 0,917 saflık ve 7,216 gr elle yazılı (o projenin kütüğünde TB-026).
- **Etki:** Ata altını değerleyen tüketici projeler (bugün SNN-Portfoy-Yonetimi).
- **Çözüm yönü:** Ata altınının resmî saflık (0,917) ve ağırlık (7,216 gr) değerlerini kaynağıyla doğrula; `gold` modülüne ayar dışı bir tür (ör. `ZIYNET_GRAM.ata` + ayrı saflık) olarak ekle; test + `api-surface.test.ts` + CHANGELOG; tüketiciye sürüm notu.
- **2026-09-19 araştırması — kapatılamadı, engel kaydedildi.** Çözüm yönü resmî kaynakla doğrulama istiyor (defterin kuralı: *"ikincil kaynaklar mevzuatın yerine geçmez"*, `text.plate` dersi). `darphane.gov.tr` **site izinlerince engelli**, açılamadı; zorlanmadı.
  Ölçülen iki çelişki, değer yazılmadan önce çözülmeli:
  1. **Saflık 0,916 mı 0,917 mi?** Çekirdek `PURITY[22] = 0.916`; tüketici `ATA_SAFLIK = 0.917` ve kendi yorumunda ikisini ayrı satırda gösteriyor (*"22 Ayar = 0.916 (Darphane Ziynet)"* / *"Ata (Cumhuriyet) = 0.917"*). Hangisinin doğru olduğu **ölçülmedi**.
  2. **Tüketicinin yorumu kaynak sayılamaz.** Aynı yorum *"24 Ayar = 1.000 saflık (Has)"* diyor; çekirdek ise `PURITY[24] = 0.995` kullanıyor ve bunu *"fiziki/piyasa altın kuralı"* diye belgeliyor. İki dosya 24 ayarda bile anlaşmıyor — 0,917 rakamının dayanağı da aynı yorumdur.
- **Neden Şimdi Çözülmüyor:** Resmî kaynak doğrulanamadı (yukarıdaki engel). Değer kaynağıyla sabitlenmeden çekirdeğe yazılmaz: 8 projeye giren yanlış bir sabiti geri almak kırıcı sürüm demektir.

---

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
