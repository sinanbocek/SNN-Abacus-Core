/**
 * ABACUS dahili para ayrıştırma çekirdeği (yaprak modül — yalnız `math`'e bağlıdır).
 *
 * Genel (public) kapı `money.parse`'tır; bu modül dışa açık API değildir ve
 * barrel üzerinden export edilmez. `internal/money-format` ile simetriktir.
 */

import { mul, round } from '../math';
import { allSymbols, allTextCodes } from './currency-registry';

/**
 * AYNA KURALI
 * -----------
 * ABACUS **kendi ürettiği her şeyi** geri okuyabilmelidir; ne fazlasını, ne eksiğini.
 *
 * Kabul edilenler = `money.format`'ın ürettiği tüm biçimler:
 *   "₺23.232"  ·  "₺23.232,23"  ·  "-₺23.232"  ·  "(₺23.232)"
 *   "23.232 TL"  ·  "220,75 USD"  ·  "$220,75"  ·  "0"  ·  "0,00"
 *
 * Yerleşik tüm para birimlerinin simgesi (₺ $ € £) ve metin kodu
 * (TL USD EUR GBP) tanınır. Tanınmayan birim reddedilir.
 *
 * NOT: Ayrıştırma alt birim hanesini 2 kabul eder (kuruş). Yerleşik dört
 * birimin dördü de 2 hanelidir. Farklı haneli birimler (JPY 0, KWD 3)
 * `format` tarafından ÜRETİLEBİLİR ama `parse` tarafından okunamaz;
 * bu bilinçli bir kapsam sınırıdır ve testle çivilenmiştir.
 *
 * Ek olarak, KAPALI ve belgelenmiş bir hoşgörü listesi (kullanıcı yazarken
 * eksik bırakabilir):
 *   1. baştaki/sondaki boşluk
 *   2. simge veya para kodu hiç yazılmamış olabilir
 *   3. binlik ayraç hiç yazılmamış olabilir
 *   4. tek ondalık hane yazılmış olabilir (",5" = 50 kuruş)
 *
 * Bu listenin DIŞINDA kalan her şey reddedilir. Özellikle İngilizce biçim
 * ("1,234.56") reddedilir — çünkü ABACUS onu üretmez.
 */

/** Türkçe biçimli para metnini kuruşa çevirir; çözümlenemezse null. */
export function parseMoney(text: string | null | undefined): number | null {
  if (text === null || text === undefined || typeof text !== 'string') return null;

  let s = text.trim();
  if (s === '') return null;

  // 1) Negatif işareti: baştaki '-' veya parantez sarmalı
  let negative = false;
  if (s.startsWith('(') && s.endsWith(')')) {
    negative = true;
    s = s.slice(1, -1).trim();
  }
  if (s.startsWith('-')) {
    negative = true;
    s = s.slice(1).trim();
  }
  // Parantez içinde de eksi olabilir: "(-₺5)"
  if (s.startsWith('-')) return null;

  // 2) Para simgesi / kodu: yalnız ABACUS'un ürettikleri kabul edilir
  s = stripCurrency(s).trim();
  if (s === '') return null;

  // 3) Sayı gövdesi doğrulanır (Türkçe biçim: '.' binlik, ',' ondalık)
  const parts = s.split(',');
  if (parts.length > 2) return null;

  const intPart = parts[0];
  const decPart = parts.length === 2 ? (parts[1] ?? '') : '';
  if (intPart === undefined) return null;
  if (!isValidIntegerPart(intPart)) return null;
  if (parts.length === 2 && !/^\d{1,2}$/.test(decPart)) return null;

  const digits = intPart.replace(/\./g, '');
  if (digits === '') return null;

  // 4) Kuruşa çevir. `lira` güvenli tam sayı olduğu için `lira * 100` de
  // kesin olurdu; `mul` bir koruma DEĞİL, ABACUS-SPEC §0.2 kural uyumudur
  // ("tüm aritmetik math motoru üzerinden"). Mutasyon testi bu ikisini
  // ayırt edemez; beklenen budur.
  const lira = Number(digits);
  if (!Number.isSafeInteger(lira)) return null;

  const kurusFromLira = mul(lira, 100);
  const kurusPart = decPart === '' ? 0 : Number(decPart.padEnd(2, '0'));
  const total = round(kurusFromLira + kurusPart, 0);

  if (!Number.isSafeInteger(total)) return null;

  // -0 dondurmeyiz: para degerinde isaretli sifir anlamsizdir ve
  // tuketici tarafinda Object.is / toBe karsilastirmalarini sasirtir.
  if (total === 0) return 0;
  return negative ? -total : total;
}

/**
 * ABACUS'un ürettiği para simgesi / kodunu ayıklar.
 *
 * Yerleşik kayıt defterindeki tüm simge ve metin kodları tanınır.
 * Tanınmayan para birimi ("1.234,56 XYZ") için AYRI bir kontrol yoktur:
 * kod ayıklanmadığında geriye kalan metin sayı gövdesi doğrulamasına takılır
 * ve zaten reddedilir (AI-RULES §2.4: kırmızı vermeyen koruma ölü koddur).
 */
function stripCurrency(input: string): string {
  for (const sym of allSymbols()) {
    if (input.startsWith(sym)) return input.slice(sym.length);
  }
  for (const code of allTextCodes()) {
    const suffix = ` ${code}`;
    if (input.endsWith(suffix)) return input.slice(0, -suffix.length);
  }
  // Simge/kod yazılmamış (hoşgörü listesi md. 2)
  return input;
}

/**
 * Tam sayı kısmını doğrular.
 * Binlik ayraç varsa gruplar kusursuz olmalı: "1.234", "23.232", "1.234.567".
 * Ayraç yoksa düz rakam dizisi kabul edilir (hoşgörü listesi md. 3).
 */
function isValidIntegerPart(part: string): boolean {
  if (part === '') return false;
  if (!part.includes('.')) return /^\d+$/.test(part);
  return /^\d{1,3}(\.\d{3})+$/.test(part);
}
