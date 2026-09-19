import { describe, expect, it } from 'vitest';
import { digits, toAsciiUpper, toAsciiLower, upper } from './index';

/**
 * TALEP #7 / KAYIT MADDE 33 — giriş süzme.
 *
 * İki tüketici, iki ayrı gün, aynı ihtiyaç: GHS-Panel araç formu (2026-09-17,
 * `121212scca` finansal alana girebiliyordu) ve SNN-İhale gün kutusu
 * (2026-09-16, `3asa`). Talepteki C ve D maddeleri REDDEDİLDİ; karşılıkları
 * `money.formatGroupedInput` ve `money.parseNumber` olarak zaten vardı.
 */

describe('digits — yalnız rakam bırakır', () => {
  it('talepteki ekran vakaları', () => {
    expect(digits('2o0a7')).toBe('207');
    expect(digits('20267', 4)).toBe('2026');
    expect(digits('121212scca')).toBe('121212');
    expect(digits('3asa')).toBe('3');
  });

  it('boş girdi boş döner; süzülecek rakam yoksa da boş', () => {
    expect(digits('')).toBe('');
    expect(digits('abc')).toBe('');
    expect(digits('', 5)).toBe('');
  });

  it('eksi, virgül, nokta ve boşluk da silinir (para kutusu için money motoru)', () => {
    expect(digits('-12,50')).toBe('1250');
    expect(digits('1.250.000')).toBe('1250000');
    expect(digits(' 34 ABC 12 ')).toBe('3412');
  });

  it('maxLength kesmez, yalnız fazlasını atar', () => {
    expect(digits('12', 5)).toBe('12');
    expect(digits('123456', 6)).toBe('123456');
    expect(digits('123456', 0)).toBe('');
  });

  it('20 haneden uzun sınır kabul edilir (gecerliHane sınırı burada geçerli değil)', () => {
    expect(digits('1'.repeat(40), 30)).toBe('1'.repeat(30));
  });

  it('geçersiz maxLength → — (sessizce yok sayılmaz)', () => {
    for (const bozuk of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53]) {
      expect(digits('12345', bozuk)).toBe('—');
    }
  });
});

describe('toAsciiUpper — ASCII kod alanları için', () => {
  it('ASIL SEBEP: upper şasi numarasını bozar, toAsciiUpper bozmaz', () => {
    expect(upper('irmaksasi')).toBe('İRMAKSASİ');
    expect(toAsciiUpper('irmaksasi')).toBe('IRMAKSASI');
  });

  it('toAsciiLower ile ikizdir (gidiş-dönüş)', () => {
    expect(toAsciiUpper(toAsciiLower('VF1KMAC0530'))).toBe('VF1KMAC0530');
    expect(toAsciiLower(toAsciiUpper('vf1kmac0530'))).toBe('vf1kmac0530');
  });

  it('yalnız a-z aralığına dokunur; Türkçe harf ve rakam değişmez', () => {
    expect(toAsciiUpper('ağrı25')).toBe('AğRı25');
    expect(toAsciiUpper('ÇĞİÖŞÜ')).toBe('ÇĞİÖŞÜ');
    expect(toAsciiUpper('')).toBe('');
  });
});
