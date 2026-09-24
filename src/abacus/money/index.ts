import { abs, div, floor, mod, mul, round } from '../math';
import { numberToWords } from '../text';
import { formatMoney, groupThousands } from '../internal/money-format';
import { parseMoney } from '../internal/money-parse';
import { isValidDigits } from '../internal/hane';
import type { CurrencyDef, CurrencyRef } from '../internal/currency-registry';
import {
  knownCurrencyCodes,
  minorFactor,
  resolveCurrency,
  withDigits,
} from '../internal/currency-registry';

export type { CurrencyDef, CurrencyRef };
export { knownCurrencyCodes };

export type { FormatMoneyOptions } from '../internal/money-format';
import type { FormatMoneyOptions } from '../internal/money-format';

export interface ToWordsOptions {
  spaced?: boolean;
}

/** Kısaltma ölçeği. Adlar stilden bağımsızdır: `'B'` harfi bir stilde bin, ötekinde milyar demek. */
export type CompactScale = 'thousand' | 'million' | 'billion';

export interface CompactMoneyOptions {
  style?: 'K/M' | 'B/Mn/Mr';
  form?: 'symbol' | 'text';
  /** Yerleşik kod veya tam tanım. v2.2.0 öncesinde bu seçenek YOK SAYILIYORDU. */
  currency?: CurrencyRef;
  /**
   * Kısaltılmış değerin SABİT ondalık hane sayısı (v4.3.0, madde 39D): `2` ile
   * `₺1,20Mn` ve `₺29,99Mn` aynı hanede yazılır, sütunda hizalanır. Verilmezse en
   * çok 2 hane yazılır ve sondaki sıfır atılır (`₺1,2Mn`). Kısaltılmayan (ölçeğin
   * altındaki) tutara uygulanmaz. Geçerli aralık 0–20; dışında `'—'`.
   */
  digits?: number;
  /**
   * Kısaltmanın başladığı en küçük ölçek (v4.3.0, madde 39D). Altındaki tutar tam
   * yazılır: `minScale: 'million'` ile `1500` -> `₺1.500`. Varsayılan `'thousand'`.
   * Türkçe stilde `'million'` seçmek `B` (bin) kısaltmasını ekrandan kaldırır.
   * Geçersiz değerde `'—'`.
   */
  minScale?: CompactScale;
  /** Sıfır tutarın yazımı; bkz. `FormatMoneyOptions.zero` (v4.3.0, madde 39C). */
  zero?: 'plain' | 'symbol';
}

/**
 * ABACUS para biçimlendirme motoru (TCMB kurallarına uygun).
 * Girdi kuruş bazlı tam sayıdır (2323223 kuruş = 23.232,23 TL).
 * Genel kapı burasıdır; hesap `internal/money-format` yaprak modülünde durur
 * (dairesel import olmadan `text.suffix` tarafından da kullanılabilsin diye).
 */
export const format = formatMoney;

/**
 * ANA BİRİMDEKİ bir sayıyı biçimlendirir (kuruş değil, lira/dolar).
 * Alt birime çevrim `math` üzerinden yapılır; float hatası oluşmaz.
 *
 * `digits` verilirse alt birime çevrim de O hane sayısıyla yapılır; yoksa
 * 1,2345 önce kuruşa yuvarlanır ve dört haneli çıktı anlamını kaybederdi.
 *
 * @example money.formatMajor(1234.56, { kurus: true })  // "₺1.234,56"
 * @example money.formatMajor(1.2345, { digits: 4, kurus: true })  // "₺1,2345"
 */
export function formatMajor(
  amountMajor: number | null | undefined,
  opts?: FormatMoneyOptions
): string {
  if (amountMajor === null || amountMajor === undefined || !Number.isFinite(amountMajor)) {
    return '—';
  }
  const resolved = resolveCurrency(opts?.currency);
  if (resolved === null) return '—';

  const cur = withDigits(resolved, opts?.digits);
  if (cur === null) return '—';

  const minor = toMinor(amountMajor, cur);
  if (minor === null) return '—';
  return format(minor, { ...opts, currency: cur });
}

