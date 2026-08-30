import { abs, div, round, sub } from '../math';
import { toTrLower } from '../internal/tr-case';

export type DateFormatStyle =
  | 'short'
  | 'long'
  | 'dayMonth'
  | 'monthYear'
  | 'period'
  | 'time'
  | 'dateTime'
  | 'dayMonthWeekday';

export type NameForm = 'short' | 'long';

const MONTH_NAMES_FULL = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const MONTH_NAMES_SHORT = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
];

const DAY_NAMES_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'];

const DAY_NAMES_FULL = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
];

/**
 * Türkiye sabit saat dilimi farkı: UTC+03:00 (dakika cinsinden).
 *
 * UYARI: Türkiye 2016 yılından bu yana kalıcı UTC+3 uygular; yaz saati YOKTUR.
 * Bu sabit, 2016 öncesi tarihlerde yaz saati dönemleri için yanlış sonuç verir.
 * Intl / toLocale kullanımı ABACUS-SPEC §4.2 ile yasaklı olduğundan tarihsel
 * saat dilimi veritabanı çekirdeğe taşınmaz; kapsam bilinçli olarak sınırlıdır.
 */
const ISTANBUL_OFFSET_MINUTES = 180;

const MS_PER_DAY = 86400000;
const MS_PER_MINUTE = 60000;

interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  hasTime: boolean;
}

/** Yılın artık yıl olup olmadığını döner (Gregoryen kuralı). */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Ayın gerçek gün sayısını döner; ay geçersizse null. */
function daysInMonth(year: number, month: number): number | null {
  if (month < 1 || month > 12) return null;
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  const thirtyDayMonths = [4, 6, 9, 11];
  return thirtyDayMonths.includes(month) ? 30 : 31;
}

/**
 * ISO metnini ayrıştırır, TAKVİM DOĞRULAMASI yapar ve saat dilimi bilgisi
 * varsa Europe/Istanbul (UTC+3) karşılığına çevirir.
 *
 * - Saat dilimi eki YOKSA değer İstanbul duvar saati kabul edilir, kaydırılmaz.
 * - Z veya +HH:MM eki VARSA değer İstanbul saatine çevrilir; bu, tarihi de
 *   ileri veya geri alabilir.
 *
 * Geçersiz biçim veya var olmayan takvim gününde (ör. 2024-02-30) null döner.
 */
function parseIso(iso: string | null | undefined): DateParts | null {
  if (!iso || typeof iso !== 'string') return null;

  const match = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?\s*(Z|[+-]\d{2}:?\d{2})?)?$/
  );
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const maxDay = daysInMonth(year, month);
  if (maxDay === null || day < 1 || day > maxDay) return null;

  const hasTime = match[4] !== undefined && match[5] !== undefined;
  if (!hasTime) {
    return { year, month, day, hour: 0, minute: 0, hasTime: false };
  }

  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] !== undefined ? Number(match[6]) : 0;
  if (hour > 23 || minute > 59 || second > 59) return null;

  const zone = match[7];
  if (zone === undefined) {
    return { year, month, day, hour, minute, hasTime: true };
  }

  const zoneOffsetMinutes = parseZoneOffset(zone);
  if (zoneOffsetMinutes === null) return null;

  const utcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const shiftMinutes = sub(ISTANBUL_OFFSET_MINUTES, zoneOffsetMinutes);
  const istanbulMs = utcMs + shiftMinutes * MS_PER_MINUTE;
  const shifted = new Date(istanbulMs);

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    hasTime: true,
  };
}

/** Z veya +HH:MM / +HHMM saat dilimi ekini dakikaya çevirir; geçersizse null. */
function parseZoneOffset(zone: string): number | null {
  if (zone === 'Z') return 0;
  const m = zone.match(/^([+-])(\d{2}):?(\d{2})$/);
  if (!m || !m[1] || !m[2] || !m[3]) return null;
  const hours = Number(m[2]);
  const minutes = Number(m[3]);
  if (hours > 14 || minutes > 59) return null;
  const total = hours * 60 + minutes;
  return m[1] === '-' ? -total : total;
}

