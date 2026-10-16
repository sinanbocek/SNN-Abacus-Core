import { describe, expect, it } from 'vitest';
import { accrual, valueAt, type Schedule } from './index';

/**
 * Madde 48 — tarihli değer çizelgesi (SNN-Ihale-Maliyet `rates.ts`, ADR-0007).
 *
 * Oranlar zamanla değişir: bir oran tek sayı değil, "şu tarihten itibaren şu değer"
 * satırlarıdır. Beklenen değerler elle hesaplandı (gün sayıları takvimden, kesirler
 * tam): kaynak deponun `dated_rates_reference.py` (Python `fractions`) çıktısıyla aynı.
 */
const TWO: Schedule = [
  { from: '2026-01-01', value: 0.4 },
  { from: '2026-11-01', value: 0.35 },
];

describe('period.valueAt — bir tarihte yürürlükteki değer', () => {
  it.each([
    ['2026-01-01', 0.4],
    ['2026-10-31', 0.4],
    ['2026-11-01', 0.35],
    ['2027-05-01', 0.35],
  ])('%s → %d (başlangıcı o güne kadar olan son satır)', (iso, value) => {
    expect(valueAt(TWO, iso)).toBe(value);
  });

  it('ilk satırdan önce değer yoktur: null, sıfır değil', () => {
    expect(valueAt(TWO, '2025-12-31')).toBeNull();
  });

  it('boş çizelgede değer yoktur', () => {
    expect(valueAt([], '2026-06-01')).toBeNull();
  });

  it('geçersiz tarih için değer yoktur', () => {
    expect(valueAt(TWO, '31.12.2026')).toBeNull();
    expect(valueAt(TWO, '2026-02-30')).toBeNull();
  });

  it('negatif değer geçerlidir (eksi faiz, indirim)', () => {
    expect(valueAt([{ from: '2026-01-01', value: -0.005 }], '2026-03-01')).toBe(-0.005);
  });

  it('kaynağı ya da başka alanı olan satır kabul edilir', () => {
    const withSource = [{ from: '2026-01-01', value: 0.4, source: 'Ayarlar' }];
    expect(valueAt(withSource, '2026-03-01')).toBe(0.4);
  });

  describe('bozuk çizelge sessizce okunmaz: null', () => {
    it.each([
      [
        'tarih sırası bozuk',
        [
          { from: '2026-11-01', value: 0.35 },
          { from: '2026-01-01', value: 0.4 },
        ],
      ],
      [
        'aynı tarih iki kez',
        [
          { from: '2026-01-01', value: 0.4 },
          { from: '2026-01-01', value: 0.35 },
        ],
      ],
      ['geçersiz satır tarihi', [{ from: '2026/01/01', value: 0.4 }]],
      ['sayı olmayan değer', [{ from: '2026-01-01', value: Number.NaN }]],
      ['sonsuz değer', [{ from: '2026-01-01', value: Number.POSITIVE_INFINITY }]],
    ] as const)('%s', (_label, schedule) => {
      expect(valueAt(schedule, '2026-12-01')).toBeNull();
    });

    it('sıra bozukluğu sorgulanan tarihten SONRA olsa da null', () => {
      // Erken çıkışlı bir tarama ikinci satırı hiç görmeden 0.4 dönerdi.
      const broken: Schedule = [
        { from: '2026-01-01', value: 0.4 },
        { from: '2026-11-01', value: 0.35 },
        { from: '2026-06-01', value: 0.3 },
      ];
      expect(valueAt(broken, '2026-02-01')).toBeNull();
    });
  });
});

describe('period.accrual — Σ (değer × gün) ÷ gün esası, dilimlenmiş', () => {
  // 2026-10-01 → 2026-12-15: Eki 31 + Kas 30 + Ara 14 = 75 gün.
  it('tek oran: 75 gün × %40 ÷ 365 = 6/73', () => {
    expect(accrual([{ from: '2026-01-01', value: 0.4 }], '2026-10-01', '2026-12-15', 365)).toBeCloseTo(6 / 73, 15);
  });

  it('oran dönem içinde değişir: (31 × %40 + 44 × %35) ÷ 365 = 139/1825', () => {
    expect(accrual(TWO, '2026-10-01', '2026-12-15', 365)).toBeCloseTo(139 / 1825, 15);
  });

  it('üç dilim, 360 gün esası: (16 × 0,5 + 28 × 0,4 + 10 × 0,3) ÷ 360 = 37/600', () => {
    const three: Schedule = [
      { from: '2026-01-01', value: 0.5 },
      { from: '2026-02-01', value: 0.4 },
      { from: '2026-03-01', value: 0.3 },
    ];
    expect(accrual(three, '2026-01-16', '2026-03-11', 360)).toBeCloseTo(37 / 600, 15);
  });

  it('değişim günü yeni değere aittir: başlangıç gününde değişen oran bütün aralığa uygulanır', () => {
    const atStart: Schedule = [
      { from: '2026-01-01', value: 0.4 },
      { from: '2026-10-01', value: 0.3 },
    ];
    // 75 × 0,3 ÷ 365 = 9/146
    expect(accrual(atStart, '2026-10-01', '2026-12-15', 365)).toBeCloseTo(9 / 146, 15);
  });

  it('bitiş gününde ya da sonrasında başlayan satır etkisizdir (aralık [from, to))', () => {
    const atEnd: Schedule = [
      { from: '2026-01-01', value: 0.4 },
      { from: '2026-12-15', value: 0.1 },
      { from: '2027-01-01', value: 0.05 },
    ];
    expect(accrual(atEnd, '2026-10-01', '2026-12-15', 365)).toBeCloseTo(6 / 73, 15);
  });

  it('artık yıl: 28 Şub → 1 Mar 2024 iki gündür', () => {
    expect(accrual([{ from: '2024-01-01', value: 0.365 }], '2024-02-28', '2024-03-01', 365)).toBe(0.002);
  });

  it('hesap ondalık tamdır: 3 gün × 0,1 ÷ 1 = 0,3 (float 0,30000000000000004 verirdi)', () => {
    expect(accrual([{ from: '2026-01-01', value: 0.1 }], '2026-01-01', '2026-01-04', 1)).toBe(0.3);
  });

  it('boş aralık sıfırdır', () => {
    expect(accrual(TWO, '2026-10-01', '2026-10-01', 365)).toBe(0);
  });

  it('ters aralık hesaplanmaz: null (sıfır kararı çağıranındır)', () => {
    expect(accrual(TWO, '2027-01-10', '2026-12-15', 365)).toBeNull();
  });

  it('aralığın başında değer tanımlı değilse null', () => {
    expect(accrual(TWO, '2025-12-01', '2026-12-15', 365)).toBeNull();
  });

  it.each([0, -365, Number.NaN, Number.POSITIVE_INFINITY])('gün esası %d geçersiz: null', (basis) => {
    expect(accrual(TWO, '2026-10-01', '2026-12-15', basis)).toBeNull();
  });

  it('geçersiz tarih ya da bozuk çizelge: null', () => {
    expect(accrual(TWO, '2026-10-01', 'x', 365)).toBeNull();
    expect(accrual(TWO, 'x', '2026-12-15', 365)).toBeNull();
    const broken: Schedule = [
      { from: '2026-11-01', value: 0.35 },
      { from: '2026-01-01', value: 0.4 },
    ];
    expect(accrual(broken, '2026-10-01', '2026-12-15', 365)).toBeNull();
  });
});
