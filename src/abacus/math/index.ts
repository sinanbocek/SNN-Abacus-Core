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

/** Bölme işlemi. **Bölen** 0 ise null döner (sessiz hata/varsayılan yok); `div(0, 5)` -> `0`. */
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

/**
 * Tavan / yukarı yuvarlama. `floor`'un simetriğidir: `ceil(x) === -floor(-x)`.
 *
 * Yuvarlamanın üç yönünden ikisi (`round`, `floor`) çekirdekteydi; bu üçüncüsü.
 * Onsuz tüketici ya ham `Math.ceil`e düşüyor ya da `-floor(-x)` hilesini yazıp
 * okuyanı düşündürüyordu.
 *
 * @example math.ceil(2.1)   // 3
 * @example math.ceil(-2.1)  // -2
 */
export function ceil(x: number): number {
  return new D(String(x)).ceil().toNumber();
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

/**
 * ONLUK logaritma (log₁₀). `x <= 0` veya geçersizse `null` döner — `log` ile
 * aynı kural.
 *
 * ⚠️ **`log(x) / log(10)` ile TAKLİT EDİLEMEZ.** `log` sonucunu `toNumber()`
 * ile float'a düşürür; hassasiyet orada kaybolur ve bölme onu geri getiremez.
 * Tam onluk kuvvetlerde sonuç bir epsilon aşağıda kalır:
 *
 *     div(log(1000), log(10))     -> 2.9999999999999996   → floor -> 2  ✘
 *     div(log(1000000), log(10))  -> 5.999999999999999    → floor -> 5  ✘
 *     log10(1000)                 -> 3                    → floor -> 3  ✔
 *
 * Bu, sessiz bir hatadır: büyüklük mertebesi bir basamak kayar ve ondan
 * türetilen grafik eksen adımı on kat yanlış olur. `decimal.js` 10 tabanını
 * doğrudan hesapladığı için burada o kayma yoktur.
 *
 * @example math.log10(1000)     // 3
 * @example math.log10(1700000)  // 6.230448921378274
 * @example math.log10(0)        // null
 */
export function log10(x: number): number | null {
  if (x <= 0 || !Number.isFinite(x)) return null;
  try {
    return new D(String(x)).log().toNumber();
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

  const delta = sub(current, previous);
  const changeRatio = div(delta, previous);
  if (changeRatio === null) return null;
  return mul(changeRatio, 100);
}

/**
 * `allocate` artık birim politikası. Şimdilik tek değer vardır.
 *
 * Seçenek bilinçli olarak ZORUNLUDUR ve varsayılanı yoktur: artığın hangi kaleme
 * bineceği bir tercihtir (GERI-BILDIRIM-KAYDI madde 9). Yeni bir politika
 * gerçek bir ihtiyaçla geldiğinde yalnız bu birleşime değer eklenir — MINOR.
 */
export type ResidualPolicy = 'largest-remainder';

/** `allocate` seçenekleri. */
export interface AllocateOptions {
  residual: ResidualPolicy;
}

/**
 * Sonlu, negatif olmayan bir sayıyı ONDALIK yazımıyla `mantissa × 10^-olcek`
 * olarak ayrıştırır. `String(n)` JS'in en kısa gidiş-dönüş yazımıdır: `0.1`
 * ikili yaklaşığıyla değil `"0.1"` olarak, `1e-7` ise `"1e-7"` olarak gelir.
 */
function splitDecimal(n: number): { mantissa: bigint; scale: number } {
  const m = /^(\d+)(?:\.(\d+))?(?:e([+-]\d+))?$/.exec(String(n));
  // Çağıran yalnız sonlu ve >= 0 değer verir; bu biçimin dışı oluşmaz.
  if (m === null) throw new Error(`ondalikParcala: beklenmeyen yazım ${String(n)}`);
  const fraction = m[2] ?? '';
  const exponent = m[3] === undefined ? 0 : Number(m[3]);
  const scale = fraction.length - exponent;
  const mantissa = BigInt((m[1] as string) + fraction);
  return scale >= 0
    ? { mantissa, scale }
    : { mantissa: mantissa * 10n ** BigInt(-scale), scale: 0 };
}

/**
 * Bir tam sayı havuzu ağırlıklara orantılı dağıtır; **sonuçların toplamı
 * havuza her zaman TAM eşittir.**
 *
 * Her payı ayrı yuvarlamak (`round(total * w / Σw)`) bu garantiyi vermez —
 * toplam 1–2 birim sapar ve hata sessizdir. Burada tam paylar tabana
 * yuvarlanır, eksik kalan birimler en büyük kesirli kalandan başlayarak birer
 * birer dağıtılır (en büyük kalan / Hamilton yöntemi). Eşit kalanda küçük
 * indis önceliklidir.
 *
 * **Hesap tam aritmetiktir (`BigInt`), yuvarlama yoktur.** Ağırlıklar ondalık
 * yazımlarıyla ortak bir `10^k` ile tam sayıya ölçeklenir; `q = T·W div S`,
 * `kalan = T·W mod S`. 20 basamaklı `Decimal` bölmesi büyük havuzlarda
 * (~10^15) artığı yanlış kaleme verebiliyordu — ölçüldü, bkz. fixture
 * `sapma-prec20-*`. Tam aritmetikte bu hassasiyet sınırı yoktur.
 *
 * - `total`: güvenli tam sayı (alt birim: kuruş/cent). Negatif olabilir; sonuç
 *   işaret-simetriktir: `allocate(-x, w) = allocate(x, w).map(v => -v)`.
 * - `weights`: sonlu ve `>= 0`. **Tam sayı olmak zorunda DEĞİLDİR** (m³, kg).
 *
 * Garantiler: `Σ sonuç === total` · uzunluk korunur · sıfır ağırlık sıfır pay
 * alır · `w[i] > w[j] → r[i] >= r[j]` (tek dağıtım içinde).
 *
 * ⚠️ **Havuz büyüdüğünde bir kalemin payı azalabilir** (Alabama paradoksu):
 * `allocate(40, [160, 4, 136, 17])` → `[20, 1, 17, 2]`, `allocate(41, …)` →
 * `[21, 0, 18, 2]`. Yöntemin bilinen özelliğidir, hata değildir. Monotonluk
 * garantisi tek dağıtım içindir; farklı havuz tutarları arasında yoktur.
 *
 * `null` döner: `total` güvenli tam sayı değilse · `weights` boşsa · bir ağırlık
 * sonlu değil ya da negatifse · tüm ağırlıklar sıfırsa · politika tanınmıyorsa.
 *
 * @example math.allocate(100000, [6080, 8160, 12080], { residual: 'largest-remainder' })
 * @example math.allocate(10, [1, 1, 1], { residual: 'largest-remainder' })  // [4, 3, 3]
 */
export function allocate(
  total: number,
  weights: readonly number[],
  opts: AllocateOptions,
): number[] | null {
  if (opts?.residual !== 'largest-remainder') return null;
  if (!Number.isSafeInteger(total)) return null;
  if (!weights.every((w) => Number.isFinite(w) && w >= 0)) return null;

  const parts = weights.map(splitDecimal);
  const k = parts.reduce((largest, p) => (p.scale > largest ? p.scale : largest), 0);
  const W = parts.map((p) => p.mantissa * 10n ** BigInt(k - p.scale));
  const S = W.reduce((a, b) => a + b, 0n);
  /*
   * TEK KAPI: boş dizi ve tümü sıfır ağırlık. Ayrı bir `weights.length === 0`
   * koruması BİLİNÇLİ olarak yoktur: boş dizide `S` zaten `0n`'dır. Mutasyon
   * testi o korumanın hiçbir testi kırmadığını gösterdi (AI-RULES §2.4).
   */
  if (S === 0n) return null;

  const T = BigInt(total < 0 ? -total : total);
  const shares = W.map((w) => (T * w) / S);
  const remainders = W.map((w) => (T * w) % S);
  const leftover = Number(T - shares.reduce((a, b) => a + b, 0n));

  /*
   * Artık < kalem sayısıdır (her kalan < S). Sıfır ağırlıklı kalemin kalanı 0'dır
   * ve pozitif kalanı olan kalemlerin sayısı artıktan az olamaz; dolayısıyla
   * sıfır ağırlık yapısal olarak artık almaz — ayrı bir koruma gerekmez.
   */
  const ranking = remainders
    .map((remainder, i) => ({ remainder, i }))
    .sort((a, b) => (a.remainder === b.remainder ? a.i - b.i : a.remainder > b.remainder ? -1 : 1));
  for (let j = 0; j < leftover; j++) {
    const targetIndex = (ranking[j] as { i: number }).i;
    shares[targetIndex] = (shares[targetIndex] as bigint) + 1n;
  }

  // `0 - v`: negatif havuzda sıfır pay `-0` olarak dönmesin.
  return shares.map((p) => (total < 0 ? 0 - Number(p) : Number(p)));
}

/**
 * Bugünkü net değer (NPV) — `irr`'in iç hesabı.
 *
 * DIŞA AÇILMAZ. Tüketici raporu #2 §1 bunu açıkça talep ETMEDİ ve
 * AI-RULES §4.1 Kural 3 gereği ("emin değilsen çekirdeğe alma") gerçek bir
 * ekranda ihtiyaç doğmadan genel API'ye ad eklenmez. Gerçek ihtiyaç geldiğinde
 * dışa açmak tek satırlık bir MINOR sürümdür.
 *
 * ÖNKOŞUL: `rate > -1`. `r = -1`'de (1+r)^t sıfırdır ve NPV tanımsız olur.
 * Bu önkoşulu ÇAĞIRAN sağlar: `irr` hem `guess`'i (`guess > -1`) hem de kök
 * arama adaylarını -1'in üstünde tutar, ikiye bölme de aralığın dışına çıkmaz.
 *
 * Burada ayrıca bir `rate <= -1` koruması YOKTUR: mutasyon testi o korumanın
 * hiçbir testi kırmadığını, yani ulaşılamaz olduğunu gösterdi (AI-RULES §2.4 —
 * kırmızı vermeyen koruma ölü koddur). Önkoşul değişirse bu not da değişmeli.
 */
function npvInternal(rate: number, cashFlows: readonly number[]): number | null {
  let sum = new D(0);
  for (let t = 0; t < cashFlows.length; t++) {
    const flow = cashFlows[t];
    // noUncheckedIndexedAccess gereği tip düzeyinde zorunlu; döngü sınırları
    // dizinin kendi uzunluğundan geldiği için çalışma zamanında oluşmaz.
    if (flow === undefined) return null;
    sum = sum.plus(new D(String(flow)).dividedBy(new D(String(1 + rate)).pow(t)));
  }
  const result = sum.toNumber();
  return Number.isFinite(result) ? result : null;
}

/** `irr` yakınsama eşiği: NPV bu değerin altına inince kök kabul edilir. */
const IRR_NPV_EPSILON = 1e-10;

/**
 * `irr` oran çözünürlüğü: aralık bu kadar daralınca kök kabul edilir.
 *
 * 1e-15 bilinçlidir. Finansal oranlar çok küçük olabilir — raporun üretim
 * vakasında aylık kök 7,7e-5'tir — ve gevşek bir eşik orada anlamlı
 * basamakları kaybettirir. Bisection bu çözünürlüğe ~50 adımda ulaşır,
 * iterasyon tavanının çok altında.
 */
const IRR_RATE_EPSILON = 1e-15;

/** `irr` iterasyon tavanı; aşılırsa yanlış sayı yerine null döner. */
const IRR_MAX_ITER = 200;

/** `irr` kök tarama tavanı: dönemsel %100.000'e kadar aranır. */
const IRR_MAX_RATE = 1000;

/**
 * İç verim oranı (Internal Rate of Return).
 *
 * Nakit akışı dizisini sıfır bugünkü değere eşitleyen DÖNEMSEL oranı bulur.
 * `cashFlows[0]` bugünkü (0. dönem) akıştır, `cashFlows[t]` t. dönem akışıdır.
 *
 * **İşaret sözleşmesi:** giren para pozitif, çıkan para negatif — ya da tersi.
 * Fonksiyon işaret yönünden bağımsızdır; yalnızca en az bir işaret değişimi arar.
 *
 * **Dönen değer dizinin dönem birimindedir:** aylık akış verilirse aylık oran
 * döner. Yıllığa çevirmek çağıranın işidir: `math.pow(1 + r, 12) - 1`.
 *
 * `null` döner:
 * - dizi 2'den az eleman içeriyorsa
 * - dizide işaret değişimi yoksa (çözüm tanımsız)
 * - sonlu olmayan değer varsa
 * - yakınsama sağlanamazsa (iterasyon sınırı)
 *
 * ⚠️ **Birden çok kök:** akış ikiden fazla işaret değiştiriyorsa (Descartes
 * işaret kuralı) denklemin birden çok gerçek kökü olabilir. Bu fonksiyon
 * **ilk bulduğu kökü** döner — standart yaklaşımdır. Böyle akışlarda IRR
 * anlamlı bir ölçüt değildir; MIRR gerekir ve o ayrı bir fonksiyondur.
 *
 * Yöntem: işaret değişimine dayalı ikiye bölme (bisection). Newton-Raphson
 * daha hızlıdır ama yatık akışlarda `-1` tekilliğine savrulabilir; bisection
 * kök aralığı bulunduğunda yakınsamayı GARANTİ eder ve finansal akış
 * uzunluklarında (yüzlerce dönem) ölçülebilir bir maliyeti yoktur.
 *
 * @example math.irr([1000, -600, -600])   // ≈ 0.130662
 * @example math.irr([1000, -500, -500])   // 0
 * @example math.irr([1000, 500])          // null (işaret değişimi yok)
 */
export function irr(cashFlows: readonly number[], guess?: number): number | null {
  let hasPositive = false;
  let hasNegative = false;
  for (const flow of cashFlows) {
    if (flow > 0) hasPositive = true;
    if (flow < 0) hasNegative = true;
  }

  /*
   * TEK KAPI: işaret değişimi yoksa NPV hiçbir oranda sıfırlanmaz; çözüm
   * tanımsızdır. Bu kontrol sözleşmenin ÜÇ maddesini birden karşılar ve
   * mutasyon testiyle ölçüldüğü doğrulandı (kaldırılınca `[0,0,0]` için
   * yanlışlıkla bir sayı dönüyor):
   *
   *  - 2'den az eleman: tek elemanlı ya da boş dizide işaret değişimi olamaz.
   *  - NaN / Infinity: `NaN > 0` ve `NaN < 0` ikisi de false olduğundan
   *    sonsuz/tanımsız değerler bayrak açtırmaz ve akış burada elenir.
   *  - Tümü aynı işaretli akış.
   *
   * Ayrı `length < 2` ve `Number.isFinite` korumaları BİLİNÇLİ olarak yoktur:
   * mutasyon testi ikisinin de hiçbir testi kırmadığını, yani ölü kod
   * olduklarını gösterdi (AI-RULES §2.4). `math.equals`'ta da aynı karar
   * verilmişti. Davranış sözleşmesi testlerle çivilidir; buraya bir koruma
   * eklemeden önce onu KIRMIZI yapan bir test yazın.
   */
  if (!hasPositive || !hasNegative) return null;

  // `guess` bir başlangıç ipucudur; geçerliyse önce onun etrafına bakılır.
  const hint = guess !== undefined && Number.isFinite(guess) && guess > -1 ? guess : 0.1;

  // Kökü içine alan bir aralık aranır. Alt sınır -1'e yaklaşır ama ona
  // DEĞMEZ: r = -1'de (1+r)^t sıfırdır ve NPV tanımsız olur.
  const candidates = [hint, 0, 0.1, -0.5, -0.9, -0.99, 1, 10, 100, IRR_MAX_RATE];
  let low: number | null = null;
  let high: number | null = null;
  let lowNpv = 0;
  let highNpv = 0;

  for (const r of candidates) {
    const value = npvInternal(r, cashFlows);
    if (value === null) continue;
    if (value === 0) return r;

    if (value > 0) {
      if (high === null || r < high) {
        high = r;
        highNpv = value;
      }
    } else if (low === null || r < low) {
      low = r;
      lowNpv = value;
    }
  }

  // Kök tarama aralığında kuşatılamadıysa (ör. dönemsel %100.000'in üstündeki
  // bir kök) yanlış bir sayı yerine null döner.
  if (low === null || high === null) return null;

  /*
   * Burada ayrıca bir "uçların işaretleri zıt mı" kontrolü YOKTUR: `alt` yalnız
   * NPV < 0 olan adaylardan, `ust` yalnız NPV > 0 olanlardan seçilir (NPV = 0
   * zaten yukarıda kökü döndürür), dolayısıyla zıtlık yapısal olarak garantidir.
   * Mutasyon testi de o kontrolün hiçbir testi kırmadığını gösterdi
   * (AI-RULES §2.4 — kırmızı vermeyen koruma ölü koddur).
   */
  let dusuk = low < high ? low : high;
  let yuksek = low < high ? high : low;
  let dusukNpv = low < high ? lowNpv : highNpv;

  for (let i = 0; i < IRR_MAX_ITER; i++) {
    const mid = add(dusuk, yuksek) / 2;
    const midNpv = npvInternal(mid, cashFlows);
    if (midNpv === null) return null;

    if (abs(midNpv) <= IRR_NPV_EPSILON || sub(yuksek, dusuk) <= IRR_RATE_EPSILON) {
      return mid;
    }

    if (midNpv * dusukNpv > 0) {
      dusuk = mid;
      dusukNpv = midNpv;
    } else {
      yuksek = mid;
    }
  }

  // Yakınsamadıysa yanlış bir sayı dönmektense boş dönülür.
  return null;
}
