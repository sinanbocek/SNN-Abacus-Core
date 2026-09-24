import { describe, expect, it } from 'vitest';
import { formatGroupedInput, parse, parseNumber } from './index';

/**
 * Talep #48 (GHS-Panel) — kutuda ondalık hane sınırlanamıyordu.
 *
 * `formatGroupedInput('1234,567')` -> `'1.234,567'`. Ekranda üç hane görünür,
 * `parse` bu metni reddeder (`null`), `parseNumber` 1234.567 okur. Sınır
 * tüketicide kesilirse üçüncü hane bir an görünüp silinir.
 *
 * `maxDigits` fazla haneyi KESER, yuvarlamaz: kullanıcı yazarken son tuşu
 * yutmak doğrudur, yazdığı rakamı değiştirmek değildir.
 */
describe('formatGroupedInput — maxDigits', () => {
  it('fazla hane kesilir, yuvarlanmaz', () => {
    expect(formatGroupedInput('1234,567', { maxDigits: 2 })).toBe('1.234,56');
    expect(formatGroupedInput('1234,569', { maxDigits: 2 })).toBe('1.234,56');
    expect(formatGroupedInput('0,075', { maxDigits: 2 })).toBe('0,07');
  });

  it('sınırın altındaki hane ve sondaki virgül olduğu gibi kalır', () => {
    expect(formatGroupedInput('1234,5', { maxDigits: 2 })).toBe('1.234,5');
    expect(formatGroupedInput('1234,', { maxDigits: 2 })).toBe('1.234,');
    expect(formatGroupedInput('1234', { maxDigits: 2 })).toBe('1.234');
  });

  it('tuş tuş yazımda üçüncü hane kutuya hiç girmez', () => {
    let box = '';
    const steps = [...'1234,567'].map((key) => {
      box = formatGroupedInput(box + key, { maxDigits: 2 });
      return box;
    });
    expect(steps).toEqual(['1', '12', '123', '1.234', '1.234,', '1.234,5', '1.234,56', '1.234,56']);
  });

  it('maxDigits: 0 tam sayı kutusudur — virgül yazılamaz', () => {
    expect(formatGroupedInput('1234,56', { maxDigits: 0 })).toBe('1.234');
    expect(formatGroupedInput('85,', { maxDigits: 0 })).toBe('85');
    expect(formatGroupedInput(',5', { maxDigits: 0 })).toBe('');
  });

  it('dotAsDecimal ile birlikte çalışır', () => {
    expect(formatGroupedInput('1234.567', { dotAsDecimal: true, maxDigits: 2 })).toBe('1.234,56');
    expect(
      formatGroupedInput('85.340,505', { dotAsDecimal: true, maxDigits: 2, previous: '85.340,50' })
    ).toBe('85.340,50');
  });

  it('maxDigits: 2 ile kutu parse ve parseNumber aynı değeri okur', () => {
    const box = formatGroupedInput('1234,567', { maxDigits: 2 });
    expect(parse(box)).toBe(123456);
    expect(parseNumber(box)).toBe(1234.56);
  });

  it('verilmezse hane sınırsızdır (bugünkü davranış, kırıcı değil)', () => {
    expect(formatGroupedInput('1234,567')).toBe('1.234,567');
    expect(formatGroupedInput('1234,567', {})).toBe('1.234,567');
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 21])(
    'geçersiz maxDigits (%s) -> "—" (text.digits ve madde 27 emsali)',
    (maxDigits) => {
      expect(formatGroupedInput('1234,56', { maxDigits })).toBe('—');
      expect(formatGroupedInput('', { maxDigits })).toBe('—');
    }
  );

  it('sınır 20 hanedir (EN_COK_HANE)', () => {
    const raw = `1,${'1'.repeat(25)}`;
    expect(formatGroupedInput(raw, { maxDigits: 20 })).toBe(`1,${'1'.repeat(20)}`);
  });
});
