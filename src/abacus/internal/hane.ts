/**
 * ABACUS dahili hane sayısı doğrulaması (yaprak modül — hiçbir motoru import etmez).
 *
 * `money` ve `unit` motorlarındaki biçimleme fonksiyonları bir `digits`
 * (ondalık hane sayısı) alır. v2.x'te bu değer doğrulanmadan `math.round`'a
 * veriliyordu; decimal.js geçersiz değerde (1.5, -1, NaN, Infinity) HATA
 * FIRLATIYORDU. ABACUS-SPEC §2.1 gereği biçimleme işi çökmez, `'—'` döner.
 *
 * Bu modül barrel üzerinden dışa açılmaz.
 */

/**
 * Kabul edilen en büyük ondalık hane sayısı.
 *
 * JavaScript sayısı ~17 anlamlı basamak taşır; daha fazla hane yeni bilgi
 * taşımaz, yalnız uydurma sıfır üretir (v2.x'te `fmtDecimalGrouped(4.3, 100)`
 * virgülden sonra 100 hane yazıyordu). 20, decimal.js'in varsayılan
 * hassasiyetiyle aynıdır ve olağan her kullanımın çok üstündedir.
 */
export const EN_COK_HANE = 20;

/** `digits` 0 ile EN_COK_HANE arasında (dâhil) bir tam sayı mı? */
export function isValidDigits(digits: number): boolean {
  return Number.isInteger(digits) && digits >= 0 && digits <= EN_COK_HANE;
}
