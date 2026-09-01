/**
 * ABACUS dahili para biçimlendirme çekirdeği (yaprak modül).
 *
 * Amaç: `money.format`'ı hem `money` motorunun hem de `text.suffix`'in dairesel
 * import üretmeden kullanabilmesi. Genel (public) kapı `money.format`'tır;
 * bu modül dışa açık API değildir ve barrel üzerinden export edilmez.
 *
 * Ayraçlar HER ZAMAN Türkçedir (binlik '.', ondalık ','); para birimi yalnız
 * simgeyi, metin kodunu ve ondalık hane sayısını belirler.
 * Bkz. `internal/currency-registry` — sorumluluk ayrımı orada açıklanmıştır.
 */

import { abs, div, floor, mod, round } from '../math';
import type { CurrencyRef } from './currency-registry';
import { minorFactor, resolveCurrency, withDigits } from './currency-registry';

export interface FormatMoneyOptions {
  kurus?: boolean;
  form?: 'symbol' | 'text';
  negative?: 'minus' | 'paren';
  /**
   * Yerleşik kod ('TRY' | 'USD' | 'EUR' | 'GBP') veya tam tanım nesnesi.
   * Tanınmayan kod verilirse '—' döner (uydurma yapılmaz).
   */
  currency?: CurrencyRef;
  /**
   * Ondalık hane sayısını para biriminin `minorDigits` değerinden BAĞIMSIZ
   * olarak belirler (v2.6.0). Yerleşik bir birimin simgesi ve kısaltması
   * korunurken yalnız hane sayısı değiştirilmek istendiğinde kullanılır:
   *
   *   money.formatMajor(1.2345, { currency: 'TRY', digits: 4, kurus: true })
   *   // "₺1,2345" — TRY tanımını kopyalamaya gerek yok
   *
   * Geçerli aralık 0..4 arası tam sayıdır; dışında '—' döner.
   *
   * ⚠️ `money.parse` alt birim hanesini 2 KABUL EDER; `digits` ile üretilen
   * dört haneli çıktı `parse` ile geri okunamaz. Bilinçli kapsam sınırıdır.
   */
  digits?: number;
}

/** Binlik ayraç ekleyici (Intl / toLocale kullanmadan) */
export function groupThousands(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Alt birim kısmını sabit haneye sıfır dolgular ("5" -> "05"). */
function padMinor(value: number, digits: number): string {
  let s = String(value);
  while (s.length < digits) s = `0${s}`;
  return s;
}

/**
 * ABACUS para biçimlendirme motoru (TCMB kurallarına uygun).
 * Girdi ALT BİRİM tam sayısıdır (2323223 kuruş = 23.232,23 TL).
 * Tüm matematiksel işlemler math motoru üzerinden yürütülür.
 */
export function formatMoney(kurus: number | null | undefined, opts?: FormatMoneyOptions): string {
  if (kurus === null || kurus === undefined || !Number.isFinite(kurus)) {
    return '—';
  }

  const resolved = resolveCurrency(opts?.currency);
  if (resolved === null) return '—';

  const cur = withDigits(resolved, opts?.digits);
  if (cur === null) return '—';

  const showKurus = (opts?.kurus ?? false) && cur.minorDigits > 0;
  const form = opts?.form ?? 'symbol';
  const negativeMode = opts?.negative ?? 'minus';
  const factor = minorFactor(cur);

  if (kurus === 0) {
    const zero = showKurus ? `0,${padMinor(0, cur.minorDigits)}` : '0';
    return form === 'text' ? `${zero} ${cur.text}` : zero;
  }

  const isNegative = kurus < 0;
  const absKurus = abs(kurus);

  let formattedNum = '';

  if (showKurus) {
    const majorDiv = div(absKurus, factor);
    const major = majorDiv !== null ? floor(majorDiv) : 0;
    const minorMod = mod(absKurus, factor);
    const minor = minorMod !== null ? round(minorMod, 0) : 0;
    formattedNum = `${groupThousands(major)},${padMinor(minor, cur.minorDigits)}`;
  } else {
    const majorDiv = div(absKurus, factor);
    const roundedMajor = majorDiv !== null ? round(majorDiv, 0) : 0;
    formattedNum = groupThousands(roundedMajor);
  }

  const resultWithForm =
    form === 'symbol' ? `${cur.symbol}${formattedNum}` : `${formattedNum} ${cur.text}`;

  if (isNegative) {
    return negativeMode === 'paren' ? `(${resultWithForm})` : `-${resultWithForm}`;
  }

  return resultWithForm;
}
