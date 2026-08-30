import { describe, expect, it } from 'vitest';
import { percent } from './index';

describe('money.percent — artı işareti seçeneği', () => {
  it('mevcut davranış değişmedi (REGRESYON)', () => {
    expect(percent(12.345)).toBe('%12,3');
    expect(percent(-12.345)).toBe('%-12,3');
    expect(percent(2.5678, 2)).toBe('%2,57');
    expect(percent(null)).toBe('—');
    expect(percent(NaN)).toBe('—');
  });

  it('showPositiveSign ile pozitif değerlere + eklenir', () => {
    expect(percent(12.345, 1, { showPositiveSign: true })).toBe('%+12,3');
    expect(percent(0.5, 1, { showPositiveSign: true })).toBe('%+0,5');
  });

  it('negatif değer seçenekten etkilenmez', () => {
    expect(percent(-12.345, 1, { showPositiveSign: true })).toBe('%-12,3');
  });

  it('sıfıra artı işareti EKLENMEZ (sıfır ne artı ne eksi)', () => {
    expect(percent(0, 1, { showPositiveSign: true })).toBe('%0');
  });

  it('geçersiz girdi seçenekten etkilenmez', () => {
    expect(percent(null, 1, { showPositiveSign: true })).toBe('—');
  });
});
