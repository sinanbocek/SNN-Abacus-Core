import { div, mul, round } from '../math';
import { ONS_TO_GRAM } from '../internal/constants';

/**
 * ABACUS Gümüş Motoru (ABACUS-SPEC & Yol-2 B-Otorite Mantığı).
 * 1 Troy Ons = 31.1034768 gram kabul edilir (altın ile aynı evrensel troy ons).
 * Varsayılan milyem 999 (0.999 Külçe Saf Gümüş) alınır.
 * Tüm çıktı değerleri tamsayı kuruş (minor unit) cinsindendir.
 */

/** 1 troy ons = 31.1034768 gram. Tek kaynak: internal/constants. */
export { ONS_TO_GRAM };

export const SILVER_PURITY: Record<number, number> = {
  999: 0.999,
  925: 0.925,
  800: 0.800,
  1000: 1.000,
};

/**
 * Gram gümüş fiyatını kuruş cinsinden hesaplar.
 * @param onsUsd Ons gümüş fiyatı (USD, float)
 * @param usdTry USD/TRY döviz kuru (float)
 * @param millesimal Milyem / Saflık etiketi (999 | 925 | 800 | 1000 - varsayılan 999)
 * @returns Tamsayı kuruş tutarı (minor unit) veya geçersiz girdi durumunda null
 */
export function gramSilverPrice(
  onsUsd: number,
  usdTry: number,
  millesimal = 999
): number | null {
  if (
    onsUsd <= 0 ||
    usdTry <= 0 ||
    !Number.isFinite(onsUsd) ||
    !Number.isFinite(usdTry) ||
    !Number.isFinite(millesimal)
  ) {
    return null;
  }

  const purity = SILVER_PURITY[millesimal];
  if (purity === undefined) {
    return null;
  }

  const safGramUsd = div(onsUsd, ONS_TO_GRAM);
  if (safGramUsd === null) {
    return null;
  }

  const gramUsd = mul(safGramUsd, purity);
  const gramTry = mul(gramUsd, usdTry);

  return round(mul(gramTry, 100), 0);
}
