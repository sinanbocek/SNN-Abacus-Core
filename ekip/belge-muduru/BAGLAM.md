# Belge Müdürü: kalıcı bilgi

## Sahip olunan dosyalar

| Yol | İçerik |
|---|---|
| `KILAVUZ.md` | Çalıştırılan örneklerle kullanım kılavuzu |
| `INSTALL.md` | Kurulum |
| `README.md` | Giriş ve motor özeti |
| `ABACUS-SPEC.md` | Şartname |
| `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md` | Motor ayrıntıları |
| `MIGRATION-v2.md`, `MIGRATION-v3.md`, `MIGRATION-v4.md` | Ana sürüm göç rehberleri |
| `CHANGELOG.md` | Değişiklik günlüğü |
| `ekip/PANO.md` | Yalnız Genel Müdür isteyince toplama |

Kabul edilmiş madde uygulanırken bu dosyaların kilitli satırlarını Yazılım Müdürü yazar. Sen koddan bağımsız belge işine ve sürüm hazırlığına bakarsın.

`AI-RULES.md` sahibin kuralıdır; yalnız iş tarifinde açıkça istenirse değişir.

## Belgeyi kilitleyen testler

| Test | Ne ölçer |
|---|---|
| `src/abacus/spec-surface.test.ts` | Şartname §2 tablosu ve README motor özeti gerçek dışa açılan adlarla aynı mı |
| `src/abacus/kilavuz.test.ts` | Kılavuzdaki her `js` örneği çalışıyor mu, her ad geçiyor mu |
| `src/abacus/docs-claims.test.ts` | Belgelerdeki davranış iddiaları doğru mu |

Belge değişince çalıştır:

```
npx vitest run src/abacus/spec-surface.test.ts src/abacus/kilavuz.test.ts src/abacus/docs-claims.test.ts
```

Yeni çalışma kopyasında önce `npm ci`.

## Sürüm hazırlığı

Yalnız sahip onayı iş tarifinde yazılıysa yapılır. 4.4.0 sürümünün dokunduğu yerler (commit `7dec036`):

1. `CHANGELOG.md`: `## [Yayınlanmadı]` başlığı `## [X.Y.Z] - tarih` olur. Bu başlık yoksa etiket atılmaz.
2. `package.json`: sürüm satırı.
3. `GERI-BILDIRIM-KAYDI.md`: yalnız sürüm sütunu ve `## Kaynak raporlar` tablosu. Kapı yalnız `bekliyor` satırını yakalar; `yayınlanmadı (main)` satırlarını elle düzelt.
4. `SNN-ABACUS-CORE-MOTOR-DETAYLARI.md`: başlıktaki "vX.Y serisi" satırı. `docs-claims.test.ts` kırar.
5. Ana sürümde `MIGRATION-vN.md` yazılır; tüketicide neyin kırıldığı `CHANGELOG.md` başlığında açıkça yazılır.

Sonra çalıştır: `npm run surum:toplu`. Etiket elle atılmaz; makine atar.

## Yayın

Sen yayın yapmazsın. Birleştirme ve etiket doğrulaması Genel Müdür'ündür.
