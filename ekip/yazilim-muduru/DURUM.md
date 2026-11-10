# Yazılım Müdürü: durum

Son güncelleme: 2026-11-10 (minimatch TB-016, durum satırları)

## Açık

- TB-013 adım 2: `PlateResult.yeniKayit` alanını ve `.snn-kod-dili.json` istisnasını sil. Sonraki MAJOR'da. Kaynak: `docs/teknik-borc.md`. Alan `src/abacus/text/index.ts` içinde duruyor (2026-11-08).
- TB-015: `text.company()` beş düzeltme, her biri önce kırmızı test. Sonraki MAJOR'da, TB-013 adım 2 ile birlikte. Kaynak: `docs/teknik-borc.md`, madde 46B.
- 2026-11-10: vitest, @vitest/mocker, @vitest/coverage-v8 4.1.12 birleşti (PR #73); vite 8.3.5 (PR #69) birleşti.
- GitHub güvenlik uyarıları: 1 açık: minimatch (#13), TB-016 kaydına bağlı (ölçüm 2026-11-10 13:46 UTC).
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
