import { abs, div, floor, mod } from '../math';
import { formatMoney } from '../internal/money-format';
import { PROVINCE_COUNT } from '../internal/constants';
import { isEmailShaped } from '../internal/patterns';
import {
  foldChar,
  toAsciiLower as leafAsciiLower,
  toAsciiUpper as leafAsciiUpper,
  toTrLower as leafTrLower,
  toTrUpper,
} from '../internal/tr-case';

export interface NumberToWordsOptions {
  spaced?: boolean;
}

export type SuffixKind = 'number' | 'money' | 'percent' | 'year';
export type SuffixCase = 'loc' | 'dat' | 'abl' | 'acc' | 'gen';
export type Iyelik = 'benim' | 'senin' | 'onun' | 'bizim' | 'sizin' | 'onların';

export interface SuffixOptions {
  hal?: SuffixCase;
  iyelik?: Iyelik;
}

export type SuffixArg = SuffixCase | SuffixOptions;

export interface NormalizeResult {
  stored: string;
  display: string;
  raw: string;
  valid: boolean;
}

/**
 * Telefon numarası sınıfı (BTK Milli Numaralandırma Planı, ilk hane):
 *  - 'mobile'   : 5 ile başlar (cep telefonu)
 *  - 'landline' : 2, 3 veya 4 ile başlar (coğrafi numara / il alan kodu)
 *  - 'special'  : 8 veya 9 ile başlar (coğrafi olmayan; 850, 800 vb.)
 * Kaynak: https://www.btk.gov.tr/cografi-numaralar
 */
export type PhoneKind = 'mobile' | 'landline' | 'special';

export interface PhoneResult extends NormalizeResult {
  /** Geçerli numaralarda sınıf; geçersizde null. */
  kind: PhoneKind | null;
}

const ONES = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
const TENS = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
/**
 * Basamak ölçekleri (her adım 1000 kat).
 * Tavan Katrilyon'dur (10^15). Daha yukarısı JavaScript'in güvenli tam sayı
 * sınırının (Number.MAX_SAFE_INTEGER ~ 9.007 x 10^15) ötesinde kaldığı için
 * eklenmemiştir: orada sayının kendisi zaten kesin değildir, yazıya dökmek
 * yanlış bir kesinlik izlenimi verir.
 */
const SCALES = ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon', 'Katrilyon'];

const TR_VOWELS = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
const BACK_VOWELS = ['a', 'ı', 'o', 'u'];
const ROUNDED_VOWELS = ['o', 'ö', 'u', 'ü'];
const HARD_CONSONANTS = ['f', 's', 't', 'k', 'ç', 'ş', 'h', 'p'];



const LOWERCASE_EXCEPTIONS = new Set(['ve', 'ile', 'veya', 'ya', 'da', 'de']);
const PRESERVED_ABBREVIATIONS = new Set(['TYC', 'A.Ş.', 'Ltd.Şti.', 'San.', 'Tic.']);

const MULTI_WORD_COMPANY_MAP: Record<string, string> = {
  'anonim şirketi': 'A.Ş.',
  'limited şirketi': 'Ltd.Şti.',
  'ltd şti': 'Ltd.Şti.',
  'ltd. şti': 'Ltd.Şti.',
  'ltd. şti.': 'Ltd.Şti.',
};

const SINGLE_WORD_COMPANY_MAP: Record<string, string> = {
  'a.ş.': 'A.Ş.',
  'a.ş': 'A.Ş.',
  'aş': 'A.Ş.',
  'ltd.şti.': 'Ltd.Şti.',
  'ltd.şti': 'Ltd.Şti.',
  'san.': 'San.',
  'san': 'San.',
  'sanayi': 'San.',
  'tic.': 'Tic.',
  'tic': 'Tic.',
  'ticaret': 'Tic.',
  'ith.': 'İth.',
  'ithalat': 'İth.',
  'ihr.': 'İhr.',
  'ihracat': 'İhr.',
  'inş.': 'İnş.',
  'inşaat': 'İnş.',
  'paz.': 'Paz.',
  'pazarlama': 'Paz.',
  've': 've',
};

/**
 * ASCII harf küçültme yardımcısı (E-posta ve Web normalizasyonu için).
 * 'I' harfini Türkçe 'ı' yerine ASCII 'i' yapar.
 */
export const toAsciiLower = leafAsciiLower;

/**
 * ASCII harf BÜYÜTME — `toAsciiLower` işinin ikizi. Yalnız a-z aralığını
 * büyütür; Türkçe harflere dokunmaz.
 *
 * ⚠️ **Hangisini kullanmalıyım?** Türkçe METİN için `text.upper`
 * (`irmak` -> `İRMAK`). ASCII KOD alanları için bu iş: şasi ve motor numarası,
 * ürün kodu, barkod, IBAN öneki. `upper` bu alanlarda kodu BOZAR:
 * `upper('irmaksasi')` -> `'İRMAKSASİ'`, oysa doğrusu `'IRMAKSASI'`.
 *
 * @example toAsciiUpper('irmaksasi')  // 'IRMAKSASI'
 * @example toAsciiUpper('ağrı')       // 'AğRı' — Türkçe harf değişmez (bkz. upper)
 */
export const toAsciiUpper = leafAsciiUpper;


/**
 * Türkçe harf küçültme yardımcısı (Intl / ham toLowerCase kullanılmaz).
 * Harita öncelikli eşleme yapar; 'İ' -> 'i' ve 'I' -> 'ı' dönüşümlerinin ASCII dalına düşmesini engeller.
 */
export const toTrLower = leafTrLower;


