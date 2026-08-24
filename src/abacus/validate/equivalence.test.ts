import { describe, expect, it } from 'vitest';
import { iban, tckn, vkn } from './index';

// v1.1.0'daki ORİJİNAL algoritmaların birebir kopyası (referans).
function tcknRef(s: string): boolean {
  if (!s || s.length !== 11 || !/^\d{11}$/.test(s)) return false;
  if (s[0] === '0') return false;
  let allSame = true;
  for (let i = 1; i < 11; i++) { if (s[i] !== s[0]) { allSame = false; break; } }
  if (allSame) return false;
  const d = s.split('').map((ch) => parseInt(ch, 10));
  // -1 sentineli: erisim her zaman gecerlidir (regex 11 hane garantiler);
  // sessiz 0 varsayilani kullanilmaz ki yasak kalip teste sizmasin.
  const at = (i: number): number => { const v = d[i]; return v === undefined ? -1 : v; };
  const oddSum = at(0) + at(2) + at(4) + at(6) + at(8);
  const evenSum = at(1) + at(3) + at(5) + at(7);
  const check10 = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  if (check10 !== at(9)) return false;
  let sum10 = 0;
  for (let i = 0; i < 10; i++) sum10 += at(i);
  return sum10 % 10 === at(10);
}

function vknRef(s: string): boolean {
  const POW: Record<number, number> = {1:2,2:4,3:8,4:16,5:32,6:64,7:128,8:256,9:512};
  if (!s || s.length !== 10 || !/^\d{10}$/.test(s)) return false;
  const charAt = (i: number): string => { const c = s[i]; return c === undefined ? 'x' : c; };
  let total = 0;
  for (let i = 1; i <= 9; i++) {
    const digit = parseInt(charAt(i - 1), 10);
    const tmp = (digit + 10 - i) % 10;
    if (tmp !== 0) { let p = (tmp * (POW[10 - i] ?? 1)) % 9; if (p === 0) p = 9; total += p; }
  }
  return (10 - (total % 10)) % 10 === parseInt(charAt(9), 10);
}

/** Deterministik sözde-rastgele üretici (Math.random yok, tekrarlanabilir). */
function lcg(seed: number) {
  let x = seed;
  return () => { x = (x * 1103515245 + 12345) % 2147483648; return x; };
}

describe('validate — yeniden yazım sonrası davranış eşdeğerliği', () => {
  it('tckn: 20.000 üretilmiş girdide referansla %100 aynı sonucu verir', () => {
    const rnd = lcg(20260824);
    let checked = 0;
    let trueCount = 0;
    for (let n = 0; n < 20000; n++) {
      let s = '';
      for (let i = 0; i < 11; i++) s += String(rnd() % 10);
      expect(tckn(s)).toBe(tcknRef(s));
      checked++;
      if (tckn(s)) trueCount++;
    }
    expect(checked).toBe(20000);
    // Geçerli sayı üretildiğini de doğrula (test boşa dönmesin)
    expect(trueCount).toBeGreaterThan(0);
  });

  it('vkn: 20.000 üretilmiş girdide referansla %100 aynı sonucu verir', () => {
    const rnd = lcg(777);
    let trueCount = 0;
    for (let n = 0; n < 20000; n++) {
      let s = '';
      for (let i = 0; i < 10; i++) s += String(rnd() % 10);
      expect(vkn(s)).toBe(vknRef(s));
      if (vkn(s)) trueCount++;
    }
    expect(trueCount).toBeGreaterThan(0);
  });

  it('iban: bilinen geçerli/geçersiz örnekler', () => {
    expect(iban('TR330006100519786457841326')).toBe(true);
    expect(iban('TR330006100519786457841327')).toBe(false);
    expect(iban('')).toBe(false);
  });

  it('yabancı uyruklu kimlik no (99 önekli) kabul edilir — rapor B11-f', () => {
    expect(tckn('99123456740')).toBe(true);
    expect(tckn('99876543292')).toBe(true);
  });
});
