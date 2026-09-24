/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import ENGINE_DETAILS_DOC from '../../SNN-ABACUS-CORE-MOTOR-DETAYLARI.md?raw';
import PACKAGE_MANIFEST from '../../package.json';
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
 * yanlış çıktı claim etmesi. Bir belge örneği değişirse bu test kırmızı verir.
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
    expect(money.percent(12.345, 1, { showPositiveSign: true })).toBe('+%12,3');
    expect(money.percent(-12.345, 1, { showPositiveSign: true })).toBe('-%12,3');
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

  it('KILAVUZ + MOTOR-DETAYLARI: relativeTime', () => {
    const now = Date.UTC(2026, 7, 15, 10, 0, 0);
    expect(date.relativeTime(now - 30_000, now)).toBe('az önce');
    expect(date.relativeTime(now - 5 * 60_000, now)).toBe('5 dakika önce');
    expect(date.relativeTime(now - 3 * 3_600_000, now, { style: 'short' })).toBe('3 sa önce');
    expect(date.relativeTime(now + 20 * 60_000, now, { style: 'short' })).toBe('20 dk sonra');
    expect(date.relativeTime(now - 92 * 86_400_000, now)).toBe('92 gün önce');
    expect(date.relativeTime(0, 60_000)).toBe('1 dakika önce');
  });
});

describe('BELGE İDDİALARI — v2.5.0 (tüketici raporu karşılığı)', () => {
  it('INSTALL.md §3: Supabase / PostgREST zaman damgaları', () => {
    expect(date.format('2026-08-31T06:17:08.317236+00:00')).toBe('31.08.2026');
    expect(date.format('2026-07-21 10:00:00+00', 'dayMonth')).toBe('21 Tem.');
  });

  it('INSTALL.md §3: aylık gruplama anahtarı YYYY-MM', () => {
    expect(date.format('2026-09', 'monthYear')).toBe('Eylül 2026');
    expect(date.format('2026-09', 'period')).toBe('09/2026');
    expect(date.format('2026-09')).toBe('—');
  });

  it('INSTALL.md §3: alt birim / ana birim ayrımı', () => {
    expect(money.formatMajor(1500)).toBe('₺1.500');
    expect(money.format(1500)).toBe('₺15');
    expect(money.compactMajor(1500000, { style: 'B/Mn/Mr' })).toBe('₺1,5Mn');
  });

  it('INSTALL.md §3: yüzde işaret modu', () => {
    expect(money.percent(-3.2, 1)).toBe('-%3,2');
    expect(money.percent(-3.2, 1, { sign: 'never' })).toBe('%3,2');
    expect(money.percent(3.2, 1, { sign: 'always' })).toBe('+%3,2');
  });

  it('MOTOR-DETAYLARI: date kabul edilen girdi biçimleri tablosu', () => {
    expect(date.format('2026-07-21T10:59:59.999999+03:00', 'time')).toBe('10:59');
    const beklenen = date.format('2026-07-21T10:00:00+03:00', 'dateTime');
    expect(date.format('2026-07-21T10:00:00+0300', 'dateTime')).toBe(beklenen);
    expect(date.format('2026-07-21T10:00:00+03', 'dateTime')).toBe(beklenen);
    expect(date.daysBetween('2026-09', '2026-10')).toBeNull();
    expect(date.dayName('2026-09')).toBe('—');
    expect(date.format('2026-09', 'long')).toBe('—');
    expect(date.format('2026-09', 'dayMonth')).toBe('—');
  });

  it('MOTOR-DETAYLARI: money.percent işaret modu tablosu', () => {
    expect(money.percent(-3.2, 1, { sign: 'auto' })).toBe('-%3,2');
    expect(money.percent(3.2, 1, { sign: 'auto' })).toBe('%3,2');
    expect(money.percent(0, 1, { sign: 'auto' })).toBe('%0');
    expect(money.percent(-3.2, 1, { sign: 'always' })).toBe('-%3,2');
    expect(money.percent(0, 1, { sign: 'always' })).toBe('%0');
    expect(money.percent(3.2, 1, { sign: 'never' })).toBe('%3,2');
    expect(money.percent(0, 1, { sign: 'never' })).toBe('%0');
    expect(money.percent(-0.04, 1, { sign: 'never' })).toBe('%0');
  });

  it('MOTOR-DETAYLARI: v4.3.0 compact seçenekleri ve en üst ölçek (madde 39C/D, 41)', () => {
    expect(money.compact(120000000, { style: 'B/Mn/Mr', digits: 2 })).toBe('₺1,20Mn');
    expect(money.compact(150000, { style: 'B/Mn/Mr', minScale: 'million' })).toBe('₺1.500');
    expect(money.compact(0, { zero: 'symbol' })).toBe('₺0');
    expect(money.compact(200000000000000)).toBe('₺2000B');
  });

  it('MOTOR-DETAYLARI: compactMajor örnekleri', () => {
    expect(money.compactMajor(1500000, { style: 'B/Mn/Mr' })).toBe('₺1,5Mn');
    expect(money.compactMajor(1500000)).toBe('₺1,5M');
    expect(money.compactMajor(1500)).toBe('₺1,5K');
    expect(money.compactMajor(999)).toBe('₺999');
    expect(money.compactMajor(-1500000, { style: 'B/Mn/Mr' })).toBe('-₺1,5Mn');
    expect(money.compactMajor(0)).toBe('0');
    expect(money.compactMajor(null)).toBe('—');
    expect(money.compactMajor(NaN)).toBe('—');
    expect(money.compactMajor(1500, { currency: 'YOK' })).toBe('—');
    expect(money.compact(1500)).toBe('₺15');
  });
});