/**
 * ARAMA ANAHTARI — metni aramada karşılaştırılabilir bir anahtara çevirir.
 *
 * `lower` Türkçe-doğrudur ama arama için katıdır: `lower('Ismail')` = "ısmail",
 * `lower('İsmail')` = "ismail" — ikisi eşleşmez ve kullanıcı aradığını bulamaz.
 * `searchKey` her ikisini de "ismail" yapar.
 *
 * Yapılanlar: Türkçe harfleri ASCII'ye katlar (ç→c, ğ→g, ı/i/I/İ→i, ö→o, ş→s,
 * ü→u, şapkalılar dâhil), ASCII küçültür, baştaki/sondaki boşluğu atar ve iç
 * boşlukları teke indirir.
 *
 * ⚠️ KAPSAM SINIRI (bilinçli): noktalama ve boşluklar SİLİNMEZ. Bu daha agresif
 * bir karardır ve uygulamaya aittir; çekirdek en az yıkıcı olanı yapar.
 * İhtiyaç duyan tüketici `searchKey(x).replace(/[^a-z0-9]/g, '')` ekleyebilir.
 *
 * ⚠️ `collate.key` ile KARIŞTIRILMAMALI: bu ARAMA anahtarıdır (ç ile c aynı
 * sayılır); `collate.key` SIRALAMA anahtarıdır (ç ile c ayrı harftir).
 *
 * @example text.searchKey('Çağrı Öztürk')  // "cagri ozturk"
 */
export function searchKey(value: string | null | undefined): string {
  if (!value) return '';

  let out = '';
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === undefined) continue;
    out += foldChar(ch);
  }

  return out.trim().replace(/\s+/g, ' ');
}

/** Türkçe harf küçültme motoru (toTrLower takma adı, ABACUS-SPEC §3.5-c) */
export const lower = toTrLower;

/**
 * Türkçe harf büyütme motoru (ABACUS-SPEC §3.5-c).
 * i->İ, ı->I dönüşümlerini özel harita ile yapar (ham toUpperCase kullanılmaz).
 */
export const upper = toTrUpper;


/**
 * Türkçe başlık harf biçimlendirme motoru (ABACUS-SPEC §3.5-c).
 * Kelimelerin ilk harflerini büyük, kalanlarını küçük yapar; istisna sözlüğü (ve/ile küçük, TYC/A.Ş. korunur) uygular.
 */
export function title(str: string): string {
  if (!str) return '';
  const words = str.split(' ');
  const resWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) {
      resWords.push('');
      continue;
    }

    // 1. Kısaltma kontrolü (eğer kelime orijinal haliyle ya da upper haliyle sözlükteyse)
    if (PRESERVED_ABBREVIATIONS.has(word)) {
      resWords.push(word);
      continue;
    }
    const upWord = upper(word);
    if (PRESERVED_ABBREVIATIONS.has(upWord)) {
      resWords.push(upWord);
      continue;
    }

    // 2. Bağlaç/edat kontrolü (ilk kelime DEĞİLSE ve küçük harf hali sözlükteyse)
    const lowWord = toTrLower(word);
    if (i > 0 && LOWERCASE_EXCEPTIONS.has(lowWord)) {
      resWords.push(lowWord);
      continue;
    }

    // 3. Normal Title Case: İlk harf upper, kalanlar lower
    const firstChar = word[0] ?? '';
    const rest = word.slice(1);
    resWords.push(`${upper(firstChar)}${toTrLower(rest)}`);
  }

  return resWords.join(' ');
}

/** Türkçe eleman birleştirme motoru (ABACUS-SPEC §3.5-e) */
export function join(items: string[]): string {
  if (!items) return '';
  const filtered = items.filter((item) => item != null && item.trim() !== '');
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return filtered[0] ?? '';
  if (filtered.length === 2) return `${filtered[0]} ve ${filtered[1]}`;

  const lastItem = filtered[filtered.length - 1];
  const previousItems = filtered.slice(0, filtered.length - 1);
  return `${previousItems.join(', ')} ve ${lastItem}`;
}

/**
 * Türkiye telefon numarası normalizasyonu (ABACUS-SPEC §3.5-e).
 *
 * BTK Milli Numaralandırma Planı'nın ilk-hane sınıflandırmasını uygular:
 *   1        -> kısa numara (desteklenmez, geçersiz)
 *   2, 3, 4  -> coğrafi numara / sabit hat  -> kind: 'landline'
 *   5        -> mobil                        -> kind: 'mobile'
 *   8, 9     -> coğrafi olmayan (850/800)    -> kind: 'special'
 * Kaynak: https://www.btk.gov.tr/cografi-numaralar
 *
 * Kabul edilen girdi biçimleri: 10 hane, 11 hane 0 önekli, 12 hane 90 önekli.
 * Ayraç / boşluk / parantez serbesttir.
 */
export function phone(raw: string): PhoneResult {
  if (!raw) return { stored: '', display: '', raw: raw ?? '', valid: false, kind: null };

  let digits = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch && ch >= '0' && ch <= '9') {
      digits += ch;
    }
  }

  let core = '';
  if (digits.length === 12 && digits.startsWith('90')) {
    core = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    core = digits.slice(1);
  } else if (digits.length === 10) {
    core = digits;
  }

  const kind = phoneKindOf(core);
  if (kind === null) {
    return { stored: '', display: '', raw, valid: false, kind: null };
  }

  const stored = `+90${core}`;
  const display = `+90 (${core.slice(0, 3)}) ${core.slice(3, 6)} ${core.slice(6, 8)} ${core.slice(8, 10)}`;
  return { stored, display, raw, valid: true, kind };
}

/** 10 haneli çekirdek numaranın BTK sınıfını döner; tahsissiz aralıkta null. */
function phoneKindOf(core: string): PhoneKind | null {
  if (core.length !== 10) return null;
  const first = core[0];
  if (first === '5') return 'mobile';
  if (first === '2' || first === '3' || first === '4') return 'landline';
  if (first === '8' || first === '9') return 'special';
  return null;
}

