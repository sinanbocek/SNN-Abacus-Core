// YOL-2 DOĞRULUK TESTİ — silver motoru (gram gümüş), kırmızı-önce TDD.
// Assert = B-otorite (piyasa standardı, Sinan onaylı): 999=0.999 (varsayılan), 925=0.925, 800=0.800, 1000=1.000; ons→gram=31.1034768 (troy).
// Karakterizasyon DEĞİL: DOĞRU değeri test eder.

import { describe, expect, it } from 'vitest';
import { gramSilverPrice } from './index';

describe('ABACUS silver gümüş hesaplama motoru', () => {
  describe('gramSilverPrice (gram gümüş fiyatı)', () => {
    it('ons=31 USD, usdTry=34.20 ile 999 milyem külçe gümüş -> 3405 kuruş hesaplar', () => {
      expect(gramSilverPrice(31, 34.20, 999)).toBe(3405);
    });

    it('ons=31 USD, usdTry=34.20 ile 925 milyem sterling gümüş -> 3153 kuruş hesaplar', () => {
      expect(gramSilverPrice(31, 34.20, 925)).toBe(3153);
    });

    it('ons=31 USD, usdTry=34.20 ile 800 milyem gümüş -> 2727 kuruş hesaplar', () => {
      expect(gramSilverPrice(31, 34.20, 800)).toBe(2727);
    });

    it('ons=31 USD, usdTry=34.20 ile 1000 milyem teorik saf gümüş -> 3409 kuruş hesaplar', () => {
      expect(gramSilverPrice(31, 34.20, 1000)).toBe(3409);
    });

    it('millesimal parametresi verilmediğinde varsayılan 999 milyem -> 3405 kuruş hesaplar', () => {
      expect(gramSilverPrice(31, 34.20)).toBe(3405);
    });

    it('haritada olmayan geçersiz milyem (700) girildiğinde null döner', () => {
      expect(gramSilverPrice(31, 34.20, 700)).toBeNull();
    });

    it('onsUsd 0 veya negatif girildiğinde null döner', () => {
      expect(gramSilverPrice(0, 34.20, 999)).toBeNull();
      expect(gramSilverPrice(-31, 34.20, 999)).toBeNull();
    });

    it('usdTry 0 veya negatif girildiğinde null döner', () => {
      expect(gramSilverPrice(31, 0, 999)).toBeNull();
      expect(gramSilverPrice(31, -1, 999)).toBeNull();
    });
  });
});
