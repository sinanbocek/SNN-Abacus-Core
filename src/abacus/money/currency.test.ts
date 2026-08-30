import { describe, expect, it } from 'vitest';
import {
  compact,
  decimal,
  format,
  formatMajor,
  formatMinorInput,
  parse,
  ratio,
  toMinor,
} from './index';

/**
 * PARA BİRİMİ = VERİ
 *
 * Yeni bir para birimi eklemek için çekirdeğin güncellenmesi GEREKMEZ.
 * Ayraçlar her zaman Türkçedir; para birimi yalnız simgeyi, metin kodunu ve
 * ondalık hane sayısını belirler.
 */

describe('money.format — yerleşik para birimleri', () => {
  it('TRY varsayılandır ve davranışı değişmedi (REGRESYON)', () => {
    expect(format(123456, { kurus: true })).toBe('₺1.234,56');
    expect(format(123456, { kurus: true, form: 'text' })).toBe('1.234,56 TL');
    expect(format(2323223)).toBe('₺23.232');
  });

  it('USD davranışı değişmedi (REGRESYON)', () => {
    expect(format(22075, { kurus: true, currency: 'USD' })).toBe('$220,75');
    expect(format(22075, { kurus: true, currency: 'USD', form: 'text' })).toBe('220,75 USD');
  });

  it('EUR ve GBP artık çalışıyor', () => {
    expect(format(123456, { kurus: true, currency: 'EUR' })).toBe('€1.234,56');
    expect(format(123456, { kurus: true, currency: 'GBP' })).toBe('£1.234,56');
    expect(format(123456, { kurus: true, currency: 'EUR', form: 'text' })).toBe('1.234,56 EUR');
    expect(format(123456, { kurus: true, currency: 'GBP', form: 'text' })).toBe('1.234,56 GBP');
  });

  it('ayraçlar para birimi ne olursa olsun TÜRKÇEDİR', () => {
    // Amerikan biçimi ($1,234.56) KAPSAM DIŞI — bilinçli karar
    expect(format(123456, { kurus: true, currency: 'USD' })).toBe('$1.234,56');
    expect(format(123456, { kurus: true, currency: 'USD' })).not.toBe('$1,234.56');
  });

  it('negatif ve sıfır her para biriminde tutarlı', () => {
    expect(format(-123456, { kurus: true, currency: 'EUR' })).toBe('-€1.234,56');
    expect(format(-123456, { kurus: true, currency: 'EUR', negative: 'paren' })).toBe('(€1.234,56)');
    expect(format(0, { kurus: true, currency: 'GBP', form: 'text' })).toBe('0,00 GBP');
  });
});

describe('money.format — tüketici kendi para birimini verebilir', () => {
  it('çekirdeğin hiç duymadığı bir birim tanım olarak verilebilir', () => {
    const azn = { code: 'AZN', symbol: '₼', text: 'AZN', minorDigits: 2 };
    expect(format(123456, { kurus: true, currency: azn })).toBe('₼1.234,56');
    expect(format(123456, { kurus: true, currency: azn, form: 'text' })).toBe('1.234,56 AZN');
  });

  it('ondalık hanesi 0 olan birim (JPY) desteklenir', () => {
    const jpy = { code: 'JPY', symbol: '¥', text: 'JPY', minorDigits: 0 };
    // minorDigits=0 -> alt birim yok, 1234 = 1.234 yen
    expect(format(1234, { kurus: true, currency: jpy })).toBe('¥1.234');
    expect(format(1234, { currency: jpy })).toBe('¥1.234');
  });

  it('ondalık hanesi 3 olan birim (KWD) desteklenir', () => {
    const kwd = { code: 'KWD', symbol: 'KD', text: 'KWD', minorDigits: 3 };
    expect(format(1234567, { kurus: true, currency: kwd })).toBe('KD1.234,567');
  });

  it('geçersiz para birimi tanımı — döner (uydurmaz)', () => {
    expect(format(123456, { kurus: true, currency: 'XYZ' })).toBe('—');
    expect(format(123456, { kurus: true, currency: { code: '', symbol: '$', text: 'X', minorDigits: 2 } })).toBe('—');
    expect(format(123456, { kurus: true, currency: { code: 'X', symbol: '$', text: 'X', minorDigits: 9 } })).toBe('—');
  });
});

