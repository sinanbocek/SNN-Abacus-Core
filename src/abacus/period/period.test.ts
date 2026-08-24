import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  endOfMonth,
  isBetween,
  monthsBetween,
  quarterOf,
  quarterRange,
  startOfMonth,
} from './index';

describe('ABACUS period dönem aritmetiği motoru', () => {
  describe('addDays', () => {
    it('gün ekler ve ay sınırını doğru geçer', () => {
      expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
      expect(addDays('2026-08-24', 7)).toBe('2026-08-31');
    });

    it('yıl sınırını doğru geçer', () => {
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
      expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
    });

    it('artık yıl sınırını doğru geçer', () => {
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
      expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
      expect(addDays('2025-02-28', 1)).toBe('2025-03-01');
    });

    it('negatif gün çıkarır, sıfır aynı günü döner', () => {
      expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
      expect(addDays('2026-08-24', 0)).toBe('2026-08-24');
    });

    it('geçersiz tarih ve geçersiz gün sayısında null döner', () => {
      expect(addDays('2024-02-30', 1)).toBeNull();
      expect(addDays('abc', 1)).toBeNull();
      expect(addDays('2026-08-24', 1.5)).toBeNull();
      expect(addDays('2026-08-24', NaN)).toBeNull();
    });
  });

  describe('addMonths', () => {
    it('ay ekler', () => {
      expect(addMonths('2026-08-24', 1)).toBe('2026-09-24');
      expect(addMonths('2026-08-24', 6)).toBe('2027-02-24');
    });

    it('hedef ayda gün yoksa ay sonuna kırpar', () => {
      expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
      expect(addMonths('2024-01-31', 1)).toBe('2024-02-29'); // artık yıl
      expect(addMonths('2026-03-31', 1)).toBe('2026-04-30');
    });

    it('negatif ay çıkarır ve yıl sınırını geçer', () => {
      expect(addMonths('2026-01-15', -1)).toBe('2025-12-15');
      expect(addMonths('2026-01-15', -13)).toBe('2024-12-15');
    });

    it('geçersiz girdide null döner', () => {
      expect(addMonths('2024-02-30', 1)).toBeNull();
      expect(addMonths('2026-08-24', 1.5)).toBeNull();
    });
  });

  describe('startOfMonth / endOfMonth', () => {
    it('ay başını döner', () => {
      expect(startOfMonth('2026-08-24')).toBe('2026-08-01');
      expect(startOfMonth('2026-01-01')).toBe('2026-01-01');
    });

    it('ay sonunu döner, Şubat’ı artık yıla göre hesaplar', () => {
      expect(endOfMonth('2026-08-10')).toBe('2026-08-31');
      expect(endOfMonth('2026-02-10')).toBe('2026-02-28');
      expect(endOfMonth('2024-02-10')).toBe('2024-02-29');
      expect(endOfMonth('2026-04-10')).toBe('2026-04-30');
    });

    it('geçersiz tarihte null döner', () => {
      expect(startOfMonth('2024-02-30')).toBeNull();
      expect(endOfMonth('abc')).toBeNull();
    });
  });

  describe('quarterOf / quarterRange', () => {
    it('takvim çeyreğini döner', () => {
      expect(quarterOf('2026-01-01')).toBe(1);
      expect(quarterOf('2026-03-31')).toBe(1);
      expect(quarterOf('2026-04-01')).toBe(2);
      expect(quarterOf('2026-08-24')).toBe(3);
      expect(quarterOf('2026-10-01')).toBe(4);
      expect(quarterOf('2026-12-31')).toBe(4);
    });

    it('çeyrek aralığını döner', () => {
      expect(quarterRange(2026, 1)).toEqual({ start: '2026-01-01', end: '2026-03-31' });
      expect(quarterRange(2026, 2)).toEqual({ start: '2026-04-01', end: '2026-06-30' });
      expect(quarterRange(2026, 3)).toEqual({ start: '2026-07-01', end: '2026-09-30' });
      expect(quarterRange(2026, 4)).toEqual({ start: '2026-10-01', end: '2026-12-31' });
    });

    it('geçersiz çeyrek numarasında null döner', () => {
      expect(quarterRange(2026, 0)).toBeNull();
      expect(quarterRange(2026, 5)).toBeNull();
      expect(quarterRange(2026, 1.5)).toBeNull();
      expect(quarterOf('2024-02-30')).toBeNull();
    });
  });

  describe('monthsBetween', () => {
    it('tam ay sayısını döner', () => {
      expect(monthsBetween('2026-01-15', '2026-04-15')).toBe(3);
      expect(monthsBetween('2026-01-15', '2027-01-15')).toBe(12);
    });

    it('gün eşiği dolmadıysa ay saymaz', () => {
      expect(monthsBetween('2026-01-15', '2026-02-14')).toBe(0);
      expect(monthsBetween('2026-01-15', '2026-02-15')).toBe(1);
    });

    it('ters yönde negatif döner', () => {
      expect(monthsBetween('2026-04-15', '2026-01-15')).toBe(-3);
      expect(monthsBetween('2026-02-14', '2026-01-15')).toBe(0);
    });

    it('geçersiz girdide null döner', () => {
      expect(monthsBetween('2024-02-30', '2026-01-01')).toBeNull();
    });
  });

  describe('isBetween', () => {
    it('kapalı aralık (uçlar dâhil) kontrolü yapar', () => {
      expect(isBetween('2026-08-24', '2026-08-01', '2026-08-31')).toBe(true);
      expect(isBetween('2026-08-01', '2026-08-01', '2026-08-31')).toBe(true);
      expect(isBetween('2026-08-31', '2026-08-01', '2026-08-31')).toBe(true);
      expect(isBetween('2026-09-01', '2026-08-01', '2026-08-31')).toBe(false);
      expect(isBetween('2026-07-31', '2026-08-01', '2026-08-31')).toBe(false);
    });

    it('geçersiz girdide null döner', () => {
      expect(isBetween('2024-02-30', '2026-08-01', '2026-08-31')).toBeNull();
    });
  });
});