/** `plate` sonucu. `NormalizeResult`'a yeni kayıt işaretini ekler. */
export interface PlateResult extends NormalizeResult {
  /**
   * Girdi, tescili henüz yapılmamış bir aracı gösteren YENİ KAYIT biçimindeyse
   * (`34 YK` — il kodu + YK, rakam yok) `true`. Geçersiz girdide daima `false`.
   */
  yeniKayit: boolean;
}

/**
 * Plakada kullanılan 23 harf. Ç Ğ Ö Ş Ü ve Q W X kullanılmaz ve reddedilir;
 * Türkçe klavyenin I harfleri (i, ı, İ) `plate` içinde I'ya çevrilir.
 * Bu küme yönetmelikte yazılı değildir; fiilî uygulamadır (bkz. `plate`).
 */
const PLAKA_HARFLERI = 'ABCDEFGHIJKLMNOPRSTUVYZ';

/** Girdide yok sayılan ayraçlar — KAPALI liste; başka karakter girdiyi geçersiz kılar. */
const PLAKA_AYRACLARI = ' .-';

/** Yeni kayıt teamülünün harf grubu. */
const YENI_KAYIT_HARFLERI = 'YK';

/** Rakam grubunun kabul edilen uzunluk aralığı (bilinçli olarak gevşek). */
const PLAKA_RAKAM_EN_AZ = 2;
const PLAKA_RAKAM_EN_COK = 5;

/**
 * Türkiye tescil plakası normalizasyonu (v2.8.0).
 *
 * Girdiyi temizler, doğrular ve iki biçimde döner: `display` kullanıcıya
 * (`34 ABC 23`), `stored` saklamaya (`34ABC23`) — aynı plakanın farklı
 * yazımlarla iki kez kaydedilmemesi için.
 *
 *   plate('34.ABD.344')  // { display: '34 ABD 344', stored: '34ABD344', valid: true, ... }
 *   plate('34-acb-23')   // display '34 ACB 23'
 *   plate('6abc12')      // display '06 ABC 12' — tek haneli il koduna sıfır eklenir
 *   plate('34yk')        // display '34 YK', yeniKayit: true
 *   plate('82 AB 123')   // valid: false — il kodu yok
 *
 * **Kabul edilen:**
 * - İl kodu 01–81 (tek haneli yazılabilir). Katı.
 * - 1–3 harf, yalnız 23 plaka harfinden. Katı. Ç Ğ Ö Ş Ü ve Q W X reddedilir.
 * - 2–5 rakam. **Bilinçli olarak gevşek** — aşağıya bakın.
 * - Ayraç olarak yalnız boşluk, nokta, tire (kapalı liste).
 * - Küçük harf. Türkçe klavyenin I harfleri — `i`, `ı` ve `İ` — ASCII `I` olur.
 *
 * ⚠️ **HARF/RAKAM GRUPLARI YÖNETMELİKTE YAZILI DEĞİLDİR.** Karayolları Trafik
 * Yönetmeliği Madde 55, 4/11/2025 tarihli ve 33067 sayılı Resmî Gazete ile
 * kaldırıldı. Güncel dayanak (Araçların Satış, Devir ve Tescil Hizmetlerinin
 * Yürütülmesi Hakkında Yönetmelik, Madde 34) grupların İçişleri Bakanlığınca
 * belirleneceğini söyler, grupları listelemez. Bu yüzden kurallar fiilî
 * uygulamadan derlenmiştir ve rakam grubu gevşektir: Bakanlık yeni bir
 * kombinasyon açarsa gerçek plakalar reddedilmemelidir. Bedeli, fiilen
 * görülmeyen `34 A 12` gibi biçimlerin de geçmesidir.
 *
 * ⚠️ **Türkçe büyük harf kullanılmaz.** `text.upper('i')` → `İ` üretir ve İ
 * plakada yoktur. Türkçe klavyeden gelen `i`, `ı` ve (Caps Lock açıkken
 * yazılan) `İ` burada ASCII `I`'ya çevrilir; üçü de aynı `stored` değerini
 * verir. Diğer Türkçe harfler (Ç Ğ Ö Ş Ü) çevrilmez, reddedilir — plakada
 * karşılıkları yoktur ve C/G/O/S/U'ya indirmek başka bir plakayı gösterir.
 *
 * ⚠️ **YENİ KAYIT resmî bir plaka değildir.** Sigorta sektöründe tescili
 * yapılmamış sıfır araçlara poliçe kesilirken yazılan yazılı olmayan bir
 * teamüldür (`34 YK`, arkasında rakam yok). Çekirdek sahibinin kararıyla her
 * zaman kabul edilir ve `yeniKayit: true` ile işaretlenir; tüketici "plakası
 * çıktı mı?" sorusunu metni ayrıştırmadan bu bayraktan yanıtlar.
 * `34 YK 123` ise sıradan bir plakadır (`yeniKayit: false`).
 */
