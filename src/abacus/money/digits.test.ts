import { describe, expect, it } from 'vitest';
import { format, formatMajor, knownCurrencyCodes } from './index';

/**
 * TÜKETİCİ RAPORU #1 §6 (SNN Portföy Yönetimi, 1 Eylül 2026).
 *
 * Belirti: TL'yi dört ondalık haneyle yazmak isteyen tüketici, YERLEŞİK TRY
 * tanımını kullanamıyordu. Hane sayısı yalnızca `minorDigits` alanından
 * okunduğu için tüketici tanımın TAMAMINI yeniden yazmak zorunda kalıyordu:
 *
 *   money.formatMajor(1.2345, {
 *     currency: { code: 'TRY', symbol: '₺', text: 'TL', minorDigits: 4 },
 *   })
 *
 * Bu, çekirdeğin sahip olduğu iki veriyi (simge ve metin kısaltma) tüketiciye
 * KOPYALATIYORDU. Fon sayfasında dört haneye ihtiyaç duyan iki yer var:
 * birim pay fiyatı ve yönetim ücretinin kuruş küsuratı.
 */

describe('FormatMoneyOptions.digits — yerleşik birimin hane sayısını geçersiz kılar', () => {
  it('formatMajor dört hane yazar, simge çekirdekten gelir', () => {
    expect(formatMajor(1.2345, { currency: 'TRY', digits: 4, kurus: true })).toBe('₺1,2345');
  });

  it('tam tanım kopyalamakla AYNI sonucu verir — kopya artık gereksiz', () => {
    const digitsIle = formatMajor(1.2345, { currency: 'TRY', digits: 4, kurus: true });
    const kopyaIle = formatMajor(1.2345, {
      currency: { code: 'TRY', symbol: '₺', text: 'TL', minorDigits: 4 },
      kurus: true,
    });
    expect(digitsIle).toBe(kopyaIle);
  });

  it('format (alt birim kapısı) da geçersiz kılmayı uygular', () => {
    // 12345 alt birim, 4 haneli TRY = 1,2345 TL
    expect(format(12345, { currency: 'TRY', digits: 4, kurus: true })).toBe('₺1,2345');
  });

  it('metin biçiminde kısaltma da çekirdekten gelir', () => {
    expect(formatMajor(1.2345, { currency: 'TRY', digits: 4, kurus: true, form: 'text' })).toBe(
      '1,2345 TL'
    );
  });

  it('sıfır hane: kuruşsuz birim davranışı', () => {
    expect(formatMajor(1234, { currency: 'TRY', digits: 0, kurus: true })).toBe('₺1.234');
  });

  it('her yerleşik birimde çalışır', () => {
    expect(formatMajor(1.2345, { currency: 'USD', digits: 4, kurus: true })).toBe('$1,2345');
    expect(formatMajor(1.2345, { currency: 'EUR', digits: 4, kurus: true })).toBe('€1,2345');
    expect(formatMajor(1.2345, { currency: 'GBP', digits: 4, kurus: true })).toBe('£1,2345');
    // Yerleşik liste değişirse bu test bilinçli olarak gözden geçirilsin.
    expect(knownCurrencyCodes()).toEqual(['EUR', 'GBP', 'TRY', 'USD']);
  });

  it('tüketicinin verdiği tam tanımın hanesini de geçersiz kılar', () => {
    const azn = { code: 'AZN', symbol: '₼', text: 'AZN', minorDigits: 2 };
    expect(formatMajor(1.234, { currency: azn, digits: 3, kurus: true })).toBe('₼1,234');
  });

  it('digits verilmezse davranış DEĞİŞMEZ (REGRESYON)', () => {
    expect(formatMajor(1500)).toBe('₺1.500');
    expect(formatMajor(1234.56, { kurus: true })).toBe('₺1.234,56');
    expect(format(123456, { kurus: true })).toBe('₺1.234,56');
    expect(format(123456, { currency: 'EUR', kurus: true })).toBe('€1.234,56');
  });

  it('geçersiz digits SESSİZCE yok sayılmaz — tire döner', () => {
    expect(formatMajor(1.2345, { digits: -1 })).toBe('—');
    expect(formatMajor(1.2345, { digits: 5 })).toBe('—');
    expect(formatMajor(1.2345, { digits: 1.5 })).toBe('—');
    expect(formatMajor(1.2345, { digits: NaN })).toBe('—');
    expect(format(12345, { digits: -1 })).toBe('—');
    expect(format(12345, { digits: 5 })).toBe('—');
  });

  it('tanınmayan para birimi yine tire döner', () => {
    expect(formatMajor(1.2345, { currency: 'YOK', digits: 4 })).toBe('—');
  });
});