describe('money.compact — para birimi hatası düzeltildi', () => {
  it('TRY davranışı değişmedi (REGRESYON)', () => {
    expect(compact(123456789)).toBe('₺1,23M');
    expect(compact(-123456789)).toBe('-₺1,23M');
    expect(compact(123456789, { form: 'text' })).toBe('1,23M TL');
  });

  it('artık para birimini dikkate alıyor (önceden hep ₺ yazıyordu)', () => {
    expect(compact(123456789, { currency: 'USD' })).toBe('$1,23M');
    expect(compact(123456789, { currency: 'EUR' })).toBe('€1,23M');
    expect(compact(123456789, { currency: 'GBP', form: 'text' })).toBe('1,23M GBP');
  });

  it('1.000 altı değerde de para birimi doğru', () => {
    expect(compact(50000, { currency: 'EUR' })).toBe('€500');
  });
});

describe('money.parse — yeni simgeleri de geri okur (AYNA KURALI)', () => {
  it('yerleşik tüm simgeler', () => {
    expect(parse('₺1.234,56')).toBe(123456);
    expect(parse('$1.234,56')).toBe(123456);
    expect(parse('€1.234,56')).toBe(123456);
    expect(parse('£1.234,56')).toBe(123456);
  });

  it('yerleşik tüm metin kodları', () => {
    expect(parse('1.234,56 TL')).toBe(123456);
    expect(parse('1.234,56 USD')).toBe(123456);
    expect(parse('1.234,56 EUR')).toBe(123456);
    expect(parse('1.234,56 GBP')).toBe(123456);
  });

  it('tanınmayan para birimi hâlâ reddedilir', () => {
    expect(parse('1.234,56 XYZ')).toBeNull();
    expect(parse('¥1.234,56')).toBeNull();
  });

  it('AYNA: dört para biriminde de tur atar', () => {
    for (const c of ['TRY', 'USD', 'EUR', 'GBP'] as const) {
      for (const k of [0, 1, -1, 123456, -123456, 999999999]) {
        expect(parse(format(k, { kurus: true, currency: c })), `${c} / ${k}`).toBe(k);
        expect(parse(format(k, { kurus: true, currency: c, form: 'text' })), `${c} metin / ${k}`).toBe(k);
      }
    }
  });
});

describe('money.formatMajor — ana birimden biçimlendirir', () => {
  it('lira/dolar sayısını kuruşa çevirip biçimlendirir', () => {
    expect(formatMajor(1234.56, { kurus: true })).toBe('₺1.234,56');
    expect(formatMajor(1234.56, { kurus: true, currency: 'USD' })).toBe('$1.234,56');
    expect(formatMajor(1500)).toBe('₺1.500');
  });

  it('yuvarlama half-up ve float hatasızdır', () => {
    expect(formatMajor(19.99, { kurus: true })).toBe('₺19,99');
    expect(formatMajor(8.2, { kurus: true })).toBe('₺8,20');
    expect(formatMajor(0.005, { kurus: true })).toBe('₺0,01');
  });

  it('geçersiz girdide — döner', () => {
    expect(formatMajor(null)).toBe('—');
    expect(formatMajor(undefined)).toBe('—');
    expect(formatMajor(NaN)).toBe('—');
    expect(formatMajor(Infinity)).toBe('—');
  });
});

