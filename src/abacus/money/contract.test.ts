import { describe, expect, it } from 'vitest';
import { fmtDecimalGrouped, parseNumber } from './index';
import { add, div, mul } from '../math';

describe('money dönüş sözleşmesi hizalaması (rapor B5)', () => {
  describe('parseNumber artık sessiz 0 döndürmez', () => {
    it('çözümlenemeyen girdide null döner', () => {
      expect(parseNumber('abc')).toBeNull();
      expect(parseNumber('')).toBeNull();
      expect(parseNumber('   ')).toBeNull();
      expect(parseNumber('-')).toBeNull();
      expect(parseNumber(',')).toBeNull();
    });

    it('gerçek sıfırı null’dan ayırır', () => {
      expect(parseNumber('0')).toBe(0);
      expect(parseNumber('0,00')).toBe(0);
    });

    it('Türkçe biçimli sayıları çözer (REGRESYON)', () => {
      expect(parseNumber('1.234,56')).toBe(1234.56);
      expect(parseNumber('70.000,50')).toBe(70000.5);
      expect(parseNumber('-1.234,56')).toBe(-1234.56);
      expect(parseNumber('42')).toBe(42);
    });
  });

  describe('fmtDecimalGrouped artık "0" değil, biçimlendirme sentineli döner', () => {
    it('null / undefined / NaN girdisinde — döner', () => {
      expect(fmtDecimalGrouped(null)).toBe('—');
      expect(fmtDecimalGrouped(undefined)).toBe('—');
      expect(fmtDecimalGrouped(NaN)).toBe('—');
      expect(fmtDecimalGrouped(Infinity)).toBe('—');
    });

    it('gerçek sıfırı "0" olarak basar (yokluk ile karışmaz)', () => {
      expect(fmtDecimalGrouped(0)).toBe('0');
      expect(fmtDecimalGrouped(0, 2)).toBe('0,00');
    });

    it('mevcut biçimlendirme davranışı değişmedi (REGRESYON)', () => {
      expect(fmtDecimalGrouped(47.89, 4)).toBe('47,8900');
      expect(fmtDecimalGrouped(70000.5, 2)).toBe('70.000,50');
    });
  });
});

describe('math ilkel katmanı — NaN yayılımı çivilenmiştir (bilinçli sözleşme)', () => {
  it('sonlu olmayan girdi sonlu olmayan çıktı üretir, sessizce 0 olmaz', () => {
    expect(add(NaN, 1)).toBeNaN();
    expect(mul(NaN, 2)).toBeNaN();
  });

  it('bölme gibi tanımsızlık üretebilen işlemler null döner', () => {
    expect(div(1, 0)).toBeNull();
  });

  it('NaN asla 0 ile karışmaz', () => {
    expect(add(NaN, 1)).not.toBe(0);
  });
});
