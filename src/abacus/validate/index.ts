import { upper } from '../text';
import { isEmailShaped } from '../internal/patterns';

/**
 * ABACUS doğrulama motoru (ABACUS-SPEC §3.7).
 * VKN, TCKN, IBAN (mod-97), İKN ve E-posta doğrulamalarını içerir.
 */

const POW_2_MAP: Record<number, number> = {
  1: 2,
  2: 4,
  3: 8,
  4: 16,
  5: 32,
  6: 64,
  7: 128,
  8: 256,
  9: 512,
};

/**
 * Resmi Türkiye VKN (Vergi Kimlik No) doğrulama algoritması.
 * 1. Tam 10 haneli sayısal karakter dizisi olmalı.
 * 2. i = 1..9 için d_i basamakları alınır:
 *    - tmp = (d_i + 10 - i) % 10
 *    - tmp !== 0 ise: p_i = (tmp * 2^(10 - i)) % 9; eğer p_i === 0 ise p_i = 9
 *    - tmp === 0 ise: p_i = 0
 * 3. toplam = sum(p_1..p_9)
 * 4. 10. hane (kontrol): (10 - (toplam % 10)) % 10 === d_10
 */
export function vkn(s: string): boolean {
  if (!s || s.length !== 10 || !/^\d{10}$/.test(s)) {
    return false;
  }

  let totalSum = 0;
  for (let i = 1; i <= 9; i++) {
    const ch = s[i - 1];
    if (ch === undefined) return false;
    const digit = parseInt(ch, 10);
    const tmp = (digit + 10 - i) % 10;
    if (tmp !== 0) {
      const pow2 = POW_2_MAP[10 - i] ?? 1;
      let p = (tmp * pow2) % 9;
      if (p === 0) p = 9;
      totalSum += p;
    }
  }

  const checkDigit = (10 - (totalSum % 10)) % 10;
  const lastCh = s[9];
  if (lastCh === undefined) return false;
  const actualLastDigit = parseInt(lastCh, 10);

  return checkDigit === actualLastDigit;
}

/**
 * Resmi Türkiye T.C. Kimlik No (TCKN) doğrulama algoritması.
 * 1. Tam 11 haneli sayısal karakter dizisi olmalı.
 * 2. İlk hane '0' olamaz.
 * 3. 10. hane: ((7 * oddSum - evenSum) % 10 + 10) % 10 (odd: 1,3,5,7,9; even: 2,4,6,8)
 * 4. 11. hane: (sum(1..10) % 10) === d_11
 * 5. Tüm haneleri aynı olan sayılar (örn. 11111111111) geçersizdir.
 */
export function tckn(s: string): boolean {
  if (!s || s.length !== 11 || !/^\d{11}$/.test(s)) {
    return false;
  }
  if (s[0] === '0') return false;

  let allSame = true;
  for (let i = 1; i < 11; i++) {
    if (s[i] !== s[0]) {
      allSame = false;
      break;
    }
  }
  if (allSame) return false;

  // Basamaklar dogrudan dizeden okunur; sessiz varsayilan (?? 0) kullanilmaz.
  // Regex zaten 11 hane garantiler, yine de her erisim acikca dogrulanir.
  const digitAt = (i: number): number | null => {
    const ch = s[i];
    if (ch === undefined) return null;
    return parseInt(ch, 10);
  };

  // 10. hane kontrolu: tek konumlar (1,3,5,7,9) ve cift konumlar (2,4,6,8)
  let oddSum = 0;
  let evenSum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = digitAt(i);
    if (digit === null) return false;
    if (i % 2 === 0) {
      oddSum += digit;
    } else {
      evenSum += digit;
    }
  }

  const d10 = digitAt(9);
  const d11 = digitAt(10);
  if (d10 === null || d11 === null) return false;

  const check10 = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  if (check10 !== d10) return false;

  // 11. hane kontrolu: ilk 10 hanenin toplaminin birler basamagi
  let sum10 = 0;
  for (let i = 0; i < 10; i++) {
    const digit = digitAt(i);
    if (digit === null) return false;
    sum10 += digit;
  }

  const check11 = sum10 % 10;
  return check11 === d11;
}

/**
 * İhale Kayıt No (İKN) doğrulama motoru.
 * Biçim: YYYY/N... (4 haneli yıl / 5 ilâ 7 haneli numara).
 */
export function ikn(s: string): boolean {
  if (!s) return false;
  return /^\d{4}\/\d{5,7}$/.test(s);
}

/**
 * TR IBAN Mod-97 doğrulama motoru.
 * 1. Boşluklar temizlenir ve büyük harfe çevrilir (upper).
 * 2. TR + 24 rakam = 26 karakter olmalı.
 * 3. Karakterler yeniden dizilir: restDigits(22) + "2927" + checkDigits(2).
 * 4. Oluşan 30 haneli sayı için basamak basamak mod 97 hesaplanır.
 * 5. Sonuç === 1 olmalıdır.
 */
export function iban(s: string): boolean {
  if (!s) return false;
  const clean = upper(s.replace(/\s+/g, ''));
  if (clean.length !== 26) return false;

  if (!clean.startsWith('TR')) return false;
  const digitsPart = clean.slice(2);
  if (!/^\d{24}$/.test(digitsPart)) return false;

  const checkDigits = digitsPart.slice(0, 2);
  const restDigits = digitsPart.slice(2);
  const numericString = `${restDigits}2927${checkDigits}`;

  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    const ch = numericString[i];
    if (ch === undefined) return false;
    const digit = parseInt(ch, 10);
    remainder = (remainder * 10 + digit) % 97;
  }

  return remainder === 1;
}

/**
 * E-posta format doğrulama motoru.
 * Biçim: user@domain.tld
 */
export function email(s: string): boolean {
  return isEmailShaped(s);
}
