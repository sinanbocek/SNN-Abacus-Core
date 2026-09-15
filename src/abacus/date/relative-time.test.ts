import { describe, expect, it } from 'vitest';
import { relativeTime } from './index';

/**
 * TALEP #6 / KAYIT MADDE 32 — dakika/saat çözünürlüklü göreli süre.
 *
 * Üç tüketicide (trade-kasa, GHS-Panel, Gunum-Var) dört farklı kopya vardı.
 * Yazım politikası sahip kararıyla belirlendi; bu dosya o kararları çiviler:
 * küçük harf `az önce` · `long`/`short` · 24 saatten sonra `date.relative`e
 * devir · gelecek simetrik (`sonra`) · `0` ve negatif damga geçerli.
 */

const SN = 1000;
const DK = 60 * SN;
const SA = 60 * DK;

/** İstanbul 2026-09-15 13:00 (UTC 10:00). */
const SIMDI = Date.UTC(2026, 8, 15, 10, 0, 0);

describe('relativeTime — 1 dakikanın altı', () => {
  it('aynı an ve iki yönde 59,999 sn → az önce (küçük harf)', () => {
    expect(relativeTime(SIMDI, SIMDI)).toBe('az önce');
    expect(relativeTime(SIMDI - (DK - 1), SIMDI)).toBe('az önce');
    expect(relativeTime(SIMDI + (DK - 1), SIMDI)).toBe('az önce');
    expect(relativeTime(SIMDI - (DK - 1), SIMDI, { style: 'short' })).toBe('az önce');
  });
});

describe('relativeTime — dakika', () => {
  it('60 sn sınırı: 1 dakika', () => {
    expect(relativeTime(SIMDI - DK, SIMDI)).toBe('1 dakika önce');
    expect(relativeTime(SIMDI + DK, SIMDI)).toBe('1 dakika sonra');
    expect(relativeTime(SIMDI - DK, SIMDI, { style: 'short' })).toBe('1 dk önce');
    expect(relativeTime(SIMDI + DK, SIMDI, { style: 'short' })).toBe('1 dk sonra');
  });

  it('aşağı yuvarlar: 5 dk 59 sn → 5', () => {
    expect(relativeTime(SIMDI - (5 * DK + 59 * SN), SIMDI)).toBe('5 dakika önce');
    expect(relativeTime(SIMDI + (5 * DK + 59 * SN), SIMDI)).toBe('5 dakika sonra');
  });

  it('59 dk 59,999 sn hâlâ dakikadır', () => {
    expect(relativeTime(SIMDI - (SA - 1), SIMDI)).toBe('59 dakika önce');
  });
});

describe('relativeTime — saat', () => {
  it('60 dk sınırı: 1 saat', () => {
    expect(relativeTime(SIMDI - SA, SIMDI)).toBe('1 saat önce');
    expect(relativeTime(SIMDI - SA, SIMDI, { style: 'short' })).toBe('1 sa önce');
    expect(relativeTime(SIMDI + 3 * SA, SIMDI)).toBe('3 saat sonra');
    expect(relativeTime(SIMDI + 3 * SA, SIMDI, { style: 'short' })).toBe('3 sa sonra');
  });

  it('24 saatin 1 ms altı hâlâ saattir', () => {
    expect(relativeTime(SIMDI - (24 * SA - 1), SIMDI)).toBe('23 saat önce');
  });
});

describe('relativeTime — 24 saat ve üstü date.relative\'e devredilir', () => {
  it('tam 24 saat → dün / yarın', () => {
    expect(relativeTime(SIMDI - 24 * SA, SIMDI)).toBe('dün');
    expect(relativeTime(SIMDI + 24 * SA, SIMDI)).toBe('yarın');
  });

  it('gün sayısı ve stil farkı yok', () => {
    expect(relativeTime(SIMDI - 72 * SA, SIMDI)).toBe('3 gün önce');
    expect(relativeTime(SIMDI - 72 * SA, SIMDI, { style: 'short' })).toBe('3 gün önce');
    expect(relativeTime(SIMDI + 48 * SA, SIMDI)).toBe('2 gün sonra');
  });

  it('ay/yıl birimi yok: 92 gün', () => {
    expect(relativeTime(SIMDI - 92 * 24 * SA, SIMDI)).toBe('92 gün önce');
  });

  it('gün İSTANBUL takvimine göre sayılır, UTC\'ye göre değil', () => {
    // Şimdi: İstanbul 15 Eylül 02:00 (UTC 14 Eylül 23:00).
    const gece = Date.UTC(2026, 8, 14, 23, 0, 0);
    // 47 saat önce: İstanbul 13 Eylül 03:00 → iki takvim günü.
    // UTC ile sayılsaydı 13 Eylül 00:00 → 14 Eylül olur, "dün" çıkardı.
    expect(relativeTime(gece - 47 * SA, gece)).toBe('2 gün önce');
  });

  it('BİLİNÇLİ SIÇRAMA: 23 saatten sonra "dün" atlanıp "2 gün önce" gelebilir', () => {
    // Şimdi: İstanbul 15 Eylül 01:00. 23 sa önce 14 Eylül 02:00; 30 sa önce 13 Eylül 19:00.
    const gece = Date.UTC(2026, 8, 14, 22, 0, 0);
    expect(relativeTime(gece - 23 * SA, gece)).toBe('23 saat önce');
    expect(relativeTime(gece - 30 * SA, gece)).toBe('2 gün önce');
  });
});

describe('relativeTime — girdi sözleşmesi', () => {
  it('güvenli tam sayı olmayan her girdi → —', () => {
    for (const bozuk of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 1.5, 2 ** 53]) {
      expect(relativeTime(bozuk, SIMDI)).toBe('—');
      expect(relativeTime(SIMDI, bozuk)).toBe('—');
    }
  });

  it('0 ve negatif damga GEÇERLİDİR (çekirdek sıfıra anlam yüklemez)', () => {
    expect(relativeTime(0, 0)).toBe('az önce');
    expect(relativeTime(-DK, 0)).toBe('1 dakika önce');
    expect(relativeTime(0, 5 * SA)).toBe('5 saat önce');
    // 1970-01-01 03:00 İstanbul → 1969-12-29 03:00 İstanbul
    expect(relativeTime(-3 * 24 * SA, 0)).toBe('3 gün önce');
  });

  it('takvimin temsil edemediği gün → —', () => {
    // Güvenli tam sayı ama Date aralığı (±8,64e15 ms) dışında.
    expect(relativeTime(8_700_000_000_000_000, SIMDI)).toBe('—');
  });

  it('varsayılan stil long', () => {
    expect(relativeTime(SIMDI - 5 * DK, SIMDI)).toBe(relativeTime(SIMDI - 5 * DK, SIMDI, { style: 'long' }));
    expect(relativeTime(SIMDI - 5 * DK, SIMDI, {})).toBe('5 dakika önce');
  });
});
