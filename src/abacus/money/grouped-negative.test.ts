import { describe, expect, it } from 'vitest';
import { decimal, fmtDecimalGrouped, formatMinorInput } from './index';

/**
 * Madde 49 (talep #17, issue #59): `fmtDecimalGrouped` -1 ile 0 arasında eksiyi düşürüyordu.
 * Tam kısım `"-0"` → `Number("-0")` → `0` olup işaret kayboluyordu.
 */
describe('money.fmtDecimalGrouped — -1 ile 0 arası eksi işareti (madde 49)', () => {
  it('talepteki vakalar: eksi korunur', () => {
    expect(fmtDecimalGrouped(-0.5, 1)).toBe('-0,5');
    expect(fmtDecimalGrouped(-0.04, 2)).toBe('-0,04');
  });

  it('sıfıra yuvarlanan değerde eksi yazılmaz', () => {
    expect(fmtDecimalGrouped(-0.4, 0)).toBe('0');
    expect(fmtDecimalGrouped(-0.004, 2)).toBe('0,00');
    expect(fmtDecimalGrouped(-0, 2)).toBe('0,00');
  });

  it('zaten doğru olan çıktılar değişmez', () => {
    expect(fmtDecimalGrouped(-0.999, 2)).toBe('-1,00');
    expect(fmtDecimalGrouped(-1.5, 1)).toBe('-1,5');
    expect(fmtDecimalGrouped(-1234.5, 1)).toBe('-1.234,5');
    expect(fmtDecimalGrouped(0.5, 1)).toBe('0,5');
    expect(fmtDecimalGrouped(70000.5, 2)).toBe('70.000,50');
  });

  it('gruplamasız ikizi decimal ile aynı işareti verir', () => {
    expect(decimal(-0.5, 1)).toBe('-0,5');
  });

  it('formatMinorInput da düzelir: -50 kuruş "-0,50"', () => {
    expect(formatMinorInput(-50, 2)).toBe('-0,50');
    expect(formatMinorInput(-123456, 2)).toBe('-1.234,56');
  });
});
