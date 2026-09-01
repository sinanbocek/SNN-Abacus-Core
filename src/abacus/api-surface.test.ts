import { describe, expect, it } from 'vitest';
import * as abacus from './index';

/**
 * GENEL API YÜZEYİ KİLİDİ
 *
 * Tüketici projeler `#semver:^2.x` aralığıyla bağlandığı için MINOR sürümler
 * onlara OTOMATİK iner. Bu, çekirdeğe yeni bir borç yükler: yanlışlıkla kırıcı
 * bir değişikliği minor olarak çıkarmak, tüketici projeleri sessizce bozar.
 *
 * Bu test o riski makineye bağlar (AI-RULES §1: her kuralın bir zorlayıcısı olur).
 *
 * KURAL:
 *  - Listeden bir ad SİLİNİRSE veya YENİDEN ADLANDIRILIRSA test kırılır.
 *    Bu KIRICI bir değişikliktir; MAJOR sürüm gerektirir.
 *  - Listeye yeni ad EKLENİRSE test kırılır.
 *    Bu eklemeli bir değişikliktir; MINOR sürüm yeterlidir.
 *
 * Her iki durumda da aşağıdaki listeyi güncellemek BİLİNÇLİ bir adımdır ve
 * doğru sürüm sıçramasını seçmeye zorlar. Listeyi düşünmeden güncellemeyin.
 *
 * Not: Bu test yalnız ADLARI kilitler, davranışı değil. Davranışı
 * `docs-claims.test.ts` ve motor testleri korur.
 */

/** v2.5.0 itibarıyla dışa açık yüzey. Motor -> dışa açılan adlar. */
const API_SURFACE: Record<string, string[]> = {
  math: [
    'abs', 'add', 'div', 'equals', 'floor', 'log', 'max', 'mod', 'mul',
    'percent', 'percentChange', 'pow', 'ratio', 'round', 'sub',
  ],
  money: [
    'compact', 'compactMajor', 'decimal', 'fmtDecimalGrouped', 'format', 'formatGroupedInput',
    'formatMajor', 'formatMinorInput', 'knownCurrencyCodes', 'parse',
    'parseNumber', 'percent', 'ratio', 'toMinor', 'toWords',
  ],
  text: [
    'company', 'email', 'endsWithHardConsonant', 'endsWithVowel', 'isBackVowel',
    'isRoundedVowel', 'join', 'lastVowel', 'lower', 'name', 'numberToWords',
    'phone', 'searchKey', 'suffix', 'title', 'toAsciiLower', 'toTrLower', 'upper',
    'website',
    'websiteUrl', 'whatsapp',
  ],
  date: [
    'dayName', 'daysBetween', 'daysUntil', 'format', 'isAfter', 'isBefore',
    'isSameDay', 'monthName', 'parse', 'relative',
  ],
  currency: ['convert', 'cross'],
  validate: ['email', 'iban', 'ikn', 'tckn', 'vkn'],
  mask: ['iban', 'money', 'phone', 'vkn'],
  tradingMath: [
    'calculateThresholdDays', 'computePortfolioRatios', 'computeRiskReward',
    'leverage', 'qtyFromVolume', 'validateTradeDirections', 'volumeFromQty',
  ],
  gold: ['ONS_TO_GRAM', 'PURITY', 'ZIYNET_GRAM', 'gramGoldPrice', 'ziynetPrice'],
  silver: ['ONS_TO_GRAM', 'SILVER_PURITY', 'gramSilverPrice'],
  unit: ['ONS_TO_GRAM', 'categoryOf', 'convert', 'dataSize'],
  period: [
    'addDays', 'addMonths', 'endOfMonth', 'isBetween', 'monthsBetween',
    'quarterOf', 'quarterRange', 'startOfMonth',
  ],
  collate: ['compare', 'key', 'sortBy'],
};

/** Barrel üzerinden gerçekten dışa açılan adları toplar. */
function actualSurface(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [engine, mod] of Object.entries(abacus)) {
    out[engine] = Object.keys(mod as Record<string, unknown>).sort();
  }
  return out;
}

describe('GENEL API YÜZEYİ — sürüm disiplini kilidi', () => {
  it('barrel tam olarak beklenen motorları açar', () => {
    expect(Object.keys(abacus).sort()).toEqual(Object.keys(API_SURFACE).sort());
  });

  it('hiçbir ad SİLİNMEMİŞ veya yeniden adlandırılmamış (silme = MAJOR)', () => {
    const actual = actualSurface();
    const kayip: string[] = [];

    for (const [engine, names] of Object.entries(API_SURFACE)) {
      const now = actual[engine] ?? [];
      for (const n of names) {
        if (!now.includes(n)) kayip.push(`${engine}.${n}`);
      }
    }

    expect(kayip, `SİLİNEN ADLAR — bu KIRICI bir değişikliktir, MAJOR sürüm gerekir`).toEqual([]);
  });

  it('listede olmayan yeni ad EKLENMEMİŞ (ekleme = MINOR)', () => {
    const actual = actualSurface();
    const yeni: string[] = [];

    for (const [engine, names] of Object.entries(actual)) {
      const beklenen = API_SURFACE[engine] ?? [];
      for (const n of names) {
        if (!beklenen.includes(n)) yeni.push(`${engine}.${n}`);
      }
    }

    expect(yeni, `YENİ ADLAR — listeyi güncelleyin ve MINOR sürüm çıkarın`).toEqual([]);
  });

  it('her motorun yüzeyi birebir eşleşir', () => {
    const actual = actualSurface();
    for (const [engine, names] of Object.entries(API_SURFACE)) {
      expect(actual[engine], `motor: ${engine}`).toEqual([...names].sort());
    }
  });

  it('internal/ dışa açılmaz (dahili modüller genel API değildir)', () => {
    expect(Object.keys(abacus)).not.toContain('internal');
    for (const k of Object.keys(abacus)) {
      expect(k.startsWith('internal')).toBe(false);
    }
  });
});