describe('BELGE İDDİALARI — v3.1.0 (talep #5 karşılığı)', () => {
  const LR = { residual: 'largest-remainder' } as const;

  it('MOTOR-DETAYLARI: math.allocate örnek bloğu', () => {
    // Beklenen değerler Python `fractions` tam aritmetiğinden (bkz. math/allocate.test.ts).
    expect(math.allocate(100000, [6080, 8160, 12080, 62360, 80120, 1560160, 133200, 120, 3820800], LR))
      .toEqual([107, 144, 212, 1097, 1410, 27453, 2344, 2, 67231]);
    expect(math.allocate(10, [1, 1, 1], LR)).toEqual([4, 3, 3]);
    expect(math.allocate(-10, [1, 1, 1], LR)).toEqual([-4, -3, -3]);
    expect(math.allocate(1000, [1e-7, 2e-7], LR)).toEqual([333, 667]);
    expect(math.allocate(40, [160, 4, 136, 17], LR)).toEqual([20, 1, 17, 2]);
    expect(math.allocate(41, [160, 4, 136, 17], LR)).toEqual([21, 0, 18, 2]);
    expect(math.allocate(1000, [], LR)).toBeNull();
    expect(math.allocate(100.5, [1, 2], LR)).toBeNull();
  });
});

describe('BELGE İDDİALARI — v2.6.0 (tüketici raporu #2 karşılığı)', () => {
  it('MOTOR-DETAYLARI: math.irr örnek bloğu', () => {
    const kok = math.irr([1000, -600, -600]);
    expect(kok).not.toBeNull();
    // Kapalı form: x = (√69-3)/6 · r = 1/x - 1
    expect(math.equals(kok as number, 0.13066238629180748, 1e-9)).toBe(true);
    expect(math.irr([1000, -500, -500])).toBe(0);
    expect(math.equals(math.irr([-100, 300]) as number, 2, 1e-9)).toBe(true);
    expect(math.irr([1000, 500])).toBeNull();
    expect(math.irr([1000])).toBeNull();
    expect(math.irr([])).toBeNull();
    expect(math.irr([1000, NaN])).toBeNull();
  });

  it('MOTOR-DETAYLARI: irr dönemseldir, yıllığa çevrim çağıranın işi', () => {
    const aylik = math.irr([899550, ...Array<number>(12).fill(-75000)]) as number;
    const yillik = math.pow(1 + aylik, 12) as number;
    expect(math.equals(yillik - 1, 0.0009237993397638396, 1e-12)).toBe(true);
  });

  it('MOTOR-DETAYLARI: irr arama tavanı üstü null döner', () => {
    expect(math.irr([-1, 2000])).toBeNull();
  });

  it('MOTOR-DETAYLARI + INSTALL: FormatMoneyOptions.digits', () => {
    expect(money.formatMajor(1.2345, { currency: 'TRY', digits: 4, kurus: true })).toBe('₺1,2345');
    expect(money.format(12345, { currency: 'TRY', digits: 4, kurus: true })).toBe('₺1,2345');
    // Tam tanım kopyalamakla aynı sonuç — kopya artık gereksiz
    expect(
      money.formatMajor(1.2345, {
        currency: { code: 'TRY', symbol: '₺', text: 'TL', minorDigits: 4 },
        kurus: true,
      })
    ).toBe('₺1,2345');
    expect(money.formatMajor(1.2345, { digits: 5 })).toBe('—');
  });
});