export function plate(raw: string): PlateResult {
  const invalid: PlateResult = {
    stored: '', display: '', raw: raw ?? '', valid: false, yeniKayit: false,
  };
  if (!raw) return invalid;

  let compacted = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i] as string;
    if (PLAKA_AYRACLARI.includes(ch)) continue;

    if (ch >= '0' && ch <= '9') {
      compacted += ch;
    } else if (ch === 'ı' || ch === 'İ') {
      // Türkçe klavyenin I harfleri: noktasız ı ve (Caps Lock açıkken i
      // tuşunun yazdığı) büyük İ, plakadaki I'dır. Küçük noktalı i özel dal
      // gerektirmez — aşağıdaki ASCII yolundan zaten I olur.
      compacted += 'I';
    } else if (ch >= 'a' && ch <= 'z') {
      // ASCII büyük harf. toUpperCase yasaktır (Türkçe yerelde i → İ olur).
      compacted += String.fromCharCode(ch.charCodeAt(0) - 32);
    } else if (ch >= 'A' && ch <= 'Z') {
      compacted += ch;
    } else {
      return invalid;
    }
  }

  const piece = compacted.match(/^(\d{1,2})([A-Z]{1,3})(\d*)$/);
  if (!piece) return invalid;

  const provinceCode = Number(piece[1]);
  const letters = piece[2] as string;
  const digitPart = piece[3] as string;

  if (provinceCode < 1 || provinceCode > PROVINCE_COUNT) return invalid;

  for (const letter of letters) {
    if (!PLAKA_HARFLERI.includes(letter)) return invalid;
  }

  const il = provinceCode < 10 ? `0${provinceCode}` : `${provinceCode}`;

  if (digitPart.length === 0) {
    if (letters !== YENI_KAYIT_HARFLERI) return invalid;
    return { stored: `${il}${letters}`, display: `${il} ${letters}`, raw, valid: true, yeniKayit: true };
  }

  if (digitPart.length < PLAKA_RAKAM_EN_AZ || digitPart.length > PLAKA_RAKAM_EN_COK) {
    return invalid;
  }

  return {
    stored: `${il}${letters}${digitPart}`,
    display: `${il} ${letters} ${digitPart}`,
    raw,
    valid: true,
    yeniKayit: false,
  };
}

/** WhatsApp direct link yardımcısı (ABACUS-SPEC §3.5-e) */
export function whatsapp(raw: string): string {
  const p = phone(raw);
  if (!p.valid || p.kind !== 'mobile') return '';
  return `https://wa.me/${p.stored.slice(1)}`;
}

/** E-posta adresi normalizasyonu (ABACUS-SPEC §3.5-e - validate.email SSOT kullanımı) */
export function email(raw: string): NormalizeResult {
  if (!raw) return { stored: '', display: '', raw: raw ?? '', valid: false };
  const clean = toAsciiLower(raw.trim());

  if (isEmailShaped(clean)) {
    return { stored: clean, display: clean, raw, valid: true };
  }

  return { stored: '', display: '', raw, valid: false };
}

/** Web sitesi adresi normalizasyonu (ABACUS-SPEC §3.5-e) */
export function website(raw: string): NormalizeResult {
  if (!raw) return { stored: '', display: '', raw: raw ?? '', valid: false };
  let clean = toAsciiLower(raw.trim());

  if (clean.startsWith('https://')) {
    clean = clean.slice(8);
  } else if (clean.startsWith('http://')) {
    clean = clean.slice(7);
  }

  if (clean.startsWith('www.')) {
    clean = clean.slice(4);
  }

  while (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }

  const dotIndex = clean.indexOf('.');
  if (dotIndex > 0 && dotIndex < clean.length - 1 && !clean.includes(' ')) {
    return { stored: clean, display: clean, raw, valid: true };
  }

  return { stored: '', display: '', raw, valid: false };
}

/** Web sitesi URL link yardımcısı (ABACUS-SPEC §3.5-e) */
export function websiteUrl(raw: string): string {
  const w = website(raw);
  if (!w.valid) return '';
  return `https://${w.stored}`;
}

/** Kişi adı normalizasyonu (ABACUS-SPEC §3.5-e) */
export function name(raw: string): NormalizeResult {
  if (!raw) return { stored: '', display: '', raw: raw ?? '', valid: false };

  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return { stored: '', display: '', raw, valid: false };

  const titled = title(cleaned);
  return { stored: titled, display: titled, raw, valid: true };
}

/** Firma unvanı normalizasyonu (ABACUS-SPEC §3.5-e) */
export function company(raw: string): NormalizeResult {
  if (!raw) return { stored: '', display: '', raw: raw ?? '', valid: false };

  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return { stored: '', display: '', raw, valid: false };

  const words = cleaned.split(' ');
  const resWords: string[] = [];

  let i = 0;
  while (i < words.length) {
    const currentWord = words[i];
    if (!currentWord) {
      i++;
      continue;
    }

    // Çok-kelimeli kısaltma kontrolü (2 kelime)
    if (i + 1 < words.length) {
      const nextWord = words[i + 1] ?? '';
      const pairKey = toTrLower(`${currentWord} ${nextWord}`);
      const multiMatch = MULTI_WORD_COMPANY_MAP[pairKey];
      if (multiMatch) {
        resWords.push(multiMatch);
        i += 2;
        continue;
      }
    }

    // Tek-kelimeli kısaltma kontrolü
    const singleKey = toTrLower(currentWord);
    const singleMatch = SINGLE_WORD_COMPANY_MAP[singleKey];
    if (singleMatch) {
      if (singleKey === 've') {
        resWords.push(resWords.length === 0 ? 'Ve' : 've');
      } else {
        resWords.push(singleMatch);
      }
      i++;
      continue;
    }

    // Normal kelime -> title casing
    resWords.push(title(currentWord));
    i++;
  }

  const resultStr = resWords.join(' ');
  return { stored: resultStr, display: resultStr, raw, valid: true };
}

/**
 * Sayıyı Türkçe yazıya çeviren çekirdek fonksiyon (ABACUS-SPEC §3.5).
 * "Bir" düşme kuralını uygular: 100 -> "Yüz", 1000 -> "Bin", ancak 1.000.000 -> "BirMilyon".
 */
