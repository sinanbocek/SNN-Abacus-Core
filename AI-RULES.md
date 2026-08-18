# AI-RULES.md — SNN-Abacus-Core Geliştirme Kuralları

> **Bu dosya bağlayıcıdır.** Bu repoda kod yazmadan, dosya oluşturmadan/silmeden veya
> komut çalıştırmadan önce okunur. Kural ile bir istek çelişirse **DUR ve sahibine
> (Sinan) sor** — kuralı sessizce esnetme.
>
> Bu dosya SNN-Abacus-Core'a (çekirdek hesaplama kütüphanesi) özgüdür. Tüketici
> uygulamaların kuralları (mimari katman, veritabanı, dağıtım) burada yer almaz.
>
> **Sürüm:** 1.0 · **Geçerlilik:** tüm AI asistanları · **Kod dili:** İngilizce

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
- **TypeScript strict:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noUnusedLocals`, `noUnusedParameters`. Örtük `any` yok.
- **CI kapısı (Node 22):** `npm ci → lint → tsc --noEmit → test`. Herhangi biri kırılırsa merge yok.

Zorlanamayan madde "kural" değil "öneri"dir.

---

## 2. Kırmızı-Önce TDD (yeni motor/fonksiyon)

Yeni davranış eklenirken:

1. **Önce test yazılır** (`*.test.ts`, vitest). Kod yokken çalıştırılır → **KIRMIZI**
   olduğu kanıtlanır (test gerçekten bir şey bekliyor).
2. **Sonra kod yazılır** → test **YEŞİL** olur.
3. **Meta-doğrulama:** bir sabit/mantık geçici bozulur → ilgili test kırmızı olmalı
   (test gerçekten ölçüyor mu), sonra geri alınır → yeşil, `git diff` boş.

Assert değerleri **dış otoriteden** (piyasa/Darphane/resmi standart) gelir; kodun
ürettiği çıktı assert'e körlemesine kopyalanmaz. Kod ile beklenen çelişirse DUR, raporla.

---

## 3. Saflık ve Kapsülleme

- Motorlar **saf** kalır: I/O yok (fetch/DB/localStorage/env/fs). Veri parametreyle gelir.
- **decimal.js yalnız `math`** içinde. Yeni motor hesabı `math` primitifleriyle yapar.
- Para **kuruş** (integer minor). Float ile para yasak.
- Hata **`null`** ile döner; sessiz `|| 0` yasak.

---

## 4. Tek Otorite (SSOT)

- Bu repo, hesaplama mantığının **tek kaynağıdır**. Aynı iş için ikinci fonksiyon yazılmaz.
- Tüketici projeler mantığı **kopyalamaz**; `@snn/abacus-core`'u `npm install github:...` ile çeker.
- Motor değişikliği yalnız bu repoda yapılır, sürüm (`CHANGELOG.md` + SemVer + git tag) ile dağıtılır.

---

## 5. Git ve Doğrulama Disiplini

- Commit'e yalnız **ilgili dosyalar** girer (`git add .` yasak; dosyaları açıkça ekle).
- Commit tipi anlamlı: `feat:`, `test:`, `docs:`, `ci:`, `fix:`.
- **Push beyanı ≠ push gerçeği.** Her push sonrası: `git fetch` + `git log origin/main`
  ham çıktısı + `git log origin/main..HEAD` (boş olmalı) + `HEAD == origin/main` doğrulanır.
- Sürüm etiketi (`git tag vX.Y.Z`) yalnız CHANGELOG + version bump commit'lendikten sonra atılır.