describe('BELGE İDDİALARI — v2.7.0 (tüketici raporu #3 karşılığı)', () => {
  it('MOTOR-DETAYLARI: math.ceil örnekleri', () => {
    expect(math.ceil(2.1)).toBe(3);
    expect(math.ceil(2.9)).toBe(3);
    expect(math.ceil(-2.1)).toBe(-2);
    expect(math.ceil(3)).toBe(3);
    expect((math.ceil(math.div(1650000, 100000) as number) as number) * 100000).toBe(1700000);
  });

  it('MOTOR-DETAYLARI: math.log10 örnekleri ve karşılaştırma tablosu', () => {
    expect(math.log10(1000)).toBe(3);
    expect(math.log10(1700000)).toBe(6.230448921378274);
    expect(math.log10(0)).toBeNull();

    const taklit = (x: number) => math.div(math.log(x) as number, math.log(10) as number) as number;
    expect(taklit(1000)).toBe(2.9999999999999996);
    expect(math.floor(taklit(1000))).toBe(2);
    expect(math.floor(math.log10(1000) as number)).toBe(3);
    expect(taklit(1000000)).toBe(5.999999999999999);
    expect(math.floor(taklit(1000000))).toBe(5);
    expect(math.floor(math.log10(1000000) as number)).toBe(6);

    // Eksen adımı formülü
    expect(math.pow(10, math.floor(math.log10(1000000) as number) - 1)).toBe(100000);
  });

  it('MOTOR-DETAYLARI: date.weekday örnekleri', () => {
    expect(date.weekday('2026-09-05')).toBe(6);
    expect(date.weekday('2026-09-06')).toBe(0);
    expect(date.weekday('2024-02-30')).toBeNull();
    expect(date.weekday('2026-09-01T21:30:00Z')).toBe(3);
    expect(date.weekday('2026-09-01')).toBe(2);
  });

  it('MOTOR-DETAYLARI: date.isWeekend örnekleri', () => {
    expect(date.isWeekend('2026-09-05')).toBe(true);
    expect(date.isWeekend('2026-09-07')).toBe(false);
    expect(date.isWeekend('abc')).toBeNull();
  });

  it('GERI-BILDIRIM-KAYDI: date sorgular / period üretir ayrımı', () => {
    // Kayıt dosyasındaki "period zaten karşılıyordu" iddiası
    expect(typeof period.addDays).toBe('function');
    expect(typeof period.quarterOf).toBe('function');
    expect(typeof period.quarterRange).toBe('function');
    expect(typeof period.addMonths).toBe('function');
  });
});

describe('BELGE İDDİALARI — v2.8.0 (text.plate)', () => {
  it('MOTOR-DETAYLARI: plate tablosu', () => {
    const d = (raw: string) => text.plate(raw);
    expect(d('54apy281')).toEqual({ stored: '54APY281', display: '54 APY 281', raw: '54apy281', valid: true, yeniKayit: false });
    expect(d('34.ABD.344').display).toBe('34 ABD 344');
    expect(d('34-acb-23').stored).toBe('34ACB23');
    expect(d('34CD3455').display).toBe('34 CD 3455');
    expect(d('6abc12').stored).toBe('06ABC12');
    expect(d('34abı12').display).toBe('34 ABI 12');
    expect(d('34 ABİ 12').stored).toBe('34ABI12');
    expect(d('34abi12').stored).toBe(d('34 ABİ 12').stored);
    expect(d('34yk')).toEqual({ stored: '34YK', display: '34 YK', raw: '34yk', valid: true, yeniKayit: true });
    expect(d('34 YK 123').yeniKayit).toBe(false);
    for (const g of ['82 AB 123', '34 ABÇ 12', '34 AQ 123', 'TR 34 ABC 23', '34/ABC/23']) {
      expect(d(g).valid).toBe(false);
      expect(d(g).yeniKayit).toBe(false);
    }
  });

  it('MOTOR-DETAYLARI: gevşeklik bedeli ve text.upper uyarısı', () => {
    expect(text.plate('34 A 12').valid).toBe(true);
    expect(text.plate('34 ABC 12345').valid).toBe(true);
    expect(text.upper('34abi12')).toBe('34ABİ12');
  });

  it('INSTALL: plate örneği', () => {
    const p = text.plate('34-acb-23');
    expect(p.display).toBe('34 ACB 23');
    expect(p.stored).toBe('34ACB23');
    expect(text.plate('82 AB 123').valid).toBe(false);
    expect(text.plate('34yk').yeniKayit).toBe(true);
  });
});