export function numberToWords(n: number, opts?: NumberToWordsOptions): string {
  const spaced = opts?.spaced ?? false;
  const joinStr = spaced ? ' ' : '';

  // Negatif, ondalıklı, sonsuz, NaN veya güvenli tam sayı sınırı dışındaki
  // girdiler yazıya dökülemez. Sessizce yanlış üretmek yerine boş dize döner
  // (motorun mevcut "üretilemedi" sentineli).
  if (!Number.isSafeInteger(n) || n < 0) return '';

  if (n === 0) return 'Sıfır';

  let remaining = n;
  const groups: { value: number; scaleIndex: number }[] = [];
  let scaleIndex = 0;

  while (remaining > 0) {
    const groupVal = mod(remaining, 1000);
    if (groupVal === null) return '';
    if (groupVal > 0) {
      groups.push({ value: groupVal, scaleIndex });
    }
    const nextRemaining = div(remaining, 1000);
    if (nextRemaining === null) return '';
    remaining = floor(nextRemaining);
    scaleIndex++;

    // Ölçek tablosunun ötesine geçildiyse sessizce basamak düşürmek yerine dur.
    if (scaleIndex >= SCALES.length && remaining > 0) return '';
  }

  // Yüksek basamaktan düşüğe doğru işle
  const parts: string[] = [];

  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g) continue;
    const val = g.value;
    const sIndex = g.scaleIndex;

    const hundredsDiv = div(val, 100);
    const rem100 = mod(val, 100);
    if (hundredsDiv === null || rem100 === null) return '';
    const tensDiv = div(rem100, 10);
    const onesVal = mod(rem100, 10);
    if (tensDiv === null || onesVal === null) return '';
    const hundreds = floor(hundredsDiv);
    const tensVal = floor(tensDiv);

    const tokens: string[] = [];

    // Yüzler basamağı ("BirYüz" yerine "Yüz")
    if (hundreds > 0) {
      if (hundreds === 1) {
        tokens.push('Yüz');
      } else {
        const onesWord = ONES[hundreds];
        if (onesWord) tokens.push(onesWord, 'Yüz');
      }
    }

    // Onlar basamağı
    if (tensVal > 0) {
      const tensWord = TENS[tensVal];
      if (tensWord) tokens.push(tensWord);
    }

    // Birler basamağı
    if (onesVal > 0) {
      const onesWord = ONES[onesVal];
      if (onesWord) tokens.push(onesWord);
    }

    let groupText = tokens.join(joinStr);

    // Binler basamağında "BirBin" yerine "Bin" düşürme kuralı
    if (sIndex === 1 && val === 1) {
      groupText = 'Bin';
    } else if (sIndex > 0) {
      const scaleName = SCALES[sIndex];
      if (scaleName) {
        groupText = groupText ? `${groupText}${joinStr}${scaleName}` : scaleName;
      }
    }

    if (groupText) {
      parts.push(groupText);
    }
  }

  return parts.join(joinStr);
}

/** Kelimedeki son ünlüyü döner (a/e/ı/i/o/ö/u/ü). Bulunamazsa null. */
export function lastVowel(word: string): string | null {
  if (!word) return null;
  const lowerStr = toTrLower(word);
  for (let i = lowerStr.length - 1; i >= 0; i--) {
    const char = lowerStr[i];
    if (char && TR_VOWELS.includes(char)) {
      return char;
    }
  }
  return null;
}

/** Ünlünün kalın (a, ı, o, u) olup olmadığını kontrol eder. */
export function isBackVowel(vowel: string): boolean {
  if (!vowel) return false;
  const lowerStr = toTrLower(vowel);
  return BACK_VOWELS.includes(lowerStr);
}

/** Ünlünün yuvarlak (o, ö, u, ü) olup olmadığını kontrol eder. */
export function isRoundedVowel(vowel: string): boolean {
  if (!vowel) return false;
  const lowerStr = toTrLower(vowel);
  return ROUNDED_VOWELS.includes(lowerStr);
}

/** Dört yönlü küçük ünlü uyumu yardımcısı (a/ı -> ı, e/i -> i, o/u -> u, ö/ü -> ü) */
function getHarmonyVowel(lastV: string | null): 'ı' | 'i' | 'u' | 'ü' {
  if (!lastV) return 'ı';
  const back = isBackVowel(lastV);
  const rounded = isRoundedVowel(lastV);

  if (back && !rounded) return 'ı';
  if (!back && !rounded) return 'i';
  if (back && rounded) return 'u';
  return 'ü';
}

/** Kelimenin son harfinin sert ünsüz (f, s, t, k, ç, ş, h, p) olup olmadığını kontrol eder. */
export function endsWithHardConsonant(word: string): boolean {
  if (!word) return false;
  const lowerStr = toTrLower(word);
  const lastChar = lowerStr[lowerStr.length - 1];
  return lastChar ? HARD_CONSONANTS.includes(lastChar) : false;
}

/** Kelimenin son harfinin ünlü (a/e/ı/i/o/ö/u/ü) olup olmadığını kontrol eder. */
export function endsWithVowel(word: string): boolean {
  if (!word) return false;
  const lowerStr = toTrLower(word);
  const lastChar = lowerStr[lowerStr.length - 1];
  return lastChar ? TR_VOWELS.includes(lastChar) : false;
}

/**
 * ABACUS Türkçe ek çekim motoru (ABACUS-SPEC §3.5-a).
 * Ek, sayının veya para biriminin (lira) okunuşunun son sesine göre belirlenir.
 * İyelik ve hâl birleşiminde onun/onların kişileri için pronominal-n araya girer.
 * Kesme işareti (') daima eklenir.
 */
