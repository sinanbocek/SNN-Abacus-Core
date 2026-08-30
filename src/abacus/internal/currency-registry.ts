/**
 * ABACUS dahili para birimi kayıt defteri (yaprak modül — hiçbir motoru import etmez).
 *
 * TASARIM İLKESİ: para birimi KOD değil, VERİdir.
 *
 * Eskiden `currency` seçeneği `'TRY' | 'USD'` biçiminde koda gömülüydü; yeni bir
 * para birimi (EUR, GBP…) eklemek çekirdek güncellemesi gerektiriyordu. Artık
 * para birimi bir tanım nesnesidir ve tüketici çekirdeğin hiç duymadığı bir
 * birimi de doğrudan verebilir:
 *
 *   money.format(123456, { currency: 'EUR' })
 *   money.format(123456, { currency: { code: 'AZN', symbol: '₼', text: 'AZN', minorDigits: 2 } })
 *
 * Böylece yeni para birimi için çekirdeğin güncellenmesi GEREKMEZ.
 *
 * SORUMLULUK AYRIMI — bu ayrım bilinçlidir:
 *   - Para birimi ŞUNLARI belirler: simge, metin kodu, ondalık hane sayısı.
 *   - Okuyucunun DİLİ şunları belirler: binlik/ondalık ayracı, simgenin konumu.
 *
 * ABACUS **Türkçe yerelli** bir kütüphanedir: ayraçlar her zaman Türkçedir
 * (binlik '.', ondalık ','), para birimi ne olursa olsun. Yani dolar da
 * "$1.234,56" biçiminde yazılır — çünkü sayfadaki diğer tüm sayılar öyle.
 * Amerikan biçimi ("$1,234.56") KAPSAM DIŞIDIR; o, okuyucunun dili değişince
 * gündeme gelir ve ayrı bir karardır.
 */

export interface CurrencyDef {
  /** ISO 4217 kodu: 'TRY', 'USD', 'EUR', 'GBP'… */
  code: string;
  /** Simge biçiminde kullanılan işaret: '₺', '$', '€', '£' */
  symbol: string;
  /** Metin biçiminde yazılan kısaltma. TRY için Türkçe teamül gereği 'TL'dir. */
  text: string;
  /** Alt birimin hane sayısı. Çoğu birimde 2; JPY'de 0, KWD'de 3. */
  minorDigits: number;
}

/** Yerleşik para birimleri. Listede olmayan birim doğrudan tanım olarak verilebilir. */
const REGISTRY: Record<string, CurrencyDef> = {
  TRY: { code: 'TRY', symbol: '₺', text: 'TL', minorDigits: 2 },
  USD: { code: 'USD', symbol: '$', text: 'USD', minorDigits: 2 },
  EUR: { code: 'EUR', symbol: '€', text: 'EUR', minorDigits: 2 },
  GBP: { code: 'GBP', symbol: '£', text: 'GBP', minorDigits: 2 },
};

/**
 * `currency` seçeneğinin kabul ettiği biçim: yerleşik kod, herhangi bir kod
 * metni ya da tam tanım nesnesi.
 */
export type CurrencyRef = string | CurrencyDef;

export const DEFAULT_CURRENCY: CurrencyDef = REGISTRY.TRY as CurrencyDef;

/** Yerleşik para birimi kodlarını döner (salt okunur kopya). */
export function knownCurrencyCodes(): string[] {
  return Object.keys(REGISTRY).sort();
}

/**
 * Bir para birimi referansını tanıma çözer.
 *
 * - Tanım nesnesi verilmişse doğrulanır ve olduğu gibi kullanılır.
 * - Yerleşik bir kod verilmişse kayıt defterinden alınır.
 * - Tanınmayan bir KOD verilmişse `null` döner: çekirdek o birimin simgesini
 *   ve hane sayısını bilemez, uydurmak sessiz hata olurdu (ABACUS-SPEC §2.2).
 *   Tüketici tam tanımı vererek bu birimi kullanabilir.
 */
export function resolveCurrency(ref: CurrencyRef | undefined): CurrencyDef | null {
  if (ref === undefined) return DEFAULT_CURRENCY;

  if (typeof ref === 'string') {
    return REGISTRY[ref] ?? null;
  }

  if (!isValidDef(ref)) return null;
  return ref;
}

/** Tüketicinin verdiği tanımın kullanılabilir olduğunu doğrular. */
function isValidDef(def: CurrencyDef): boolean {
  if (typeof def.code !== 'string' || def.code === '') return false;
  if (typeof def.symbol !== 'string' || def.symbol === '') return false;
  if (typeof def.text !== 'string' || def.text === '') return false;
  if (!Number.isInteger(def.minorDigits)) return false;
  if (def.minorDigits < 0 || def.minorDigits > 4) return false;
  return true;
}

/**
 * Bir alt birim değerini ana birime bölmek için gereken katsayı.
 * minorDigits = 2 -> 100 · 0 -> 1 · 3 -> 1000
 */
export function minorFactor(def: CurrencyDef): number {
  let f = 1;
  for (let i = 0; i < def.minorDigits; i++) f *= 10;
  return f;
}

/**
 * Ayrıştırma için: yerleşik tüm simgeler ve metin kodları.
 * `money.parse` bunları kullanarak kendi ürettiği her biçimi geri okur.
 */
export function allSymbols(): string[] {
  return Object.values(REGISTRY).map((c) => c.symbol);
}

export function allTextCodes(): string[] {
  return Object.values(REGISTRY).map((c) => c.text);
}