describe('BELGE İDDİALARI — v2.9.0 (money.percent işaret konumu ve sabit ondalık)', () => {
  it('MOTOR-DETAYLARI: signPosition tablosu ve fixed örnekleri', () => {
    // v3.0.0: varsayılan 'leading'; v2.x yazımı 'inner' ile.
    expect(money.percent(-4.3, 1)).toBe('-%4,3');
    expect(money.percent(-4.3, 1, { signPosition: 'inner' })).toBe('%-4,3');
    expect(money.percent(4.3, 1, { sign: 'always' })).toBe('+%4,3');
    expect(money.percent(4.3, 1, { sign: 'always', signPosition: 'inner' })).toBe('%+4,3');
    expect(money.percent(4.3, 2, { fixed: true })).toBe('%4,30');
    expect(money.percent(5, 2, { fixed: true })).toBe('%5,00');
    expect(money.percent(-4.3, 2, { signPosition: 'leading', fixed: true })).toBe('-%4,30');
  });

  it('MOTOR-DETAYLARI: bilinçli CLDR farkları', () => {
    expect(money.percent(-0.04, 1, { signPosition: 'leading' })).toBe('%0');
    // CLDR tr-TR 1.234,5 yazar (depo dışında ölçüldü); çekirdek binlik ayraç koymaz.
    expect(money.percent(1234.5, 1)).toBe('%1234,5');
  });

  it('INSTALL: yüzde örnekleri (v3.0.0 varsayılanı)', () => {
    expect(money.percent(-3.2, 1)).toBe('-%3,2');
    expect(money.percent(-3.2, 1, { sign: 'never' })).toBe('%3,2');
    expect(money.percent(3.2, 1, { sign: 'always' })).toBe('+%3,2');
    expect(money.percent(-4.3, 2, { fixed: true })).toBe('-%4,30');
  });
});

describe('BELGE İDDİALARI — v3.0.0 (text.suffix negatif ve ondalıklı sayılar)', () => {
  it('MOTOR-DETAYLARI: suffix örnekleri', () => {
    expect(text.suffix(-2, 'number', 'dat')).toBe("-2'ye");
    expect(text.suffix(-4, 'percent', 'loc')).toBe("-%4'te");
    expect(text.suffix(2.5, 'number', 'dat')).toBe("2,5'e");
    expect(text.suffix(7.65, 'number', 'loc')).toBe("7,65'te");
    expect(text.suffix(2.5, 'percent', 'dat')).toBe("%2,5'e");
    expect(text.suffix(-4.3, 'percent', 'loc')).toBe("-%4,3'te");
    expect(text.suffix(2, 'percent', 'dat')).toBe("%2'ye");
  });
});

