import { describe, expect, it } from 'vitest';
import { phone, whatsapp } from './index';

/**
 * BTK Milli Numaralandırma Planı ilk-hane sınıflandırması:
 *   1        -> kısa numara (desteklenmez)
 *   2, 3, 4  -> coğrafi numara (sabit hat)
 *   5        -> mobil
 *   8, 9     -> coğrafi olmayan (850/800 vb.)
 * Kaynak: https://www.btk.gov.tr/cografi-numaralar
 */
describe('text.phone — BTK sınıflandırması', () => {
  describe('mobil (mevcut davranış korunmalı — REGRESYON)', () => {
    it('5 ile başlayan 10 haneyi kabul eder ve kind=mobile döner', () => {
      const r = phone('5321234567');
      expect(r.valid).toBe(true);
      expect(r.stored).toBe('+905321234567');
      expect(r.display).toBe('+90 (532) 123 45 67');
      expect(r.kind).toBe('mobile');
    });

    it('0 önekli ve +90 önekli cep biçimleri aynen çalışır', () => {
      expect(phone('0532 123 45 67').stored).toBe('+905321234567');
      expect(phone('+90 532 123 45 67').stored).toBe('+905321234567');
    });
  });

  describe('sabit hat (coğrafi — 2/3/4)', () => {
    it('0212 İstanbul numarasını kabul eder', () => {
      const r = phone('02123334455');
      expect(r.valid).toBe(true);
      expect(r.stored).toBe('+902123334455');
      expect(r.display).toBe('+90 (212) 333 44 55');
      expect(r.kind).toBe('landline');
    });

    it('0312 Ankara ve 0232 İzmir numaralarını kabul eder', () => {
      expect(phone('03124445566').kind).toBe('landline');
      expect(phone('02324445566').kind).toBe('landline');
    });

    it('4 ile başlayan coğrafi numarayı kabul eder (412 Diyarbakır)', () => {
      expect(phone('04121112233').kind).toBe('landline');
    });

    it('+90 önekli sabit hattı kabul eder', () => {
      expect(phone('+902123334455').stored).toBe('+902123334455');
    });
  });

  describe('coğrafi olmayan (8/9)', () => {
    it('0850 numarasını special olarak tanır', () => {
      const r = phone('08503334455');
      expect(r.valid).toBe(true);
      expect(r.kind).toBe('special');
    });

    it('0800 numarasını special olarak tanır', () => {
      expect(phone('08003334455').kind).toBe('special');
    });
  });

  describe('reddedilenler', () => {
    it('1 ile başlayan kısa numara aralığını reddeder', () => {
      expect(phone('01123334455').valid).toBe(false);
    });

    it('0 veya 6/7 ile başlayan tahsissiz aralığı reddeder', () => {
      expect(phone('00123334455').valid).toBe(false);
      expect(phone('06123334455').valid).toBe(false);
      expect(phone('07123334455').valid).toBe(false);
    });

    it('eksik/fazla hane ve çöp girdiyi reddeder, kind null döner', () => {
      expect(phone('212333445').valid).toBe(false);
      expect(phone('abc').valid).toBe(false);
      expect(phone('').valid).toBe(false);
      expect(phone('abc').kind).toBeNull();
    });
  });

  describe('whatsapp yalnız cep için üretir', () => {
    it('cep numarasında link üretir', () => {
      expect(whatsapp('5321234567')).toBe('https://wa.me/905321234567');
    });

    it('sabit hat ve 850 için boş dize döner', () => {
      expect(whatsapp('02123334455')).toBe('');
      expect(whatsapp('08503334455')).toBe('');
    });
  });
});