describe('money.toMinor — parse’ın sayısal ikizi', () => {
  it('ana birimi alt birime çevirir', () => {
    expect(toMinor(1234.56)).toBe(123456);
    expect(toMinor(1500)).toBe(150000);
    expect(toMinor(0)).toBe(0);
    expect(toMinor(-1234.56)).toBe(-123456);
  });

  it('float hatası üretmez (ham ×100 ile fark)', () => {
    expect(toMinor(19.99)).toBe(1999);
    expect(toMinor(8.2)).toBe(820);
    expect(19.99 * 100).not.toBe(1999); // ham çarpım yanlış
  });

  it('alt birim arası half-up yuvarlar', () => {
    expect(toMinor(551.875)).toBe(55188);
    expect(toMinor(0.005)).toBe(1);
  });

  it('para birimine göre ölçekler', () => {
    expect(toMinor(1234, { code: 'JPY', symbol: '¥', text: 'JPY', minorDigits: 0 })).toBe(1234);
    expect(toMinor(1.234, { code: 'KWD', symbol: 'KD', text: 'KWD', minorDigits: 3 })).toBe(1234);
  });

  it('geçersiz girdide null döner — sessizce 0 YAPMAZ', () => {
    expect(toMinor(NaN)).toBeNull();
    expect(toMinor(Infinity)).toBeNull();
    expect(toMinor(-Infinity)).toBeNull();
    expect(toMinor(1, 'XYZ')).toBeNull();
    expect(toMinor(1e18)).toBeNull(); // güvenli tam sayı sınırı dışı
  });

  it('AYNA: toMinor(x) ile parse(formatMajor(x)) aynı sonucu verir', () => {
    for (const v of [0, 1, 19.99, 8.2, 1234.56, -1234.56]) {
      expect(parse(formatMajor(v, { kurus: true }))).toBe(toMinor(v));
    }
  });
});

describe('money.decimal — düz ondalık gösterim', () => {
  it('ondalık ayracı VIRGÜLDÜR', () => {
    expect(decimal(2.5)).toBe('2,5');
    expect(decimal(8.712, 2)).toBe('8,71');
    expect(decimal(0.1)).toBe('0,1');
  });

  it('gereksiz sondaki sıfır eklenmez', () => {
    expect(decimal(3)).toBe('3');
    expect(decimal(3, 2)).toBe('3');
    expect(decimal(10)).toBe('10');
  });

  it('half-up yuvarlar', () => {
    expect(decimal(2.55, 1)).toBe('2,6');
    expect(decimal(-2.55, 1)).toBe('-2,6');
  });

  it('geçersiz girdide — döner', () => {
    expect(decimal(null)).toBe('—');
    expect(decimal(undefined)).toBe('—');
    expect(decimal(NaN)).toBe('—');
    expect(decimal(Infinity)).toBe('—');
  });
});

describe('money.ratio — decimal’in çifti', () => {
  it('iki ondalık ve sonda x', () => {
    expect(ratio(8.712)).toBe('8,71x');
    expect(ratio(2)).toBe('2x');
    expect(ratio(1.5)).toBe('1,5x');
  });

  it('geçersiz girdide — döner', () => {
    expect(ratio(null)).toBe('—');
    expect(ratio(NaN)).toBe('—');
  });
});

describe('money.formatMinorInput — giriş kutusu metni', () => {
  it('alt birimi sade metne çevirir (simge YOK)', () => {
    expect(formatMinorInput(123456, 2)).toBe('1.234,56');
    expect(formatMinorInput(150000, 2)).toBe('1.500,00');
    expect(formatMinorInput(150000)).toBe('1.500');
  });

  it('parse ile gidiş-dönüş uyumludur', () => {
    for (const k of [0, 5, 100, 123456, 999999]) {
      expect(parse(formatMinorInput(k, 2))).toBe(k);
    }
  });

  it('geçersiz girdide — döner', () => {
    expect(formatMinorInput(null)).toBe('—');
    expect(formatMinorInput(NaN)).toBe('—');
    expect(formatMinorInput(123456, 9)).toBe('—');
    expect(formatMinorInput(123456, 1.5)).toBe('—');
  });
});
