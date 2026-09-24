import { describe, expect, it } from 'vitest';
import { properNounSuffix, suffix } from './index';

/**
 * Talep #13 (issue #51, TYC Grup şartname özeti) — rakamla biten özel ad.
 *
 * Ek, adın son HARFİNDEN alınıyordu; sondaki rakamlar atlanıyordu:
 * `17 Şubat 2027` -> `17 Şubat 2027'a` ("Şubat"ın 'a'sı). Doğrusu sayının
 * OKUNUŞUNDAN almaktır: 2027 "iki bin yirmi yedi" -> `2027'ye` (TDK: sayılara
 * gelen ekler okunuşa göre yazılır).
 *
 * Kural `text.suffix` ile aynıdır; o fonksiyon sayılar için zaten doğruydu.
 */
describe('properNounSuffix — rakamla biten ad sayının okunuşuna göre çekilir', () => {
  it.each([
    ['17 Şubat 2027', 'dat', "17 Şubat 2027'ye"],
    ['Ek-6', 'loc', "Ek-6'da"],
    ['Ek-1', 'loc', "Ek-1'de"],
    ['Model 3', 'loc', "Model 3'te"],
    ['Madde 40', 'abl', "Madde 40'tan"],
    ['2027', 'dat', "2027'ye"],
    ['A4', 'loc', "A4'te"],
  ] as const)('talepteki vaka: %s %s -> %s', (name, kind, expected) => {
    expect(properNounSuffix(name, kind)).toBe(expected);
  });

  it.each([
    ['Madde 10', 'dat', "Madde 10'a"],
    ['Madde 60', 'loc', "Madde 60'ta"],
    ['Madde 90', 'abl', "Madde 90'dan"],
    ['Madde 100', 'loc', "Madde 100'de"],
    ['Ek-5', 'gen', "Ek-5'in"],
    ['Ek-2', 'acc', "Ek-2'yi"],
    ['2027', 'gen', "2027'nin"],
    ['Madde 0', 'dat', "Madde 0'a"],
    ['1.000.000', 'dat', "1.000.000'a"],
    // Binlik noktalı sayı BÜTÜN okunur: "iki bin" -> 'e'. Son grup ('000' -> "sıfır") değil.
    ['Madde 2.000', 'dat', "Madde 2.000'e"],
    ['Tutar 7,65', 'loc', "Tutar 7,65'te"],
    ['%40', 'abl', "%40'tan"],
  ] as const)('ek, sayının son okunan kelimesinden: %s %s -> %s', (name, kind, expected) => {
    expect(properNounSuffix(name, kind)).toBe(expected);
  });

  it('sayının kendisi için text.suffix ile birebir aynı ek (0–3000, beş hâl)', () => {
    const kinds = ['loc', 'abl', 'dat', 'gen', 'acc'] as const;
    for (let n = 0; n <= 3000; n++) {
      for (const kind of kinds) {
        expect(properNounSuffix(String(n), kind), `${n} ${kind}`).toBe(suffix(n, 'number', kind));
      }
    }
  });

  it('güvenli tam sayı sınırını aşan rakam dizisi (kod) harf kuralına düşer, çökmez', () => {
    // 20 haneli bir kodun okunuşu yoktur; ek adın harflerinden alınır ("Kod" -> 'o').
    expect(properNounSuffix('Kod 12345678901234567890', 'loc')).toBe("Kod 12345678901234567890'da");
  });

  it('çıktıda ad aynen kalır; sondaki nokta ses çözümlemesinden atılır', () => {
    expect(properNounSuffix('Madde 40.', 'abl')).toBe("Madde 40.'tan");
    expect(properNounSuffix('  Model 3  ', 'loc')).toBe("Model 3'te");
  });

  describe('harfle biten adlar DEĞİŞMEDİ', () => {
    it.each([
      ['VakıfBank', 'loc', "VakıfBank'ta"],
      ['A.Ş.', 'abl', "A.Ş.'nden"],
      ['Ziraat Bankası', 'loc', "Ziraat Bankası'nda"],
      ['Gürsu', 'loc', "Gürsu'da"],
      ['İzmir', 'loc', "İzmir'de"],
      ['Ankara', 'dat', "Ankara'ya"],
    ] as const)('%s %s -> %s', (name, kind, expected) => {
      expect(properNounSuffix(name, kind)).toBe(expected);
    });
  });
});
