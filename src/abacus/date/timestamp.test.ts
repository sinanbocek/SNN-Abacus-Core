import { describe, expect, it } from 'vitest';
import { daysBetween, dayName, format, relative } from './index';

/**
 * TÜKETİCİ RAPORU §1 ve §4 (SNN Portföy Yönetimi, 1 Eylül 2026).
 *
 * §1 — PostgREST / Supabase zaman damgaları sessizce '—' oluyordu.
 * Postgres `timestamptz` alanları mikrosaniye taşır ve PostgREST bunu
 * `2026-08-31T06:17:08.317236+00:00` biçiminde yazar. Supabase tabanlı HER
 * tüketici bu duvara çarpıyordu; hata görünmüyordu çünkü ekranda yalnızca
 * '—' beliriyordu.
 *
 * §4 — Aylık gruplamanın doğal anahtarı `YYYY-MM`'dir; `monthYear` ve
 * `period` stilleri gün bileşenini zaten kullanmadığı hâlde onu zorunlu
 * tutuyordu.
 */

describe('date — kesirli saniye (rapor §1)', () => {
  it('mikrosaniyeli PostgREST damgası artık ayrıştırılır', () => {
    expect(format('2026-07-21T10:00:00.123456+00:00', 'dayMonth')).toBe('21 Tem.');
    expect(format('2026-08-31T06:17:08.317236+00:00', 'short')).toBe('31.08.2026');
  });

  it('milisaniyeli ve Z ekli damga', () => {
    expect(format('2026-07-21T10:00:00.123Z', 'dayMonth')).toBe('21 Tem.');
  });

  it('kesirli saniye ATILIR — dakika çözünürlüğü değişmez', () => {
    expect(format('2026-07-21T10:00:00.999999+03:00', 'time')).toBe('10:00');
    expect(format('2026-07-21T10:59:59.999999+03:00', 'time')).toBe('10:59');
  });

  it('kesirli saniye saat dilimi kaydırmasını bozmaz', () => {
    // UTC 21:30 -> İstanbul ertesi gün 00:30
    expect(format('2026-08-15T21:30:00.500Z', 'short')).toBe('16.08.2026');
  });

  it('kesirli saniye gün aritmetiğini de bozmaz', () => {
    expect(daysBetween('2026-07-21T10:00:00.123456Z', '2026-07-24T10:00:00.999Z')).toBe(3);
    expect(dayName('2026-07-21T10:00:00.123456+00:00')).toBe('Sal');
    expect(relative('2026-07-21T00:00:00.123456+03:00', '2026-07-20')).toBe('yarın');
  });

  it('bozuk kesirli saniye yine reddedilir', () => {
    expect(format('2026-07-21T10:00:00.+00:00', 'short')).toBe('—');
    expect(format('2026-07-21T10:00:00.abc+00:00', 'short')).toBe('—');
  });
});

describe('date — çıplak saat dilimi eki +HH (rapor §1)', () => {
  it('Postgres boşluklu biçimi, iki haneli offset ile', () => {
    expect(format('2026-07-21 10:00:00+00', 'dayMonth')).toBe('21 Tem.');
  });

  it('+HH gerçekten kaydırır — +00 ile +03 farklı sonuç verir', () => {
    // 23:30 UTC -> İstanbul ertesi gün 02:30
    expect(format('2026-07-21 23:30:00+00', 'short')).toBe('22.07.2026');
    // 23:30 zaten İstanbul saati -> aynı gün
    expect(format('2026-07-21 23:30:00+03', 'short')).toBe('21.07.2026');
  });

  it('üç biçim de aynı anı gösterir', () => {
    const beklenen = format('2026-07-21T10:00:00+03:00', 'dateTime');
    expect(format('2026-07-21T10:00:00+0300', 'dateTime')).toBe(beklenen);
    expect(format('2026-07-21T10:00:00+03', 'dateTime')).toBe(beklenen);
    expect(beklenen).toBe('21.07.2026 10:00');
  });

  it('geçersiz offset yine reddedilir', () => {
    expect(format('2026-07-21T10:00:00+99', 'short')).toBe('—');
    expect(format('2026-07-21T10:00:00+3', 'short')).toBe('—');
  });
});

describe('date — YYYY-MM girdisi (rapor §4)', () => {
  it('monthYear ve period ay anahtarını kabul eder', () => {
    expect(format('2026-09', 'monthYear')).toBe('Eylül 2026');
    expect(format('2026-09', 'period')).toBe('09/2026');
  });

  it('tam tarihle aynı sonucu verir', () => {
    expect(format('2026-09', 'monthYear')).toBe(format('2026-09-01', 'monthYear'));
    expect(format('2026-09', 'period')).toBe(format('2026-09-15', 'period'));
  });

  it('GÜN GÖSTEREN stiller ayın 1\'ini UYDURMAZ — hâlâ tire döner', () => {
    expect(format('2026-09')).toBe('—');
    expect(format('2026-09', 'short')).toBe('—');
    expect(format('2026-09', 'long')).toBe('—');
    expect(format('2026-09', 'dayMonth')).toBe('—');
    expect(format('2026-09', 'dayMonthWeekday')).toBe('—');
    expect(format('2026-09', 'time')).toBe('—');
    expect(format('2026-09', 'dateTime')).toBe('—');
  });

  it('gün aritmetiği ay anahtarını KABUL ETMEZ', () => {
    expect(daysBetween('2026-09', '2026-10')).toBe(null);
    expect(dayName('2026-09')).toBe('—');
  });

  it('geçersiz ay yine reddedilir', () => {
    expect(format('2026-13', 'monthYear')).toBe('—');
    expect(format('2026-00', 'period')).toBe('—');
  });

  it('gününü kaybetmiş bir ZAMAN DAMGASI geçerli değildir', () => {
    expect(format('2026-09T10:00', 'monthYear')).toBe('—');
    expect(format('2026-09 10:00:00+03', 'period')).toBe('—');
  });
});

describe('date — v2.4.0 davranışı korunur (REGRESYON)', () => {
  it('temiz ISO biçimleri aynen çalışır', () => {
    expect(format('2026-07-21T10:00:00+00:00', 'dayMonth')).toBe('21 Tem.');
    expect(format('2026-08-16')).toBe('16.08.2026');
    expect(format('2026-08-15T21:30:00Z')).toBe('16.08.2026');
  });

  it('takvim doğrulaması gevşemedi', () => {
    expect(format('2024-02-30')).toBe('—');
    expect(format('2025-02-29')).toBe('—');
    expect(format('2026-04-31')).toBe('—');
    expect(format('2026-13-45')).toBe('—');
  });

  it('geçersiz girdi yine tire döner', () => {
    expect(format(null)).toBe('—');
    expect(format('')).toBe('—');
    expect(format('abc')).toBe('—');
    expect(format('2026')).toBe('—');
    expect(format('2026-')).toBe('—');
  });
});
