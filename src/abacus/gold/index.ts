import { div, mul, round } from '../math';
import { ONS_TO_GRAM } from '../internal/constants';

/**
 * ABACUS Altın ve Değerli Maden Motoru (ABACUS-SPEC & Yol-2 B-Otorite Mantığı).
 * 1 Ons = 31.1034768 gram kabul edilir.
 * 24K saflığı fiziki/piyasa altın kuralına uygun olarak 0.995 alınır.
 * Tüm çıktı değerleri tamsayı kuruş (minor unit) cinsindendir.
 */

/** 1 troy ons = 31.1034768 gram. Tek kaynak: internal/constants. */
export { ONS_TO_GRAM };

export const PURITY: Record<number, number> = {
  24: 0.995,
  22: 0.916,
  21: 0.875,
  18: 0.750,
};

export const ZIYNET_GRAM: Record<string, number> = {
  quarter: 1.754,
  half: 3.508,
  full: 7.016,
};

/**
 * Gram altın fiyatını kuruş cinsinden hesaplar.
 * @param onsUsd Ons altın fiyatı (USD, float)
 * @param usdTry USD/TRY döviz kuru (float)
 * @param karat Ayar (24, 22, 21, 18)
 * @returns Tamsayı kuruş tutarı (minor unit) veya geçersiz girdi durumunda null
 */
export function gramGoldPrice(onsUsd: number, usdTry: number, karat: number): number | null {
  if (
    onsUsd <= 0 ||
    usdTry <= 0 ||
    !Number.isFinite(onsUsd) ||
    !Number.isFinite(usdTry) ||
    !Number.isFinite(karat)
  ) {
    return null;
  }

  const purity = PURITY[karat];
  if (purity === undefined) {
    return null;
  }

  const safGramUsd = div(onsUsd, ONS_TO_GRAM);
  if (safGramUsd === null) {
    return null;
  }

  const ayarGramUsd = mul(safGramUsd, purity);
  const ayarGramTry = mul(ayarGramUsd, usdTry);

  return round(mul(ayarGramTry, 100), 0);
}

/**
 * Ziynet altın (Çeyrek, Yarım, Tam) fiyatını kuruş cinsinden hesaplar.
 * @param type Ziynet türü ('quarter' | 'half' | 'full')
 * @param onsUsd Ons altın fiyatı (USD, float)
 * @param usdTry USD/TRY döviz kuru (float)
 * @returns Tamsayı kuruş tutarı (minor unit) veya geçersiz girdi durumunda null
 */
export function ziynetPrice(type: string, onsUsd: number, usdTry: number): number | null {
  if (
    onsUsd <= 0 ||
    usdTry <= 0 ||
    !Number.isFinite(onsUsd) ||
    !Number.isFinite(usdTry) ||
    !type
  ) {
    return null;
  }

  const weight = ZIYNET_GRAM[type];
  if (weight === undefined) {
    return null;
  }

  const purity22 = PURITY[22];
  if (purity22 === undefined) {
    return null;
  }

  const safGramUsd = div(onsUsd, ONS_TO_GRAM);
  if (safGramUsd === null) {
    return null;
  }

  const gram22Usd = mul(safGramUsd, purity22);
  const gram22Try = mul(gram22Usd, usdTry);
  const ziynetTry = mul(gram22Try, weight);

  return round(mul(ziynetTry, 100), 0);
}
