import { describe, expect, it } from 'vitest';
import { format, parse } from './index';

/**
 * GİRİŞ KAPISI — money.parse
 *
 * AYNA KURALI: ABACUS kendi ürettiği her şeyi geri okuyabilmelidir.
 * Ne fazlası (rastgele biçim kabul edilmez), ne eksiği (kendi çıktısı reddedilemez).
 */

describe('money.parse — kendi çıktısını geri okur (AYNA KURALI)', () => {
  it('varsayılan biçim', () => {
    expect(parse('₺23.232')).toBe(2323200);
    expect(parse('₺1.500')).toBe(150000);
    expect(parse('0')).toBe(0);
  });

  it('kuruşlu biçim', () => {
    expect(parse('₺23.232,23')).toBe(2323223);
    expect(parse('₺1.234,56')).toBe(123456);
    expect(parse('0,00')).toBe(0);
  });

  it('negatif — eksi biçimi', () => {
    expect(parse('-₺23.232')).toBe(-2323200);
    expect(parse('-₺1.234,56')).toBe(-123456);
  });

  it('negatif — parantez biçimi', () => {
    expect(parse('(₺23.232)')).toBe(-2323200);
    expect(parse('(₺1.234,56)')).toBe(-123456);
  });

  it('metin biçimi (TL / USD son ekli)', () => {
    expect(parse('23.232 TL')).toBe(2323200);
    expect(parse('1.234,56 TL')).toBe(123456);
    expect(parse('220,75 USD')).toBe(22075);
  });

  it('USD simgesi', () => {
    expect(parse('$220,75')).toBe(22075);
    expect(parse('-$220,75')).toBe(-22075);
  });
});

describe('money.parse — belgelenmiş hoşgörü listesi', () => {
  it('baştaki/sondaki boşluğu yok sayar', () => {
    expect(parse('  ₺1.234,56  ')).toBe(123456);
  });

  it('simge olmadan kabul eder', () => {
    expect(parse('1.234,56')).toBe(123456);
    expect(parse('23.232')).toBe(2323200);
  });

  it('binlik ayraç olmadan kabul eder', () => {
    expect(parse('23232,23')).toBe(2323223);
    expect(parse('1234,56')).toBe(123456);
  });

  it('tek ondalık haneyi kabul eder (,5 = 50 kuruş)', () => {
    expect(parse('1,5')).toBe(150);
    expect(parse('10,5')).toBe(1050);
  });
});

describe('money.parse — reddedilenler (ayna kuralının sınırı)', () => {
  it('İngilizce biçimi reddeder', () => {
    expect(parse('23,232.23')).toBeNull();
    expect(parse('1,234.56')).toBeNull();
  });

  it('bozuk binlik gruplamasını reddeder', () => {
    expect(parse('1.23')).toBeNull();
    expect(parse('12.3456')).toBeNull();
    expect(parse('1.2345,00')).toBeNull();
  });

  it('ikiden fazla ondalık haneyi reddeder', () => {
    expect(parse('1,234')).toBeNull();
    expect(parse('1,2345')).toBeNull();
  });

  it('çöp ve boş girdiyi reddeder', () => {
    expect(parse('abc')).toBeNull();
    expect(parse('')).toBeNull();
    expect(parse('   ')).toBeNull();
    expect(parse('-')).toBeNull();
    expect(parse(',')).toBeNull();
    expect(parse('₺')).toBeNull();
    expect(parse('1.234,56 EUR')).toBeNull();
  });

  it('birden fazla virgülü reddeder', () => {
    expect(parse('1,23,45')).toBeNull();
  });

  it('null / undefined girdiyi reddeder', () => {
    expect(parse(null)).toBeNull();
    expect(parse(undefined)).toBeNull();
  });
});

describe('money.parse — kuruş döner, float değil (çekirdeğin asıl amacı)', () => {
  it('float hatası üretmez — elle ×100 yapmanın alternatifi', () => {
    // Tüketicinin elle yaptığı: parseNumber('19,99') * 100 = 1998.9999999999998
    expect(parse('19,99')).toBe(1999);
    expect(parse('8,20')).toBe(820);
    expect(parse('0,07')).toBe(7);
    expect(parse('1.234,56')).toBe(123456);
  });

  it('sonuç her zaman tam sayıdır', () => {
    for (const t of ['19,99', '8,20', '0,07', '1.234,56', '999.999,99']) {
      const r = parse(t);
      expect(Number.isInteger(r)).toBe(true);
    }
  });
});

describe('AYNA KURALI — parse(format(x)) === x (özellik testi)', () => {
  /** Deterministik üretici (Math.random yok, tekrarlanabilir). */
  function lcg(seed: number) {
    let x = seed;
    return () => {
      x = (x * 1103515245 + 12345) % 2147483648;
      return x;
    };
  }

  it('5.000 kuruş değeri için tüm biçimlerde tur atar', () => {
    const rnd = lcg(20260825);
    const opts = [
      { kurus: true },
      { kurus: false },
      { kurus: true, form: 'text' as const },
      { kurus: true, negative: 'paren' as const },
      { kurus: true, currency: 'USD' as const },
    ];

    let checked = 0;
    for (let i = 0; i < 1000; i++) {
      const sign = rnd() % 2 === 0 ? 1 : -1;
      // +0 ile normalize: sign=-1 ve deger 0 iken -0 uretilmesini engeller
      const kurus = sign * (rnd() % 100000000) + 0;

      for (const o of opts) {
        const text = format(kurus, o);
        const back = parse(text);

        if (o.kurus) {
          // Kuruşlu biçim bilgi kaybetmez: tam tur atmalı
          expect(back).toBe(kurus);
        } else {
          // Kuruşsuz biçim kuruşu yuvarlar; en yakın liraya eşit olmalı.
          // Not: JS'de negatif sayıda "x % 100" sonucu -0 olabilir; bu yüzden
          // doğrudan boolean karşılaştırması yapılır (-0 === 0 -> true).
          expect(back).not.toBeNull();
          expect((back as number) % 100 === 0).toBe(true);
        }
        checked++;
      }
    }
    expect(checked).toBe(5000);
  });

  it('negatif sıfır üretmez', () => {
    expect(Object.is(parse('-₺0'), -0)).toBe(false);
    expect(parse('-₺0')).toBe(0);
    expect(parse('(₺0,00)')).toBe(0);
  });

  it('sıfır ve sınır değerleri', () => {
    for (const k of [0, 1, -1, 99, 100, -100, 999999999]) {
      expect(parse(format(k, { kurus: true }))).toBe(k);
    }
  });
});
