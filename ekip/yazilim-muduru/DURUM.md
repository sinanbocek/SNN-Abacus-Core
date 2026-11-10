# Yazılım Müdürü: durum

Son güncelleme: 2026-11-10 (vitest 4.1.12 yükseltmesi)

## Açık

- TB-013 adım 2: `PlateResult.yeniKayit` alanını ve `.snn-kod-dili.json` istisnasını sil. Sonraki MAJOR'da. Kaynak: `docs/teknik-borc.md`. Alan `src/abacus/text/index.ts` içinde duruyor (2026-11-08).
- TB-015: `text.company()` beş düzeltme, her biri önce kırmızı test. Sonraki MAJOR'da, TB-013 adım 2 ile birlikte. Kaynak: `docs/teknik-borc.md`, madde 46B.
- PR #69: Vite 8.2.2 → 8.3.5 (Dependabot). Denetimler yeşil, birleştirilmedi (2026-11-08).
- 2026-11-10: vitest, @vitest/mocker, @vitest/coverage-v8 4.1.12 yapıldı (vite 8.3.5 korundu); çalışma kopyasında, birleştirme Genel Müdür'de. Vitest, vite'i sert bağımlılık olarak çektiği için kilit dosyasında vite, rolldown, postcss ve ilgili girişler elle eski sürümde tutuldu.
- GitHub güvenlik uyarıları: 8 açık, hepsi geliştirme aracı. Vite 6 (1 yüksek, 4 orta, 1 düşük), `@vitest/mocker` 2 orta. Kütükte karşılığı yok. PR #69'un kaçını kapattığı ölçülmedi (2026-11-08).
- (durumu belirsiz) TB-013 etkisi: GHS-Panel'de 6 kaynak, 3 test satırı. Ölçüm 2026-09-24 tarihli; 5.0.0 öncesi yeniden ölçülmeli.
- (durumu belirsiz) TB-015 etkisi: çekirdek dışında yalnız GHS-Panel çağırıyor. Ölçüm 2026-09-24 tarihli; 5.0.0 öncesi yeniden ölçülmeli.

## Sahip kararı bekleyen

- 5.0.0 ne zaman açılır. Sahip kararı (2026-09-24): acele yok, bir sonraki ana sürümde yapılır.

## Biten (son 10)

Kaynak: `gh pr list --state merged`, 2026-11-08 doğrulandı.

- PR #68 (2026-10-18): brace-expansion 5.0.12.
- PR #67 (2026-10-18): source-map-js 1.2.2.
- PR #66 (2026-10-18): `math.amortize` (madde 51B) ve 4.4.0.
- PR #64 (2026-10-18): `fmtDecimalGrouped` eksi düzeltmesi, `compactNumber` (madde 49, 50).
- PR #63 (2026-10-17): `.gitattributes`, LF satır sonu.
- PR #61 (2026-10-16): `valueAt`, `accrual`, `median`, `taxFrom*`, `abbreviationSteps`.
- PR #58 (2026-09-28): `unit` hacim kategorisi (madde 47).
- PR #57 (2026-09-24): `newRegistration` eklendi (TB-013 adım 1).
- PR #56 (2026-09-24): K harfi "ka" okunur (madde 44D).
- PR #55 (2026-09-24): kısaltmaya hâl eki (TB-014).
