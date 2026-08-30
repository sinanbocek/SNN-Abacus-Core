/**
 * ABACUS dahili Türkçe harf dönüşümü (yaprak modül — hiçbir motoru import etmez).
 *
 * Amaç: `text` ve `collate` motorlarının aynı harf haritasını paylaşması
 * (SSOT) ve `collate`'in `text` üzerinden `math`/decimal.js bağımlılığı
 * taşımak zorunda kalmaması.
 *
 * Genel (public) kapılar `text.lower` / `text.toTrLower` / `text.upper`'dır;
 * bu modül dışa açık API değildir ve barrel üzerinden export edilmez.
 */

const TR_UPPER_TO_LOWER_MAP: Record<string, string> = {
  'İ': 'i',
  'I': 'ı',
  'Ç': 'ç',
  'Ğ': 'ğ',
  'Ö': 'ö',
  'Ş': 'ş',
  'Ü': 'ü',
  'Â': 'â',
  'Î': 'î',
  'Û': 'û',
};

const TR_LOWER_TO_UPPER_MAP: Record<string, string> = {
  'i': 'İ',
  'ı': 'I',
  'ç': 'Ç',
  'ğ': 'Ğ',
  'ö': 'Ö',
  'ş': 'Ş',
  'ü': 'Ü',
  'â': 'Â',
  'î': 'Î',
  'û': 'Û',
};

/**
 * ASCII harf küçültme (I -> i, Türkçe ı değil). E-posta / web adresi için.
 */
export function toAsciiLower(str: string): string {
  if (!str) return '';
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (!ch) continue;
    if (ch >= 'A' && ch <= 'Z') {
      res += String.fromCharCode(ch.charCodeAt(0) + 32);
    } else {
      res += ch;
    }
  }
  return res;
}

/**
 * Türkçe harf küçültme (İ -> i, I -> ı). Ham `toLowerCase` kullanılmaz.
 */
export function toTrLower(str: string): string {
  if (!str) return '';
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (!ch) continue;

    const mapped = TR_UPPER_TO_LOWER_MAP[ch];
    if (mapped) {
      res += mapped;
    } else if (ch >= 'A' && ch <= 'Z') {
      res += String.fromCharCode(ch.charCodeAt(0) + 32);
    } else {
      res += ch;
    }
  }
  return res;
}

/**
 * Türkçe harf büyütme (i -> İ, ı -> I). Ham `toUpperCase` kullanılmaz.
 */
export function toTrUpper(str: string): string {
  if (!str) return '';
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (!ch) continue;

    const mapped = TR_LOWER_TO_UPPER_MAP[ch];
    if (mapped) {
      res += mapped;
    } else if (ch >= 'a' && ch <= 'z') {
      res += String.fromCharCode(ch.charCodeAt(0) - 32);
    } else {
      res += ch;
    }
  }
  return res;
}

/**
 * ARAMA için Türkçe harfleri ASCII karşılığına katlar.
 *
 * Küçültmeden FARKLIDIR: `toTrLower` Türkçe-doğrudur (I -> ı) ama arama için
 * katıdır; burada I ve İ'nin ikisi de 'i' olur ki "Ismail" yazan "İsmail"i
 * bulabilsin.
 */
const TR_FOLD_MAP: Record<string, string> = {
  'ç': 'c', 'Ç': 'c',
  'ğ': 'g', 'Ğ': 'g',
  // 'I' ve 'i' satırları ASCII küçültme dalıyla AYNI sonucu verir; mutasyon
  // testi ikisini ayırt edemez. Bilerek duruyorlar: searchKey'in var oluş
  // sebebini gösteriyorlar — Türkçe küçültmede I -> ı olurdu, burada I -> i.
  'ı': 'i', 'I': 'i',
  'i': 'i', 'İ': 'i',
  'ö': 'o', 'Ö': 'o',
  'ş': 's', 'Ş': 's',
  'ü': 'u', 'Ü': 'u',
  'â': 'a', 'Â': 'a',
  'î': 'i', 'Î': 'i',
  'û': 'u', 'Û': 'u',
};

/** Bir karakteri arama katlamasından geçirir; haritada yoksa ASCII küçültür. */
export function foldChar(ch: string): string {
  const mapped = TR_FOLD_MAP[ch];
  if (mapped !== undefined) return mapped;
  if (ch >= 'A' && ch <= 'Z') return String.fromCharCode(ch.charCodeAt(0) + 32);
  return ch;
}
