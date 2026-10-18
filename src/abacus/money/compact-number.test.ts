import { describe, expect, it } from 'vitest';
import { compactMajor, compactNumber } from './index';

/** Madde 50 (talep #18, issue #60): para birimsiz kısaltma. */
describe('money.compactNumber — para birimsiz kısaltma (madde 50)', () => {
  it('talepteki vakalar', () => {
    expect(compactNumber(1250000, { style: 'B/Mn/Mr' })).toBe('1,25Mn');
    expect(compactNumber(12500, { style: 'B/Mn/Mr' })).toBe('12,5B');
    expect(compactNumber(-1250000, { style: 'B/Mn/Mr' })).toBe('-1,25Mn');
    expect(compactNumber(999, { style: 'B/Mn/Mr' })).toBe('999');
  });

  it('varsayılan stil compact ile aynı (K/M)', () => {
    expect(compactNumber(1500)).toBe('1,5K');
    expect(compactNumber(2e12)).toBe('2000B');
  });

  it('kısaltılmış kısım compactMajor ile birebir aynı, yalnız simge yok', () => {
    const cases: [number, Parameters<typeof compactNumber>[1]][] = [
      [1250000, { style: 'B/Mn/Mr' }],
      [1200000, { style: 'B/Mn/Mr', digits: 2 }],
      [999999, { style: 'B/Mn/Mr' }],
      [3456789012, { digits: 0 }],
      [2500000, { minScale: 'million' }],
      [-12500, { style: 'B/Mn/Mr', digits: 1 }],
    ];
    for (const [value, opts] of cases) {
      expect(compactNumber(value, opts)).toBe(compactMajor(value, opts).replace('₺', ''));
    }
  });

  it('ölçeğin altında sayı kaybolmaz: en çok 2 hane, sondaki sıfır atılır', () => {
    expect(compactNumber(0)).toBe('0');
    expect(compactNumber(0.5)).toBe('0,5');
    expect(compactNumber(-0.5)).toBe('-0,5');
    expect(compactNumber(12.345)).toBe('12,35');
    expect(compactNumber(12.0)).toBe('12');
    expect(compactNumber(100)).toBe('100');
    expect(compactNumber(-0.001)).toBe('0');
  });

  it('ölçeğin altında digits sabit hane verir', () => {
    expect(compactNumber(5, { digits: 1 })).toBe('5,0');
    expect(compactNumber(1500, { minScale: 'million', digits: 0 })).toBe('1.500');
    expect(compactNumber(1500, { minScale: 'million' })).toBe('1.500');
  });

  it('geçersiz girdide "—"', () => {
    expect(compactNumber(null)).toBe('—');
    expect(compactNumber(undefined)).toBe('—');
    expect(compactNumber(Number.NaN)).toBe('—');
    expect(compactNumber(Infinity)).toBe('—');
    expect(compactNumber(1000, { digits: -1 })).toBe('—');
    // @ts-expect-error geçersiz ölçek
    expect(compactNumber(1000, { minScale: 'trillion' })).toBe('—');
  });
});
