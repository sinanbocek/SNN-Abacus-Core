# Değişiklik Günlüğü

Bu projedeki tüm önemli değişiklikler bu dosyada belgelenir.
Format [Keep a Changelog](https://keepachangelog.com/tr/) temellidir;
sürümleme [Semantic Versioning](https://semver.org/lang/tr/) kurallarına uyar.

## [1.1.0] - 2026-08-18

### Eklenenler
- **gold motoru** — Ons/USD ve USD/TRY üzerinden gram altın (24K/22K/21K/18K)
  ve ziynet (çeyrek/yarım/tam) hesaplama. B-otorite saflık katsayıları:
  24K=0.995, 22K=0.916, 21K=0.875, 18K=0.750; ons→gram=31.1034768 (troy).
- **silver motoru** — Ons/USD ve USD/TRY üzerinden gram gümüş hesaplama.
  Milyem saflıkları: 999 (külçe, varsayılan), 925 (sterling), 800, 1000.
- gold ve silver için 20 birim testi (toplam 225).

## [1.0.0] - 2026

### Eklenenler
- Çekirdek motorlar: math, money, currency, date, text, validate, mask, tradingMath.
- decimal.js tabanlı kuruş matematiği, half-up yuvarlama, null sentinel deseni.
- Tam saf (I/O'suz) kütüphane mimarisi, vitest test altyapısı, CI (lint + tsc + test).
