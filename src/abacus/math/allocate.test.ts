/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { allocate, div, floor, type AllocateOptions } from './index';
// `?raw` + JSON.parse: tsconfig `resolveJsonModule` açmıyor; spec-surface ile aynı yol.
import FIXTURE_HAM from './__fixtures__/allocate.json?raw';

/**
 * TÜKETİCİ TALEBİ — SNN-Ihale-Maliyet (14 Eylül 2026), Talep A + Ek Talep #1.
 *
 * Gerçek ihtiyaç: ihale teklifinde havuz maliyetleri (navlun, gümrük, komisyon)
 * kalemlere dağıtılıyor. Her payı ayrı yuvarlamak toplamı havuzdan saptırıyor —
 * müşterinin gerçek 9 kalemlik verisinde havuz tutarlarının %55,0'ında.
 *
 * ASSERT DEĞERLERİNİN KAYNAĞI (AI-RULES §2 — dış otorite, kodun çıktısı DEĞİL):
 *
 * 1) `__fixtures__/allocate.json` — tüketici tarafından Python `fractions` ile
 *    tam aritmetikte üretildi; çekirdek tarafında ayrı bir `Fraction`
 *    uygulamasıyla 23/23 bağımsız olarak yeniden doğrulandı.
 * 2) Üslü gösterim vakaları (`1e-7`, `1e21`) çekirdek tarafında aynı bağımsız
 *    `Fraction` uygulamasıyla hesaplandı.
 * 3) Özellik testleri değer kopyalamaz; sözleşmenin değişmezlerini sınar.
 */

interface Vaka {
  ad: string;
  total: number;
  weights: number[];
  weightsStr: string[];
  residual: string;
  beklenen: number[] | null;
}

const VAKALAR = (JSON.parse(FIXTURE_HAM) as { vakalar: Vaka[] }).vakalar;
const LR: AllocateOptions = { residual: 'largest-remainder' };

const topla = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0);

describe('math.allocate — tüketici fixture (tam aritmetik referansı)', () => {
  it('fixture 23 vaka içerir (dosya eksik yüklenmedi)', () => {
    expect(VAKALAR.length).toBe(23);
  });

  for (const v of VAKALAR) {
    it(v.ad, () => {
      expect(allocate(v.total, v.weights, { residual: v.residual } as AllocateOptions)).toEqual(
        v.beklenen,
      );
    });
  }

  it('JSON sayı ağırlıkları weightsStr ile aynı ondalık yazıma sahip', () => {
    // Fixture'ın iki gösterimi ayrışırsa yukarıdaki testler yanlış şeyi sınar.
    for (const v of VAKALAR) expect(v.weights.map(String), v.ad).toEqual(v.weightsStr);
  });
});

describe('math.allocate — ondalık yorum', () => {
  it('üslü küçük ağırlık ondalık değeriyle okunur (1e-7 → 0,0000001)', () => {
    expect(allocate(1000, [1e-7, 2e-7], LR)).toEqual([333, 667]);
  });

  it('üslü büyük ağırlık ondalık değeriyle okunur (1e21)', () => {
    expect(allocate(1000, [1e21, 1], LR)).toEqual([1000, 0]);
  });

  it('karışık ölçekli ondalıklar ortak paydaya doğru ölçeklenir', () => {
    expect(allocate(7, [1.5, 0.0025, 3], LR)).toEqual([2, 0, 5]);
  });
});

describe('math.allocate — null dönen girdiler', () => {
  it('ağırlık NaN / Infinity', () => {
    expect(allocate(100, [1, NaN], LR)).toBeNull();
    expect(allocate(100, [1, Infinity], LR)).toBeNull();
  });

  it('total NaN / Infinity', () => {
    expect(allocate(NaN, [1, 2], LR)).toBeNull();
    expect(allocate(Infinity, [1, 2], LR)).toBeNull();
  });

  it('tanınmayan residual politikası', () => {
    expect(allocate(100, [1, 2], { residual: 'first' } as unknown as AllocateOptions)).toBeNull();
  });

  it('seçenek nesnesi hiç verilmemiş (JS tüketici)', () => {
    expect(allocate(100, [1, 2], undefined as unknown as AllocateOptions)).toBeNull();
  });

  it('en küçük negatif güvenli tam sayının altı', () => {
    expect(allocate(-9007199254740992, [1, 2], LR)).toBeNull();
  });
});

