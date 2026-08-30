import Decimal from 'decimal.js';

/**
 * Yuvarlama modu half-up (ROUND_HALF_UP = 1) olan özel bir Decimal kopyası.
 *
 * `Decimal.set(...)` KULLANILMAZ: global Decimal'i değiştirmek, kendi
 * decimal.js'ini kullanan tüketici projelerin ayarını da sessizce bozardı.
 * Çekirdek saf kalmalı, dışarıya sızan yan etki üretmemelidir.
 */
const D = /* @__PURE__ */ Decimal.clone({ rounding: Decimal.ROUND_HALF_UP });

/** Kuruş bazlı iki sayıyı güvenle toplar (float köprüsü için String dönüşümü kullanılır) */
export function add(a: number, b: number): number {
  return new D(String(a)).plus(String(b)).toNumber();
}

/** Kuruş bazlı iki sayıyı güvenle çıkarır */
export function sub(a: number, b: number): number {
  return new D(String(a)).minus(String(b)).toNumber();
}

/** Kuruş bazlı iki sayıyı güvenle çarpar */
export function mul(a: number, b: number): number {
  return new D(String(a)).times(String(b)).toNumber();
}

/** Bölme işlemi. Bölünen 0 ise null döner (sessiz hata/varsayılan yok). */
export function div(a: number, b: number): number | null {
  if (b === 0) return null;
  return new D(String(a)).dividedBy(String(b)).toNumber();
}

/** Half-up yuvarlama (Türkiye usulü, işaret korumalı: 2,5 -> 3, -2,5 -> -3) */
export function round(x: number, d = 0): number {
  return new D(String(x)).toDecimalPlaces(d, D.ROUND_HALF_UP).toNumber();
}

/** Mutlak değer hesabı */
export function abs(x: number): number {
  return new D(String(x)).abs().toNumber();
}

/** Taban / aşağı yuvarlama */
export function floor(x: number): number {
  return new D(String(x)).floor().toNumber();
}

/** Kalan / modülasyon hesabı (payda 0 ise null) */
export function mod(a: number, b: number): number | null {
  if (b === 0) return null;
  return new D(String(a)).mod(String(b)).toNumber();
}

/** Katsayı hesabı. Payda <= 0 ise null döner. */
export function ratio(pay: number, payda: number): number | null {
  if (payda <= 0) return null;
  return new D(String(pay)).dividedBy(String(payda)).toNumber();
}

/** Yüzde değeri hesabı (pay / payda * 100). Payda <= 0 ise null döner. */
export function percent(pay: number, payda: number): number | null {
  if (payda <= 0) return null;
  return new D(String(pay)).dividedBy(String(payda)).times(100).toNumber();
}

/** Üs alma hesabı (base ^ exp). base < 0 veya geçersizse null döner. */
export function pow(base: number, exp: number): number | null {
  if (base < 0 || !Number.isFinite(base) || !Number.isFinite(exp)) return null;
  try {
    return new D(String(base)).pow(String(exp)).toNumber();
  } catch {
    return null;
  }
}

/** Doğal logaritma (ln(x)). x <= 0 veya geçersizse null döner. */
export function log(x: number): number | null {
  if (x <= 0 || !Number.isFinite(x)) return null;
  try {
    return new D(String(x)).ln().toNumber();
  } catch {
    return null;
  }
}

/** Sayılar arasından en büyüğünü döner. Dizi boş ise null döner. */
export function max(...values: number[]): number | null {
  if (values.length === 0) return null;
  const valid = values.filter((v) => Number.isFinite(v));
  if (valid.length === 0) return null;
  return D.max(...valid.map((v) => new D(String(v)))).toNumber();
}

/**
 * İki sayının verilen tolerans içinde eşit olup olmadığını söyler.
 *
 * Fark `abs(a - b)` olarak hesaplanır ve tolerans **dâhil** karşılaştırılır
 * (`<=`). Tolerans verilmezse tam eşitlik aranır.
 *
 * Float karşılaştırmasında `a === b` çoğu zaman yanıltıcıdır
 * (`0.1 + 0.2 !== 0.3`); bu fonksiyon o tuzağı görünür kılar.
 *
 * Sonlu olmayan girdide `false` döner (`NaN` hiçbir şeye eşit değildir) ve
 * negatif tolerans da `false` üretir. Bunlar için AYRI bir koruma yoktur:
 * `abs()` asla negatif olmaz ve `NaN <= x` zaten `false`'tur, dolayısıyla
 * karşılaştırmanın kendisi iki durumu da doğru ele alır. Ayrı koruma eklemek
 * ölü kod olurdu (AI-RULES §2.4) — mutasyon testi de bunu doğruladı.
 *
 * @example math.equals(0.1 + 0.2, 0.3, 0.0000001)  // true
 */
export function equals(a: number, b: number, tolerance = 0): boolean {
  return abs(sub(a, b)) <= tolerance;
}

/**
 * İki değer arasındaki DEĞİŞİM yüzdesi: ((yeni - eski) / eski) * 100.
 *
 * `percent(pay, payda)` ile karıştırmayın: o bir oranın yüzdesini verir,
 * bu ise iki ölçüm arasındaki değişimi verir.
 *
 * `previous <= 0` ise `null` döner — `percent` ile aynı kural. Negatif ya da
 * sıfır tabanda değişim yüzdesi matematiksel olarak yanıltıcıdır (işaret ters
 * döner) ve sessizce 0 üretmek "değişim yok" ile "hesaplanamadı"yı karıştırır.
 *
 * @example math.percentChange(150, 100)  // 50
 * @example math.percentChange(100, 0)    // null
 */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous <= 0) return null;

  const fark = sub(current, previous);
  const oran = div(fark, previous);
  if (oran === null) return null;
  return mul(oran, 100);
}
