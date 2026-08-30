import { describe, expect, it } from 'vitest';
import { equals, percentChange } from './index';

/**
 * KARŞILAŞTIRMA VE DEĞİŞİM
 *
 * İkisi de tüketici projelerde elle yazılmış hâlde bulundu (Gunum-Var
 * `areNumbersEqual`, `calculatePercentageChange`); yerleştirme kuralı
 * (AI-RULES §4.1) gereği genel oldukları için çekirdeğe alındı.
 */

describe('math.equals — toleranslı eşitlik', () => {
  it('tolerans içindeki farkı eşit sayar', () => {
    expect(equals(1.0, 1.0005, 0.001)).toBe(true);
    expect(equals(100, 100.0009, 0.001)).toBe(true);
  });

  it('tolerans dışındaki farkı eşit saymaz', () => {
    expect(equals(1.0, 1.002, 0.001)).toBe(false);
    expect(equals(100, 101, 0.001)).toBe(false);
  });

  it('tolerans SINIRI dâhildir (<=)', () => {
    expect(equals(1, 1.001, 0.001)).toBe(true);
    expect(equals(1, 1.0011, 0.001)).toBe(false);
  });

  it('tolerans verilmezse TAM eşitlik arar', () => {
    expect(equals(1, 1)).toBe(true);
    expect(equals(1, 1.0000001)).toBe(false);
  });

  it('float tuzağını math motoru üzerinden aşar', () => {
    // 0.1 + 0.2 = 0.30000000000000004 (ham JS)
    expect(equals(0.1 + 0.2, 0.3)).toBe(false); // tam eşitlik: değil
    expect(equals(0.1 + 0.2, 0.3, 0.0000001)).toBe(true); // toleransla: evet
  });

  it('işaret yönü fark etmez', () => {
    expect(equals(-5, -5.0005, 0.001)).toBe(true);
    expect(equals(5, -5, 0.001)).toBe(false);
  });

  it('sonlu olmayan girdide false döner (NaN hiçbir şeye eşit değildir)', () => {
    expect(equals(NaN, NaN)).toBe(false);
    expect(equals(NaN, 1, 100)).toBe(false);
    expect(equals(Infinity, Infinity)).toBe(false);
  });

  it('negatif tolerans geçersizdir', () => {
    expect(equals(1, 1, -0.5)).toBe(false);
  });
});

describe('math.percentChange — değişim yüzdesi', () => {
  it('artışı pozitif, azalışı negatif verir', () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
    expect(percentChange(100, 100)).toBe(0);
  });

  it('ondalıklı sonuç üretir', () => {
    expect(percentChange(105.5, 100)).toBe(5.5);
    expect(percentChange(133, 100)).toBe(33);
  });

  it('float hatası üretmez', () => {
    // ham: ((0.3 - 0.1) / 0.1) * 100 = 199.99999999999997
    expect(percentChange(0.3, 0.1)).toBe(200);
  });

  it('önceki değer <= 0 ise null döner — sessizce 0 YAPMAZ', () => {
    // Gunum-Var'daki yerel sürüm burada 0 dönüyordu; "değişim yok" ile
    // "hesaplanamadı" birbirine karışıyordu.
    expect(percentChange(100, 0)).toBeNull();
    expect(percentChange(100, -50)).toBeNull();
  });

  it('geçersiz girdide null döner', () => {
    expect(percentChange(NaN, 100)).toBeNull();
    expect(percentChange(100, NaN)).toBeNull();
    expect(percentChange(Infinity, 100)).toBeNull();
  });

  it('gerçek sıfır ile null ayrılır', () => {
    expect(percentChange(100, 100)).toBe(0); // gerçekten değişmemiş
    expect(percentChange(100, 0)).toBeNull(); // hesaplanamaz
  });
});
