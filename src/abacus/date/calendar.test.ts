import { describe, expect, it } from 'vitest';
import { dayName, daysBetween, format, monthName } from './index';

describe('date takvim doğrulaması (rapor B1)', () => {
  it('var olmayan günü reddeder — 30 Şubat', () => {
    expect(format('2024-02-30', 'long')).toBe('—');
    expect(dayName('2024-02-30')).toBe('—');
  });

  it('artık olmayan yılda 29 Şubat’ı reddeder', () => {
    expect(format('2025-02-29', 'long')).toBe('—');
    expect(format('1900-02-29', 'long')).toBe('—'); // 100’e bölünür, 400’e bölünmez
  });

  it('gerçek artık yılda 29 Şubat’ı kabul eder', () => {
    expect(format('2024-02-29', 'long')).toBe('29 Şubat 2024');
    expect(format('2000-02-29', 'long')).toBe('29 Şubat 2000'); // 400’e bölünür
  });

  it('30 günlük ayda 31’i reddeder, 31 günlük ayda kabul eder', () => {
    expect(format('2026-04-31', 'long')).toBe('—');
    expect(format('2026-06-31', 'long')).toBe('—');
    expect(format('2026-01-31', 'long')).toBe('31 Ocak 2026');
    expect(format('2026-12-31', 'long')).toBe('31 Aralık 2026');
  });

  it('gün aritmetiği geçersiz tarihte null döner (sessizce kaymaz)', () => {
    expect(daysBetween('2024-02-30', '2024-03-01')).toBeNull();
    expect(daysBetween('2024-03-01', '2024-02-30')).toBeNull();
  });

  it('geçerli tarihlerde gün aritmetiği aynen çalışır (REGRESYON)', () => {
    expect(daysBetween('2026-08-10', '2026-08-15')).toBe(5);
    expect(daysBetween('2026-01-01', '2026-12-31')).toBe(364);
  });
});

describe('date saat biçimlendirme — Europe/Istanbul (UTC+3)', () => {
  it('Z ekli ISO’yu İstanbul saatine çevirir', () => {
    expect(format('2026-08-24T21:30:00Z', 'time')).toBe('00:30');
    expect(format('2026-08-24T21:30:00Z', 'dateTime')).toBe('25.08.2026 00:30');
  });

  it('saat dilimi yazılmamış ISO’yu İstanbul duvar saati kabul eder (kaydırmaz)', () => {
    expect(format('2026-08-24T10:00:00', 'time')).toBe('10:00');
    expect(format('2026-08-24T10:00:00', 'dateTime')).toBe('24.08.2026 10:00');
  });

  it('+03:00 ekli ISO’yu kaydırmaz', () => {
    expect(format('2026-08-24T10:00:00+03:00', 'time')).toBe('10:00');
  });

  it('farklı offsetleri doğru çevirir', () => {
    expect(format('2026-08-24T10:00:00+00:00', 'time')).toBe('13:00');
    expect(format('2026-08-24T23:00:00-05:00', 'time')).toBe('07:00'); // ertesi gün
    expect(format('2026-08-24T23:00:00-05:00', 'dateTime')).toBe('25.08.2026 07:00');
  });

  it('saat kısmı olmayan ISO’da time/dateTime — döner', () => {
    expect(format('2026-08-24', 'time')).toBe('—');
    expect(format('2026-08-24', 'dateTime')).toBe('—');
  });

  it('tarih stilleri de saat dilimini dikkate alır (tutarlılık)', () => {
    // UTC 21:30 -> İstanbul ertesi gün 00:30, dolayısıyla tarih de ilerler
    expect(format('2026-08-24T21:30:00Z', 'short')).toBe('25.08.2026');
    expect(dayName('2026-08-24T21:30:00Z')).toBe('Sal'); // 25 Ağustos 2026 Salı
  });
});

describe('date ay ve gün adı genişletmeleri', () => {
  it('monthName tek başına ay adı döner', () => {
    expect(monthName(8)).toBe('Ağustos');
    expect(monthName(8, 'short')).toBe('Ağu');
    expect(monthName(1)).toBe('Ocak');
    expect(monthName(12, 'short')).toBe('Ara');
  });

  it('monthName geçersiz ayda — döner', () => {
    expect(monthName(0)).toBe('—');
    expect(monthName(13)).toBe('—');
  });

  it('dayName kısa (varsayılan) ve uzun biçim döner', () => {
    expect(dayName('2026-08-15')).toBe('Cts');
    expect(dayName('2026-08-15', 'long')).toBe('Cumartesi');
    expect(dayName('2026-08-17', 'long')).toBe('Pazartesi');
    expect(dayName('2026-08-13', 'long')).toBe('Perşembe');
  });

  it('bileşik stil: gün + ay + kısa gün adı', () => {
    expect(format('2026-08-13', 'dayMonthWeekday')).toBe('13 Ağustos Per.');
  });
});
