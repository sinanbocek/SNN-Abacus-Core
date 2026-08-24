/**
 * ABACUS dahili para biçimlendirme çekirdeği (yaprak modül — yalnız `math`'e bağlıdır).
 *
 * Amaç: `money.format`'ı hem `money` motorunun hem de `text.suffix`'in dairesel
 * import üretmeden kullanabilmesi. Genel (public) kapı `money.format`'tır;
 * bu modül dışa açık API değildir ve barrel üzerinden export edilmez.
 *
 * Davranış birebir korunmuştur (v1.1.0 ile fark yok).
 */

import { abs, div, floor, mod, round } from '../math';

export interface FormatMoneyOptions {
  kurus?: boolean;
  form?: 'symbol' | 'text';
  negative?: 'minus' | 'paren';
  currency?: 'TRY' | 'USD';
}

/** Binlik ayraç ekleyici (Intl / toLocale kullanmadan) */
export function groupThousands(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * ABACUS para biçimlendirme motoru (TCMB kurallarına uygun).
 * Girdi kuruş bazlı tam sayıdır (2323223 kuruş = 23.232,23 TL).
 * Tüm matematiksel işlemler math motoru üzerinden yürütülür (ham Math.* kullanımı yoktur).
 */
export function formatMoney(kurus: number | null | undefined, opts?: FormatMoneyOptions): string {
  if (kurus === null || kurus === undefined || !Number.isFinite(kurus)) {
    return '—';
  }

  const showKurus = opts?.kurus ?? false;
  const form = opts?.form ?? 'symbol';
  const negativeMode = opts?.negative ?? 'minus';
  const cur = opts?.currency ?? 'TRY';
  const symbol = cur === 'USD' ? '$' : '₺';
  const textCode = cur === 'USD' ? 'USD' : 'TL';

  if (kurus === 0) {
    if (form === 'text') {
      return showKurus ? `0,00 ${textCode}` : `0 ${textCode}`;
    }
    return showKurus ? '0,00' : '0';
  }

  const isNegative = kurus < 0;
  const absKurus = abs(kurus);

  let formattedNum = '';

  if (showKurus) {
    const tlDiv = div(absKurus, 100);
    const tl = tlDiv !== null ? floor(tlDiv) : 0;
    const kMod = mod(absKurus, 100);
    const k = kMod !== null ? round(kMod, 0) : 0;
    const kStr = k < 10 ? `0${k}` : `${k}`;
    formattedNum = `${groupThousands(tl)},${kStr}`;
  } else {
    const tlDiv = div(absKurus, 100);
    const roundedTL = tlDiv !== null ? round(tlDiv, 0) : 0;
    formattedNum = groupThousands(roundedTL);
  }

  const resultWithForm = form === 'symbol' ? `${symbol}${formattedNum}` : `${formattedNum} ${textCode}`;

  if (isNegative) {
    return negativeMode === 'paren' ? `(${resultWithForm})` : `-${resultWithForm}`;
  }

  return resultWithForm;
}
