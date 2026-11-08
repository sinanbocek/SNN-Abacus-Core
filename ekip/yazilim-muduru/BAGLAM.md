# Yazılım Müdürü: kalıcı bilgi

## Sahip olunan klasörler

| Yol | İçerik |
|---|---|
| `src/abacus/` | Motorlar: collate, currency, date, gold, internal, mask, math, money, period, silver, text, trading-math, unit, validate. Kök test dosyaları dahil. |
| `eslint/index.js`, `eslint.config.js` | Yayınlanan lint yapılandırması ve depo ayarı |
| `scripts/` | `beceri-dogrula.mjs`, `check-release-batching.mjs` |
| `.github/workflows/` | CI, etiket, yayılım, tarama akışları |
| `package.json`, `package-lock.json` | Bağımlılıklar. Sürüm satırı senin değil. |
| `tsconfig.json`, `vitest.config.ts`, `.snn-kod-dili.json` | Derleyici, test ve kod dili istisnaları |
| `docs/teknik-borc.md`, `docs/teknik-borc-arsiv.md` | Teknik borç kütüğü ve arşivi |

## İşe göre önce okunacaklar

| İş | Önce oku |
|---|---|
| Herhangi bir kod işi | `AI-RULES.md`, `ABACUS-SPEC.md`, ilgili motorun kaynağı |
| Kabul edilmiş madde | `GERI-BILDIRIM-KAYDI.md` içindeki ilgili madde |
| Lint kuralı | `AI-RULES.md` §4.0: yeni kapı önce `configs.strict`e girer |
| Teknik borç | `docs/teknik-borc.md` içindeki kayıt |

## Kabul edilmiş madde uygulanınca aynı değişikliğe girenler

Son iki özellik işi bunu gösteriyor (commit `8fe244c`, `4286fdb`). Kilit testleri olmadan kırılır.

| Dosya | Ne eklenir | Kilidi |
|---|---|---|
| `src/abacus/api-surface.test.ts` | Yeni ad, bilinçli olarak | Kendisi |
| `ABACUS-SPEC.md` | §2 fonksiyon tablosu | `spec-surface.test.ts` |
| `README.md` | Motor özeti | `spec-surface.test.ts` |
| `KILAVUZ.md` | En az bir çalışan örnek | `kilavuz.test.ts` |
| `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md` | İmza ve davranış | `docs-claims.test.ts` kısmen |
| `CHANGELOG.md` | `## [Yayınlanmadı]` bölümüne satır | `surum-etiketi.yml` sürüm başlığı arar |
| `GERI-BILDIRIM-KAYDI.md` | Maddenin son sütunu `bekliyor` → `yayınlanmadı (main)` | `check-release-batching.mjs` |

## Kalite kapısı

`.github/workflows/ci.yml` ile aynı sıra. Yeni çalışma kopyasında önce `npm ci`.

```
npm run beceri:dogrula
npm run lint
npx tsc --noEmit
npm run test:coverage
```

Kapsam eşikleri `vitest.config.ts` içindedir ve düşürülmez.

## Yayın

Sen yayın yapmazsın. Sürüm satırı `main`'e girince etiketi makine atar (`surum-etiketi.yml`), yayılımı `cekirdek-yayilim.yml` yapar. Etiket elle atılmaz.

Kırıcı olup olmadığını tüketicinin gördüğü çıktı belirler (`AI-RULES.md` §4.0). Şüpheliyse raporda söyle.
