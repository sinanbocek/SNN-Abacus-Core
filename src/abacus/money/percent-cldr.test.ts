import { describe, expect, it } from 'vitest';
import { percent } from './index';

/**
 * money.percent — İŞARET KONUMU ve SABİT ONDALIK (v2.9.0).
 *
 * SORUN: Çekirdek negatif yüzdeyi `%-4,3` yazıyordu. TDK Yazım Kılavuzu yüzde
 * işaretini sayıdan önce ve boşluksuz ister (`%25`) ama negatif sayı için hüküm
 * koymaz; `%-4,3` bu kuralın harfiyen uygulanmasıdır. Eksi işareti iki sembolün
 * arasına sıkışır ve bir tabloda yön ilk karakterden okunamaz. Unicode CLDR'nin
 * Türkçe biçimi (tarayıcılar, `Intl.NumberFormat`) ise `-%4,3` yazar.
 *
 * Ayrıca sondaki sıfır atılıyordu (`%4,3`, `%4,30` değil); tablolarda ondalıklar
 * alt alta hizalanmıyordu.
 *
 * BEKLENEN DEĞERLERİN KAYNAĞI (AI-RULES §2 — dış otorite):
 * Unicode CLDR 48.0 (ICU 78.3) `tr-TR` yüzde biçimi. Değerler depo DIŞINDA
 * `Intl.NumberFormat('tr-TR', { style: 'percent', useGrouping: false, ... })`
 * ile ölçüldü (çekirdek kaynağında `Intl` yasaktır):
 *
 *   -4,3  maxFrac 1                 → "-%4,3"
 *    4,3  signDisplay 'always'      → "+%4,3"
 *   -4,3  min/maxFrac 2             → "-%4,30"
 *    5    min/maxFrac 2             → "%5,00"
 *   12,345 min/maxFrac 2 halfExpand → "%12,35"
 *   -4,3  min/maxFrac 0             → "-%4"
 *    0 ve -0,04 (1 hane) 'exceptZero' → "%0"
 *
 * BİLİNÇLİ FARK: CLDR 'auto' işaret gösteriminde `-0,04`'ü `-%0` yazar. Çekirdeğin
 * mevcut sözleşmesi sıfıra hiçbir modda işaret koymamaktır (CLDR 'exceptZero' ile
 * aynı); bu korunur.
 *
 * v3.0.0 — KIRICI: varsayılan `signPosition` artık `'leading'`'dir (`-%4,3`).
 * v2.9.0'da seçenek olarak geldi; varsayılanın değişmesi tüketicinin gördüğü
 * çıktıyı değiştirdiği için MAJOR sürüme bırakılmıştı (AI-RULES §4.0).
 * Eski yazım `signPosition: 'inner'` ile hâlâ alınabilir. `fixed` varsayılanı
 * değişmedi (`false`). Göç: MIGRATION-v3.md.
 */

describe("money.percent — signPosition: 'leading' (CLDR tr-TR)", () => {
  it('negatifte eksi en başa gelir', () => {
    expect(percent(-4.3, 1, { signPosition: 'leading' })).toBe('-%4,3');
  });

  it("sign: 'always' ile artı da en başa gelir", () => {
    expect(percent(4.3, 1, { signPosition: 'leading', sign: 'always' })).toBe('+%4,3');
    expect(percent(-4.3, 1, { signPosition: 'leading', sign: 'always' })).toBe('-%4,3');
  });

  it('pozitif sayıda işaret yoksa konum fark etmez', () => {
    expect(percent(4.3, 1, { signPosition: 'leading' })).toBe('%4,3');
  });

  it('sıfıra hiçbir durumda işaret konmaz (CLDR exceptZero ile aynı)', () => {
    expect(percent(0, 1, { signPosition: 'leading' })).toBe('%0');
    expect(percent(-0.04, 1, { signPosition: 'leading' })).toBe('%0');
    expect(percent(0, 1, { signPosition: 'leading', sign: 'always' })).toBe('%0');
  });

  it("sign: 'never' ile konumun anlamı yoktur", () => {
    expect(percent(-4.3, 1, { signPosition: 'leading', sign: 'never' })).toBe('%4,3');
  });

  it("showPositiveSign (eski ad) ile de çalışır", () => {
    expect(percent(4.3, 1, { signPosition: 'leading', showPositiveSign: true })).toBe('+%4,3');
  });
});

describe('money.percent — fixed: true (sabit ondalık hane)', () => {
  it('sondaki sıfırlar korunur', () => {
    expect(percent(4.3, 2, { fixed: true })).toBe('%4,30');
    expect(percent(5, 2, { fixed: true })).toBe('%5,00');
  });

  it('yuvarlama half-up', () => {
    expect(percent(12.345, 2, { fixed: true })).toBe('%12,35');
  });

  it('sıfır hane ile virgül yazılmaz', () => {
    expect(percent(4.3, 0, { fixed: true })).toBe('%4');
  });

  it('sıfır sabit hanesiyle yazılır, işaretsiz', () => {
    expect(percent(0, 2, { fixed: true })).toBe('%0,00');
    expect(percent(-0.001, 2, { fixed: true, signPosition: 'leading' })).toBe('%0,00');
  });

  it('negatif değer sabit haneyle', () => {
    expect(percent(-4.3, 2, { fixed: true })).toBe('-%4,30');
    expect(percent(-4.3, 2, { fixed: true, signPosition: 'inner' })).toBe('%-4,30');
  });

  it('tablo hizası: aynı hane sayısı, aynı virgül konumu', () => {
    const column = [4.3, 12.45, 0.5].map((v) => percent(v, 2, { fixed: true }));
    expect(column).toEqual(['%4,30', '%12,45', '%0,50']);
    for (const h of column) expect(h.length - h.indexOf(',')).toBe(3);
  });
});

describe('money.percent — iki seçenek birlikte (tam CLDR tr-TR)', () => {
  it('kullanıcının istediği okunur negatif', () => {
    expect(percent(-4.3, 2, { signPosition: 'leading', fixed: true })).toBe('-%4,30');
  });

  it('sıfır hane', () => {
    expect(percent(-4.3, 0, { signPosition: 'leading', fixed: true })).toBe('-%4');
  });

  it('artı işaretiyle', () => {
    expect(percent(4.3, 2, { signPosition: 'leading', fixed: true, sign: 'always' })).toBe('+%4,30');
  });
});

describe('money.percent — v3.0.0 varsayılanı: işaret en başta (KIRICI)', () => {
  it("varsayılan artık 'leading' — CLDR tr-TR", () => {
    expect(percent(-4.3, 1)).toBe('-%4,3');
    expect(percent(-4.3, 2)).toBe('-%4,3');
    expect(percent(4.3, 1, { sign: 'always' })).toBe('+%4,3');
  });

  it('işaretsiz çıktılar değişmedi', () => {
    expect(percent(12.345, 1)).toBe('%12,3');
    expect(percent(-0.04, 1)).toBe('%0');
    expect(percent(-4.3, 1, { sign: 'never' })).toBe('%4,3');
  });

  it("eski v2.x yazımı signPosition: 'inner' ile alınır", () => {
    expect(percent(-4.3, 1, { signPosition: 'inner' })).toBe('%-4,3');
    expect(percent(4.3, 1, { sign: 'always', signPosition: 'inner' })).toBe('%+4,3');
  });

  it('geçersiz girdi her seçenekle tire döner', () => {
    expect(percent(null, 2, { signPosition: 'leading', fixed: true })).toBe('—');
    expect(percent(NaN, 2, { fixed: true })).toBe('—');
  });
});
