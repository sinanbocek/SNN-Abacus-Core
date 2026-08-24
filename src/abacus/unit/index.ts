import { div, mul, round } from '../math';
import { ONS_TO_GRAM } from '../internal/constants';

/**
 * ABACUS birim çevrim motoru.
 *
 * Saf ve I/O'suz; tüm aritmetik `math` motoru üzerinden yürütülür.
 * Çevrim, birimin kendi kategorisindeki taban birime oranı üzerinden yapılır:
 *   uzunluk -> metre · ağırlık -> gram · alan -> metrekare · veri -> bayt
 *
 * Kategoriler arası çevrim (ör. kg -> m) anlamsızdır ve `null` döner.
 * Geçersiz sayı veya tanınmayan birimde de `null` döner (sessiz 0 yoktur).
 */

export { ONS_TO_GRAM };

export type LengthUnit = 'mm' | 'cm' | 'm' | 'km';
export type MassUnit = 'g' | 'kg' | 'ton' | 'ons';
export type AreaUnit = 'm2' | 'dönüm' | 'dekar' | 'hektar' | 'km2';
export type DataUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';
export type Unit = LengthUnit | MassUnit | AreaUnit | DataUnit;

export type UnitCategory = 'length' | 'mass' | 'area' | 'data';

interface UnitDef {
  category: UnitCategory;
  /** Kategorinin taban birimi cinsinden karşılığı. */
  factor: number;
}

/**
 * Birim tablosu.
 *
 * Alan birimleri Tapu ve Kadastro'nun metrik standardını izler:
 * 1 dönüm = 1 dekar = 1000 m². (Tarihî "eski dönüm" 919,3 m²'dir ve
 * KAPSAM DIŞIDIR; gerekirse ayrı bir birim adıyla eklenmelidir.)
 *
 * Veri birimleri ikili tabandadır: 1 KB = 1024 B. (Ondalık taban 1 kB = 1000 B
 * kapsam dışıdır; gerekirse ayrı birim adlarıyla eklenmelidir.)
 */
const UNITS: Record<Unit, UnitDef> = {
  // uzunluk — taban: metre
  mm: { category: 'length', factor: 0.001 },
  cm: { category: 'length', factor: 0.01 },
  m: { category: 'length', factor: 1 },
  km: { category: 'length', factor: 1000 },

  // ağırlık — taban: gram
  g: { category: 'mass', factor: 1 },
  kg: { category: 'mass', factor: 1000 },
  ton: { category: 'mass', factor: 1000000 },
  ons: { category: 'mass', factor: ONS_TO_GRAM },

  // alan — taban: metrekare
  m2: { category: 'area', factor: 1 },
  'dönüm': { category: 'area', factor: 1000 },
  dekar: { category: 'area', factor: 1000 },
  hektar: { category: 'area', factor: 10000 },
  km2: { category: 'area', factor: 1000000 },

  // veri — taban: bayt (ikili)
  B: { category: 'data', factor: 1 },
  KB: { category: 'data', factor: 1024 },
  MB: { category: 'data', factor: 1048576 },
  GB: { category: 'data', factor: 1073741824 },
  TB: { category: 'data', factor: 1099511627776 },
};

const DATA_LADDER: DataUnit[] = ['B', 'KB', 'MB', 'GB', 'TB'];

/**
 * Bir değeri aynı kategorideki başka bir birime çevirir.
 * @returns Çevrilmiş değer; kategori uyuşmazlığında / tanınmayan birimde /
 *          geçersiz sayıda `null`.
 */
export function convert(value: number, from: Unit, to: Unit): number | null {
  if (!Number.isFinite(value)) return null;

  const fromDef = UNITS[from];
  const toDef = UNITS[to];
  if (!fromDef || !toDef) return null;
  if (fromDef.category !== toDef.category) return null;


  if (fromDef.factor === toDef.factor) return value;

  const inBase = mul(value, fromDef.factor);
  return div(inBase, toDef.factor);
}

/** Bir birimin kategorisini döner; tanınmayan birimde null. */
export function categoryOf(u: Unit): UnitCategory | null {
  return UNITS[u]?.category ?? null;
}

export interface DataSizeOptions {
  /** Gösterilecek ondalık basamak sayısı (varsayılan 1). */
  digits?: number;
}

/**
 * Bayt değerini okunur metne çevirir ("5 MB", "1,5 KB").
 * Ondalık ayraç Türkçe virgüldür; gereksiz ",0" kuyruğu atılır.
 * Negatif / geçersiz / null girdide '—' döner (biçimlendirme sözleşmesi).
 */
export function dataSize(bytes: number | null | undefined, opts?: DataSizeOptions): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
    return '—';
  }

  const digits = opts?.digits ?? 1;

  let unit: DataUnit = 'B';
  for (let i = DATA_LADDER.length - 1; i >= 0; i--) {
    const candidate = DATA_LADDER[i];
    if (!candidate) continue;
    const def = UNITS[candidate];
    if (bytes >= def.factor) {
      unit = candidate;
      break;
    }
  }

  const scaled = convert(bytes, 'B', unit);
  if (scaled === null) return '—';

  return `${decimalText(round(scaled, digits))} ${unit}`;
}

/** Sayıyı Türkçe ondalık ayraçlı metne çevirir (toFixed/Intl kullanmadan). */
function decimalText(n: number): string {
  const s = String(n);
  return s.includes('.') ? s.replace('.', ',') : s;
}
