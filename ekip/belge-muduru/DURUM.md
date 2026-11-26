# Belge Müdürü: durum

Son güncelleme: 2026-11-26 (kurulum belgeleri 4.x hattına çekildi)

## Açık

- `MIGRATION-v5.md` henüz yok. 5.0.0 hazırlığında yazılacak; GHS-Panel satırları TB-013 ve TB-015 kayıtlarında. Kaynak: `docs/teknik-borc.md`.
- `package.json` `files` listesinde `MIGRATION-v2.md` ve `MIGRATION-v3.md` var, `MIGRATION-v4.md` yok. Bilinçli olup olmadığı bilinmiyor; 5.0.0 hazırlığında bakılacak (2026-11-08 ölçüldü).

- `AI-RULES.md:274` hâlâ `#semver:^3.x` diyor; iş tarifi dışı, sahibin kuralı (2026-11-26 görüldü).

## Sahip kararı bekleyen

Yok.

## Biten (son 10)

Kaynak: git geçmişi, 2026-11-08 doğrulandı. Belge işleri kurulumdan önce ayrı kayda alınmıyordu.

- 2026-11-26: README.md ve INSTALL.md kurulum satırı `#semver:^3.0.0` iken `^4.4.0` yapıldı; MIGRATION-v4.md bağlantısı eklendi. Belge kilit testleri geçti (384). Commit bekliyor.
- Commit `7dec036` (2026-10-18): 4.4.0 toplu sürüm hazırlığı.