/** İki haneye sıfır dolgusu yapar. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Doğrulanmış tarihi UTC gün sayısına çevirir. */
function toUtcDays(parts: DateParts): number | null {
  const utcMs = Date.UTC(parts.year, parts.month - 1, parts.day);
  const daysDiv = div(utcMs, MS_PER_DAY);
  return daysDiv !== null ? round(daysDiv, 0) : null;
}

/** Doğrulanmış tarihin hafta günü indeksi (0 = Pazar). */
function weekdayIndex(parts: DateParts): number | null {
  const idx = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return Number.isInteger(idx) ? idx : null;
}

/**
 * ABACUS tarih biçimlendirme motoru (ABACUS-SPEC §3.4).
 * ISO string girdi alır; `Date` nesnesi KABUL ETMEZ.
 * Intl / toLocale kullanılmadan, sabit ad dizileriyle çalışır.
 * Geçersiz biçim veya var olmayan takvim gününde '—' döner.
 */
export function format(iso: string | null | undefined, style: DateFormatStyle = 'short'): string {
  const parts = parseIso(iso);
  if (parts === null) return '—';

  const fullMonth = MONTH_NAMES_FULL[parts.month - 1];
  const shortMonth = MONTH_NAMES_SHORT[parts.month - 1];
  if (!fullMonth || !shortMonth) return '—';

  const yearStr = `${parts.year}`;
  const monthStr = pad2(parts.month);
  const dayStr = pad2(parts.day);
  const dateShort = `${dayStr}.${monthStr}.${yearStr}`;

  switch (style) {
    case 'long':
      return `${parts.day} ${fullMonth} ${yearStr}`;
    case 'dayMonth':
      return `${parts.day} ${shortMonth}.`;
    case 'monthYear':
      return `${fullMonth} ${yearStr}`;
    case 'period':
      return `${monthStr}/${yearStr}`;
    case 'time':
      if (!parts.hasTime) return '—';
      return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
    case 'dateTime':
      if (!parts.hasTime) return '—';
      return `${dateShort} ${pad2(parts.hour)}:${pad2(parts.minute)}`;
    case 'dayMonthWeekday': {
      const wd = weekdayIndex(parts);
      if (wd === null) return '—';
      const shortDay = DAY_NAMES_SHORT[wd];
      if (!shortDay) return '—';
      return `${parts.day} ${fullMonth} ${shortDay}.`;
    }
    case 'short':
    default:
      return dateShort;
  }
}

/** Ay numarasından (1-12) Türkçe ay adı döner. Geçersiz ayda '—'. */
export function monthName(month: number, form: NameForm = 'long'): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) return '—';
  const name = form === 'short' ? MONTH_NAMES_SHORT[month - 1] : MONTH_NAMES_FULL[month - 1];
  return name ?? '—';
}

/** İki ISO tarihi arasındaki gün farkını hesaplar (isoB - isoA) */
export function daysBetween(isoA: string, isoB: string): number | null {
  const a = parseIso(isoA);
  const b = parseIso(isoB);
  if (a === null || b === null) return null;
  const daysA = toUtcDays(a);
  const daysB = toUtcDays(b);
  if (daysA === null || daysB === null) return null;
  return sub(daysB, daysA);
}

/** Bugünden hedefe gün farkını hesaplar (iso - today) */
export function daysUntil(iso: string, today: string): number | null {
  return daysBetween(today, iso);
}

/** Bugüne göre Türkçe bağıl zaman ifadesi döner (bugün / dün / yarın / N gün önce/sonra) */
export function relative(iso: string, today: string): string {
  const diff = daysUntil(iso, today);
  if (diff === null) return '—';

  if (diff === 0) return 'bugün';
  if (diff === -1) return 'dün';
  if (diff === 1) return 'yarın';

  if (diff < 0) {
    const absDiff = abs(diff);
    return `${absDiff} gün önce`;
  }

  return `${diff} gün sonra`;
}

