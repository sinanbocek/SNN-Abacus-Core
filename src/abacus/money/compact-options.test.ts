import { describe, expect, it } from 'vitest';
import { compact, compactMajor } from './index';

/**
 * Talep #11 aday 4 (GHS-Panel, issue #47) — madde 39D: kısa biçim seçenekleri.
 *
 * `digits`: kısaltılmış değerin SABİT ondalık hane sayısı. Bugün `₺1,2Mn` ile
 * `₺29,99Mn` farklı hanede yazılıyor ve tablo sütununda hizalanmıyor.
 *
 * `minScale`: kısaltmanın başladığı en küçük ölçek. `'B'` harfi varsayılan stilde
 * MİLYAR, `B/Mn/Mr` stilinde BİN demektir; `minScale: 'million'` bin ölçeğini hiç
 * kullanmaz, böylece `B` ekranda iki anlamla görünmez.
 *
 * İkisi de verilmezse davranış DEĞİŞMEZ.
 */
const TR = { style: 'B/Mn/Mr' } as const;

describe('compactMajor — digits (sabit hane)', () => {
  it.each([
    [1_200_000, 2, '₺1,20Mn'],
    [29_990_000, 2, '₺29,99Mn'],
    [1_500, 2, '₺1,50B'],
    [1_200_000_000, 2, '₺1,20Mr'],
    [29_990_000, 1, '₺30,0Mn'],
    [1_500_000, 0, '₺2Mn'],
    [1_200_000, 3, '₺1,200Mn'],
  ])('%s, digits %s -> %s', (value, digits, expected) => {
    expect(compactMajor(value, { ...TR, digits })).toBe(expected);
  });

  it('yuvarlama üst ölçeğe taşarsa terfi eder, hane korunur', () => {
    expect(compactMajor(999_999_999, { ...TR, digits: 2 })).toBe('₺1,00Mr');
    expect(compactMajor(999_600, { digits: 0 })).toBe('₺1M');
  });

  it('eksi, metin biçimi ve kuruş girdisi', () => {
    expect(compactMajor(-1_200_000, { ...TR, digits: 2 })).toBe('-₺1,20Mn');
    expect(compactMajor(1_200_000, { ...TR, digits: 2, form: 'text' })).toBe('1,20Mn TL');
    expect(compact(120_000_000, { ...TR, digits: 2 })).toBe('₺1,20Mn');
  });

  it('1.000 altı kısaltılmaz; hane uygulanmaz', () => {
    expect(compactMajor(500, { ...TR, digits: 2 })).toBe('₺500');
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 21])(
    'geçersiz digits (%s) -> "—"',
    (digits) => {
      expect(compactMajor(1_200_000, { ...TR, digits })).toBe('—');
    }
  );

  it('verilmezse bugünkü yazım sürer (en çok 2 hane, sondaki sıfır atılır)', () => {
    expect(compactMajor(1_200_000, TR)).toBe('₺1,2Mn');
    expect(compactMajor(29_990_000, TR)).toBe('₺29,99Mn');
  });
});

/**
 * HATA (madde 41, 4.3.0 hazırlığında ölçüldü): üst ölçeğe terfi kararı birimin
 * HARFİNE bakıyordu. Varsayılan stilde 'B' MİLYAR, Türkçe stilde BİN demek; milyar
 * ölçeğinde yuvarlanan değer 1000'e ulaşınca (1 trilyon ve üstü) tutar milyona
 * "terfi" ediyordu: 2 trilyon -> '₺2M', MİLYON kat küçük. Çekirdekte trilyon birimi
 * yok; en üst ölçek milyardır ve orada kalınır.
 */
describe('compactMajor — en üst ölçek milyardır (madde 41)', () => {
  it.each([
    [2e12, {}, '₺2000B'],
    [1.5e12, {}, '₺1500B'],
    [999_999_999_999, {}, '₺1000B'],
    [2e12, TR, '₺2000Mr'],
    [2e12, { digits: 2 }, '₺2000,00B'],
  ])('%s %j -> %s', (value, opts, expected) => {
    expect(compactMajor(value, opts)).toBe(expected);
  });

  it('milyarın altındaki terfiler yerinde', () => {
    expect(compactMajor(999_999_999)).toBe('₺1B');
    expect(compactMajor(999_999_999, TR)).toBe('₺1Mr');
    expect(compactMajor(999_999, TR)).toBe('₺1Mn');
  });
});

describe('compactMajor — minScale (kısaltmanın başladığı ölçek)', () => {
  it("'million': bin ölçeği kullanılmaz, tutar tam yazılır", () => {
    expect(compactMajor(1_500, { ...TR, minScale: 'million' })).toBe('₺1.500');
    expect(compactMajor(999_999, { ...TR, minScale: 'million' })).toBe('₺999.999');
    expect(compactMajor(1_000_000, { ...TR, minScale: 'million' })).toBe('₺1Mn');
    expect(compactMajor(1_200_000_000, { ...TR, minScale: 'million' })).toBe('₺1,2Mr');
  });

  it("'billion': milyonlar da tam yazılır", () => {
    expect(compactMajor(29_990_000, { ...TR, minScale: 'billion' })).toBe('₺29.990.000');
    expect(compactMajor(1_200_000_000, { ...TR, minScale: 'billion' })).toBe('₺1,2Mr');
  });

  it("'thousand' varsayılanla aynıdır", () => {
    expect(compactMajor(1_500, { ...TR, minScale: 'thousand' })).toBe('₺1,5B');
    expect(compactMajor(1_500, TR)).toBe('₺1,5B');
  });

  it("'million' ile Türkçe stilde 'B' (bin) hiç üretilmez", () => {
    for (const v of [1_000, 12_345, 999_999, 1_000_000, 5_000_000_000]) {
      expect(compactMajor(v, { ...TR, minScale: 'million' })).not.toMatch(/\dB$/);
    }
  });

  it('digits ile birlikte', () => {
    expect(compactMajor(1_200_000, { ...TR, minScale: 'million', digits: 2 })).toBe('₺1,20Mn');
    expect(compactMajor(1_500, { ...TR, minScale: 'million', digits: 2 })).toBe('₺1.500');
  });

  it('eksi tutar da aynı eşikle', () => {
    expect(compactMajor(-1_500, { ...TR, minScale: 'million' })).toBe('-₺1.500');
  });

  it('geçersiz minScale -> "—"', () => {
    expect(compactMajor(1_500, { ...TR, minScale: 'bin' as never })).toBe('—');
  });
});
