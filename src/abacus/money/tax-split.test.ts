import { describe, expect, it } from 'vitest';
import { taxFromGross, taxFromNet } from './index';

/**
 * Madde 48H — vergi dahil / hariç ayrıştırma (genel tüketim vergisi: KDV, ÖTV…).
 *
 * Kural (nakit K17, mali müşavir onaylı, 2026-10-16; KDV Kanunu md. 20 matrah tanımına göre
 * vergi dahil bedelden vergi "iç yüzde" ile bulunur):
 *   dahil:  vergi = yarımYukarı(brüt × oran ÷ (1 + oran)), net = brüt − vergi
 *   hariç:  vergi = yarımYukarı(net × oran),               brüt = net + vergi
 * İki durumda da net + vergi = brüt (kuruş). Beklenen değerler elle hesaplandı.
 */
describe('money.taxFromGross — vergi dahil tutardan', () => {
  it('tam bölünen tutar: 120,00 TL %20 → vergi 20,00, net 100,00', () => {
    expect(taxFromGross(12000, 0.2)).toEqual({ net: 10000, tax: 2000 });
  });

  it('yarım kuruş yukarı yuvarlanır: 1.002,99 TL %20 → 16.716,5 → vergi 167,17', () => {
    // Önce net bulan yöntem (100299 ÷ 1,2 = 83582,5 → 83583) vergiyi 167,16 verirdi.
    expect(taxFromGross(100299, 0.2)).toEqual({ net: 83582, tax: 16717 });
  });

  it('küçük tutarlar: 3 kuruş %20 → 0,5 → 1; 50 kuruş %1 → 0,495 → 0', () => {
    expect(taxFromGross(3, 0.2)).toEqual({ net: 2, tax: 1 });
    expect(taxFromGross(50, 0.01)).toEqual({ net: 50, tax: 0 });
  });

  it('oran 0: vergi yok', () => {
    expect(taxFromGross(4250, 0)).toEqual({ net: 4250, tax: 0 });
  });

  it('negatif tutar (iade) işaret korumalı yuvarlanır: −3 kuruş %20 → vergi −1', () => {
    expect(taxFromGross(-3, 0.2)).toEqual({ net: -2, tax: -1 });
  });

  it('net + vergi her zaman brüte eşittir', () => {
    for (const rate of [0.01, 0.1, 0.18, 0.2]) {
      for (let gross = 1; gross <= 5000; gross++) {
        const split = taxFromGross(gross, rate);
        expect(split === null ? null : split.net + split.tax).toBe(gross);
      }
    }
  });
});

describe('money.taxFromNet — vergi hariç tutardan', () => {
  it('100,00 TL %20 → vergi 20,00, brüt 120,00', () => {
    expect(taxFromNet(10000, 0.2)).toEqual({ tax: 2000, gross: 12000 });
  });

  it('kuruşa yarım yukarı: 7 kuruş %20 → 1,4 → 1; 8 kuruş → 1,6 → 2; 5 kuruş %10 → 0,5 → 1', () => {
    expect(taxFromNet(7, 0.2)).toEqual({ tax: 1, gross: 8 });
    expect(taxFromNet(8, 0.2)).toEqual({ tax: 2, gross: 10 });
    expect(taxFromNet(5, 0.1)).toEqual({ tax: 1, gross: 6 });
  });

  it('oran 1’den büyük olabilir (ÖTV gibi): 100 kuruş %220 → vergi 220', () => {
    expect(taxFromNet(100, 2.2)).toEqual({ tax: 220, gross: 320 });
  });
});

describe('geçersiz girdi: null, sıfır değil', () => {
  it.each([
    ['negatif oran', 100, -0.1],
    ['sayı olmayan oran', 100, Number.NaN],
    ['sonsuz oran', 100, Number.POSITIVE_INFINITY],
    ['kuruş olmayan tutar', 100.5, 0.2],
    ['sayı olmayan tutar', Number.NaN, 0.2],
    ['güvenli tam sayı olmayan tutar', 2 ** 53, 0.2],
  ])('%s', (_label, amount, rate) => {
    expect(taxFromGross(amount, rate)).toBeNull();
    expect(taxFromNet(amount, rate)).toBeNull();
  });
});
