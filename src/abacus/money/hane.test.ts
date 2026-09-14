import { describe, expect, it } from 'vitest';
import { decimal, fmtDecimalGrouped, percent, ratio } from './index';
import { dataSize } from '../unit';

/**
 * GEÇERSİZ HANE SAYISI — ÇÖKME YERİNE '—' (v3.0.0, KIRICI DÜZELTME).
 *
 * v2.x'teki HATA: hane sayısı alan biçimleme fonksiyonları geçersiz `digits`
 * değerinde `'—'` döndürmek yerine decimal.js hatası FIRLATIYORDU:
 *
 *   money.decimal(4.3, 1.5)            → [DecimalError] Invalid argument: 1.5
 *   money.percent(4.3, -1)             → [DecimalError] Invalid argument: -1
 *   money.fmtDecimalGrouped(4.3, NaN)  → fırlatır
 *   unit.dataSize(5242880, { digits: Infinity }) → fırlatır
 *
 * Bu, ABACUS-SPEC §2.1'in ihlaliydi: biçimleme işi geçersiz girdide `'—'` döner,
 * asla çökmez. v2.9.0'da `money.percent` üzerinde mutasyon testi yapılırken ölçüldü.
 *
 * İKİNCİ HATA: çok büyük hane sayısı anlamsız çıktı üretiyordu
 * (`fmtDecimalGrouped(4.3, 100)` → virgülden sonra 100 hane). JavaScript sayısı
 * ~17 anlamlı basamak taşıyabilir; bunun ötesindeki haneler uydurmadır.
 *
 * KURAL: `digits` 0 ile 20 arasında (dâhil) bir tam sayı olmalıdır; aksi hâlde
 * `'—'`. `money.formatMinorInput` kendi daha dar sınırını (0–4) korur.
 */

const GECERSIZ_HANELER = [1.5, -1, NaN, Infinity, -Infinity, 21, 100];

describe('geçersiz hane sayısı çökme yerine tire döner', () => {
  for (const h of GECERSIZ_HANELER) {
    it(`digits = ${h}`, () => {
      expect(decimal(4.3, h)).toBe('—');
      expect(percent(4.3, h)).toBe('—');
      expect(percent(4.3, h, { fixed: true })).toBe('—');
      expect(fmtDecimalGrouped(4.3, h)).toBe('—');
      expect(dataSize(5242880, { digits: h })).toBe('—');
    });
  }
});

describe('sınırlar dâhil geçerli', () => {
  it('digits = 0', () => {
    expect(decimal(4.3, 0)).toBe('4');
    expect(percent(4.3, 0)).toBe('%4');
    expect(fmtDecimalGrouped(4300.4, 0)).toBe('4.300');
    expect(dataSize(5242880, { digits: 0 })).toBe('5 MB');
  });

  it('digits = 20', () => {
    expect(decimal(4.3, 20)).toBe('4,3');
    expect(percent(4.3, 20)).toBe('%4,3');
    expect(dataSize(5242880, { digits: 20 })).toBe('5 MB');
    // fixed ve fmtDecimalGrouped haneyi doldurur — 20 hane sonlu ve kısa kalır.
    expect(percent(4.3, 20, { fixed: true })).toBe('%4,30000000000000000000');
  });
});

describe('geçerli hane sayıları DEĞİŞMEDİ (REGRESYON)', () => {
  it('varsayılanlar ve olağan değerler', () => {
    expect(decimal(2.5)).toBe('2,5');
    expect(decimal(2.567, 2)).toBe('2,57');
    expect(percent(12.345, 1)).toBe('%12,3');
    expect(percent(-4.3, 2, { fixed: true })).toBe('-%4,30');
    expect(fmtDecimalGrouped(70000)).toBe('70.000');
    expect(ratio(8.712)).toBe('8,71x');
    expect(dataSize(5242880)).toBe('5 MB');
    expect(dataSize(1536, { digits: 1 })).toBe('1,5 KB');
  });

  it('geçersiz DEĞER hâlâ tire döner (değişmedi)', () => {
    expect(decimal(NaN, 2)).toBe('—');
    expect(percent(null, 2)).toBe('—');
    expect(fmtDecimalGrouped(undefined, 2)).toBe('—');
    expect(dataSize(-1)).toBe('—');
  });
});
