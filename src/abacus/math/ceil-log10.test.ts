import { describe, expect, it } from 'vitest';
import { ceil, div, floor, log, log10, pow, round } from './index';

/**
 * TÜKETİCİ RAPORU #3 §2 ve §3 (SNN Portföy Yönetimi, 1 Eylül 2026).
 *
 * §2 — Yuvarlamanın üç yönünden ikisi (`round`, `floor`) çekirdekteydi,
 * üçüncüsü değildi. Grafik ekseninin üst sınırını adımın katına tamamlarken
 * tüketici ham `Math.ceil`e düşmek zorunda kaldı.
 *
 * §3 — `math.log` doğal logaritmadır. Finansal arayüzde logaritmanın ana
 * kullanımı BÜYÜKLÜK MERTEBESİ bulmaktır ve o her zaman 10 tabanındadır.
 * `log(x) / log(10)` taklidi SESSİZCE YANLIŞTIR: `math.log` sonucu `toNumber()`
 * ile float'a düşer, hassasiyet orada kaybolur ve tam onluk kuvvetlerde bölme
 * bir epsilon aşağıda kalır. `floor` ile birleşince bir basamak kaydırır.
 *
 * Bu iki dosya tüketicide `src/utils/chartScale.ts` içindeydi ve o dosya
 * yapısal kural taramasında MUAF tutulmak zorunda kalmıştı.
 */

describe('math.ceil — yukarı yuvarlama (rapor #3 §2)', () => {
  it('pozitif ve negatif değerler', () => {
    expect(ceil(2.1)).toBe(3);
    expect(ceil(2.9)).toBe(3);
    expect(ceil(-2.1)).toBe(-2);
    expect(ceil(-2.9)).toBe(-2);
  });

  it('tam sayı değişmez', () => {
    expect(ceil(3)).toBe(3);
    expect(ceil(-3)).toBe(-3);
    expect(ceil(0)).toBe(0);
  });

  it('floor ile simetriktir — ceil(x) === -floor(-x)', () => {
    // `===` kullanılıyor, `toBe` değil: x = 0'da -floor(-0) === -0 üretir ve
    // Object.is(0, -0) false'tur. Sayısal olarak ikisi eşittir (0 === -0).
    for (const x of [2.1, -2.1, 0.5, -0.5, 1000.0001, -1000.0001, 7, 0]) {
      expect(ceil(x) === -floor(-x)).toBe(true);
    }
  });

  it('raporun grafik ekseni kullanımı', () => {
    // ustSinir = ceil(max / step) * step
    const ustSinir = (max: number, step: number) => (ceil(div(max, step) as number) as number) * step;
    expect(ustSinir(1700000, 100000)).toBe(1700000);
    expect(ustSinir(1650000, 100000)).toBe(1700000);
    expect(ustSinir(1700001, 100000)).toBe(1800000);
  });

  it('float köprüsünde kayma yok', () => {
    // Ham 0.1 + 0.2 = 0.30000000000000004; ceil(0.3) 1 olmalı, 1 kalmalı.
    expect(ceil(0.3)).toBe(1);
    expect(ceil(round(0.1 + 0.2, 2))).toBe(1);
  });
});

describe('math.log10 — onluk logaritma (rapor #3 §3)', () => {
  it('tam onluk kuvvetlerde TAM DEĞER döner', () => {
    expect(log10(1)).toBe(0);
    expect(log10(10)).toBe(1);
    expect(log10(100)).toBe(2);
    expect(log10(1000)).toBe(3);
    expect(log10(10000)).toBe(4);
    expect(log10(100000)).toBe(5);
    expect(log10(1000000)).toBe(6);
  });

  it('ln BÖLMESİNİN yaptığı hatayı yapmaz (raporun ölçümü)', () => {
    // Taklit: div(log(x), log(10)) — tam kuvvetlerde bir epsilon aşağıda kalır.
    const taklit = (x: number) => div(log(x) as number, log(10) as number) as number;

    expect(taklit(1000)).not.toBe(3);
    expect(floor(taklit(1000))).toBe(2); // ✘ bir basamak kayması
    expect(floor(log10(1000) as number)).toBe(3); // ✔ doğru

    expect(taklit(1000000)).not.toBe(6);
    expect(floor(taklit(1000000))).toBe(5); // ✘
    expect(floor(log10(1000000) as number)).toBe(6); // ✔
  });

  it('raporun eksen adımı formülü artık doğru sonuç verir', () => {
    // taban = 10 ^ (floor(log10(max)) - 1)
    const eksenAdimi = (max: number): number | null => {
      const mertebe = log10(max);
      if (mertebe === null) return null;
      return pow(10, floor(mertebe) - 1);
    };
    expect(eksenAdimi(1700000)).toBe(100000);
    expect(eksenAdimi(170000)).toBe(10000);
    expect(eksenAdimi(1000000)).toBe(100000); // ← taklitte 10.000 çıkıyordu
    expect(eksenAdimi(1000)).toBe(100); // ← taklitte 10 çıkıyordu
  });

  it('ara değerler', () => {
    expect(round(log10(1700000) as number, 6)).toBe(6.230449);
    expect(round(log10(2) as number, 6)).toBe(0.30103);
    expect(round(log10(0.001) as number, 6)).toBe(-3);
  });

  it('x <= 0 veya geçersizde null — log ile aynı kural', () => {
    expect(log10(0)).toBeNull();
    expect(log10(-5)).toBeNull();
    expect(log10(NaN)).toBeNull();
    expect(log10(Infinity)).toBeNull();
  });

  it('log (doğal) davranışı DEĞİŞMEDİ (REGRESYON)', () => {
    expect(round(log(1.1) as number, 5)).toBe(0.09531);
    expect(log(0)).toBeNull();
    expect(log(-5)).toBeNull();
  });
});
