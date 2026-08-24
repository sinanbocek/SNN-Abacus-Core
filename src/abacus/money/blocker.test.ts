import { describe, expect, it } from 'vitest';
import { toWords } from './index';
import { numberToWords } from '../text';

describe('text.numberToWords ölçek tavanı (rapor B2)', () => {
  it('Trilyon üstünü artık sessizce düşürmez — Katrilyon', () => {
    expect(numberToWords(1e15)).toBe('BirKatrilyon');
    expect(numberToWords(2000000000000000)).toBe('İkiKatrilyon');
  });

  it('Trilyon aralığı aynen çalışır (REGRESYON)', () => {
    expect(numberToWords(999999999999999)).toBe(
      'DokuzYüzDoksanDokuzTrilyonDokuzYüzDoksanDokuzMilyarDokuzYüzDoksanDokuzMilyonDokuzYüzDoksanDokuzBinDokuzYüzDoksanDokuz'
    );
  });

  it('güvenli tam sayı sınırının ötesini sessizce yanlış üretmez', () => {
    expect(numberToWords(1e16)).toBe('');
    expect(numberToWords(Number.MAX_SAFE_INTEGER + 2)).toBe('');
  });

  it('negatif ve geçersiz girdide boş dize (mevcut sözleşme)', () => {
    expect(numberToWords(-5)).toBe('');
    expect(numberToWords(NaN)).toBe('');
    expect(numberToWords(1.5)).toBe('');
  });
});

describe('money.toWords negatif ve geçersiz girdi (rapor B4)', () => {
  it('NaN ve Infinity artık "Sıfır" yazmaz, — döner', () => {
    expect(toWords(NaN)).toBe('—');
    expect(toWords(Infinity)).toBe('—');
    expect(toWords(-Infinity)).toBe('—');
  });

  it('negatif tutarda dilbilgisel olarak doğru "Eksi" kullanır', () => {
    expect(toWords(-100)).toBe('Yalnız EksiBirTürkLirası');
    expect(toWords(-100, { spaced: true })).toBe('Yalnız Eksi Bir Türk Lirası');
  });

  it('pozitif ve sıfır davranışı değişmedi (REGRESYON)', () => {
    expect(toWords(123456)).toBe('Yalnız BinİkiYüzOtuzDörtLiraElliAltıKuruş');
    expect(toWords(123456, { spaced: true })).toBe('Yalnız Bin İki Yüz Otuz Dört Lira Elli Altı Kuruş');
    expect(toWords(0)).toBe('Yalnız SıfırTürkLirası');
    expect(toWords(100)).toBe('Yalnız BirTürkLirası');
  });

  it('ölçek dışı tutarda — döner', () => {
    expect(toWords(1e18)).toBe('—');
  });

  it('ondalıklı kuruş girdisini reddeder (korumasız sessizce yanlış üretirdi)', () => {
    // Koruma olmasaydı toWords(0.5) -> "Yalnız SıfırLiraBirKuruş" üretirdi:
    // olmayan bir kuruş değeri uydurulmuş olurdu.
    expect(toWords(0.5)).toBe('—');
    expect(toWords(1234.56)).toBe('—');
    expect(toWords(-0.5)).toBe('—');
  });
});
