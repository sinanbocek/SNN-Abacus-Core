import { describe, expect, it } from 'vitest';
import { amortize, type AmortizationRow, type AmortizeOptions } from './index';

import KEY_RAW from './__fixtures__/amortize-key.json?raw';

/**
 * Madde 51B (talep #19): `math.amortize`.
 *
 * Cevap anahtarı çekirdekten bağımsızdır: SNN-Proje-ve-Nakit-Akış, commit c9e8c0c,
 * `scratch/abacus-amortize/anahtar.json` (Python `decimal`, ROUND_HALF_UP, float yok).
 * Çekirdek de 8 vakayı ayrı bir Python betiğiyle yeniden hesapladı; hepsi aynı çıktı.
 */
interface Case {
  id: string;
  input: { principalMinor: number; ratePerPeriod: string; periods: number; remainder: 'last' };
  regularPayment: number;
  lastPaymentDelta: number;
  rows: AmortizationRow[];
}

const CASES = JSON.parse(KEY_RAW) as Case[];
const LAST: AmortizeOptions = { remainder: 'last' };

describe('math.amortize — cevap anahtarı (madde 51B)', () => {
  it('anahtarda 8 vaka var', () => {
    expect(CASES.map((c) => c.id)).toEqual([
      'AM-01', 'AM-02', 'AM-03', 'AM-04', 'AM-05', 'AM-06', 'AM-07', 'AM-08',
    ]);
  });

  for (const c of CASES) {
    it(`${c.id}: her satır anahtarla birebir`, () => {
      const { principalMinor, ratePerPeriod, periods } = c.input;
      const rows = amortize(principalMinor, Number(ratePerPeriod), periods, LAST);
      expect(rows).toEqual(c.rows);
      expect(rows?.[0]?.payment).toBe(periods === 1 ? c.rows[0]?.payment : c.regularPayment);
    });
  }

  it('artık kuruş talepteki ölçümle aynı: 0, +33, +8, −2', () => {
    expect(CASES.slice(0, 4).map((c) => c.lastPaymentDelta)).toEqual([0, 33, 8, -2]);
  });
});

describe('math.amortize — değişmezler', () => {
  const sample: [number, number, number][] = [
    [10000000, 0.03965, 12],
    [123457, 0.0123, 17],
    [999999999, 0.07, 60],
    [100, 0.5, 9],
    [10001, 0, 3],
  ];
  for (const [p, r, n] of sample) {
    it(`${p} kuruş, ${r}, ${n} dönem`, () => {
      const rows = amortize(p, r, n, LAST);
      expect(rows).not.toBeNull();
      if (rows === null) return;
      expect(rows).toHaveLength(n);
      expect(rows[rows.length - 1]?.balance).toBe(0);
      expect(rows.reduce((s, row) => s + row.principal, 0)).toBe(p);
      for (const row of rows) expect(row.payment).toBe(row.interest + row.principal);
      // Son satır dışında taksit sabit.
      expect(new Set(rows.slice(0, -1).map((row) => row.payment)).size).toBeLessThanOrEqual(1);
    });
  }
});

describe('math.amortize — geçersiz girdi null', () => {
  it.each([
    ['anapara 0', 0, 0.01, 12],
    ['anapara eksi', -100, 0.01, 12],
    ['anapara kesirli', 100.5, 0.01, 12],
    ['anapara güvenli değil', 2 ** 53, 0.01, 12],
    ['oran eksi', 100, -0.01, 12],
    ['oran NaN', 100, Number.NaN, 12],
    ['oran sonsuz', 100, Infinity, 12],
    ['dönem 0', 100, 0.01, 0],
    ['dönem kesirli', 100, 0.01, 1.5],
  ])('%s', (_, p, r, n) => {
    expect(amortize(p, r, n, LAST)).toBeNull();
  });

  it('politika zorunlu ve tanınmayan değer null', () => {
    // @ts-expect-error politika zorunlu
    expect(amortize(100, 0.01, 12, {})).toBeNull();
    // @ts-expect-error 'first' henüz yok
    expect(amortize(100, 0.01, 12, { remainder: 'first' })).toBeNull();
  });

  it('hassasiyet: 20 basamakta kuruş kararı sapan vaka (Python decimal, 80 basamak)', () => {
    // 20 basamaklı hesap 958771625441549 verir; doğrusu ...548. Ölçüldü (madde 51B).
    expect(amortize(3834990626521159, 0.00001, 4, LAST)?.[0]?.payment).toBe(958771625441548);
  });

  it('tutar güvenli tam sayıyı aşarsa null', () => {
    expect(amortize(2 ** 52, 10, 5, LAST)).toBeNull();
  });
});
