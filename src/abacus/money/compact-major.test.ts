import { describe, expect, it } from 'vitest';
import { compact, compactMajor, format, formatMajor, percent, toMinor } from './index';
import { abs } from '../math';

/**
 * TÜKETİCİ RAPORU §2 ve §3 (SNN Portföy Yönetimi, 1 Eylül 2026).
 *
 * §2 — Finansal arayüzlerde yaygın kalıp işareti RENKLE anlatıp metinde
 * göstermemektir. Tüketici `percent(Math.abs(v), 1)` yazmak zorunda kalıyordu;
 * `Math.abs` unutulunca "%-3,2" kırmızı renkle üst üste binip çift olumsuzlama
 * gibi okunuyordu.
 *
 * §3 — `format` / `formatMajor` çifti tutarlı sunulmuşken `compact` yalnız
 * alt birim sürümüyle geliyordu; grafik ekseni gibi ana birimle çalışan her
 * yerde tüketici `compact(toMinor(v) ?? 0, opts)` çevrimini elle yazıyordu.
 */

describe('money.percent — işaret modu (rapor §2)', () => {
  it("'never' eksi işaretini metinden düşürür", () => {
    expect(percent(-3.2, 1, { sign: 'never' })).toBe('%3,2');
    expect(percent(3.2, 1, { sign: 'never' })).toBe('%3,2');
    expect(percent(0, 1, { sign: 'never' })).toBe('%0');
  });

  it("'never', tüketicinin abs() sarmalamasıyla aynı sonucu verir", () => {
    // Rapor §2: tüketici `percent(Math.abs(v), 1)` yazmak zorunda kalıyordu.
    for (const v of [-3.2, -0.5, 0, 0.5, 12.34, -99.99]) {
      expect(percent(v, 1, { sign: 'never' })).toBe(percent(abs(v), 1));
    }
  });

  it("'never' yuvarlama SONRASI işaretsizleştirir — '%-0' üretmez", () => {
    expect(percent(-0.04, 1, { sign: 'never' })).toBe('%0');
    expect(percent(-0.04, 1)).toBe('%0'); // auto modda da -0 yazılmaz
  });

  it("'always' artıyı yazar, sıfıra işaret koymaz", () => {
    expect(percent(3.2, 1, { sign: 'always' })).toBe('%+3,2');
    expect(percent(-3.2, 1, { sign: 'always' })).toBe('%-3,2');
    expect(percent(0, 1, { sign: 'always' })).toBe('%0');
  });

  it("'auto' varsayılandır ve v2.4.0 davranışının aynısıdır", () => {
    expect(percent(3.2, 1, { sign: 'auto' })).toBe(percent(3.2, 1));
    expect(percent(-3.2, 1, { sign: 'auto' })).toBe(percent(-3.2, 1));
    expect(percent(-3.2, 1)).toBe('%-3,2');
    expect(percent(3.2, 1)).toBe('%3,2');
  });

  it('showPositiveSign geriye dönük çalışır (REGRESYON)', () => {
    expect(percent(12.3, 1, { showPositiveSign: true })).toBe('%+12,3');
    expect(percent(-12.3, 1, { showPositiveSign: true })).toBe('%-12,3');
    expect(percent(0, 1, { showPositiveSign: true })).toBe('%0');
  });

  it('sign verilirse showPositiveSign YOK SAYILIR', () => {
    expect(percent(3.2, 1, { showPositiveSign: true, sign: 'never' })).toBe('%3,2');
    expect(percent(3.2, 1, { showPositiveSign: true, sign: 'auto' })).toBe('%3,2');
    expect(percent(3.2, 1, { showPositiveSign: false, sign: 'always' })).toBe('%+3,2');
  });

  it('geçersiz girdi her modda tire döner', () => {
    for (const sign of ['auto', 'always', 'never'] as const) {
      expect(percent(null, 1, { sign })).toBe('—');
      expect(percent(undefined, 1, { sign })).toBe('—');
      expect(percent(NaN, 1, { sign })).toBe('—');
      expect(percent(Infinity, 1, { sign })).toBe('—');
    }
  });
});

describe('money.compactMajor (rapor §3)', () => {
  it('ana birim girdiyi kısaltır', () => {
    expect(compactMajor(1500000, { style: 'B/Mn/Mr' })).toBe('₺1,5Mn');
    expect(compactMajor(1500000)).toBe('₺1,5M');
  });

  it('compact(toMinor(v)) ile birebir aynı sonucu verir', () => {
    for (const v of [1500, 1500000, 2500000000, 999, 0, -4200000]) {
      const minor = toMinor(v);
      expect(minor).not.toBe(null);
      expect(compactMajor(v)).toBe(compact(minor as number));
    }
  });

  it('formatMajor ile simetriktir — ikisi de ana birim okur', () => {
    expect(formatMajor(1500)).toBe('₺1.500');
    expect(compactMajor(1500)).toBe('₺1,5K'); // 1000 ANA birim üstü kısaltılır
    expect(compactMajor(999)).toBe('₺999'); // 1000 altı kısaltılmaz
    // Alt birim kapısı: aynı sayı burada 15 lira demektir. Simetri şudur —
    // compactMajor/formatMajor ana birim, compact/format alt birim okur.
    expect(format(1500)).toBe('₺15');
    expect(compact(1500)).toBe('₺15');
  });

  it('seçenekler compact ile aynı anlamı taşır', () => {
    expect(compactMajor(1500000, { form: 'text' })).toBe('1,5M TL');
    expect(compactMajor(1500000, { style: 'B/Mn/Mr', currency: 'USD' })).toBe('$1,5Mn');
    expect(compactMajor(2500, { style: 'B/Mn/Mr' })).toBe('₺2,5B');
  });

  it('negatif değer işareti korur', () => {
    expect(compactMajor(-1500000, { style: 'B/Mn/Mr' })).toBe('-₺1,5Mn');
  });

  it('geçersiz girdide SESSİZCE SIFIR üretmez — tire döner', () => {
    expect(compactMajor(null)).toBe('—');
    expect(compactMajor(undefined)).toBe('—');
    expect(compactMajor(NaN)).toBe('—');
    expect(compactMajor(Infinity)).toBe('—');
    expect(compactMajor(1500, { currency: 'YOK' })).toBe('—');
  });

  it('sıfır sıfır kalır', () => {
    expect(compactMajor(0)).toBe('0');
  });
});
