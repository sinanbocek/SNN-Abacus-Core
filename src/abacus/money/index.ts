import { abs, div, floor, mod, round } from '../math';
import { numberToWords } from '../text';
import { formatMoney, groupThousands } from '../internal/money-format';

export type { FormatMoneyOptions } from '../internal/money-format';

export interface ToWordsOptions {
  spaced?: boolean;
}

export interface CompactMoneyOptions {
  style?: 'K/M' | 'B/Mn/Mr';
  form?: 'symbol' | 'text';
}

/**
 * ABACUS para biçimlendirme motoru (TCMB kurallarına uygun).
 * Girdi kuruş bazlı tam sayıdır (2323223 kuruş = 23.232,23 TL).
 * Genel kapı burasıdır; hesap `internal/money-format` yaprak modülünde durur
 * (dairesel import olmadan `text.suffix` tarafından da kullanılabilsin diye).
 */
export const format = formatMoney;

/**
 * ABACUS yüzde biçimlendirme motoru (%12,3).
 * Null / undefined / NaN için '—' (tire) döndürür.
 */
export function percent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  const rounded = round(value, digits);
  const roundedStr = String(rounded).replace('.', ',');
  return `%${roundedStr}`;
}

/**
 * Türkçe biçimli sayı metnini sayıya çevirir ("1.234,56" -> 1234.56).
 *
 * Çözümlenemeyen girdide `null` döner (ABACUS-SPEC §2.1: hesap işleri `null`
 * ile hata bildirir). Gerçek sıfır ile "değer yok" birbirine karışmaz.
 */
export function parseNumber(val: string): number | null {
  if (!val) return null;
  const clean = val.replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
  if (clean === '' || clean === '-' || clean === '.' || clean === '-.') return null;
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}



/** Ondalıklı sayıyı binlik ayraçlı (nokta) + ondalık (virgül) göster — ör. 70000 -> "70.000" */
export function fmtDecimalGrouped(value: number | null | undefined, digits = 0): string {
  // ABACUS-SPEC §2.1: biçimlendirme işleri geçersiz girdide '—' döner.
  // '0' döndürmek "değer yok" ile "değer sıfır"ı birbirine karıştırırdı.
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const rounded = round(value, digits);
  const parts = String(rounded).split('.');
  const intPart = parts[0] ? groupThousands(Number(parts[0])) : '0';
  if (digits > 0) {
    const decPart = (parts[1] || '').padEnd(digits, '0').slice(0, digits);
    return `${intPart},${decPart}`;
  }
  return intPart;
}

/** Serbest ondalık giriş kutuları için CANLI biçimlendirme */
export function formatGroupedInput(raw: string): string {
  if (!raw) return '';
  const clean = raw.replace(/[^0-9,]/g, '');
  const firstComma = clean.indexOf(',');
  const intPartRaw = firstComma === -1 ? clean : clean.slice(0, firstComma);
  const decPart = firstComma === -1 ? '' : clean.slice(firstComma + 1).replace(/,/g, '');
  const intDigits = intPartRaw.replace(/^0+(?=\d)/, '');
  if (!intDigits && firstComma === -1) return '';
  // Sessiz varsayilan (|| 0) yok: bos hane dizisi acikca 0 demektir.
  const intValue = intDigits.length > 0 ? Number(intDigits) : 0;
  const grouped = groupThousands(intValue);
  if (firstComma === -1) return grouped;
  // groupThousands(0) zaten '0' dondurur; sessiz varsayilana gerek yok.
  return `${grouped},${decPart}`;
}


/**
 * Tutarı Türkçe yazıya çevirir ("Yalnız ... Türk Lirası").
 *
 * Geçersiz girdide (NaN, Infinity, güvenli tam sayı sınırı dışı) '—' döner;
 * sessizce "Sıfır" yazmaz. Negatif tutarda "Eksi" ibaresi "Yalnız"dan SONRA,
 * tutarın önüne gelir (dilbilgisel doğru konum).
 */