/**
 * ANA BİRİMDEKİ bir sayıyı KISALTILMIŞ biçimde gösterir (kuruş değil, lira).
 * `compact`'in ana birim ikizidir; `format` / `formatMajor` çiftiyle simetriktir.
 *
 * Grafik ekseni gibi tutarları ana birimde tutan her yerde tüketicinin
 * `compact(toMinor(v) ?? 0, opts)` çevrimini elle yazmasını gereksiz kılar —
 * o `?? 0` kalıbı geçersiz girdiyi sessizce sıfıra çeviriyordu.
 *
 * @example money.compactMajor(1500000, { style: 'B/Mn/Mr' })  // "₺1,5Mn"
 */
export function compactMajor(
  amountMajor: number | null | undefined,
  opts?: CompactMoneyOptions
): string {
  if (amountMajor === null || amountMajor === undefined || !Number.isFinite(amountMajor)) {
    return '—';
  }
  const cur = resolveCurrency(opts?.currency);
  if (cur === null) return '—';

  const minor = toMinor(amountMajor, cur);
  if (minor === null) return '—';
  return compact(minor, { ...opts, currency: cur });
}

/**
 * ANA BİRİMDEKİ bir SAYIYI alt birim tam sayısına çevirir (metin değil —
 * metin için `parse` kullanın). `parse`'ın sayısal ikizidir.
 *
 * Geçersiz girdide `null` döner (ABACUS-SPEC §2.2); sessizce 0 üretmez.
 *
 * @example money.toMinor(1234.56)  // 123456
 */
export function toMinor(major: number, currency?: CurrencyRef): number | null {
  if (!Number.isFinite(major)) return null;
  const cur = resolveCurrency(currency);
  if (cur === null) return null;

  const scaled = mul(major, minorFactor(cur));
  const result = round(scaled, 0);
  return Number.isSafeInteger(result) ? result : null;
}

/**
 * Alt birim tam sayısını GİRİŞ KUTUSUNDA gösterilecek ana birim metnine çevirir.
 * Simge/kod içermez — kullanıcı yazarken kutuda görünen sade metindir.
 * `parse` ile gidiş-dönüş uyumludur.
 *
 * @example money.formatMinorInput(123456, 2)  // "1.234,56"
 */
export function formatMinorInput(minor: number | null | undefined, digits = 0): string {
  if (minor === null || minor === undefined || !Number.isFinite(minor)) return '—';
  if (!Number.isInteger(digits) || digits < 0 || digits > 4) return '—';
  const majorDiv = div(round(minor, 0), 100);
  if (majorDiv === null) return '—';
  return fmtDecimalGrouped(majorDiv, digits);
}

/**
 * Düz ondalık gösterim; ondalık ayracı virgüldür.
 * Gereksiz sondaki sıfır eklenmez: 3 → "3", 2,5 → "2,5".
 *
 * @example money.decimal(2.5)  // "2,5"
 */
export function decimal(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (!isValidDigits(digits)) return '—';
  return String(round(value, digits)).replace('.', ',');
}

/**
 * Oran gösterimi: iki ondalık, virgüllü, sonda "x".
 * `decimal`'in çiftidir.
 *
 * @example money.ratio(8.712)  // "8,71x"
 */
