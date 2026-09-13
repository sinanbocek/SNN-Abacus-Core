/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import * as abacus from './index';
import KILAVUZ from '../../KILAVUZ.md?raw';

/**
 * KULLANIM KILAVUZU — ÇALIŞTIRILAN ÖRNEKLER
 *
 * `KILAVUZ.md` içindeki her ```js kod bloğunun her satırı bir örnektir:
 *
 *     money.format(150000)   // → '₺1.500'
 *
 * Bu test o satırları GERÇEKTEN ÇALIŞTIRIR: sol taraf çekirdeğe karşı
 * değerlendirilir, sağ taraf beklenen değerdir. İkisi eşleşmezse kırılır.
 * Kılavuz bu yüzden yanlış bir örnek içeremez.
 *
 * İkinci kilit: dışa açılan her ad (`motor.ad`) kılavuzda en az bir kez geçmek
 * zorundadır. Yeni bir fonksiyon eklenip kılavuza yazılmazsa test kırılır —
 * `ABACUS-SPEC.md` tablosunun üç sürüm boyunca sessizce eskimesinin tekrarını
 * önlemek için (bkz. `spec-surface.test.ts`).
 *
 * ```js blokları içinde yalnız üç tür satır olabilir: örnek (`// →` içerir),
 * yorum (`//` ile başlar) veya boş satır. Başka bir satır denetlenmeden
 * geçemeyeceği için test onu da hata sayar.
 */

const MOTOR_ADLARI = Object.keys(abacus);
const MOTORLAR = Object.values(abacus);

/** Bir JS ifadesini çekirdek motorları kapsamda olacak şekilde değerlendirir. */
function calistir(ifade: string): unknown {
  const fn = new Function(...MOTOR_ADLARI, `"use strict"; return (${ifade});`) as (
    ...m: unknown[]
  ) => unknown;
  return fn(...MOTORLAR);
}

interface Ornek {
  satirNo: number;
  ifade: string;
  beklenen: string;
}

/** Kılavuzdaki ```js bloklarını örneklere ayırır; tanınmayan satırları da döner. */
function ornekleriTopla(): { ornekler: Ornek[]; tanimsiz: string[] } {
  const ornekler: Ornek[] = [];
  const tanimsiz: string[] = [];
  const satirlar = KILAVUZ.split(/\r?\n/);
  let blokta = false;

  satirlar.forEach((ham: string, i: number) => {
    const satir = ham.trim();
    if (!blokta) {
      if (satir === '```js') blokta = true;
      return;
    }
    if (satir.startsWith('```')) {
      blokta = false;
      return;
    }
    if (satir === '' || (satir.startsWith('//') && !satir.includes('// →'))) return;

    const ayrac = satir.lastIndexOf('// →');
    if (ayrac <= 0) {
      tanimsiz.push(`satır ${i + 1}: ${satir}`);
      return;
    }
    ornekler.push({
      satirNo: i + 1,
      ifade: satir.slice(0, ayrac).trim(),
      beklenen: satir.slice(ayrac + '// →'.length).trim(),
    });
  });

  return { ornekler, tanimsiz };
}

const { ornekler, tanimsiz } = ornekleriTopla();

describe('KILAVUZ.md — yapı', () => {
  it('js bloklarında denetlenmeyen satır yok', () => {
    expect(tanimsiz).toEqual([]);
  });

  it('kılavuz anlamlı sayıda çalıştırılan örnek içerir', () => {
    expect(ornekler.length).toBeGreaterThan(100);
  });

  it('dışa açılan her ad kılavuzda geçer', () => {
    const eksik: string[] = [];
    for (const [motor, mod] of Object.entries(abacus)) {
      for (const ad of Object.keys(mod as Record<string, unknown>)) {
        if (!KILAVUZ.includes(`${motor}.${ad}`)) eksik.push(`${motor}.${ad}`);
      }
    }
    expect(eksik).toEqual([]);
  });
});

describe('KILAVUZ.md — her örnek çalışır', () => {
  for (const o of ornekler) {
    it(`satır ${o.satirNo}: ${o.ifade}`, () => {
      expect(calistir(o.ifade)).toEqual(calistir(o.beklenen));
    });
  }
});
