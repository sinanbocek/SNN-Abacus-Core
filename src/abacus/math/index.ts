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

  const fark = sub(current, previous);
  const oran = div(fark, previous);
  if (oran === null) return null;
  return mul(oran, 100);
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
  let toplam = new D(0);
  for (let t = 0; t < cashFlows.length; t++) {
    const akis = cashFlows[t];
    // noUncheckedIndexedAccess gereği tip düzeyinde zorunlu; döngü sınırları
    // dizinin kendi uzunluğundan geldiği için çalışma zamanında oluşmaz.
    if (akis === undefined) return null;
    toplam = toplam.plus(new D(String(akis)).dividedBy(new D(String(1 + rate)).pow(t)));
  }
  const sonuc = toplam.toNumber();
  return Number.isFinite(sonuc) ? sonuc : null;
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
  let pozitifVar = false;
  let negatifVar = false;
  for (const akis of cashFlows) {
    if (akis > 0) pozitifVar = true;
    if (akis < 0) negatifVar = true;
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
  if (!pozitifVar || !negatifVar) return null;

  // `guess` bir başlangıç ipucudur; geçerliyse önce onun etrafına bakılır.
  const ipucu = guess !== undefined && Number.isFinite(guess) && guess > -1 ? guess : 0.1;

  // Kökü içine alan bir aralık aranır. Alt sınır -1'e yaklaşır ama ona
  // DEĞMEZ: r = -1'de (1+r)^t sıfırdır ve NPV tanımsız olur.
  const aday = [ipucu, 0, 0.1, -0.5, -0.9, -0.99, 1, 10, 100, IRR_MAX_RATE];
  let alt: number | null = null;
  let ust: number | null = null;
  let altNpv = 0;
  let ustNpv = 0;

  for (const r of aday) {
    const deger = npvInternal(r, cashFlows);
    if (deger === null) continue;
    if (deger === 0) return r;

    if (deger > 0) {
      if (ust === null || r < ust) {
        ust = r;
        ustNpv = deger;
      }
    } else if (alt === null || r < alt) {
      alt = r;
      altNpv = deger;
    }
  }

  // Kök tarama aralığında kuşatılamadıysa (ör. dönemsel %100.000'in üstündeki
  // bir kök) yanlış bir sayı yerine null döner.
  if (alt === null || ust === null) return null;

  /*
   * Burada ayrıca bir "uçların işaretleri zıt mı" kontrolü YOKTUR: `alt` yalnız
   * NPV < 0 olan adaylardan, `ust` yalnız NPV > 0 olanlardan seçilir (NPV = 0
   * zaten yukarıda kökü döndürür), dolayısıyla zıtlık yapısal olarak garantidir.
   * Mutasyon testi de o kontrolün hiçbir testi kırmadığını gösterdi
   * (AI-RULES §2.4 — kırmızı vermeyen koruma ölü koddur).
   */
  let dusuk = alt < ust ? alt : ust;
  let yuksek = alt < ust ? ust : alt;
  let dusukNpv = alt < ust ? altNpv : ustNpv;

  for (let i = 0; i < IRR_MAX_ITER; i++) {
    const orta = add(dusuk, yuksek) / 2;
    const ortaNpv = npvInternal(orta, cashFlows);
    if (ortaNpv === null) return null;

    if (abs(ortaNpv) <= IRR_NPV_EPSILON || sub(yuksek, dusuk) <= IRR_RATE_EPSILON) {
      return orta;
    }

    if (ortaNpv * dusukNpv > 0) {
      dusuk = orta;
      dusukNpv = ortaNpv;
    } else {
      yuksek = orta;
    }
  }

  // Yakınsamadıysa yanlış bir sayı dönmektense boş dönülür.
  return null;
}
