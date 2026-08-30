import { describe, expect, it } from 'vitest';
import {
  collate,
  currency,
  date,
  gold,
  mask,
  math,
  money,
  period,
  silver,
  text,
  tradingMath,
  unit,
  validate,
} from './index';

/**
 * BELGE İDDİALARI TESTİ.
 *
 * README.md, INSTALL.md, ABACUS-SPEC.md ve SNN-ABACUS-CORE-MOTOR-DETAYLARI.md
 * içindeki her kod örneği burada birebir doğrulanır.
 *
 * Amaç: denetim raporundaki B7 hatasının tekrarını önlemek — belgelerin
 * yanlış çıktı iddia etmesi. Bir belge örneği değişirse bu test kırmızı verir.
 */

describe('BELGE İDDİALARI — README.md hızlı başlangıç', () => {
  it('kod bloğundaki her satır', () => {
    expect(money.format(150000)).toBe('₺1.500');
    expect(math.add(10000, 5000)).toBe(15000);
    expect(tradingMath.calculateThresholdDays(0.1, 35)).toBe(116);
    expect(gold.gramGoldPrice(2650, 34.2, 22)).toBe(266906);
    expect(gold.ziynetPrice('quarter', 2650, 34.2)).toBe(468153);
    expect(silver.gramSilverPrice(31, 34.2)).toBe(3405);
    expect(unit.convert(5000, 'm2', 'dönüm')).toBe(5);
    expect(unit.dataSize(5242880)).toBe('5 MB');
    expect(period.addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(period.quarterRange(2026, 3)).toEqual({ start: '2026-07-01', end: '2026-09-30' });
    expect(collate.sortBy(['zam', 'çam', 'dal'])).toEqual(['çam', 'dal', 'zam']);
  });
});

describe('BELGE İDDİALARI — INSTALL.md §3 kullanım örneği', () => {
  it('kod bloğundaki her satır', () => {
    expect(money.format(150000)).toBe('₺1.500');
    expect(math.add(10000, 5000)).toBe(15000);
    expect(tradingMath.calculateThresholdDays(0.1, 35)).toBe(116);
    expect(date.format('2026-08-16')).toBe('16.08.2026');
    expect(date.format('2026-08-16', 'long')).toBe('16 Ağustos 2026');
    expect(date.format('2026-08-24T21:30:00Z', 'dateTime')).toBe('25.08.2026 00:30');
    expect(mask.vkn('1234567890')).toBe('123****890');
    expect(unit.convert(5000, 'm2', 'dönüm')).toBe(5);
    expect(unit.dataSize(5242880)).toBe('5 MB');
    expect(period.addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(collate.sortBy(['zam', 'çam', 'dal'])).toEqual(['çam', 'dal', 'zam']);
  });

  it('§3 uyarısı: Date nesnesi çalışmaz', () => {
    expect(date.format(new Date() as never)).toBe('—');
  });
});

describe('BELGE İDDİALARI — ABACUS-SPEC.md', () => {
  it('§1 çağrı deseni örnekleri', () => {
    expect(money.format(2323223)).toBe('₺23.232');
    expect(gold.gramGoldPrice(2650, 34.2, 22)).toBe(266906);
    expect(silver.gramSilverPrice(31, 34.2)).toBe(3405);
  });

  it('§2.1 dönüş sözleşmesi tablosunun her satırı', () => {
    // hesap -> null
    expect(math.div(1, 0)).toBeNull();
    expect(currency.convert(100, 0)).toBeNull();
    expect(gold.gramGoldPrice(2400, 34, 99)).toBeNull();
    expect(unit.convert(1, 'kg', 'm')).toBeNull();
    expect(money.parseNumber('abc')).toBeNull();
    // biçimlendirme -> '—'
    expect(money.format(null)).toBe('—');
    expect(money.toWords(NaN)).toBe('—');
    expect(money.fmtDecimalGrouped(null)).toBe('—');
    expect(date.format(null)).toBe('—');
    expect(mask.vkn('abc')).toBe('—');
    expect(unit.dataSize(-1)).toBe('—');
    // doğrulama -> false
    expect(validate.vkn('abc')).toBe(false);
    expect(validate.tckn('11111111111')).toBe(false);
    expect(validate.iban('')).toBe(false);
    expect(validate.ikn('abc')).toBe(false);
    expect(validate.email(' ')).toBe(false);
    // normalizasyon -> { valid: false }
    expect(text.phone('abc').valid).toBe(false);
    expect(text.email('abc').valid).toBe(false);
    // metin dönüşümü -> ''
    expect(text.title('')).toBe('');
    expect(text.join([])).toBe('');
    expect(text.numberToWords(-5)).toBe('');
  });

  it('§2.1 ilkel katman istisnası: NaN yayılır, 0 olmaz', () => {
    expect(math.add(NaN, 1)).toBeNaN();
    expect(math.mul(NaN, 2)).toBeNaN();
    expect(math.add(NaN, 1)).not.toBe(0);
  });

  it('§3 ONS_TO_GRAM üç motorda tek kaynaktan', () => {
    expect(gold.ONS_TO_GRAM).toBe(31.1034768);
    expect(silver.ONS_TO_GRAM).toBe(gold.ONS_TO_GRAM);
    expect(unit.ONS_TO_GRAM).toBe(gold.ONS_TO_GRAM);
  });
});

describe('BELGE İDDİALARI — MOTOR-DETAYLARI: money', () => {
  it('parseNumber (B5 sonrası)', () => {
    expect(money.parseNumber('23.232,50')).toBe(23232.5);
    expect(money.parseNumber('1.234,56')).toBe(1234.56);
    expect(money.parseNumber('-1.234,56')).toBe(-1234.56);
    expect(money.parseNumber('0')).toBe(0);
    expect(money.parseNumber('abc')).toBeNull();
    expect(money.parseNumber('')).toBeNull();
    expect(money.parseNumber('-')).toBeNull();
  });

  it('fmtDecimalGrouped (B5 sonrası)', () => {
    expect(money.fmtDecimalGrouped(47.89, 4)).toBe('47,8900');
    expect(money.fmtDecimalGrouped(34.5, 4)).toBe('34,5000');
    expect(money.fmtDecimalGrouped(70000.5, 2)).toBe('70.000,50');
    expect(money.fmtDecimalGrouped(0)).toBe('0');
    expect(money.fmtDecimalGrouped(null)).toBe('—');
    expect(money.fmtDecimalGrouped(NaN)).toBe('—');
  });

  it('compact ve percent', () => {
    expect(money.compact(123456789)).toBe('₺1,23M');
    expect(money.compact(-123456789)).toBe('-₺1,23M');
    expect(money.percent(12.345)).toBe('%12,3');
    expect(money.percent(null)).toBe('—');
  });

  it('toWords (B2/B4 sonrası)', () => {
    expect(money.toWords(123456)).toBe('Yalnız BinİkiYüzOtuzDörtLiraElliAltıKuruş');
    expect(money.toWords(-15000)).toBe('Yalnız EksiYüzElliTürkLirası');
    expect(money.toWords(-15000, { spaced: true })).toBe('Yalnız Eksi Yüz Elli Türk Lirası');
    expect(money.toWords(0)).toBe('Yalnız SıfırTürkLirası');
  });
});

describe('BELGE İDDİALARI — MOTOR-DETAYLARI: date', () => {
  it('format stilleri ve takvim', () => {
    expect(date.format('2026-01-05')).toBe('05.01.2026');
    expect(date.format('2026-08-15', 'long')).toBe('15 Ağustos 2026');
    expect(date.format('2026-12-01', 'long')).toBe('1 Aralık 2026');
    expect(date.format('2026-08-15', 'dayMonth')).toBe('15 Ağu.');
    expect(date.format('2026-08-15', 'monthYear')).toBe('Ağustos 2026');
    expect(date.format('2026-08-15', 'period')).toBe('08/2026');
    expect(date.format('2026-08-15T21:30:00Z')).toBe('16.08.2026');
    expect(date.format('2024-02-30')).toBe('—');
    expect(date.format('2026-13-45')).toBe('—');
    expect(date.format('2026-08-13', 'dayMonthWeekday')).toBe('13 Ağustos Per.');
  });

  it('monthName ve dayName', () => {
    expect(date.monthName(8)).toBe('Ağustos');
    expect(date.monthName(8, 'short')).toBe('Ağu');
    expect(date.monthName(0)).toBe('—');
    expect(date.dayName('2026-08-15')).toBe('Cts');
    expect(date.dayName('2026-08-15', 'long')).toBe('Cumartesi');
    expect(date.dayName('2026-08-17')).toBe('Pzt');
    expect(date.dayName('invalid')).toBe('—');
  });

  it('daysBetween ve relative', () => {
    expect(date.daysBetween('2026-08-10', '2026-08-15')).toBe(5);
    expect(date.daysBetween('2026-01-01', '2026-12-31')).toBe(364);
    expect(date.relative('2026-08-12', '2026-08-15')).toBe('3 gün önce');
    expect(date.relative('2026-08-18', '2026-08-15')).toBe('3 gün sonra');
  });
});

describe('BELGE İDDİALARI — MOTOR-DETAYLARI: period', () => {
  it('belgedeki tüm örnekler', () => {
    expect(period.addDays('2026-08-31', 1)).toBe('2026-09-01');
    expect(period.addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(period.addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(period.addDays('2026-08-24', 1.5)).toBeNull();
    expect(period.addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(period.addMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(period.addMonths('2026-03-31', 1)).toBe('2026-04-30');
    expect(period.addMonths('2026-01-15', -13)).toBe('2024-12-15');
    expect(period.startOfMonth('2026-08-24')).toBe('2026-08-01');
    expect(period.endOfMonth('2026-02-10')).toBe('2026-02-28');
    expect(period.endOfMonth('2024-02-10')).toBe('2024-02-29');
    expect(period.quarterOf('2026-08-24')).toBe(3);
    expect(period.quarterRange(2026, 3)).toEqual({ start: '2026-07-01', end: '2026-09-30' });
    expect(period.quarterRange(2026, 5)).toBeNull();
    expect(period.monthsBetween('2026-01-15', '2026-02-14')).toBe(0);
    expect(period.monthsBetween('2026-01-15', '2026-02-15')).toBe(1);
    expect(period.monthsBetween('2026-04-15', '2026-01-15')).toBe(-3);
    expect(period.isBetween('2026-08-31', '2026-08-01', '2026-08-31')).toBe(true);
  });
});

describe('BELGE İDDİALARI — MOTOR-DETAYLARI: collate', () => {
  it('belgedeki tüm örnekler', () => {
    expect(collate.compare('can', 'çan')).toBe(-1);
    expect(collate.compare('ısı', 'iyi')).toBe(-1);
    expect(collate.compare('kâr', 'kar')).toBe(0);
    expect(collate.compare('Çan', 'çan')).toBe(0);
    expect(collate.key('')).toBe('');
    expect(collate.sortBy(['zam', 'çam', 'dal'])).toEqual(['çam', 'dal', 'zam']);
    // belgedeki "ham sort yanlış verir" iddiası
    expect([...['zam', 'çam', 'dal']].sort()).toEqual(['dal', 'zam', 'çam']);
  });
});

describe('BELGE İDDİALARI — MOTOR-DETAYLARI: unit / silver / gold', () => {
  it('unit örnekleri', () => {
    expect(unit.convert(1, 'km', 'm')).toBe(1000);
    expect(unit.convert(1, 'ons', 'g')).toBe(31.1034768);
    expect(unit.convert(5000, 'm2', 'dönüm')).toBe(5);
    expect(unit.convert(5242880, 'B', 'MB')).toBe(5);
    expect(unit.convert(NaN, 'm', 'km')).toBeNull();
    expect(unit.convert(-2, 'km', 'm')).toBe(-2000);
    expect(unit.dataSize(1536)).toBe('1,5 KB');
    expect(unit.dataSize(512)).toBe('512 B');
    expect(unit.dataSize(0)).toBe('0 B');
  });

  it('silver / gold örnekleri', () => {
    expect(silver.gramSilverPrice(31, 34.2, 999)).toBe(3405);
    expect(silver.gramSilverPrice(31, 34.2, 925)).toBe(3153);
    expect(silver.gramSilverPrice(31, 34.2, 800)).toBe(2727);
    expect(silver.gramSilverPrice(31, 34.2, 1000)).toBe(3409);
    expect(silver.gramSilverPrice(31, 34.2, 700)).toBeNull();
  });
});

describe('BELGE İDDİALARI — MOTOR-DETAYLARI: text / mask', () => {
  it('harf dönüşümü ve join', () => {
    expect(text.lower('İSTANBUL')).toBe('istanbul');
    expect(text.lower('IŞIK')).toBe('ışık');
    expect(text.upper('iğne')).toBe('İĞNE');
    expect(text.upper('ışık')).toBe('IŞIK');
    expect(text.title('ahmet yılmaz')).toBe('Ahmet Yılmaz');
    expect(text.title('iSTANBUL')).toBe('İstanbul');
    expect(text.join(['Ali', 'Veli'])).toBe('Ali ve Veli');
    expect(text.join(['Ali', 'Veli', 'Can'])).toBe('Ali, Veli ve Can');
  });

  it('numberToWords ölçek tavanı', () => {
    expect(text.numberToWords(1e15)).toBe('BirKatrilyon');
    expect(text.numberToWords(1e16)).toBe('');
  });

  it('phone BTK tablosu ve mask', () => {
    expect(text.phone('02123334455').kind).toBe('landline');
    expect(text.phone('5321234567').kind).toBe('mobile');
    expect(text.phone('08503334455').kind).toBe('special');
    expect(text.phone('01123334455').valid).toBe(false);
    expect(text.whatsapp('02123334455')).toBe('');
    expect(text.whatsapp('5321234567')).toBe('https://wa.me/905321234567');
    expect(mask.phone('05321234567')).toBe('+90 5** *** ** 67');
    expect(mask.phone('02123334455')).toBe('+90 2** *** ** 55');
  });
});

describe('BELGE İDDİALARI — MIGRATION-v2.md', () => {
  it('Adım 1a: saat dilimi çevrimi', () => {
    expect(date.format('2026-08-15T21:30:00Z')).toBe('16.08.2026');
    expect(date.format('2026-08-15')).toBe('15.08.2026');
    expect(date.format('2026-08-15T21:30:00')).toBe('15.08.2026');
  });

  it('Adım 1b: takvim doğrulaması', () => {
    expect(date.format('2024-02-30', 'long')).toBe('—');
    expect(date.format('2025-02-29', 'long')).toBe('—');
    expect(date.daysBetween('2024-02-30', '2024-03-01')).toBeNull();
    expect(date.format('2024-02-29', 'long')).toBe('29 Şubat 2024');
    expect(date.format('2000-02-29', 'long')).toBe('29 Şubat 2000');
  });

  it('Adım 2: parseNumber', () => {
    expect(money.parseNumber('0')).toBe(0);
    expect(money.parseNumber('')).toBeNull();
    expect(money.parseNumber('abc')).toBeNull();
    expect(money.parseNumber('1.234,56')).toBe(1234.56);
  });

  it('Adım 3a: fmtDecimalGrouped', () => {
    expect(money.fmtDecimalGrouped(null)).toBe('—');
    expect(money.fmtDecimalGrouped(0)).toBe('0');
    expect(money.fmtDecimalGrouped(70000.5, 2)).toBe('70.000,50');
  });

  it('Adım 3b: toWords negatif ve geçersiz', () => {
    expect(money.toWords(-15000)).toBe('Yalnız EksiYüzElliTürkLirası');
    expect(money.toWords(NaN)).toBe('—');
  });

  it('Adım 3c: telefon sınıflandırması', () => {
    expect(text.phone('02123334455').valid).toBe(true);
    expect(text.phone('02123334455').kind).toBe('landline');
    expect(mask.phone('02123334455')).toBe('+90 2** *** ** 55');
    expect(text.phone('5321234567').kind).toBe('mobile');
    expect(mask.phone('05321234567')).toBe('+90 5** *** ** 67');
    expect(text.whatsapp('02123334455')).toBe('');
    expect(text.whatsapp('5321234567')).toBe('https://wa.me/905321234567');
  });

  it('Değişmeyenler bölümü', () => {
    expect(gold.ONS_TO_GRAM).toBe(31.1034768);
    expect(silver.ONS_TO_GRAM).toBe(31.1034768);
    expect(money.format(2323223)).toBe('₺23.232');
    expect(money.compact(123456789)).toBe('₺1,23M');
    expect(text.upper('ışık')).toBe('IŞIK');
    expect(text.title('ahmet yılmaz')).toBe('Ahmet Yılmaz');
  });

  it('Yeni motorlar bölümü', () => {
    expect(unit.convert(5000, 'm2', 'dönüm')).toBe(5);
    expect(unit.dataSize(5242880)).toBe('5 MB');
    expect(period.addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(period.quarterRange(2026, 3)).toEqual({ start: '2026-07-01', end: '2026-09-30' });
    expect(collate.sortBy(['zam', 'çam', 'dal'])).toEqual(['çam', 'dal', 'zam']);
    expect([...['zam', 'çam', 'dal']].sort()).toEqual(['dal', 'zam', 'çam']);
  });
});

describe('BELGE İDDİALARI — giriş kapısı (AYNA KURALI)', () => {
  it('SPEC §2.1: parse(format(x)) === x', () => {
    expect(money.parse(money.format(123456, { kurus: true }))).toBe(123456);
    expect(date.parse(date.format('2026-08-15', 'short'))).toBe('2026-08-15');
    expect(date.parse(date.format('2026-08-15', 'long'))).toBe('2026-08-15');
  });

  it('SPEC §2.1: bilgi kaybeden çıktı geri okunamaz', () => {
    expect(date.parse('Ağustos 2026')).toBeNull();
    expect(date.parse('15 Ağu.')).toBeNull();
    expect(date.parse('08/2026')).toBeNull();
    expect(date.parse('00:30')).toBeNull();
  });

  it('README: hızlı başlangıç parse satırları', () => {
    expect(money.parse('₺1.234,56')).toBe(123456);
    expect(date.parse('15.08.2026')).toBe('2026-08-15');
  });

  it('MOTOR-DETAYLARI: money.parse örnekleri', () => {
    expect(money.parse('₺23.232')).toBe(2323200);
    expect(money.parse('₺23.232,23')).toBe(2323223);
    expect(money.parse('-₺23.232')).toBe(-2323200);
    expect(money.parse('(₺23.232)')).toBe(-2323200);
    expect(money.parse('23.232 TL')).toBe(2323200);
    expect(money.parse('$220,75')).toBe(22075);
    expect(money.parse('220,75 USD')).toBe(22075);
    expect(money.parse('0')).toBe(0);
    expect(money.parse('0,00')).toBe(0);
    expect(money.parse('1.234,56')).toBe(123456);
    expect(money.parse('1234,56')).toBe(123456);
    expect(money.parse('1,5')).toBe(150);
    expect(money.parse('1,234.56')).toBeNull();
    expect(money.parse('1.23')).toBeNull();
    expect(money.parse('1,234')).toBeNull();
    expect(money.parse('1.234,56 XYZ')).toBeNull(); // EUR v2.2.0'da tanınır
    // float hatasi karsilastirmasi
    expect(money.parse('19,99')).toBe(1999);
    expect((money.parseNumber('19,99') as number) * 100).not.toBe(1999);
  });

  it('MOTOR-DETAYLARI: date.parse örnekleri', () => {
    expect(date.parse('15.08.2026')).toBe('2026-08-15');
    expect(date.parse('15 Ağustos 2026')).toBe('2026-08-15');
    expect(date.parse('25.08.2026 00:30')).toBe('2026-08-25T00:30');
    expect(date.parse('5.1.2026')).toBe('2026-01-05');
    expect(date.parse('2026-08-15')).toBe('2026-08-15');
    expect(date.parse('15/08/2026')).toBeNull();
    expect(date.parse('15-08-2026')).toBeNull();
    expect(date.parse('30.02.2024')).toBeNull();
  });
});

describe('BELGE İDDİALARI — para birimi (v2.2.0)', () => {
  it('SPEC §2.0: yerleşik birimler ve tüketici tanımı', () => {
    expect(money.format(123456, { kurus: true, currency: 'EUR' })).toBe('€1.234,56');
    expect(money.format(123456, { kurus: true, currency: 'GBP' })).toBe('£1.234,56');
    expect(money.format(123456, {
      kurus: true,
      currency: { code: 'AZN', symbol: '₼', text: 'AZN', minorDigits: 2 },
    })).toBe('₼1.234,56');
    expect(money.knownCurrencyCodes()).toEqual(['EUR', 'GBP', 'TRY', 'USD']);
  });

  it('SPEC §2.0: ayraçlar her zaman Türkçe', () => {
    expect(money.format(123456, { kurus: true, currency: 'USD' })).toBe('$1.234,56');
    expect(money.format(123456, { kurus: true, currency: 'XYZ' })).toBe('—');
  });

  it('MOTOR-DETAYLARI: farklı ondalık haneli birimler', () => {
    expect(money.format(1234, { kurus: true, currency: { code: 'JPY', symbol: '¥', text: 'JPY', minorDigits: 0 } })).toBe('¥1.234');
    expect(money.format(1234567, { kurus: true, currency: { code: 'KWD', symbol: 'KD', text: 'KWD', minorDigits: 3 } })).toBe('KD1.234,567');
  });

  it('MOTOR-DETAYLARI: yeni money fonksiyonları', () => {
    expect(money.formatMajor(1234.56, { kurus: true })).toBe('₺1.234,56');
    expect(money.toMinor(1234.56)).toBe(123456);
    expect(money.toMinor(19.99)).toBe(1999);
    expect(money.toMinor(551.875)).toBe(55188);
    expect(money.toMinor(NaN)).toBeNull();
    expect(money.formatMinorInput(123456, 2)).toBe('1.234,56');
    expect(money.decimal(2.5)).toBe('2,5');
    expect(money.decimal(3)).toBe('3');
    expect(money.ratio(8.712)).toBe('8,71x');
  });

  it('CHANGELOG: compact para birimi hatası düzeldi', () => {
    expect(money.compact(123456789, { currency: 'USD' })).toBe('$1,23M');
    expect(money.compact(123456789)).toBe('₺1,23M');
  });
});

describe('BELGE İDDİALARI — v2.3.0', () => {
  it('MOTOR-DETAYLARI: text.searchKey', () => {
    expect(text.searchKey('Çağrı Öztürk')).toBe('cagri ozturk');
    expect(text.searchKey('İSMAİL')).toBe('ismail');
    expect(text.searchKey('  Ali   Veli  ')).toBe('ali veli');
    expect(text.searchKey(null)).toBe('');
    // lower bunu yapamaz — searchKey'in var olus sebebi
    expect(text.lower('Ismail')).not.toBe(text.lower('İsmail'));
    expect(text.searchKey('Ismail')).toBe(text.searchKey('İsmail'));
  });

  it('MOTOR-DETAYLARI: money.percent showPositiveSign', () => {
    expect(money.percent(12.345, 1, { showPositiveSign: true })).toBe('%+12,3');
    expect(money.percent(-12.345, 1, { showPositiveSign: true })).toBe('%-12,3');
    expect(money.percent(0, 1, { showPositiveSign: true })).toBe('%0');
    expect(money.percent(12.345)).toBe('%12,3');
  });
});

describe('BELGE İDDİALARI — v2.4.0', () => {
  it('MOTOR-DETAYLARI: math.equals', () => {
    expect(math.equals(0.1 + 0.2, 0.3)).toBe(false);
    expect(math.equals(0.1 + 0.2, 0.3, 1e-7)).toBe(true);
    expect(math.equals(NaN, NaN)).toBe(false);
    expect(math.equals(1, 1, -0.5)).toBe(false);
  });

  it('MOTOR-DETAYLARI: math.percentChange', () => {
    expect(math.percentChange(150, 100)).toBe(50);
    expect(math.percentChange(50, 100)).toBe(-50);
    expect(math.percentChange(0.3, 0.1)).toBe(200);
    expect(math.percentChange(100, 0)).toBeNull();
    expect(math.percentChange(100, -50)).toBeNull();
    // ham aritmetik yanlis sonuc verirdi
    expect(((0.3 - 0.1) / 0.1) * 100).not.toBe(200);
  });

  it('MOTOR-DETAYLARI: date karşılaştırma', () => {
    expect(date.isBefore('2026-08-15', '2026-08-16')).toBe(true);
    expect(date.isAfter('2026-08-15', '2026-08-16')).toBe(false);
    expect(date.isSameDay('2026-08-15T09:00:00', '2026-08-15T23:00:00')).toBe(true);
    expect(date.isSameDay('2026-08-15T21:30:00Z', '2026-08-16')).toBe(true);
    expect(date.isBefore('2024-02-30', '2026-01-01')).toBeNull();
  });

  it('MOTOR-DETAYLARI: relative doğal stil', () => {
    const bugun = '2026-08-15';
    expect(date.relative('2026-08-17', bugun, 'natural')).toBe('Pazartesi günü');
    expect(date.relative('2026-08-22', bugun, 'natural')).toBe('haftaya Cumartesi');
    expect(date.relative('2026-08-29', bugun, 'natural')).toBe('14 gün sonra');
    expect(date.relative('2026-08-12', bugun, 'natural')).toBe('3 gün önce');
    expect(date.relative('2026-08-18', bugun)).toBe('3 gün sonra');
  });
});
