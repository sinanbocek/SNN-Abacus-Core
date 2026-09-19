# AI-RULES.md — SNN-Abacus-Core Geliştirme Kuralları

> **Bu dosya bağlayıcıdır.** Bu repoda kod yazmadan, dosya oluşturmadan/silmeden veya
> komut çalıştırmadan önce okunur. Kural ile bir istek çelişirse **DUR ve sahibine
> (Sinan) sor** — kuralı sessizce esnetme.
>
> Bu dosya SNN-Abacus-Core'a (çekirdek hesaplama kütüphanesi) özgüdür. Tüketici
> uygulamaların kuralları (mimari katman, veritabanı, dağıtım) burada yer almaz.
>
> **Sürüm:** 2.0 · **Geçerlilik:** tüm AI asistanları · **Kod dili:** İngilizce

## Aile standardı

Bu proje **SNN aile standardına** tabidir (`sinanbocek/SNN-Standartlar`). Aile standardı
tüm SNN projeleri için ortak kuralları taşır: kod dili, eş zamanlı çalışma, teknik borç
kütüğü, gizli anahtar taraması.

**Çelişki halinde hangisi üstün:** aile standardı **taban**tır, bu dosya onun üstüne
çekirdeğe özgü kural ekler. Bu dosya aile standardını **gevşetemez**; yalnız sıkılaştırır.
Gerçekten çelişen bir durum varsa kural sessizce esnetilmez — `standart-talep` becerisiyle
SNN-Standartlar'a bildirilir, karar oranın `GERI-BILDIRIM-KAYDI.md`'sine yazılır.

Bu depoda yürürlükteki aile kuralları:

| Kural | Nerede |
|---|---|
| Kod dili (tanımlayıcılar İngilizce) | `.github/workflows/kod-dili.yml` · istisnalar `.snn-kod-dili.json` |
| Teknik borç kütüğü | `docs/teknik-borc.md` (TB-xxx) |
| Gizli anahtar taraması | `.github/workflows/anahtar-tarama.yml` |
| Eş zamanlı çalışma | kendi dalında çalış; ortak dosyadan önce `git log --oneline -5` |

Çekirdeğe gelen talepler bunun dışındadır ve **bu deponun** kendi yolundan yürür:
`GERI-BILDIRIM-KAYDI.md` + `abacus-talep` becerisi (§4.1 sınavı beşinci şarttır).

---

## 0. Önce Oku

1. İş başlamadan: bu dosyayı + `ABACUS-SPEC.md`'yi + ilgili motorun kaynağını oku.
2. **Kuralı geçmek için kuralı gevşetme.** Lint/tip hatasında kodu düzelt; `any`,
   `@ts-ignore`, `eslint-disable` ile kaçma; testi implementasyona uydurma.
3. Fonksiyon imzası/davranışı **tahmin edilmez**, kaynaktan okunur.
4. Onaysız dosya operasyonu yok; repo dışına çıkma yok.
5. Bir hatada 3 denemede çözemezsen dur, özetle, sor.
6. Her iş sonunda `lint + typecheck + test` çıktısını **kanıt** olarak sun.

---

## 1. Her Kuralın Bir Makine Zorlaması Vardır

Yazılı kural yetmez. Her katı kuralın otomatik zorlayıcısı vardır:

- **ESLint (`error`, warn değil):** `.toFixed`, `toLocaleString`, ham `toUpperCase`/
  `toLowerCase`, `parseFloat`, ham `Math`, ham `Intl` yasak → ABACUS motoruna yönlendirir.
  Ayrıca `no-restricted-syntax` ile **sessiz varsayılan** (`|| 0`, `?? 0`) yasaktır.
