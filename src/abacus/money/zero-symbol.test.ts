import { describe, expect, it } from 'vitest';
import { compact, compactMajor, format, formatMajor, parse } from './index';

/**
 * Talep #11 aday 3 (GHS-Panel, issue #47) — madde 39C: sıfır tutarda simge.
 *
 * Ölçülen tutarsızlık: simge biçimi sıfırda simgeyi DÜŞÜRÜYOR (`0,00`), metin
 * biçimi kısaltmayı KORUYOR (`0,00 TL`). Aynı sütunda `₺1.234,56` ile `0,00` yan
 * yana duruyor; GHS-Panel sıfırı bu yüzden kendisi yazmış ve 7 ayrı biçim doğmuş.
 * TCMB tablolarda simge kullanılmasını istiyor.
 *
 * Varsayılan DEĞİŞMEDİ (tüketicinin gördüğü çıktı = MAJOR); `zero: 'symbol'` seçmelidir.
 */
describe("zero: 'symbol' — sıfırda da para birimi işareti", () => {
  it('simge biçiminde sıfır simgeyle yazılır', () => {
    expect(format(0, { zero: 'symbol' })).toBe('₺0');
    expect(format(0, { kurus: true, zero: 'symbol' })).toBe('₺0,00');
    expect(formatMajor(0, { kurus: true, zero: 'symbol' })).toBe('₺0,00');
    expect(formatMajor(0, { kurus: true, currency: 'USD', zero: 'symbol' })).toBe('$0,00');
  });

  it('kuruşa yuvarlanıp sıfıra düşen tutar da aynı biçimi alır', () => {
    expect(formatMajor(0.004, { kurus: true, zero: 'symbol' })).toBe('₺0,00');
    // Kuruşsuz yazımda 0,4 lira zaten '₺0' çıkıyordu; sıfır artık ondan ayrı durmuyor.
    expect(formatMajor(0.4)).toBe('₺0');
    expect(formatMajor(0, { zero: 'symbol' })).toBe('₺0');
  });

  it('sıfırda işaret ve parantez yok', () => {
    expect(format(0, { kurus: true, zero: 'symbol', negative: 'paren' })).toBe('₺0,00');
  });

  it('metin biçimi zaten işaretliydi, değişmedi', () => {
    expect(format(0, { kurus: true, form: 'text', zero: 'symbol' })).toBe('0,00 TL');
    expect(format(0, { kurus: true, form: 'text' })).toBe('0,00 TL');
  });

  it('sıfır dışındaki tutarlar etkilenmez', () => {
    expect(formatMajor(1234.56, { kurus: true, zero: 'symbol' })).toBe('₺1.234,56');
    expect(formatMajor(-5, { zero: 'symbol' })).toBe('-₺5');
  });

  it('kısa biçim: compact ve compactMajor', () => {
    expect(compact(0, { zero: 'symbol' })).toBe('₺0');
    expect(compactMajor(0, { zero: 'symbol' })).toBe('₺0');
    expect(compactMajor(0, { zero: 'symbol', currency: 'EUR' })).toBe('€0');
    // Kısa biçimde metin biçimi sıfırda kısaltmayı DÜŞÜRÜYORDU; seçenekle ikisi de işaretli.
    expect(compact(0, { form: 'text', zero: 'symbol' })).toBe('0 TL');
  });

  it('çıktı parse ile geri okunur (ayna kuralı)', () => {
    expect(parse('₺0,00')).toBe(0);
    expect(parse('₺0')).toBe(0);
  });

  describe('varsayılan DEĞİŞMEDİ (kırıcı değil)', () => {
    it.each([
      [() => format(0), '0'],
      [() => format(0, { kurus: true }), '0,00'],
      [() => formatMajor(0, { kurus: true }), '0,00'],
      [() => formatMajor(0, { kurus: true, zero: 'plain' }), '0,00'],
      [() => compact(0), '0'],
      [() => compactMajor(0), '0'],
      [() => compact(0, { form: 'text' }), '0'],
    ])('%#', (call, expected) => {
      expect(call()).toBe(expected);
    });
  });
});
