import { daysBetween, format } from '../date';

/**
 * ABACUS dönem / periyot aritmetiği motoru.
 *
 * `date` motoru BİÇİMLENDİRME ve FARK hesabı yapar; bu motor TARİH ÜRETİR
 * (gün ekleme, ay başı/sonu, çeyrek aralıkları). Bağımlılık tek yönlüdür:
 * `period` -> `date`.
 *
 * Girdi ve çıktı ISO tarih metnidir ("YYYY-AA-GG"). Saat kısmı taşıyan
 * girdiler `date` motorunun kurallarına göre Europe/Istanbul gününe indirgenir.
 * Geçersiz veya var olmayan takvim gününde `null` döner.
 */

export type Quarter = 1 | 2 | 3 | 4;

export interface QuarterRange {
  start: string;
  end: string;
}

const MS_PER_DAY = 86400000;

/** Doğrulanmış ISO gününü {y, m, d} olarak çözer; geçersizde null. */
function parseDay(iso: string | null | undefined): { y: number; m: number; d: number } | null {
  // date.format tüm doğrulamayı (biçim, takvim, saat dilimi) yapar.
  const normalized = format(iso, 'short');
  if (normalized === '—') return null;

  const parts = normalized.split('.');
  const dd = parts[0];
  const mm = parts[1];
  const yyyy = parts[2];
  if (dd === undefined || mm === undefined || yyyy === undefined) return null;

  return { y: Number(yyyy), m: Number(mm), d: Number(dd) };
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toIso(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** Yılın artık yıl olup olmadığı (Gregoryen kuralı). */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Ayın gün sayısı; ay geçersizse null. */
function daysInMonth(year: number, month: number): number | null {
  if (month < 1 || month > 12) return null;
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/**
 * Tarihe gün ekler (negatif değer çıkarır).
 * `addDays('2026-08-31', 1) -> '2026-09-01'`
 */
export function addDays(iso: string, days: number): string | null {
  const p = parseDay(iso);
  if (p === null || !Number.isFinite(days) || !Number.isInteger(days)) return null;

  const shifted = new Date(Date.UTC(p.y, p.m - 1, p.d) + days * MS_PER_DAY);
  return toIso(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

/**
 * Tarihe ay ekler (negatif değer çıkarır).
 *
 * Hedef ayda gün yoksa AY SONUNA KIRPILIR (takvim aritmetiğinin standart
 * davranışı): `addMonths('2026-01-31', 1) -> '2026-02-28'`.
 */
export function addMonths(iso: string, months: number): string | null {
  const p = parseDay(iso);
  if (p === null || !Number.isFinite(months) || !Number.isInteger(months)) return null;

  // Ham Math.* kullanilmaz (ABACUS-SPEC 4.1): tam sayi aritmetigi ile normalize.
  const totalMonths = p.y * 12 + (p.m - 1) + months;
  const monthIndex = ((totalMonths % 12) + 12) % 12;
  const year = (totalMonths - monthIndex) / 12;
  const targetMonth = monthIndex + 1;

  const maxDay = daysInMonth(year, targetMonth);
  if (maxDay === null) return null;

  const day = p.d > maxDay ? maxDay : p.d;
  return toIso(year, targetMonth, day);
}

/** Ayın ilk günü. `startOfMonth('2026-08-24') -> '2026-08-01'` */
export function startOfMonth(iso: string): string | null {
  const p = parseDay(iso);
  if (p === null) return null;
  return toIso(p.y, p.m, 1);
}

/** Ayın son günü. `endOfMonth('2026-02-10') -> '2026-02-28'` */
export function endOfMonth(iso: string): string | null {
  const p = parseDay(iso);
  if (p === null) return null;
  const maxDay = daysInMonth(p.y, p.m);
  if (maxDay === null) return null;
  return toIso(p.y, p.m, maxDay);
}

/** Tarihin ait olduğu takvim çeyreği (1-4). */
export function quarterOf(iso: string): Quarter | null {
  const p = parseDay(iso);
  if (p === null) return null;
  if (p.m <= 3) return 1;
  if (p.m <= 6) return 2;
  if (p.m <= 9) return 3;
  return 4;
}

/** Bir yılın belirtilen çeyreğinin başlangıç ve bitiş tarihleri. */
export function quarterRange(year: number, quarter: number): QuarterRange | null {
  if (!Number.isInteger(year) || !Number.isInteger(quarter)) return null;
  if (quarter < 1 || quarter > 4) return null;

  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const endDay = daysInMonth(year, endMonth);
  if (endDay === null) return null;

  return {
    start: toIso(year, startMonth, 1),
    end: toIso(year, endMonth, endDay),
  };
}

/**
 * İki tarih arasındaki TAM ay sayısı (isoB - isoA).
 * Gün eşiği dolmadıysa ay sayılmaz: 15 Oca -> 14 Şub = 0 ay.
 */
export function monthsBetween(isoA: string, isoB: string): number | null {
  const a = parseDay(isoA);
  const b = parseDay(isoB);
  if (a === null || b === null) return null;

  let months = (b.y - a.y) * 12 + (b.m - a.m);
  if (months > 0 && b.d < a.d) months -= 1;
  if (months < 0 && b.d > a.d) months += 1;
  return months;
}

/** Tarihin, verilen kapalı aralık içinde olup olmadığı (uçlar dâhil). */
export function isBetween(iso: string, startIso: string, endIso: string): boolean | null {
  const fromStart = daysBetween(startIso, iso);
  const toEnd = daysBetween(iso, endIso);
  if (fromStart === null || toEnd === null) return null;
  return fromStart >= 0 && toEnd >= 0;
}
