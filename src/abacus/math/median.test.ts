import { describe, expect, it } from 'vitest';
import { median } from './index';

/**
 * Madde 49 — ortanca. Kardeş projelerde üç ayrı kopyası ölçüldü (GHS-Panel teklif okuyucu
 * iki dosya, SNN-Portföy nakit akışı analizi) ve kopyalar çift uzunlukta farklı sonuç
 * veriyordu (`[1, 2, 3, 4]` → 3 ve 2,5). Beklenen değerler istatistiğin tanımından:
 * sıralı dizinin ortası; çift uzunlukta iki ortanın aritmetik ortalaması.
 */
describe('math.median', () => {
  it('tek uzunlukta ortadaki eleman', () => {
    expect(median([5])).toBe(5);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([-5, -1, -3])).toBe(-3);
  });

  it('çift uzunlukta iki ortanın ortalaması', () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([10, 20])).toBe(15);
  });

  it('ortalama ondalık tamdır: [0,1, 0,2] → 0,15 (float 0,15000000000000002 verirdi)', () => {
    expect(median([0.1, 0.2])).toBe(0.15);
  });

  it('büyük tam sayılarda ortalama kaymaz', () => {
    expect(median([1e15, 1e15 + 2])).toBe(1e15 + 1);
  });

  it('boş dizi hesaplanmaz: null, sıfır değil', () => {
    expect(median([])).toBeNull();
  });

  it('sonlu olmayan değer varsa null (sayı atlanmaz; atlamak ortancayı kaydırır)', () => {
    expect(median([Number.NaN, 1, 2])).toBeNull();
    expect(median([1, Number.POSITIVE_INFINITY])).toBeNull();
  });

  it('girdi dizisini değiştirmez', () => {
    const values = [3, 1, 2];
    median(values);
    expect(values).toEqual([3, 1, 2]);
  });
});
