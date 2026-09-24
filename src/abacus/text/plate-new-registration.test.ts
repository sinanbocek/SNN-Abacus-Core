import { describe, expect, it } from 'vitest';
import { plate } from './index';

/**
 * TB-013 — `PlateResult.yeniKayit` alanı Türkçe (kod dili standardı).
 *
 * Alan GENEL API'dir; yeniden adlandırmak kırıcıdır (AI-RULES §4.0). İki adımda
 * yapılır:
 *   1. (bu adım, MINOR) İngilizce ad `newRegistration` eklenir; `yeniKayit` aynı
 *      değeri taşımaya devam eder ve `@deprecated` işaretlenir. Kimse kırılmaz.
 *   2. (bir sonraki MAJOR) `yeniKayit` silinir; `.snn-kod-dili.json` geçiş istisnası
 *      da silinir; TB-013 kapanır.
 *
 * Ölçüm (2026-09-24): çekirdek dışında `yeniKayit`'i yalnız GHS-Panel okuyor (6 kaynak
 * + 3 test/betik satırı); hiçbir tüketici `PlateResult` nesnesini elle kurmuyor ya da
 * bütünüyle karşılaştırmıyor. Alan eklemek o yüzden kırıcı değil.
 */
describe('plate — newRegistration (yeniKayit\'in İngilizce adı)', () => {
  it.each([
    ['34yk', true],
    ['06 YK', true],
    ['34 YK 123', false],
    ['54apy281', false],
    ['34 ABC 123', false],
    ['', false],
    ['82 AB 123', false],
    ['çöp', false],
  ])('%j -> newRegistration %s', (raw, expected) => {
    expect(plate(raw).newRegistration).toBe(expected);
  });

  it('eski ad aynı değeri taşımaya devam eder (geçiş dönemi)', () => {
    for (const raw of ['34yk', '06 YK', '34 YK 123', '54apy281', '', 'çöp']) {
      const result = plate(raw);
      expect(result.yeniKayit, raw).toBe(result.newRegistration);
    }
  });
});