export function ratio(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${decimal(value, 2)}x`;
}

/**
 * ABACUS para AYRIŞTIRMA motoru — `format`'ın aynası.
 *
 * Türkçe biçimli para metnini **kuruş tam sayısına** çevirir.
 * `money.format`'ın ürettiği her biçimi geri okur; ayrıca kapalı bir hoşgörü
 * listesi uygular (boşluk, eksik simge, eksik binlik ayraç, tek ondalık hane).
 * Bunun dışındaki hiçbir biçim kabul edilmez — İngilizce biçim dâhil.
 *
 * Çözümlenemeyen girdide `null` döner (ABACUS-SPEC §2.1).
 *
 * `parseNumber` ile karıştırmayın: o ondalıklı bir `number` döner (1234.56),
 * bu ise kuruş tam sayısı döner (123456). Kuruşa çevrim `math` üzerinden
 * yapıldığı için float hatası oluşmaz.
 *
 * @example
 * money.format(123456)      // "₺1.234,56"
 * money.parse('₺1.234,56')  // 123456
 */
export const parse = parseMoney;

/**
 * `percent` işaret modu (v2.5.0).
 *
 * - `'auto'`   — varsayılan: eksi görünür, artı görünmez ("-%3,2" · "%3,2").
 * - `'always'` — artı da yazılır ("+%3,2"); `showPositiveSign: true` karşılığı.
 * - `'never'`  — hiç işaret yazılmaz ("%3,2"); yönü RENKLE anlatan finansal
 *   arayüzler için. Tüketicinin `Math.abs(v)` yazmasını gereksiz kılar —
 *   o çağrı unutulduğunda eksi işareti kırmızı renkle üst üste binip çift
 *   olumsuzlama gibi okunuyordu.
 *
 * Sıfıra hiçbir modda işaret eklenmez — sıfır ne artı ne eksidir.
 */
export type PercentSign = 'auto' | 'always' | 'never';

export interface PercentOptions {
  /**
   * Pozitif değerlerin önüne '+' koyar ("+%12,3"). Değişim/fark gösteren
   * tablolarda yönü görünür kılmak için kullanılır.
   * Sıfıra işaret eklenmez — sıfır ne artı ne eksidir.
   *
   * @deprecated v2.5.0: `sign: 'always'` kullanın. Geriye dönük uyum için
   * korunur; `sign` verildiğinde YOK SAYILIR.
   */
  showPositiveSign?: boolean;
  /**
   * İşaret modu. Verilirse `showPositiveSign`'ı geçersiz kılar.
   * Varsayılan `'auto'` — v2.4.0 davranışının aynısı.
   */
  sign?: PercentSign;
  /**
   * İşaretin (`-` / `+`) yüzde simgesine göre konumu (v2.9.0).
   *
   * - `'leading'` (**v3.0.0'dan itibaren varsayılan**): `-%4,3` — Unicode CLDR
   *   `tr-TR` biçimi; tarayıcıların ve `Intl.NumberFormat`'ın Türkçe için
   *   ürettiği yazım (CLDR 48.0 ile ölçüldü). Eksi en başta olduğu için tabloda
   *   yön ilk karakterden okunur. `sign: 'always'` ile artı da öne gelir (`+%4,3`).
   * - `'inner'`: `%-4,3` — TDK kuralının (önce `%`, sonra sayı) negatif sayıya
   *   harfiyen uygulanması; v2.x'in varsayılanı. Eski çıktıyı korumak için.
   */
  signPosition?: PercentSignPosition;
  /**
   * `true` ise ondalık kısım her zaman `digits` haneye tamamlanır (v2.9.0):
   * `percent(4.3, 2, { fixed: true })` → `%4,30`. Tablolarda virgüllerin alt
   * alta hizalanması içindir. Varsayılan `false`: sondaki sıfırlar atılır (`%4,3`).
   */
  fixed?: boolean;
}

/** `percent` işaret konumu. Bkz. `PercentOptions.signPosition`. */
export type PercentSignPosition = 'inner' | 'leading';

/**
 * ABACUS yüzde biçimlendirme motoru (%12,3).
 * Null / undefined / NaN için '—' (tire) döndürür.
 *
 * Yüzde işareti TDK Yazım Kılavuzu gereği sayıdan ÖNCE ve boşluksuz yazılır.
 *
 * @example
 * money.percent(3.2, 1)                                          // "%3,2"
 * money.percent(-3.2, 1)                                         // "-%3,2"
 * money.percent(-3.2, 1, { sign: 'never' })                      // "%3,2"
 * money.percent(3.2, 1, { sign: 'always' })                      // "+%3,2"
 * money.percent(-4.3, 2, { fixed: true })                        // "-%4,30"
 * money.percent(-4.3, 1, { signPosition: 'inner' })              // "%-4,3" (v2.x)
 */
export function percent(
  value: number | null | undefined,
  digits = 1,
  opts?: PercentOptions
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  // v3.0.0: geçersiz hane sayısında decimal.js fırlatıyordu; artık '—'.
  if (!isValidDigits(digits)) return '—';
  const rounded = round(value, digits);

  // `sign` verilmişse o kazanır; verilmemişse eski `showPositiveSign` okunur.
  const mode: PercentSign =
    opts?.sign ?? (opts?.showPositiveSign === true ? 'always' : 'auto');

  // İşaret yuvarlama SONRASI belirlenir ki "-0,04" birinci basamakta "%0"
  // olsun, "%-0" değil: sıfıra hiçbir modda işaret konmaz. 'never' modunda
  // eksi metinden düşer — yön çağıran tarafta (renkle) anlatılıyor.
  let sign = '';
  if (rounded < 0 && mode !== 'never') sign = '-';
  else if (rounded > 0 && mode === 'always') sign = '+';

  let numeric = String(abs(rounded));
  // `digits` burada 0..20 arası tam sayıdır (yukarıdaki gecerliHane).
  if (opts?.fixed === true && digits > 0) {
    const dotAt = numeric.indexOf('.');
    const existing = dotAt === -1 ? 0 : numeric.length - dotAt - 1;
    if (dotAt === -1) numeric += '.';
    for (let i = existing; i < digits; i++) numeric += '0';
  }
  numeric = numeric.replace('.', ',');

  return opts?.signPosition === 'inner' ? `%${sign}${numeric}` : `${sign}%${numeric}`;
}

/** Binlik ayraç: nokta, boşluk ya da Excel'in bölünmez boşluğu (U+00A0). */
const TR_GROUPED = /^-?\d{1,3}(?:[. \u00a0]\d{3})*(?:,\d+)?$/;
/** Ayraçsız yazım: "1234", "1234,56". */
const TR_PLAIN = /^-?\d+(?:,\d+)?$/;

/**
 * Türkçe biçimli sayı metnini sayıya çevirir ("1.234,56" -> 1234.56).
 *
 * **Yalnız Türkçe biçim okunur.** Kabul edilen: isteğe bağlı eksi · 3'erli nokta,
 * boşluk ya da U+00A0 binlik grupları · virgülden sonra istenen kadar ondalık.
 * Başka her yazım `null` döner (ABACUS-SPEC §2.1). Gerçek sıfır ile "değer yok"
 * birbirine karışmaz.
 *
 * ⚠️ v4.0.0 KIRICI DÜZELTME (TB-010). v3 Türkçe olmayan yazımı **sessizce yanlış
 * sayıya** çeviriyordu — JSDoc `null` vaat ettiği hâlde:
 *
 *   v3: parseNumber('1234.56') -> 123456   (100 kat)   · v4: null
 *   v3: parseNumber('12abc34') -> 1234                 · v4: null
 *   v3: parseNumber('1e3')     -> 13                   · v4: null
 *
 * Nokta ondalık ayracı ("1234.56") ya da muhasebe parantezi ("(1.210,50)") bekleyen
 * çağıran, girdiyi kendi katmanında Türkçe biçime çevirmelidir; çekirdek tahmin etmez.
 *
 * Dilbilgisi SNN-Ihale-Maliyet'in ölçülmüş çözümünden alındı (o proje v3'ün
 * gevşekliğine karşı kendi kapısını yazmış ve "çekirdeğe talep adayı" diye
 * işaretlemişti).
 *
 * @example parseNumber('1.234,56')  // 1234.56
 * @example parseNumber('1 234,56')  // 1234.56  (Excel boşluklu binlik)
 * @example parseNumber('1234.56')   // null     (nokta ondalık değildir)
 */
export function parseNumber(val: string): number | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (trimmed === '') return null;
  if (!TR_GROUPED.test(trimmed) && !TR_PLAIN.test(trimmed)) return null;

  const clean = trimmed.replace(/[. \u00a0]/g, '').replace(',', '.');
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}



/** Ondalıklı sayıyı binlik ayraçlı (nokta) + ondalık (virgül) göster — ör. 70000 -> "70.000" */
export function fmtDecimalGrouped(value: number | null | undefined, digits = 0): string {
  // ABACUS-SPEC §2.1: biçimlendirme işleri geçersiz girdide '—' döner.
  // '0' döndürmek "değer yok" ile "değer sıfır"ı birbirine karıştırırdı.
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (!isValidDigits(digits)) return '—';
  const rounded = round(value, digits);
  const parts = String(rounded).split('.');
  const intPart = parts[0] ? groupThousands(Number(parts[0])) : '0';
  if (digits > 0) {
    const decPart = (parts[1] || '').padEnd(digits, '0').slice(0, digits);
    return `${intPart},${decPart}`;
  }
  return intPart;
}

/** Serbest ondalık giriş kutuları için CANLI biçimlendirme */
export interface GroupedInputOptions {
  /**
   * `true` ise nokta tuşu **ondalık ayracı** sayılır: `'98.50'` -> `'98,50'`.
   *
   * Varsayılan `false`'ta nokta **silinir** ve kalan rakamlar yeniden gruplanır
   * (`'98.50'` -> `'9.850'`) — v2'den beri süren davranış, değişmedi.
   *
   * ⚠️ TAKAS: bu kutuda binlik ayracı olarak nokta **yazılamaz**. `'1.234'`
   * bin iki yüz otuz dört değil, **1,234** olur. İki niyet tek girdide ayırt
   * edilemez; çekirdek tahmin etmez, kararı size sorar.
   *
   * Serbest ondalık kutularında (fiyat, oran, stop) açın; binlik ayracını elle
   * yazdıran kutularda kapalı bırakın.
   *
   * ⚠️ KONTROLLÜ KUTUDA `previous` İLE KULLANIN. Kutunun kendi çıktısı 1.000 ve
   * üzerinde bir binlik noktası taşır (`8.534`); `previous` verilmezse bir sonraki
   * tuşta o nokta ondalık sanılır: `8.534` + `0` -> `8,5340` (talep #48).
   */
  readonly dotAsDecimal?: boolean;
  /**
   * Kutunun bu tuştan ÖNCEKİ metni — kontrollü kutuda (React `value`) state'teki değer.
   * Yalnız `dotAsDecimal: true` iken etkilidir; varsayılan kipte noktalar zaten silinir.
   *
   * Önceki metinde bulunan noktalar kütüphanenin koyduğu binlik ayraçlarıdır ve
   * silinir; yalnız bu tuşla EKLENEN nokta ondalık sayılabilir:
   *
   *   formatGroupedInput('8.5340', { dotAsDecimal: true, previous: '8.534' })  // '85.340'
   *   formatGroupedInput('85.34',  { dotAsDecimal: true, previous: '85.340' }) // '8.534'  (silme)
   *
   * `previous` bu fonksiyonun üretebileceği bir metin değilse (ör. başlangıç değeri
   * `String(98.5)` ile yazılmışsa) noktasının kimden geldiği bilinemez; o zaman
   * `previous` yokmuş gibi davranılır. Yapıştırma (boş kutuya ya da seçimin üstüne)
   * `previous` olmadan olduğu gibi çalışır: `'98.50'` -> `'98,50'`, `'1.234'` -> `'1,234'`.
   */
  readonly previous?: string;
  /**
   * Virgülden sonra en çok kaç hane yazılabileceği (0–20). Fazla hane **kesilir**,
   * yuvarlanmaz: kullanıcı yazarken son tuşu yutmak doğrudur, yazdığı rakamı
   * değiştirmek değildir. `0` tam sayı kutusudur, virgül yazılamaz.
   *
   * Para kutusunda `2` verin: kutu `money.parse`'ın okuyamayacağı `'1.234,567'`
   * metnini hiç üretmez. Verilmezse sınır yoktur (bugünkü davranış). Geçersiz
   * değerde `'—'` döner (`text.digits` emsali).
   */
  readonly maxDigits?: number;
}

/**
 * `dotAsDecimal` acikken noktayi ondalik ayracina cevirir — AMA yalniz anlamliysa.
 *
 * HATA DUZELTMESI (v4.1.1, talep #42): v4.1.0 TUM noktalari virgule ceviriyordu ve
 * karisik bicimi bozuyordu: `'1.234,56'` -> `'1,23456'`, **1000 kat** sapma. Ustelik
 * bu, kutuphanenin KENDI cikti bicimidir (`fmtDecimalGrouped(1234.56, 2)`), yani
 * kullanicinin ekrandan kopyalayip yapistirdigi metin.
 *
 * Kural iki kosulludur; ikisi de "kullanici ondalik yaziyor olabilir mi" sorusunu sorar:
 *   1. Girdide VIRGUL varsa ondalik zaten yazilmis; noktalar binlik ayracidir.
 *   2. BIRDEN COK nokta varsa binlik ayracidir; bir sayinin tek ondalik ayraci olur.
 *
 * Geriye tek durum kalir — tek nokta, virgul yok — ve secenegin amaci tam odur.
 */
function dotToDecimal(raw: string): string {
  if (raw.includes(',')) return raw;
  if ((raw.match(/\./g) ?? []).length > 1) return raw;
  return raw.replace('.', ',');
}

/**
 * Kontrollü kutu için `dotToDecimal` (talep #48, v4.2.0).
 *
 * Durumsuz kural `'85.34'` metninde noktanın kullanıcıdan mı yoksa kütüphanenin
 * gruplamasından mı geldiğini bilemez: kullanıcı `85.34` yapıştırmış da olabilir,
 * `85.340`'tan bir rakam silmiş de. Önceki metin bu soruyu cevaplar.
 *
 * Önceki ve yeni metnin ortak başı ve sonu değişmemiş kısımdır; oradaki noktalar
 * kütüphanenin binlik ayraçlarıdır ve silinir. Kalan (eklenen) parça ile birlikte
 * iki koşullu kural (madde 38) yine uygulanır; böylece virgül varken basılan nokta
 * ikinci bir ondalık ayracına dönüşmez.
 *
 * Önceki metin bu fonksiyonun çıktısı değilse (varsayılan kipte kendini
 * değiştirmeden geri vermiyorsa) noktalarına güvenilmez; durumsuz kurala düşülür.
 */
function dotToDecimalAfter(raw: string, previous: string): string {
  if (formatGroupedInput(previous) !== previous) return dotToDecimal(raw);

  // Baş ve son örtüşmez: ikisinin toplamı kısa metnin boyunu aşamaz.
  const shorter = raw.length < previous.length ? raw.length : previous.length;
  let head = 0;
  while (head < shorter && raw[head] === previous[head]) head++;
  let tail = 0;
  while (
    tail < shorter - head &&
    raw[raw.length - 1 - tail] === previous[previous.length - 1 - tail]
  ) {
    tail++;
  }

  const kept = (part: string) => part.replace(/\./g, '');
  const inserted = raw.slice(head, raw.length - tail);
  return dotToDecimal(kept(raw.slice(0, head)) + inserted + kept(raw.slice(raw.length - tail)));
}

export function formatGroupedInput(raw: string, opts?: GroupedInputOptions): string {
  const maxDigits = opts?.maxDigits;
  if (maxDigits !== undefined && !isValidDigits(maxDigits)) return '—';
  if (!raw) return '';
  let source = raw;
  if (opts?.dotAsDecimal === true) {
    source =
      typeof opts.previous === 'string' ? dotToDecimalAfter(raw, opts.previous) : dotToDecimal(raw);
  }
  let clean = source.replace(/[^0-9,]/g, '');
  // Tam sayı kutusu: virgül ve sonrası hiç yazılmamış sayılır.
  if (maxDigits === 0 && clean.includes(',')) clean = clean.slice(0, clean.indexOf(','));
  const firstComma = clean.indexOf(',');
  const intPartRaw = firstComma === -1 ? clean : clean.slice(0, firstComma);
  const allDecimals = firstComma === -1 ? '' : clean.slice(firstComma + 1).replace(/,/g, '');
  const decPart = maxDigits === undefined ? allDecimals : allDecimals.slice(0, maxDigits);
  const intDigits = intPartRaw.replace(/^0+(?=\d)/, '');
  if (!intDigits && firstComma === -1) return '';
  // Sessiz varsayilan (|| 0) yok: bos hane dizisi acikca 0 demektir.
  const intValue = intDigits.length > 0 ? Number(intDigits) : 0;
  const grouped = groupThousands(intValue);
  if (firstComma === -1) return grouped;
  // groupThousands(0) zaten '0' dondurur; sessiz varsayilana gerek yok.
  return `${grouped},${decPart}`;
}


/**
 * Tutarı Türkçe yazıya çevirir ("Yalnız ... Türk Lirası").
 *
 * Geçersiz girdide (NaN, Infinity, güvenli tam sayı sınırı dışı) '—' döner;
 * sessizce "Sıfır" yazmaz. Negatif tutarda "Eksi" ibaresi "Yalnız"dan SONRA,
 * tutarın önüne gelir (dilbilgisel doğru konum).
 */
export function toWords(kurus: number, opts?: ToWordsOptions): string {
  if (!Number.isFinite(kurus) || !Number.isSafeInteger(kurus)) {
    return '—';
  }

  const spaced = opts?.spaced ?? false;
  const joinStr = spaced ? ' ' : '';

  const absMinor = abs(kurus);
  const majorDivisor = div(absMinor, 100);
  const kMod = mod(absMinor, 100);
  if (majorDivisor === null || kMod === null) return '—';

  const major = floor(majorDivisor);
  const minorPart = round(kMod, 0);

  const negativeWord = kurus < 0 ? `Eksi${joinStr}` : '';
  const prefix = `Yalnız ${negativeWord}`;

  if (major === 0 && minorPart === 0) {
    const zeroMajor = spaced ? 'Sıfır Türk Lirası' : 'SıfırTürkLirası';
    return `${prefix}${zeroMajor}`;
  }

  if (minorPart === 0) {
    const majorWords = numberToWords(major, opts);
    if (!majorWords) return '—';
    const majorSuffix = spaced ? 'Türk Lirası' : 'TürkLirası';
    return `${prefix}${majorWords}${joinStr}${majorSuffix}`;
  }

  const majorWords = major > 0 ? numberToWords(major, opts) : 'Sıfır';
  const minorWords = numberToWords(minorPart, opts);
  if (!majorWords || !minorWords) return '—';
  return `${prefix}${majorWords}${joinStr}Lira${joinStr}${minorWords}${joinStr}Kuruş`;
}

/** Ölçekler küçükten büyüğe; birim harfi stile göre seçilir. */
const COMPACT_SCALES: readonly { name: CompactScale; divisor: number; km: string; tr: string }[] = [
  { name: 'thousand', divisor: 1000, km: 'K', tr: 'B' },
  { name: 'million', divisor: 1000000, km: 'M', tr: 'Mn' },
  { name: 'billion', divisor: 1000000000, km: 'B', tr: 'Mr' },
];

export function compact(kurus: number | null | undefined, opts?: CompactMoneyOptions): string {
  if (kurus === null || kurus === undefined || !Number.isFinite(kurus)) {
    return '—';
  }
  const digits = opts?.digits;
  if (digits !== undefined && !isValidDigits(digits)) return '—';
  const minScale = opts?.minScale ?? 'thousand';
  const firstScale = COMPACT_SCALES.findIndex((s) => s.name === minScale);
  if (firstScale === -1) return '—';

  // Varsayılan yol para birimini çözmeden döner (bugünkü davranış: geçersiz birimde de '0').
  if (kurus === 0 && opts?.zero !== 'symbol') {
    return '0';
  }

  const style = opts?.style ?? 'K/M';
  const form = opts?.form ?? 'symbol';
  const cur = resolveCurrency(opts?.currency);
  if (cur === null) return '—';

  if (kurus === 0) {
    return form === 'text' ? `0 ${cur.text}` : `${cur.symbol}0`;
  }

  const isNegative = kurus < 0;
  const absMinor = abs(kurus);
  const majorValue = div(absMinor, minorFactor(cur));

  if (majorValue === null) return '—';

  // Ölçek eşiğinin altı kısaltmasız standart biçime düşer
  const floorScale = COMPACT_SCALES[firstScale];
  if (floorScale === undefined || majorValue < floorScale.divisor) {
    return format(kurus, { form, kurus: false, currency: cur });
  }

  // HATA DÜZELTMESİ (v4.3.0, madde 41): terfi kararı eskiden birim HARFİNE bakıyordu;
  // varsayılan stilde 'B' milyar olduğu için 2 trilyon '₺2M' yazılıyordu. Artık sıraya
  // bakılır ve en üst ölçek (milyar) aşılmaz.
  let index = firstScale;
  for (let i = firstScale + 1; i < COMPACT_SCALES.length; i++) {
    const next = COMPACT_SCALES[i];
    if (next !== undefined && majorValue >= next.divisor) index = i;
  }

  const places = digits ?? 2;
  const roundAt = (i: number): number | null => {
    const scale = COMPACT_SCALES[i];
    if (scale === undefined) return null;
    const scaled = div(majorValue, scale.divisor);
    // Sessiz varsayilan (?? 0) yok: hesaplanamazsa bicimlendirme sentineli doner.
    return scaled === null ? null : round(scaled, places);
  };

  let roundedVal = roundAt(index);
  // Yuvarlama sonrası 1000 ve üzerine ulaşırsa üst ölçeğe terfi et (üst ölçek varsa)
  if (roundedVal !== null && roundedVal >= 1000 && index + 1 < COMPACT_SCALES.length) {
    index++;
    roundedVal = roundAt(index);
  }
  const scale = COMPACT_SCALES[index];
  if (roundedVal === null || scale === undefined) return '—';
  const unit = style === 'K/M' ? scale.km : scale.tr;

  const [intText, fracText = ''] = String(roundedVal).split('.');
  const numStr =
    digits === undefined
      ? String(roundedVal).replace('.', ',')
      : digits === 0
        ? `${intText}`
        : `${intText},${fracText.padEnd(digits, '0')}`;

  const scaledWithUnit = `${numStr}${unit}`;
  // v2.2.0: burada para birimi YOK SAYILIYORDU; compact(x, {currency:'USD'})
  // bile '₺' basıyordu. Artık seçilen birim kullanılıyor.
  const resultWithForm =
    form === 'symbol' ? `${cur.symbol}${scaledWithUnit}` : `${scaledWithUnit} ${cur.text}`;

  return isNegative ? `-${resultWithForm}` : resultWithForm;
}
