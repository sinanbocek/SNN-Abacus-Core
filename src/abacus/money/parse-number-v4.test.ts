import { describe, expect, it } from 'vitest';
import { parseNumber } from './index';

/**
 * v4.0.0 — KIRICI DÜZELTME (TB-010).
 *
 * v3'te `parseNumber` Türkçe olmayan her yazımı sessizce yanlış sayıya çeviriyordu:
 * `"1234.56"` -> `123456` (100 kat), `"12abc34"` -> `1234`. JSDoc ise
 * "çözümlenemeyen girdide null döner" vaat ediyordu; kod sözleşmeyi ihlal ediyordu.
 *
 * Kabul edilen dilbilgisi SNN-Ihale-Maliyet'in ölçülmüş çözümünden alındı
 * (`src/infrastructure/excel/decimalCell.ts`, yorumunda "Çekirdeğe talep adayı"
 * yazıyordu): isteğe bağlı eksi · 3'erli nokta/boşluk/U+00A0 binlik grupları ·
 * virgülden sonra istenen kadar ondalık.
 */
describe('money.parseNumber — v4 sözleşmesi', () => {
  describe('Türkçe biçim okunur (v3 ile aynı, gerileme koruması)', () => {
    it.each([
      ['0', 0],
      ['7', 7],
      ['1234', 1234],
      ['1,5', 1.5],
      ['1234,56', 1234.56],
      ['1.234', 1234],
      ['1.234,56', 1234.56],
      ['1.250.000', 1250000],
      ['23.232,50', 23232.5],
      ['-1.234,56', -1234.56],
      ['-0,5', -0.5],
      ['0,075', 0.075],
      ['  7,00  ', 7],
      ['1 234,56', 1234.56],
      ['1\u00a0234,56', 1234.56],
    ])('%j -> %d', (input, expected) => {
      expect(parseNumber(input)).toBe(expected);
    });
  });

  describe('Türkçe OLMAYAN yazım artık null döner (v3 sessizce yanlış sayı veriyordu)', () => {
    it.each([
      ['1234.56', 123456],
      ['1.5', 15],
      ['1e3', 13],
      ['12abc34', 1234],
      ['1,2,3', 1.23],
      ['(1.210,50)', 1210.5],
    ])('%j -> null (v3: %d)', (input) => {
      expect(parseNumber(input)).toBeNull();
    });

    it('3 haneli olmayan nokta grubu binlik sayılmaz', () => {
      expect(parseNumber('1.23')).toBeNull();
      expect(parseNumber('1.2345')).toBeNull();
      expect(parseNumber('12.34.56')).toBeNull();
    });
  });

  describe('boş ve bozuk girdi (v3 ile aynı)', () => {
    it.each(['', '   ', 'abc', '-', ',', '-,', '.', '--5'])('%j -> null', (input) => {
      expect(parseNumber(input)).toBeNull();
    });

    it('null/undefined çökmez', () => {
      expect(parseNumber(null as unknown as string)).toBeNull();
      expect(parseNumber(undefined as unknown as string)).toBeNull();
    });
  });
});