- **TypeScript strict:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noUnusedLocals`, `noUnusedParameters`. Örtük `any` yok.
- **Kapsam kapısı:** `npm run test:coverage` eşiklerle çalışır (`vitest.config.ts`).
  Kapsam düşerse CI kırılır; eşikler kapsam arttıkça yukarı çekilir.
- **CI kapısı (Node 22):** `npm ci → lint → tsc --noEmit → test:coverage`.
  Herhangi biri kırılırsa merge yok.

Zorlanamayan madde "kural" değil "öneri"dir.

---

## 2. Kırmızı-Önce TDD (yeni motor/fonksiyon)

Yeni davranış eklenirken:

1. **Önce test yazılır** (`*.test.ts`, vitest). Kod yokken çalıştırılır → **KIRMIZI**
   olduğu kanıtlanır (test gerçekten bir şey bekliyor).
2. **Sonra kod yazılır** → test **YEŞİL** olur.
3. **Meta-doğrulama:** bir sabit/mantık geçici bozulur → ilgili test kırmızı olmalı
   (test gerçekten ölçüyor mu), sonra geri alınır → yeşil, `git diff` boş.
   ⚠️ Geri almak için `git checkout` KULLANMA: yeni (henüz commit'lenmemiş) dosyaları
   geri getirmez ve o oturumun çalışmasını siler. Önce dosyaları depo dışına kopyala,
   mutasyondan sonra kopyadan geri yükle.
4. **Kırmızı vermeyen koruma ölü koddur:** bozulduğunda hiçbir test kırılmıyorsa ya
   testi ekle ya kodu kaldır; ikisinden birini yapmadan bırakma.

Assert değerleri **dış otoriteden** (piyasa/Darphane/resmi standart) gelir; kodun
ürettiği çıktı assert'e körlemesine kopyalanmaz. Kod ile beklenen çelişirse DUR, raporla.

---

## 3. Saflık ve Kapsülleme

- Motorlar **saf** kalır: I/O yok (fetch/DB/localStorage/env/fs). Veri parametreyle gelir.
- **decimal.js yalnız `math`** içinde. Yeni motor hesabı `math` primitifleriyle yapar.
- Para **kuruş** (integer minor). Float ile para yasak.
- Hata sentineli **işin türüne** bağlıdır; normatif tablo `ABACUS-SPEC.md §2.1`'dedir
  (hesap → `null`, biçimlendirme → `'—'`, doğrulama → `false`, normalizasyon →
  `{valid:false}`, metin → `''`). Sessiz `|| 0` / `?? 0` her durumda yasak.
- **Motorlar arası dairesel import yasak.** İki motorun ortak ihtiyacı varsa parça
  `src/abacus/internal/` altında bir **yaprak modüle** taşınır; genel API adı değişmez.
  `internal/` barrel üzerinden export EDİLMEZ.
- **Sabitler tek kaynaktan.** Aynı sabit iki motorda ayrı tanımlanmaz
  (ör. `ONS_TO_GRAM` → `internal/constants`).

---

## 4. Tek Otorite (SSOT)

- Bu repo, hesaplama mantığının **tek kaynağıdır**. Aynı iş için ikinci fonksiyon yazılmaz.
- Tüketici projeler mantığı **kopyalamaz**; `@snn/abacus-core`'u `npm install github:...` ile çeker.
- Motor değişikliği yalnız bu repoda yapılır, sürüm (`CHANGELOG.md` + SemVer + git tag) ile dağıtılır.

### 4.0 SemVer artık bir TAAHHÜTTÜR

Tüketici projeler `#semver:^X.Y.Z` aralığıyla bağlanır: **minor ve yama sürümleri
onlara OTOMATİK iner.** Bu, sürüm numarasını bir etiketten sorumluluğa çevirir.

- Kırıcı bir değişikliği **minor olarak çıkarmak, tüm tüketici projeleri sessizce
  bozar.** Kırıcı değişiklik daima MAJOR'dur; istisnası yoktur.
- "Küçük bir düzeltme, kimse fark etmez" diye düşünülen davranış değişiklikleri
  de kırıcıdır. Ölçüt niyet değil, **tüketicinin gördüğü çıktıdır**.
- Şüphe varsa MAJOR seçilir. Gereksiz major sürüm ucuzdur; sessiz kırılma değildir.

