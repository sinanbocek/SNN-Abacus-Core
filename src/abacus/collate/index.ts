import { toTrLower } from '../internal/tr-case';

/**
 * ABACUS Türkçe sıralama (collation) motoru.
 *
 * Saf ve I/O'suz. `Intl.Collator` KULLANILMAZ (ABACUS-SPEC §4.2); sıra,
 * sabit bir alfabe tablosundan üretilir; sonuç her ortamda aynıdır.
 *
 * Bu motor `math`'e bağlı DEĞİLDİR, dolayısıyla decimal.js taşımaz.
 *
 * ⚠️ `collate.key` SIRALAMA içindir; `text.searchKey` benzeri bir ARAMA
 * anahtarı değildir. Sıralama Türkçe harfleri ayrı harfler olarak korur
 * (ç ≠ c), arama ise onları katlamak ister. İkisi karıştırılmamalıdır.
 */

/**
 * Türk alfabesi sırası (29 harf).
 * Alfabede yer almayan q, w, x harfleri z'den SONRA sıralanır; bu, Türk Dil
 * Kurumu alfabesinde bulunmayan harfler için yaygın kütüphane davranışıdır
 * ve bilinçli bir karardır.
 */
const ALPHABET = 'abcçdefgğhıijklmnoöprsştuüvyz' + 'qwx';

/** Şapkalı harfler, şapkasız karşılıklarıyla aynı sırada kabul edilir. */
const CIRCUMFLEX: Record<string, string> = {
  'â': 'a',
  'î': 'i',
  'û': 'u',
};

/**
 * Sıra sınıfları (küçükten büyüğe):
 *   01      -> boşluk ve noktalama
 *   10..19  -> rakamlar 0-9
 *   20..51  -> harfler (ALPHABET sırasına göre)
 */
const PUNCTUATION_CODE = '01';
const DIGIT_BASE = 10;
const LETTER_BASE = 20;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Metni sıralanabilir bir anahtara çevirir.
 *
 * Anahtarlar sabit genişlikte kodlardan oluşur; bu yüzden düz `<` / `>`
 * karşılaştırması Türkçe alfabetik sırayı verir.
 *
 * `key('çam') < key('dal')` ve `key('ısı') < key('iyi')` doğrudur.
 * Boş / geçersiz girdide boş dize döner.
 */
export function key(value: string | null | undefined): string {
  if (!value) return '';

  const lowered = toTrLower(value);
  let out = '';

  for (let i = 0; i < lowered.length; i++) {
    const raw = lowered[i];
    if (raw === undefined) continue;

    const ch = CIRCUMFLEX[raw] ?? raw;

    if (ch >= '0' && ch <= '9') {
      out += pad2(DIGIT_BASE + (ch.charCodeAt(0) - 48));
      continue;
    }

    const idx = ALPHABET.indexOf(ch);
    if (idx >= 0) {
      out += pad2(LETTER_BASE + idx);
      continue;
    }

    out += PUNCTUATION_CODE;
  }

  return out;
}

/**
 * İki metni Türkçe alfabetik sıraya göre karşılaştırır.
 * `Array.prototype.sort` ile doğrudan kullanılabilir.
 *
 * @returns a < b ise -1, a > b ise 1, eşitse 0.
 */
export function compare(a: string | null | undefined, b: string | null | undefined): number {
  const ka = key(a);
  const kb = key(b);
  if (ka < kb) return -1;
  if (ka > kb) return 1;
  return 0;
}

/**
 * Bir diziyi Türkçe alfabetik sıraya göre sıralar.
 *
 * Girdi dizisi DEĞİŞTİRİLMEZ; yeni bir dizi döner (saf davranış).
 * `selector` verilmezse elemanlar metin olarak kabul edilir.
 *
 * Eşit anahtarlarda özgün sıra korunur: `Array.prototype.sort` ES2019'dan beri
 * kararlıdır (derleme hedefi ES2020), bu yüzden ayrıca indeks tutulmaz.
 * Anahtar her eleman için bir kez hesaplanır (decorate-sort-undecorate).
 */
export function sortBy<T>(items: readonly T[], selector?: (item: T) => string): T[] {
  if (!items || items.length === 0) return [];

  const decorated = items.map((item) => ({
    item,
    sortKey: key(selector ? selector(item) : String(item)),
  }));

  decorated.sort((x, y) => {
    if (x.sortKey < y.sortKey) return -1;
    if (x.sortKey > y.sortKey) return 1;
    return 0;
  });

  return decorated.map((d) => d.item);
}