export function suffix(value: number, kind: SuffixKind, arg: SuffixArg): string {
  let formattedValue = '';
  let lastWord = '';

  if (kind === 'money') {
    formattedValue = formatMoney(value);
    lastWord = 'lira';
  } else {
    // Ek, sayının OKUNUŞUNUN son kelimesine göre seçilir (TDK: `7,65'lik`).
    // Negatif sayı "eksi iki" okunur → son kelime "iki". Ondalıklı sayı
    // "iki tam onda beş" okunur → son kelime kesir kısmının sayısı ("beş").
    // v2.x bunları numberToWords'e doğrudan veriyordu; o fonksiyon negatif ve
    // ondalıklı sayıda boş döndüğü için ek rastgele düşüyordu.
    const sign = value < 0 ? '-' : '';
    // `= ''` yalnız noUncheckedIndexedAccess içindir: split en az bir eleman döner.
    const [tamKisim = '', kesirKisim] = String(abs(value)).split('.');
    const written = kesirKisim === undefined ? tamKisim : `${tamKisim},${kesirKisim}`;
    const readPart = kesirKisim === undefined ? tamKisim : kesirKisim;

    switch (kind) {
      case 'year':
      case 'number':
        formattedValue = `${sign}${written}`;
        break;
      case 'percent':
        // Konum money.percent varsayılanıyla aynı (v3.0.0, CLDR tr-TR): -%4,3
        formattedValue = `${sign}%${written}`;
        break;
    }
    const wordsText = numberToWords(Number(readPart), { spaced: true });
    const words = wordsText.split(' ');
    lastWord = words[words.length - 1] ?? '';
  }

  const opts: SuffixOptions = typeof arg === 'string' ? { hal: arg } : arg;

  let posSuffix = '';
  if (opts.iyelik) {
    const lastV = lastVowel(lastWord);
    const hv = getHarmonyVowel(lastV);
    const back = isBackVowel(lastV ?? '');
    const vowelEnd = endsWithVowel(lastWord);

    switch (opts.iyelik) {
      case 'benim':
        posSuffix = vowelEnd ? 'm' : `${hv}m`;
        break;
      case 'senin':
        posSuffix = vowelEnd ? 'n' : `${hv}n`;
        break;
      case 'onun':
        posSuffix = vowelEnd ? `s${hv}` : hv;
        break;
      case 'bizim':
        posSuffix = vowelEnd ? `m${hv}z` : `${hv}m${hv}z`;
        break;
      case 'sizin':
        posSuffix = vowelEnd ? `n${hv}z` : `${hv}n${hv}z`;
        break;
      case 'onların':
        posSuffix = back ? 'ları' : 'leri';
        break;
    }
  }

  let caseSuffix = '';
  if (opts.hal) {
    if (opts.iyelik) {
      // Fonoloji iyeliğin son ünlüsüne göre çalışır.
      // Eğer posSuffix ünsüzden ibaretse (ör. ünlü bitişinde benim -> 'm', senin -> 'n'),
      // son ünlü kök kelimeden (lastWord) alınır.
      const posLastV = lastVowel(posSuffix) ?? lastVowel(lastWord);
      const posBack = isBackVowel(posLastV ?? '');
      const posHv = getHarmonyVowel(posLastV);
      const hasPronominalN = opts.iyelik === 'onun' || opts.iyelik === 'onların';
      const buffer = hasPronominalN ? 'n' : '';

      switch (opts.hal) {
        case 'loc':
          caseSuffix = `${buffer}${posBack ? 'da' : 'de'}`;
          break;
        case 'abl':
          caseSuffix = `${buffer}${posBack ? 'dan' : 'den'}`;
          break;
        case 'dat':
          caseSuffix = `${buffer}${posBack ? 'a' : 'e'}`;
          break;
        case 'acc':
          caseSuffix = `${buffer}${posHv}`;
          break;
        case 'gen':
          caseSuffix = `${buffer}${posHv}n`;
          break;
      }
    } else {
      // Yalnızca hal ekinde kök kelimeye göre çalışır
      const lastV = lastVowel(lastWord);
      const back = isBackVowel(lastV ?? '');
      const hard = endsWithHardConsonant(lastWord);
      const vowelEnd = endsWithVowel(lastWord);

      switch (opts.hal) {
        case 'loc':
          caseSuffix = hard ? (back ? 'ta' : 'te') : back ? 'da' : 'de';
          break;
        case 'abl':
          caseSuffix = hard ? (back ? 'tan' : 'ten') : back ? 'dan' : 'den';
          break;
        case 'dat':
          caseSuffix = vowelEnd ? (back ? 'ya' : 'ye') : back ? 'a' : 'e';
          break;
        case 'acc': {
          const hv = getHarmonyVowel(lastV);
          caseSuffix = vowelEnd ? `y${hv}` : hv;
          break;
        }
        case 'gen': {
          const hv = getHarmonyVowel(lastV);
          caseSuffix = vowelEnd ? `n${hv}n` : `${hv}n`;
          break;
        }
      }
    }
  }

  return `${formattedValue}'${posSuffix}${caseSuffix}`;
}

/**
 * GİRİŞ SÜZME — metinden yalnız rakamları bırakır, isteğe bağlı olarak keser.
 *
 * Kullanıcı kutuya yazarken CANLI süzme içindir: harf, boşluk ve simge kutuya
 * hiç girmez; hata "kaydet" anına kalmaz. Aynı iki satırlık kural tüketici
 * projelerde onlarca kez yeniden yazılıyordu (talep #7, kayıt madde 33).
 *
 * `maxLength` verilirse sonuç o uzunlukta kesilir. Geçersiz `maxLength`
 * (negatif, ondalıklı, güvenli tam sayı sınırı dışı) '—' döndürür —
 * sessizce yok sayılmaz (ABACUS-SPEC §0.5, madde 27 emsali). Burada
 * `gecerliHane` KULLANILMAZ: o sınır (20) ondalık hane içindir, alan uzunluğu
 * için değil — bir kod alanı 20 karakterden uzun olabilir.
 *
 * ⚠️ Yalnız RAKAM bırakır: eksi işareti, virgül ve nokta da silinir. Para
 * kutusu için `money.formatGroupedInput` (canlı biçim) ve `money.parseNumber`
 * (geri okuma) kullanılır.
 *
 * @example digits('2o0a7')        // '207'
 * @example digits('20267', 4)     // '2026'
 * @example digits('121212scca')   // '121212'
 */