**Makine zorlaması:** `src/abacus/api-surface.test.ts` dışa açılan her adı
çiviler. Bir ad silinir/yeniden adlandırılırsa test kırılır ve MAJOR gerektiğini
söyler; yeni ad eklenirse kırılır ve MINOR gerektiğini söyler. Listeyi güncellemek
bilinçli bir adımdır — düşünmeden güncellenmez.

> Not: Bu test yalnız ADLARI korur, davranışı değil. Davranış değişikliğini
> yakalayan `docs-claims.test.ts` ve motor testleridir. İkisi birlikte çalışır.

**Şartname, README ve kılavuz da kilitlidir.** Yeni bir ad eklendiğinde `api-surface`
ile birlikte üç kilit daha kırılır ve üç belge güncellenmeden sürüm çıkmaz:

- `spec-surface.test.ts` — `ABACUS-SPEC.md` §2 fonksiyon tablosu ve `README.md`
  motor özeti (motor sayısı, motorlar, her motorun fonksiyon listesi) gerçek
  barrel ile karşılaştırılır. (v2.8.0'da, şartname tablosunun üç sürüm boyunca
  sessizce eskidiği fark edilince eklendi.)
- `kilavuz.test.ts` — `KILAVUZ.md`'deki her ```js örneği çalıştırılır ve dışa
  açılan her adın kılavuzda geçmesi zorunludur. Yeni fonksiyon için kılavuza en az
  bir çalışan örnek ve gerekiyorsa "hangisini kullanmalıyım?" satırı eklenir.

### 4.1 Yerleştirme Kuralı — Çekirdeğe mi, uygulamaya mı?

Bu kural bağlayıcıdır. Yeni bir fonksiyonun nereye ait olduğu **tartışılmaz, sınanır.**

> **SINAV:** Başka bir şirketin, başka bir alandaki uygulaması bu fonksiyonu
> **aynen** kullanabilir miydi?
>
> - **Evet** → çekirdeğe girer.
> - **Hayır** → tüketici projede kalır.

**Pratik ayıraç:** fonksiyonun adında ya da imzasında **senin işine ait bir kavram**
geçiyorsa (kasa, trade, pozisyon, ödeme, proje, tedarikçi, abone, sipariş…)
uygulamaya aittir. Yalnızca **sayı, para, metin, tarih, birim** biliyorsa çekirdeğe aittir.

**Gerçek örnekler** (2026-08 tarihli tüketici proje taramasından):

| Fonksiyon | Karar | Gerekçe |
|---|---|---|
| `parseTLInputToKurus` | **çekirdek** | yalnız metin ve para bilir |
| `normalizeStr` / `normalizeSearchKey` | **çekirdek** | yalnız metin bilir |
| `decimal(value, digits)` | **çekirdek** | yalnız sayı bilir |
| `daysBetween`, `roundSafe` | **çekirdek** | zaten çekirdekte var |
| `computeTrade` | uygulama | "trade" alan kavramı |
| `totalKasaTRY` | uygulama | "kasa" alan kavramı |
| `checkPaymentStatus` | uygulama | "payment" alan kavramı |
| `shouldAutoConfirm` | uygulama | iş kuralı, hesap değil |

**Sınır durumları:**

1. **Alan kavramı içeren ama genel bir çekirdeği olan fonksiyon** ikiye bölünür.
   Genel kısım çekirdeğe, alan kısmı uygulamada kalır.
   Örnek: `totalKasaTRY` uygulamada kalır ama içindeki toplama/kur çevrimi
   `math` ve `currency` üzerinden yapılır.
2. **Bir sabit iki uygulamada da aynıysa** çekirdeğe girer (ör. `ONS_TO_GRAM`).
   Uygulamaya göre değişiyorsa (limitler, oranlar, eşikler) girmez —
   çekirdek parametre olarak alır.
3. **Emin değilsen çekirdeğe ALMA.** Çekirdeğe eklemek kolay, çıkarmak kırıcı
   sürüm gerektirir (§4 dağıtım kuralı). Şüphe uygulamadan yana çözülür.

