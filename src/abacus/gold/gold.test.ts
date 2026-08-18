// YOL-2 DOĞRULUK TESTİ — gold motoru (gram altın + ziynet), kırmızı-önce TDD.
// Assert = B-otorite (piyasa/Darphane, Sinan onaylı): 24K=0.995, 22K=0.916, 21K=0.875, 18K=0.750; ons→gram=31.1034768.
// Karakterizasyon DEĞİL: mevcut davranışı değil, DOĞRU değeri test eder.

import { describe, expect, it } from 'vitest';
import { gramGoldPrice, ziynetPrice } from './index';

describe('ABACUS gold altın ve ziynet hesaplama motoru', () => {
  describe('gramGoldPrice (gram altın fiyatı)', () => {
    it('ons=2650 USD, usdTry=34.20 ile 24K (0.995) gram altın -> 289925 kuruş hesaplar', () => {
      expect(gramGoldPrice(2650, 34.20, 24)).toBe(289925);
    });

    it('ons=2650 USD, usdTry=34.20 ile 22K (0.916) gram altın -> 266906 kuruş hesaplar', () => {
      expect(gramGoldPrice(2650, 34.20, 22)).toBe(266906);
    });

    it('ons=2650 USD, usdTry=34.20 ile 21K (0.875) gram altın -> 254959 kuruş hesaplar', () => {
      expect(gramGoldPrice(2650, 34.20, 21)).toBe(254959);
    });

    it('ons=2650 USD, usdTry=34.20 ile 18K (0.750) gram altın -> 218537 kuruş hesaplar', () => {
      expect(gramGoldPrice(2650, 34.20, 18)).toBe(218537);
    });

    it('geçersiz karat (19) girildiğinde null döner', () => {
      expect(gramGoldPrice(2650, 34.20, 19)).toBeNull();
    });

    it('onsUsd 0 olduğunda null döner', () => {
      expect(gramGoldPrice(0, 34.20, 22)).toBeNull();
    });

    it('onsUsd veya usdTry negatif ya da geçersiz olduğunda null döner', () => {
      expect(gramGoldPrice(-2650, 34.20, 22)).toBeNull();
      expect(gramGoldPrice(2650, -34.20, 22)).toBeNull();
      expect(gramGoldPrice(NaN, 34.20, 22)).toBeNull();
      expect(gramGoldPrice(2650, NaN, 22)).toBeNull();
    });
  });

  describe('ziynetPrice (ziynet altın fiyatı)', () => {
    it('ons=2650 USD, usdTry=34.20 ile quarter (Çeyrek Altın) -> 468153 kuruş hesaplar', () => {
      expect(ziynetPrice('quarter', 2650, 34.20)).toBe(468153);
    });

    it('ons=2650 USD, usdTry=34.20 ile half (Yarım Altın) -> 936307 kuruş hesaplar', () => {
      expect(ziynetPrice('half', 2650, 34.20)).toBe(936307);
    });

    it('ons=2650 USD, usdTry=34.20 ile full (Tam Altın) -> 1872613 kuruş hesaplar', () => {
      expect(ziynetPrice('full', 2650, 34.20)).toBe(1872613);
    });

    it('geçersiz ziynet tipi girildiğinde null döner', () => {
      expect(ziynetPrice('bilinmeyen', 2650, 34.20)).toBeNull();
    });

    it('onsUsd veya usdTry geçersiz olduğunda null döner', () => {
      expect(ziynetPrice('quarter', 0, 34.20)).toBeNull();
      expect(ziynetPrice('quarter', 2650, 0)).toBeNull();
    });
  });
});
