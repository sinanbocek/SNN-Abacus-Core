import { describe, expect, it } from 'vitest';
import { format, parse } from './index';

/**
 * GİRİŞ KAPISI — date.parse
 *
 * AYNA KURALI: ABACUS kendi ürettiği her şeyi geri okuyabilmelidir.
 * Bilgi kaybeden stiller (yıl veya gün içermeyenler) bu kuralın DIŞINDADIR
 * ve bilinçli olarak reddedilir.
 */

describe('date.parse — kendi çıktısını geri okur (AYNA KURALI)', () => {
  it('short biçimi: GG.AA.YYYY', () => {
    expect(parse('15.08.2026')).toBe('2026-08-15');
    expect(parse('05.01.2026')).toBe('2026-01-05');
    expect(parse('31.12.2026')).toBe('2026-12-31');
  });

  it('long biçimi: GG Ay YYYY', () => {
    expect(parse('15 Ağustos 2026')).toBe('2026-08-15');
    expect(parse('1 Aralık 2026')).toBe('2026-12-01');
    expect(parse('29 Şubat 2024')).toBe('2024-02-29');
  });

  it('dateTime biçimi: GG.AA.YYYY SS:DD', () => {
    expect(parse('25.08.2026 00:30')).toBe('2026-08-25T00:30');
    expect(parse('15.08.2026 21:30')).toBe('2026-08-15T21:30');
  });

  it('tüm ay adlarını tanır', () => {
    const aylar = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
    ];
    aylar.forEach((ay, i) => {
      const beklenen = `2026-${String(i + 1).padStart(2, '0')}-10`;
      expect(parse(`10 ${ay} 2026`)).toBe(beklenen);
    });
  });
});

describe('date.parse — belgelenmiş hoşgörü listesi', () => {
  it('baştaki/sondaki boşluğu yok sayar', () => {
    expect(parse('  15.08.2026  ')).toBe('2026-08-15');
  });

  it('sıfır dolgusuz gün/ay kabul eder', () => {
    expect(parse('5.1.2026')).toBe('2026-01-05');
    expect(parse('5.01.2026')).toBe('2026-01-05');
  });

  it('ISO girdiyi olduğu gibi kabul eder (çekirdeğin kanonik biçimi)', () => {
    expect(parse('2026-08-15')).toBe('2026-08-15');
  });

  it('ay adında büyük/küçük harf farkını yok sayar', () => {
    expect(parse('15 ağustos 2026')).toBe('2026-08-15');
    expect(parse('15 AĞUSTOS 2026')).toBe('2026-08-15');
  });
});

describe('date.parse — takvim doğrulaması giriş kapısında da çalışır', () => {
  it('var olmayan günü reddeder', () => {
    expect(parse('30.02.2024')).toBeNull();
    expect(parse('30 Şubat 2024')).toBeNull();
    expect(parse('29.02.2025')).toBeNull();
    expect(parse('31.04.2026')).toBeNull();
  });

  it('geçerli artık yıl gününü kabul eder', () => {
    expect(parse('29.02.2024')).toBe('2024-02-29');
    expect(parse('29.02.2000')).toBe('2000-02-29');
    expect(parse('29.02.1900')).toBeNull();
  });

  it('geçersiz saat reddedilir', () => {
    expect(parse('15.08.2026 25:00')).toBeNull();
    expect(parse('15.08.2026 12:60')).toBeNull();
  });
});

describe('date.parse — reddedilenler (ayna kuralının sınırı)', () => {
  it('bilgi kaybeden stilleri reddeder', () => {
    expect(parse('15 Ağu.')).toBeNull();       // dayMonth — yıl yok
    expect(parse('Ağustos 2026')).toBeNull();  // monthYear — gün yok
    expect(parse('08/2026')).toBeNull();       // period — gün yok
    expect(parse('00:30')).toBeNull();         // time — tarih yok
  });

  it('ABACUS’un üretmediği ayraçları reddeder', () => {
    expect(parse('15/08/2026')).toBeNull();
    expect(parse('15-08-2026')).toBeNull();
    expect(parse('2026/08/15')).toBeNull();
  });

  it('tanınmayan ay adını reddeder', () => {
    expect(parse('15 August 2026')).toBeNull();
    expect(parse('15 Agustos 2026')).toBeNull(); // şapkasız/eksik harf
  });

  it('çöp ve boş girdiyi reddeder', () => {
    expect(parse('abc')).toBeNull();
    expect(parse('')).toBeNull();
    expect(parse('   ')).toBeNull();
    expect(parse(null)).toBeNull();
    expect(parse(undefined)).toBeNull();
    expect(parse('15.08')).toBeNull();
    expect(parse('15.08.26')).toBeNull(); // iki haneli yıl
  });
});

describe('AYNA KURALI — parse(format(x)) === x (özellik testi)', () => {
  function lcg(seed: number) {
    let x = seed;
    return () => {
      x = (x * 1103515245 + 12345) % 2147483648;
      return x;
    };
  }

  it('3.000 tarih için short ve long biçimlerinde tur atar', () => {
    const rnd = lcg(20260825);
    let checked = 0;

    for (let i = 0; i < 1500; i++) {
      const year = 1970 + (rnd() % 100);
      const month = 1 + (rnd() % 12);
      const day = 1 + (rnd() % 28); // her ayda güvenli
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      for (const style of ['short', 'long'] as const) {
        const text = format(iso, style);
        expect(text).not.toBe('—');
        expect(parse(text)).toBe(iso);
        checked++;
      }
    }
    expect(checked).toBe(3000);
  });

  it('ay sonu ve artık yıl sınırlarında tur atar', () => {
    const sinirlar = [
      '2024-02-29', '2023-02-28', '2000-02-29', '2026-01-31',
      '2026-04-30', '2026-12-31', '2026-01-01',
    ];
    for (const iso of sinirlar) {
      expect(parse(format(iso, 'short'))).toBe(iso);
      expect(parse(format(iso, 'long'))).toBe(iso);
    }
  });
});
