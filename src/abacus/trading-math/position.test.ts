import { describe, expect, it } from 'vitest';
import { leverage, qtyFromVolume, volumeFromQty } from './position';

describe('ABACUS trading-math/position motoru (miktardan hacim/kaldıraç türetme)', () => {
  describe('volumeFromQty', () => {
    it('miktar * fiyatKuruş * çarpan formülü ile hacim kuruş int hesaplar', () => {
      // 100 lot * 145,50 TL (14.550 kuruş) * 1 çarpan = 1.455.000 kuruş (14.550 TL)
      expect(volumeFromQty(100, 14550, 1)).toBe(1_455_000);
    });

    it('VİOP 100 kontrat çarpanı ile doğru hacim kuruş int hesaplar', () => {
      // 10 kontrat * 100,00 TL (10.000 kuruş) * 100 çarpan = 10.000.000 kuruş (100.000 TL)
      expect(volumeFromQty(10, 10000, 100)).toBe(10_000_000);
    });

    // TB-003: bu koruma kolu hiç test edilmemişti.
    it('miktar, fiyat ya da çarpan <= 0 ise hacim sentinel olarak 0 döner', () => {
      expect(volumeFromQty(0, 14550, 1)).toBe(0);
      expect(volumeFromQty(-5, 14550, 1)).toBe(0);
      expect(volumeFromQty(100, 0, 1)).toBe(0);
      expect(volumeFromQty(100, -14550, 1)).toBe(0);
      expect(volumeFromQty(100, 14550, 0)).toBe(0);
      expect(volumeFromQty(100, 14550, -1)).toBe(0);
    });
  });

  describe('qtyFromVolume', () => {
    it('tam sayılı (fractional=false) piyasalarda aşağı yuvarlayarak miktar döner', () => {
      // 1.455.000 kuruş / (14.550 kuruş * 1) = 100
      expect(qtyFromVolume(1_455_000, 14550, 1, false)).toBe(100);

      // 1.500.000 kuruş / (14.550 kuruş * 1) = 103.0927... -> floor 103
      expect(qtyFromVolume(1_500_000, 14550, 1, false)).toBe(103);
    });

    it('kesirli (fractional=true) piyasalarda ondalıklı miktar döner', () => {
      // 1.500.000 kuruş / (14.550 kuruş * 1) = 103.09278350515464
      const result = qtyFromVolume(1_500_000, 14550, 1, true);
      expect(result).toBeCloseTo(103.09278, 4);
    });

    it('fiyat veya çarpan 0 olduğunda belirsizliği önlemek için miktar sentinel olarak 0 döner', () => {
      expect(qtyFromVolume(1_000_000, 0, 1, false)).toBe(0);
      expect(qtyFromVolume(1_000_000, 14550, 0, false)).toBe(0);
    });

    // TB-003: `denom <= 0` kolu savunma amaçlı görünüyor ama ULAŞILABİLİR.
    // İki pozitif sayının çarpımı taban aşımıyla 0'a düşebilir: mul(1e-200, 1e-200) -> 0.
    // O noktada bölme tanımsız olurdu; motor 0 (miktarsız) döner.
    it('fiyat * çarpan taban aşımıyla 0 olursa miktar 0 döner (denom koruması)', () => {
      expect(qtyFromVolume(1_000_000, 1e-200, 1e-200, false)).toBe(0);
      expect(qtyFromVolume(1_000_000, 5e-324, 5e-324, true)).toBe(0);
    });
  });

  describe('leverage', () => {
    it('hacim / kullanılan teminat oranı ile kaldıraç katını döner', () => {
      // 10.000.000 kuruş hacim / 2.000.000 kuruş teminat = 5x kaldıraç
      expect(leverage(10_000_000, 2_000_000)).toBe(5);
    });

    it('teminat 0 veya negatif olduğunda sessiz 1 fallback yapmayıp null döner', () => {
      expect(leverage(10_000_000, 0)).toBeNull();
      expect(leverage(10_000_000, -500)).toBeNull();
    });
  });
});