export function digits(raw: string, maxLength?: number): string {
  if (maxLength !== undefined && (!Number.isSafeInteger(maxLength) || maxLength < 0)) {
    return '—';
  }
  if (!raw) return '';
  const onlyDigits = raw.replace(/[^0-9]/g, '');
  return maxLength === undefined ? onlyDigits : onlyDigits.slice(0, maxLength);
}

/**
 * Okunuşu iyelik ekiyle biten kısaltmalar.
 *
 * "A.Ş." okunuşu "Anonim Şirketi", "Şti." okunuşu "Şirketi"dir. Uyum HARFTEN
 * değil OKUNUŞTAN alınır: harflere bakılırsa son ünlü 'a' görünür (kalın) ve
 * `A.Ş.'ndan` çıkar; doğrusu `A.Ş.'nden`'dir.
 */
const READING_ENDS_WITH_POSSESSIVE = ['a.ş', 'aş', 'şti'];

/**
 * Üçüncü tekil iyelik eki taşıyan KURUM adı sonları: "İş Bankası", "Anonim Şirketi".
 * Bunlar hâl ekinden önce kaynaştırma 'n'si ister: `Bankası'nda`, `Şirketi'nden`.
 *
 * NEDEN DESEN DEĞİL DE LİSTE — ölçülerek karar verildi (2026-09-19):
 * Önce genel desen denendi (`/(sı|si|su|sü|…)$/`). O desen YER ADLARINI iyelik
 * sanıyor: `Gürsu` -> `Gürsu'nda` (doğrusu `Gürsu'da`), aynısı `Aksu`, `Karasu`.
 * Talebi gönderen tüketicinin 18 testi geçen uygulaması da tam bu kusuru
 * taşıyor; kod olduğu gibi taşınsaydı kusur da taşınacaktı.
 *
 * Ünsüzden sonraki iyelik `-I` biçimini genel kuralla ayırt etmek MÜMKÜN DEĞİLDİR
 * ("Hepiyi" de `-i` ile biter, iyelik değildir). Bu yüzden kesinlik tercih edildi:
 * yalnız kurum adı sonları sayılır. Liste bilinçli olarak eksiktir; eksik bir sonu
 * bildirmek için `GERI-BILDIRIM-KAYDI.md` yolu kullanılır.
 */
const POSSESSIVE_ENDINGS = [
  'bankası', 'şirketi', 'holdingi', 'ortaklığı', 'fabrikası', 'müdürlüğü',
  'başkanlığı', 'bakanlığı', 'kurumu', 'kurulu', 'birliği', 'derneği', 'vakfı',
  'hastanesi', 'üniversitesi', 'belediyesi', 'müzesi', 'idaresi', 'merkezi',
  'enstitüsü', 'mahallesi',
];

/** Hâl ekinden önce kaynaştırma 'n'si gerektiren durum. */
type BufferKind = 'abbreviation' | 'possessive' | null;

/**
 * Adın sonundaki sayının OKUNUŞUNUN son kelimesi; ad rakamla bitmiyorsa `null`.
 *
 * HATA DÜZELTMESİ (talep #13, issue #51): ek eskiden adın son HARFİNDEN alınıyordu
 * ve sondaki rakamlar atlanıyordu: `17 Şubat 2027'a`, `Madde 40'den`. TDK: sayıya
 * gelen ek okunuşa göre yazılır (`2027'ye`, `40'tan`). Kural `suffix` ile aynıdır:
 * binlik noktalı sayı bütün okunur (`1.000.000` -> "milyon"), ondalıkta kesir kısmı
 * okunur (`7,65` -> "altmış beş"). `Ek-6`'daki kısa çizgi eksi değildir; eksi
 * zaten okunuşun sonunu değiştirmez.
 */
