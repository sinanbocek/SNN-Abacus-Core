import { describe, expect, it } from 'vitest';
import { isAfter, isBefore, isSameDay, relative } from './index';

/**
 * TARİH KARŞILAŞTIRMA VE DOĞAL BAĞIL ZAMAN
 *
 * `period.isBetween` vardı, çifti yoktu. `relative` ise yalnız sayı veriyordu
 * ("3 gün sonra"); insanlar gün adı bekliyor ("Perşembe günü").
 * İkisi de tüketici projede elle yazılmış hâlde bulundu (Gunum-Var
 * `isPastDate`/`isBeforeDate` ve `formatNaturalDate`).
 */

describe('date.isBefore / isAfter / isSameDay', () => {
  it('gün sırasını doğru söyler', () => {
    expect(isBefore('2026-08-15', '2026-08-16')).toBe(true);
    expect(isBefore('2026-08-16', '2026-08-15')).toBe(false);
    expect(isAfter('2026-08-16', '2026-08-15')).toBe(true);
    expect(isAfter('2026-08-15', '2026-08-16')).toBe(false);
  });

  it('aynı gün ne önce ne sonradır', () => {
    expect(isBefore('2026-08-15', '2026-08-15')).toBe(false);
    expect(isAfter('2026-08-15', '2026-08-15')).toBe(false);
    expect(isSameDay('2026-08-15', '2026-08-15')).toBe(true);
  });

  it('saat kısmı GÜN karşılaştırmasını bozmaz', () => {
    expect(isSameDay('2026-08-15T09:00:00', '2026-08-15T23:00:00')).toBe(true);
    expect(isBefore('2026-08-15T23:00:00', '2026-08-16T01:00:00')).toBe(true);
  });

  it('saat dilimi çevrimi gün karşılaştırmasına yansır', () => {
    // 2026-08-15T21:30:00Z = İstanbul'da 16 Ağustos 00:30
    expect(isSameDay('2026-08-15T21:30:00Z', '2026-08-16')).toBe(true);
    expect(isAfter('2026-08-15T21:30:00Z', '2026-08-15')).toBe(true);
  });

  it('yıl ve ay sınırlarını geçer', () => {
    expect(isBefore('2026-12-31', '2027-01-01')).toBe(true);
    expect(isAfter('2027-01-01', '2026-12-31')).toBe(true);
  });

  it('geçersiz tarihte null döner — false DEĞİL', () => {
    // "karşılaştıramadım" ile "hayır" birbirinden ayrılır
    expect(isBefore('2024-02-30', '2026-01-01')).toBeNull();
    expect(isAfter('abc', '2026-01-01')).toBeNull();
    expect(isSameDay('2026-01-01', '')).toBeNull();
  });
});

describe('date.relative — doğal stil', () => {
  const bugun = '2026-08-15'; // Cumartesi

  it('varsayılan stil DEĞİŞMEDİ (REGRESYON)', () => {
    expect(relative('2026-08-15', bugun)).toBe('bugün');
    expect(relative('2026-08-16', bugun)).toBe('yarın');
    expect(relative('2026-08-14', bugun)).toBe('dün');
    expect(relative('2026-08-18', bugun)).toBe('3 gün sonra');
    expect(relative('2026-08-12', bugun)).toBe('3 gün önce');
  });

  it('bugün / yarın doğal stilde de aynı', () => {
    expect(relative('2026-08-15', bugun, 'natural')).toBe('bugün');
    expect(relative('2026-08-16', bugun, 'natural')).toBe('yarın');
  });

  it('2-6 gün sonrası GÜN ADI ile söylenir', () => {
    expect(relative('2026-08-17', bugun, 'natural')).toBe('Pazartesi günü');
    expect(relative('2026-08-18', bugun, 'natural')).toBe('Salı günü');
    expect(relative('2026-08-21', bugun, 'natural')).toBe('Cuma günü');
  });

  it('7-13 gün sonrası "haftaya" ile söylenir', () => {
    expect(relative('2026-08-22', bugun, 'natural')).toBe('haftaya Cumartesi');
    expect(relative('2026-08-24', bugun, 'natural')).toBe('haftaya Pazartesi');
    expect(relative('2026-08-28', bugun, 'natural')).toBe('haftaya Cuma');
  });

  it('14 gün ve sonrası sayıya döner', () => {
    expect(relative('2026-08-29', bugun, 'natural')).toBe('14 gün sonra');
    expect(relative('2026-09-15', bugun, 'natural')).toBe('31 gün sonra');
  });

  it('GEÇMİŞ doğal stilde de sayısal kalır (bilinçli kapsam sınırı)', () => {
    // "geçen Perşembe" iki hafta öncesini de anlatabildiği için belirsizdir;
    // çekirdek tahmin etmez.
    expect(relative('2026-08-12', bugun, 'natural')).toBe('3 gün önce');
    expect(relative('2026-08-14', bugun, 'natural')).toBe('dün');
  });

  it('geçersiz girdide — döner', () => {
    expect(relative('2024-02-30', bugun, 'natural')).toBe('—');
    expect(relative('abc', bugun, 'natural')).toBe('—');
  });
});