/**
 * Tarihin Türkçe gün adını döner.
 * Varsayılan kısa biçim (Pzt/Sal/...); `form: 'long'` ile uzun biçim (Pazartesi/...).
 * Geçersiz veya var olmayan tarihte '—'.
 */
export function dayName(iso: string, form: NameForm = 'short'): string {
  const parts = parseIso(iso);
  if (parts === null) return '—';
  const idx = weekdayIndex(parts);
  if (idx === null) return '—';
  const name = form === 'long' ? DAY_NAMES_FULL[idx] : DAY_NAMES_SHORT[idx];
  return name ?? '—';
}

/**
 * ABACUS tarih AYRIŞTIRMA motoru — `format`'ın aynası.
 *
 * Türkçe biçimli tarih metnini ISO metnine çevirir.
 *
 * AYNA KURALI gereği yalnızca `format`'ın **bilgi kaybetmeden** ürettiği
 * stiller geri okunabilir:
 *   - `short`     "15.08.2026"        -> "2026-08-15"
 *   - `long`      "15 Ağustos 2026"   -> "2026-08-15"
 *   - `dateTime`  "25.08.2026 00:30"  -> "2026-08-25T00:30"
 *
 * Bilgi kaybeden stiller (`dayMonth`, `monthYear`, `period`, `time`,
 * `dayMonthWeekday`) yıl veya gün içermedikleri için **bilinçli olarak**
 * reddedilir; eksik bilgiyi tahmin etmek sessiz hata üretirdi.
 *
 * Kapalı hoşgörü listesi: baştaki/sondaki boşluk · sıfır dolgusuz gün-ay
 * ("5.1.2026") · ISO girdinin olduğu gibi kabulü · ay adında büyük/küçük
 * harf farkı.
 *
 * Takvim doğrulaması giriş kapısında da uygulanır: "30.02.2024" -> null.
 * Çözümlenemeyen girdide `null` döner (ABACUS-SPEC §2.1).
 */
export function parse(text: string | null | undefined): string | null {
  if (text === null || text === undefined || typeof text !== 'string') return null;

  const s = text.trim();
  if (s === '') return null;

  // 1) ISO girdi (çekirdeğin kanonik biçimi) olduğu gibi kabul edilir.
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return buildIso(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]), null, null);
  }

  // 2) short / dateTime: GG.AA.YYYY [SS:DD]
  const dotted = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (dotted) {
    const hour = dotted[4] === undefined ? null : Number(dotted[4]);
    const minute = dotted[5] === undefined ? null : Number(dotted[5]);
    return buildIso(Number(dotted[3]), Number(dotted[2]), Number(dotted[1]), hour, minute);
  }

  // 3) long: GG Ay YYYY
  const worded = s.match(/^(\d{1,2})\s+([^\s\d]+)\s+(\d{4})$/);
  if (worded) {
    const monthWord = worded[2];
    if (monthWord === undefined) return null;
    const month = monthNumberOf(monthWord);
    if (month === null) return null;
    return buildIso(Number(worded[3]), month, Number(worded[1]), null, null);
  }

  return null;
}

/** Türkçe ay adından ay numarasını bulur (büyük/küçük harf duyarsız); yoksa null. */
function monthNumberOf(word: string): number | null {
  const w = toTrLower(word);
  for (let i = 0; i < MONTH_NAMES_FULL.length; i++) {
    const name = MONTH_NAMES_FULL[i];
    if (name !== undefined && toTrLower(name) === w) return i + 1;
  }
  return null;
}

/** Takvim doğrulaması yapıp ISO metni kurar; geçersizde null. */
function buildIso(
  year: number,
  month: number,
  day: number,
  hour: number | null,
  minute: number | null
): string | null {
  const maxDay = daysInMonth(year, month);
  if (maxDay === null || day < 1 || day > maxDay) return null;

  const datePart = `${year}-${pad2(month)}-${pad2(day)}`;
  if (hour === null || minute === null) return datePart;

  if (hour > 23 || minute > 59) return null;
  return `${datePart}T${pad2(hour)}:${pad2(minute)}`;
}