export function toWords(kurus: number, opts?: ToWordsOptions): string {
  if (!Number.isFinite(kurus) || !Number.isSafeInteger(kurus)) {
    return '—';
  }

  const spaced = opts?.spaced ?? false;
  const joinStr = spaced ? ' ' : '';

  const absKurus = abs(kurus);
  const tlDiv = div(absKurus, 100);
  const kMod = mod(absKurus, 100);
  if (tlDiv === null || kMod === null) return '—';

  const lira = floor(tlDiv);
  const kurusPart = round(kMod, 0);

  const negativeWord = kurus < 0 ? `Eksi${joinStr}` : '';
  const prefix = `Yalnız ${negativeWord}`;

  if (lira === 0 && kurusPart === 0) {
    const zeroTL = spaced ? 'Sıfır Türk Lirası' : 'SıfırTürkLirası';
    return `${prefix}${zeroTL}`;
  }

  if (kurusPart === 0) {
    const liraWords = numberToWords(lira, opts);
    if (!liraWords) return '—';
    const tlSuffix = spaced ? 'Türk Lirası' : 'TürkLirası';
    return `${prefix}${liraWords}${joinStr}${tlSuffix}`;
  }

  const liraWords = lira > 0 ? numberToWords(lira, opts) : 'Sıfır';
  const kurusWords = numberToWords(kurusPart, opts);
  if (!liraWords || !kurusWords) return '—';
  return `${prefix}${liraWords}${joinStr}Lira${joinStr}${kurusWords}${joinStr}Kuruş`;
}

export function compact(kurus: number | null | undefined, opts?: CompactMoneyOptions): string {
  if (kurus === null || kurus === undefined || !Number.isFinite(kurus)) {
    return '—';
  }

  if (kurus === 0) {
    return '0';
  }

  const style = opts?.style ?? 'K/M';
  const form = opts?.form ?? 'symbol';

  const isNegative = kurus < 0;
  const absKurus = abs(kurus);
  const tlValue = div(absKurus, 100);

  if (tlValue === null) return '—';

  // 1.000 TL altı kısaltmasız standart biçime düşer
  if (tlValue < 1000) {
    return format(kurus, { form, kurus: false });
  }

  let divisor = 1000;
  let unit = style === 'K/M' ? 'K' : 'B';

  if (tlValue >= 1000000000) {
    divisor = 1000000000;
    unit = style === 'K/M' ? 'B' : 'Mr';
  } else if (tlValue >= 1000000) {
    divisor = 1000000;
    unit = style === 'K/M' ? 'M' : 'Mn';
  }

  // Sessiz varsayilan (?? 0) yok: hesaplanamazsa bicimlendirme sentineli doner.
  const scaled = div(tlValue, divisor);
  if (scaled === null) return '—';
  let scaledVal = scaled;

  let roundedVal = round(scaledVal, 2);

  // Yuvarlama sonrası 1000 ve üzerine ulaşırsa üst ölçeğe terfi et
  if (roundedVal >= 1000) {
    if (unit === 'K' || unit === 'B') {
      const promoted = div(roundedVal, 1000);
      if (promoted !== null) {
        scaledVal = promoted;
        unit = style === 'K/M' ? 'M' : 'Mn';
        roundedVal = round(scaledVal, 2);
      }
    } else if (unit === 'M' || unit === 'Mn') {
      const promoted = div(roundedVal, 1000);
      if (promoted !== null) {
        scaledVal = promoted;
        unit = style === 'K/M' ? 'B' : 'Mr';
        roundedVal = round(scaledVal, 2);
      }
    }
  }

  const numStr = String(roundedVal).replace('.', ',');

  const scaledWithUnit = `${numStr}${unit}`;
  const resultWithForm = form === 'symbol' ? `₺${scaledWithUnit}` : `${scaledWithUnit} TL`;

  return isNegative ? `-${resultWithForm}` : resultWithForm;
}
