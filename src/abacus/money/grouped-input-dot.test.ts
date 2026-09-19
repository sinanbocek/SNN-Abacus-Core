import { describe, expect, it } from 'vitest';
import { formatGroupedInput, parseNumber } from './index';

/**
 * Talep #40 (trade-kasa) — nokta tuşu seçmeli olarak ondalık ayracı sayılabilsin.
 *
 * Ölçülen sorun: risk hesabı yapan bir stop kutusuna `98.50` yazan kullanıcı
 * `9.850` görüyordu — 100 kat sapma. Nokta binlik sayılmıyor, SİLİNİYOR.
 */
describe('formatGroupedInput — dotAsDecimal', () => {
  describe('varsayılan davranış DEĞİŞMEDİ (kırıcı değil)', () => {
    it.each([
      ['98.50', '9.850'],
      ['1234.56', '123.456'],
      ['1.5', '15'],
      ['1.234,56', '1.234,56'],
      ['1.234', '1.234'],
      ['1250000', '1.250.000'],
      ['121212scca', '121.212'],
      ['000', '0'],
      ['', ''],
    ])('%j -> %j', (raw, expected) => {
      expect(formatGroupedInput(raw)).toBe(expected);
      expect(formatGroupedInput(raw, {})).toBe(expected);
      expect(formatGroupedInput(raw, { dotAsDecimal: false })).toBe(expected);
    });
  });

  describe('dotAsDecimal: true — nokta ondalık ayracı olur', () => {
    it.each([
      ['98.50', '98,50'],
      ['1234.56', '1.234,56'],
      ['1.5', '1,5'],
      ['0.075', '0,075'],
      ['1234,56', '1.234,56'],
      ['1250000', '1.250.000'],
      ['', ''],
    ])('%j -> %j', (raw, expected) => {
      expect(formatGroupedInput(raw, { dotAsDecimal: true })).toBe(expected);
    });

    // HATA (talep #42, v4.1.0'da geldi): nokta ve virgül BİRLİKTE varsa noktalar
    // binlik ayracıdır, ondalık değil. v4.1.0 hepsini virgüle çeviriyordu:
    // '1.234,56' -> '1,23456' (1000 KAT sapma) — üstelik bu, uygulamanın KENDİ
    // çıktı biçimi (`fmtDecimalGrouped(1234.56, 2)`).
    it('karışık biçim bozulmaz: virgül varsa noktalar binliktir', () => {
      expect(formatGroupedInput('1.234,56', { dotAsDecimal: true })).toBe('1.234,56');
      expect(formatGroupedInput('1.250.000,75', { dotAsDecimal: true })).toBe('1.250.000,75');
      expect(formatGroupedInput('23.232,50', { dotAsDecimal: true })).toBe('23.232,50');
      expect(parseNumber(formatGroupedInput('1.234,56', { dotAsDecimal: true }))).toBe(1234.56);
    });

    it('birden çok nokta, virgül YOKSA binliktir — tek nokta ondalıktır', () => {
      // Tek nokta: kullanıcı ondalık yazıyor olabilir, seçeneğin amacı bu.
      expect(formatGroupedInput('98.50', { dotAsDecimal: true })).toBe('98,50');
      // Birden çok nokta: binlik ayracı yazıyor; ondalık olamaz.
      expect(formatGroupedInput('1.250.000', { dotAsDecimal: true })).toBe('1.250.000');
      expect(formatGroupedInput('1.234.567', { dotAsDecimal: true })).toBe('1.234.567');
    });

    it('TAKAS: binlik ayracı olarak nokta artık yazılamaz', () => {
      // Bilinçli ödün. Bu kutuda "1.234" 1,234 demektir — bin iki yüz otuz dört değil.
      expect(formatGroupedInput('1.234', { dotAsDecimal: true })).toBe('1,234');
    });

    it('canlı yazım sırası bozulmaz', () => {
      const steps = ['9', '98', '98.', '98.5', '98.50'];
      expect(steps.map((s) => formatGroupedInput(s, { dotAsDecimal: true }))).toEqual([
        '9',
        '98',
        '98,',
        '98,5',
        '98,50',
      ]);
    });
  });

  describe('zincir uçtan uca — talebin asıl derdi', () => {
    it('stop kutusuna 98.50 yazan kullanıcı 98,5 alır', () => {
      const box = formatGroupedInput('98.50', { dotAsDecimal: true });
      expect(box).toBe('98,50');
      expect(parseNumber(box)).toBe(98.5);
    });

    it('seçenek olmadan bugünkü 100 kat sapma aynen sürer', () => {
      const box = formatGroupedInput('98.50');
      expect(box).toBe('9.850');
      expect(parseNumber(box)).toBe(9850);
    });
  });
});