4. **Sabitliğini gösteren yürürlükteki bir metin yoksa**, kural "fiilî uygulama"
   olarak etiketlenir ve gevşek tarafta tutulur: gerçek bir değeri reddetmek,
   var olmayan bir değeri kabul etmekten daha pahalıdır. Örnek: `text.plate` —
   plaka harf/rakam grupları 2025'ten beri yönetmelikte listelenmiyor.

**Hedef ölçütü:** Bir tüketici projeyi çekirdeğe taşırken hedef "yerel kodun
%100'ünü çekirdeğe almak" DEĞİLDİR. Hedef: **genel kodun %100'ü çekirdeğe,
alan kodunun %0'ı.** Yerel klasör kaybolmaz, küçülür ve doğru adı alır
(`domain/abacus/` → `domain/<alan>/`).

### 4.2 Tüketici talepleri — önce kayıt

Bir tüketici talebini değerlendirmeden önce **`GERI-BILDIRIM-KAYDI.md` okunur.**
Aynı talep daha önce reddedilmişse gerekçesi ve yeniden başvuru koşulu oradadır;
koşul karşılanmadan yeniden tartışılmaz.

- **Her karar kayda işlenir** — kabuller sürümüyle, redler gerekçesi ve yeniden
  başvuru koşuluyla. `README.md` ve `CHANGELOG.md` bu anlatıyı taşımaz, kayda
  atıf yapar.
- **Talebin iddiaları uygulanmadan önce ölçülür.** Tüketici raporları çoğu zaman
  doğrudur ama "çoğu zaman" yetmez; sayılar bağımsız hesapla, davranış çalışan
  kodla doğrulanır.
- **Mevzuata dayanan kurallarda aslı okunur.** İkincil kaynaklar, özetler ve arama
  sonuçları mevzuatın yerine geçmez: `text.plate` araştırmasında ikincil
  kaynakların hepsi 4/11/2025'te **yürürlükten kaldırılmış** bir maddeyi gösteriyordu
  ve bu yalnızca Resmî Gazete metnini aslından okuyunca ortaya çıktı.
- **Çekirdek sahibi bir §4.1 önerisini geçersiz kılarsa** karar uygulanır ve kayda
  "sahip kararıyla istisna — emsal değildir" diye işlenir. Kural sessizce
  esnetilmez; istisna görünür kılınır.

---

## 5. Git ve Doğrulama Disiplini

- Commit'e yalnız **ilgili dosyalar** girer (`git add .` yasak; dosyaları açıkça ekle).
- Commit tipi anlamlı: `feat:`, `test:`, `docs:`, `ci:`, `fix:`.
- **Push beyanı ≠ push gerçeği.** Her push sonrası: `git fetch` + `git log origin/main`
  ham çıktısı + `git log origin/main..HEAD` (boş olmalı) + `HEAD == origin/main` doğrulanır.
- **Sürüm etiketi ELLE ATILMAZ — makine atar.** `package.json` sürümü `main`'e girer
  girmez `.github/workflows/surum-etiketi.yml` etiketi oluşturur ve gönderir; etiket
  `cekirdek-yayilim.yml`'yi tetikler, o da tüketicilerde güncelleme PR'ı açar.
  Ön koşul: `CHANGELOG.md` içinde `## [X.Y.Z]` başlığı bulunmalıdır, yoksa akış
  **durur ve etiket atılmaz**.

  > **Neden makine:** 2026-09-19'a kadar bu bağ insan hafızasına bağlıydı. `package.json`
  > 3.3.0 → 3.4.0 → 3.5.0 oldu, etiket atılmadı ve **hiçbir tüketici haberdar olmadı**.
  > `#semver:^3.x` aralığı etiketlere göre çözüldüğü için `main`'deki sürüm yükseltmesi
  > görünmez bile kaldı. "Etiket atmayı unutma" bir kural değil, bir dilekti.