function trailingNumberReading(stem: string): string | null {
  const match = /(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?$/.exec(stem);
  if (match === null) return null;
  const [, whole = '', fraction] = match;
  const readPart = fraction === undefined ? whole.replace(/\./g, '') : fraction;
  // numberToWords güvenli tam sayı sınırı dışında '' döner; o zaman harf kuralına düşülür.
  const words = numberToWords(Number(readPart), { spaced: true }).split(' ');
  const last = words[words.length - 1];
  return last ? last : null;
}

/**
 * Harf harf okunan kısaltmanın son harfinin OKUNUŞU; ad öyle bitmiyorsa `null` (TB-014).
 *
 * TDK: büyük harfli kısaltmaya ek son harfin okunuşuna göre gelir (`THY'de`, `TDK'den`,
 * `BDT'ye`); kelime gibi okunan kısaltmaya ise okunuşuna göre (`NATO'dan`, `AGİK'in`).
 * İkisi aynı biçimde yazılır ve metinden ayırt edilemez. Kesin olan tek durum ele alınır:
 * HİÇ ÜNLÜ İÇERMEYEN büyük harf dizisi kelime gibi okunamaz. Ünlü içeren ve harf harf
 * okunan kısaltma (`ABD`, doğrusu `ABD'ye`) bilinen sınırdır; çekirdek tahmin etmez.
 *
 * Adın sonundaki EN UZUN büyük harf dizisine bakılır. Büyük harfle yazılmış bir kelime
 * kendi ünlülerini de taşıdığı için (`SİGORTA`, `ASELSAN`) kısaltma sanılmaz.
 */
// Anahtarlar tanımlayıcı değil, harf VERİSİDİR; bu yüzden tırnak içinde.
const LETTER_NAMES: Readonly<Record<string, string>> = {
  'B': 'be', 'C': 'ce', 'Ç': 'çe', 'D': 'de', 'F': 'fe', 'G': 'ge', 'Ğ': 'ge', 'H': 'he',
  'J': 'je', 'K': 'ke', 'L': 'le', 'M': 'me', 'N': 'ne', 'P': 'pe', 'R': 're', 'S': 'se',
  'Ş': 'şe', 'T': 'te', 'V': 've', 'Y': 'ye', 'Z': 'ze',
  // Türkçe alfabede yok; fiilî okunuş (§4.1 Sınır durumu 4).
  'Q': 'kü', 'W': 've', 'X': 'iks',
};

function spelledLetterReading(stem: string): string | null {
  const letters = /[A-ZÇĞİÖŞÜ]+$/.exec(stem)?.[0];
  if (letters === undefined || /[AEIİOÖUÜ]/.test(letters)) return null;
  return LETTER_NAMES[letters.slice(-1)] ?? null;
}

/**
 * Okunuşu iyelik ekiyle biten kısaltma AYRI KELİME olarak mı duruyor?
 *
 * HATA DÜZELTMESİ (TB-014 çalışılırken ölçüldü): eskiden yalnız adın SONUNA bakılıyordu;
 * noktasız `aş` yazımı yüzünden "-aş" ile biten her ad şirket kısaltması sanılıyordu:
 * `Ahmet Kocataş'ne` (doğrusu `Kocataş'a`), `BOTAŞ'nin`. Artık kısaltmadan önce baş,
 * boşluk ya da nokta gelmelidir: `Koç AŞ`, `Sigorta A.Ş.`, `Ltd.Şti.`.
 */
function endsWithStandaloneAbbreviation(folded: string): boolean {
  return READING_ENDS_WITH_POSSESSIVE.some(
    (abbr) => folded === abbr || folded.endsWith(` ${abbr}`) || folded.endsWith(`.${abbr}`)
  );
}

function bufferKindOf(trimmed: string): BufferKind {
  const folded = toTrLower(trimmed).replace(/[\s.]+$/, '');
  if (endsWithStandaloneAbbreviation(folded)) return 'abbreviation';
  if (POSSESSIVE_ENDINGS.some((ending) => folded.endsWith(ending))) return 'possessive';
  return null;
}

/**
 * ÖZEL ADA HÂL EKİ (ABACUS-SPEC §3.5-b).
 *
 * `suffix` eki SAYININ okunuşundan türetir; bu işlev KELİMENİN kendisinden
 * türetir ve adın **ekli hâlini** döner — ekin kendisini değil.
 *
 * TDK kuralı gereği özel adda kesme işareti daima konur.
 *
 * Üç tuzak testle çivilenmiştir:
 *   - `A.Ş.` uyumu OKUNUŞA bakar (ince): `A.Ş.'nden`, `A.Ş.'ndan` değil.
 *   - İyelik ekiyle biten ad kaynaştırma 'n'si ister: `Bankası'nda`.
 *   - İyelik `-I` biçimi `-sI` kalıbına uymaz: `Şirketi'nden`.
 *
 * Geçersiz girdide (boş ya da yalnız noktalama) `'—'` döner (madde 27 emsali).
 *
 * @example properNounSuffix('VakıfBank', 'loc')      // "VakıfBank'ta"
 * @example properNounSuffix('A.Ş.', 'abl')           // "A.Ş.'nden"
 * @example properNounSuffix('Ziraat Bankası', 'loc') // "Ziraat Bankası'nda"
 */
export function properNounSuffix(name: string, kind: SuffixCase): string {
  if (typeof name !== 'string') return '—';
  const trimmed = name.trim();
  if (!trimmed) return '—';

  // Ses çözümlemesi için sondaki nokta/boşluk atılır; çıktıda ad AYNEN kalır.
  const stem = trimmed.replace(/[\s.]+$/, '');
  if (!stem) return '—';

  const buffer = bufferKindOf(trimmed);
  // Ad rakamla ya da ünlüsüz bir kısaltmayla bitiyorsa ses çözümlemesi yazılan
  // harflere değil OKUNUŞA bakar: `2027` -> "yedi", `THY` -> "ye".
  const sound = trailingNumberReading(stem) ?? spelledLetterReading(stem) ?? stem;

  // Kısaltmada harfler yanıltır; okunuş ince bittiği için 'i' kabul edilir.
  const harmonySource = buffer === 'abbreviation' ? 'i' : (lastVowel(sound) ?? 'a');
  const back = isBackVowel(harmonySource);
  const wide = back ? 'a' : 'e';
  const narrow = getHarmonyVowel(harmonySource);

  const n = buffer ? 'n' : '';
  // Kaynaştırma 'n'sinden sonra ünsüz benzeşmesi olmaz: 'n' yumuşaktır, d kalır.
  const d = buffer ? 'd' : endsWithHardConsonant(sound) ? 't' : 'd';
  const vowelEnd = endsWithVowel(sound);

  switch (kind) {
    case 'loc':
      return `${trimmed}'${n}${d}${wide}`;
    case 'abl':
      return `${trimmed}'${n}${d}${wide}n`;
    case 'dat':
      return `${trimmed}'${buffer ? 'n' : vowelEnd ? 'y' : ''}${wide}`;
    case 'gen':
      return `${trimmed}'${buffer || vowelEnd ? 'n' : ''}${narrow}n`;
    case 'acc':
      return `${trimmed}'${buffer ? 'n' : vowelEnd ? 'y' : ''}${narrow}`;
    default:
      return '—';
  }
}