describe('BELGE İDDİALARI — MIGRATION-v3.md', () => {
  it('§1 money.percent v3.0.0 çıktıları', () => {
    expect(money.percent(-4.3, 1)).toBe('-%4,3');
    expect(money.percent(4.3, 1, { sign: 'always' })).toBe('+%4,3');
    expect(money.percent(-4.3, 2, { fixed: true })).toBe('-%4,30');
    expect(money.percent(-4.3, 1, { signPosition: 'inner' })).toBe('%-4,3');
  });

  it('§2 text.suffix v3.0.0 çıktıları', () => {
    expect(text.suffix(-2, 'percent', 'dat')).toBe("-%2'ye");
    expect(text.suffix(-2, 'number', 'dat')).toBe("-2'ye");
    expect(text.suffix(2.5, 'percent', 'dat')).toBe("%2,5'e");
    expect(text.suffix(7.65, 'number', 'loc')).toBe("7,65'te");
  });

  it('özet: değişmeyenler', () => {
    expect(money.percent(4.3, 1)).toBe('%4,3');
    expect(money.percent(-4.3, 1, { sign: 'never' })).toBe('%4,3');
    expect(text.suffix(2, 'percent', 'dat')).toBe("%2'ye");
  });
});

describe('BELGE İDDİALARI — v3.0.0 geçersiz hane sayısı', () => {
  it('MIGRATION-v3 §3 ve MOTOR-DETAYLARI örnekleri', () => {
    expect(money.decimal(2.5, 1.5)).toBe('—');
    expect(money.percent(4.3, -1)).toBe('—');
    expect(money.fmtDecimalGrouped(4.3, 21)).toBe('—');
    expect(money.fmtDecimalGrouped(4.3, -1)).toBe('—');
    expect(unit.dataSize(5242880, { digits: 1.5 })).toBe('—');
    expect(money.formatMinorInput(123456, 5)).toBe('—');
  });

  it('ABACUS-SPEC §2.2: math.round ilkel katmanda doğrulama yapmaz', () => {
    expect(() => math.round(4.3, 1.5)).toThrow();
  });
});

describe('BELGE İDDİALARI — MIGRATION-v4.md tablosu (TB-010)', () => {
  it('Türkçe biçimli girdiler v3 ile AYNI kalır', () => {
    expect(money.parseNumber('1.234,56')).toBe(1234.56);
    expect(money.parseNumber('1 234,56')).toBe(1234.56);
    expect(money.parseNumber('1 234,56')).toBe(1234.56);
    expect(money.parseNumber('1.250.000')).toBe(1250000);
    expect(money.parseNumber('-1.234,56')).toBe(-1234.56);
  });

  it('v3 sürümünün sessizce yanlış sayı ürettiği yazımlar artık null', () => {
    expect(money.parseNumber('1234.56')).toBeNull();
    expect(money.parseNumber('1.5')).toBeNull();
    expect(money.parseNumber('1e3')).toBeNull();
    expect(money.parseNumber('12abc34')).toBeNull();
    expect(money.parseNumber('(1.210,50)')).toBeNull();
  });

  it('rehberdeki "nokta ondalığı Türkçeye çevir" reçetesi çalışır', () => {
    const raw = '1234.56';
    const trFormat = raw.replace(/,/g, '').replace('.', ',');
    expect(money.parseNumber(trFormat)).toBe(1234.56);
  });

  it('rehberdeki "muhasebe parantezini soy" reçetesi çalışır', () => {
    const raw = '(1.210,50)';
    const negative = /^\(.*\)$/.test(raw);
    const inner = raw.replace(/^\(|\)$/g, '');
    const parsed = money.parseNumber(inner);
    const value = parsed === null ? null : negative ? -parsed : parsed;
    expect(value).toBe(-1210.5);
  });
});

describe('BELGE İDDİALARI — belgedeki sürüm başlığı koddan geri kalmasın (TB-006)', () => {
  // TB-006: MOTOR-DETAYLARI başlığı "v2.8 serisi" derken paket 3.3.0'dı.
  // Başlığı düzeltmek yetmez; bu test olmadan bir sonraki sürümde yine eskir.
  it('MOTOR-DETAYLARI "vX.Y serisi" ile package.json aynı seriyi gösterir', () => {
    const claim = /\*\*Sürüm:\*\*\s*v(\d+)\.(\d+)\s*serisi/.exec(ENGINE_DETAILS_DOC);
    expect(claim, 'MOTOR-DETAYLARI başlığında "**Sürüm:** vX.Y serisi" bulunamadı').not.toBeNull();

    const [, major, minor] = claim as RegExpExecArray;
    const [pkgMajor, pkgMinor] = PACKAGE_MANIFEST.version.split('.');
    expect(`${major}.${minor}`).toBe(`${pkgMajor}.${pkgMinor}`);
  });
});