/**
 * ÖZELLİK TESTLERİ — sabit tohumlu üreteç; sonuç tekrarlanabilir.
 * Değişmez numaraları Ek Talep #1 §6 ile aynıdır.
 */
/** Park–Miller üreteci; çarpım 2^53 altında kalır, ham `Math` gerekmez. */
function uretec(tohum: number): (ust: number) => number {
  let a = tohum % 2147483647;
  return (ust) => {
    a = (a * 48271) % 2147483647;
    return floor((a / 2147483647) * ust); // [0, ust)
  };
}

function rastgeleSepet(r: (ust: number) => number): { total: number; weights: number[] } {
  const n = 1 + r(55);
  const hane = r(4); // 0..3 ondalık basamak
  const weights = Array.from({ length: n }, (): number =>
    r(100) < 15 ? 0 : (div(r(100000), 10 ** hane) as number),
  );
  if (!weights.some((w) => w > 0)) weights[0] = 1;
  // Park–Miller 31 bit üretir; büyük havuz iki çekimin birleşimidir.
  const total = r(10) < 3 ? r(4194304) * 2147483647 + r(2147483647) : r(10_000_000);
  return { total, weights };
}

describe('math.allocate — değişmezler (1000 rastgele sepet)', () => {
  const r = uretec(20260914);
  const sepetler = Array.from({ length: 1000 }, () => rastgeleSepet(r));

  it('1 · toplam her zaman havuza eşit', () => {
    for (const s of sepetler) {
      const sonuc = allocate(s.total, s.weights, LR) as number[];
      expect(topla(sonuc), JSON.stringify(s)).toBe(s.total);
    }
  });

  it('2 · uzunluk ağırlık sayısına eşit · 3 · her pay tam sayı', () => {
    for (const s of sepetler) {
      const sonuc = allocate(s.total, s.weights, LR) as number[];
      expect(sonuc.length).toBe(s.weights.length);
      expect(sonuc.every((x) => Number.isSafeInteger(x))).toBe(true);
    }
  });

  it('4 · sıfır ağırlıklı kalem sıfır pay alır', () => {
    for (const s of sepetler) {
      const sonuc = allocate(s.total, s.weights, LR) as number[];
      s.weights.forEach((w, i) => {
        if (w === 0) expect(sonuc[i]).toBe(0);
      });
    }
  });

  it('5 · belirlenimci: aynı girdi aynı çıktı', () => {
    for (const s of sepetler) {
      expect(allocate(s.total, s.weights, LR)).toEqual(allocate(s.total, [...s.weights], LR));
    }
  });

  it('6 · tek kalem havuzun tamamını alır', () => {
    for (const s of sepetler.slice(0, 100)) {
      expect(allocate(s.total, [s.weights.find((w) => w > 0) as number], LR)).toEqual([s.total]);
    }
  });

  it('7 · monotonluk: w[i] > w[j] → r[i] >= r[j]', () => {
    for (const s of sepetler) {
      const sonuc = allocate(s.total, s.weights, LR) as number[];
      const sira = s.weights.map((w, i) => ({ w, p: sonuc[i] as number })).sort((a, b) => a.w - b.w);
      for (let k = 1; k < sira.length; k++) {
        const onceki = sira[k - 1] as { w: number; p: number };
        const simdiki = sira[k] as { w: number; p: number };
        if (simdiki.w > onceki.w) expect(simdiki.p).toBeGreaterThanOrEqual(onceki.p);
      }
    }
  });

  it('8 · işaret simetrisi: allocate(-x) === allocate(x).map(-v)', () => {
    for (const s of sepetler) {
      const arti = allocate(s.total, s.weights, LR) as number[];
      // `0 - v`: -0 üretmez; toEqual +0 ile -0'ı ayırır.
      expect(allocate(-s.total, s.weights, LR)).toEqual(arti.map((v) => 0 - v));
    }
  });

  it('girdi dizisi değiştirilmez', () => {
    const w = [3, 1, 2];
    allocate(10, w, LR);
    expect(w).toEqual([3, 1, 2]);
  });
});
