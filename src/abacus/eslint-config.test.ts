import { describe, expect, it } from 'vitest';
import { ESLint } from 'eslint';
// @ts-expect-error — yayınlanan yapılandırma düz JS'tir, tip bildirimi yoktur.
import abacusEslint from '../../eslint/index.js';

/**
 * YAYINLANAN ESLint YAPILANDIRMASI — DAVRANIŞ TESTİ
 *
 * Tüketici raporu §5(a) karşılığı. Çekirdek artık `@snn/abacus-core/eslint`
 * altında paylaşılabilir bir yapılandırma yayınlıyor; bu test o kuralın
 * ŞEKLİNİ değil, GERÇEKTEN NE YAKALADIĞINI ölçer — ESLint programatik olarak
 * koşturulur ve çıkan uyarılar sayılır.
 *
 * AI-RULES §1: her kuralın bir zorlayıcısı olur. Bu, zorlayıcının kendisinin
 * zorlayıcısıdır — yapılandırma bozulursa veya kural adı değişirse kırılır.
 */

/** Verilen kaynağı yayınlanan yapılandırmayla denetler, mesajları döner. */
async function lint(source: string): Promise<ESLint.LintResult['messages']> {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: abacusEslint.configs.recommended,
  });
  const results = await eslint.lintText(source, { filePath: 'tuketici-ornek.ts' });
  const first = results[0];
  return first === undefined ? [] : first.messages;
}

describe('yayınlanan ESLint yapılandırması — alt birim kapıları (rapor §5a)', () => {
  it('money.format çağrısını YAKALAR', async () => {
    const messages = await lint('const etiket = money.format(1500);\n');
    expect(messages).toHaveLength(1);
    expect(messages[0]?.ruleId).toBe('no-restricted-properties');
    expect(messages[0]?.message).toContain('money.formatMajor');
  });

  it('money.compact çağrısını YAKALAR', async () => {
    const messages = await lint('const eksen = money.compact(1500);\n');
    expect(messages).toHaveLength(1);
    expect(messages[0]?.message).toContain('money.compactMajor');
  });

  it('ana birim ikizlerini RAHAT BIRAKIR', async () => {
    const messages = await lint(
      'const a = money.formatMajor(1500);\nconst b = money.compactMajor(1500);\n'
    );
    expect(messages).toHaveLength(0);
  });

  it('money motorunun diğer fonksiyonlarına karışmaz', async () => {
    const messages = await lint(
      [
        'const a = money.percent(-3.2, 1, { sign: "never" });',
        'const b = money.parse("₺1.234,56");',
        'const c = money.toMinor(1234.56);',
        'const d = money.toWords(150000);',
        '',
      ].join('\n')
    );
    expect(messages).toHaveLength(0);
  });

  it('BAŞKA bir nesnenin format çağrısına karışmaz', async () => {
    const messages = await lint('const t = date.format("2026-09-01", "long");\n');
    expect(messages).toHaveLength(0);
  });

  it('bilinçli alt birim kullanımı eslint-disable ile geçilebilir', async () => {
    const messages = await lint(
      [
        '// eslint-disable-next-line no-restricted-properties -- tutar kuruş cinsinden',
        'const etiket = money.format(satir.tutar_kurus);',
        '',
      ].join('\n')
    );
    expect(messages).toHaveLength(0);
  });

  // TB-005: kural bugüne dek yalnız INSTALL §6.2 şablonundaydı, pakette yoktu;
  // üstelik yalnız `0` literaline bakıyordu, `GERI_GUN[kod] ?? 1` kaçıyordu.
  it('sıfır varsayılanı her yerde yakalanır (eski davranış korunur)', async () => {
    for (const source of ['const a = deger ?? 0;', 'const b = deger || 0;']) {
      const messages = await lint(source);
      expect(messages, source).toHaveLength(1);
      expect(messages[0]?.message, source).toContain('Sessiz');
    }
  });

  it('aranmış/hesaplanmış değere HERHANGİ bir sayı varsayılanı yakalanır', async () => {
    for (const source of [
      'const a = GERI_GUN[kod] ?? 1;',
      'const b = POW_2_MAP[10 - i] ?? 1;',
      'const c = toMinor(v) ?? 0;',
      'const d = hesapla() || 0;',
      'const e = liste[0] ?? -1;',
    ]) {
      const messages = await lint(source);
      expect(messages, source).toHaveLength(1);
    }
  });

  it('meşru seçenek varsayılanı yakalanmaz — yanlış alarm üretilmiyor', async () => {
    // Ölçüm: "her sayıyı yakala" denendi ve çekirdeğin KENDİ kodunda patladı
    // (`opts?.digits ?? 1`, unit/index.ts:112). Bu testler o geri gidişi tutar.
    for (const source of [
      'const a = opts?.digits ?? 1;',
      'const b = options.digits ?? 2;',
      "const c = deger ?? 'yok';",
      'const d = deger ?? null;',
      'const e = deger ?? [];',
      'const f = deger ?? digerDeger;',
    ]) {
      const messages = await lint(source);
      expect(messages, source).toHaveLength(0);
    }
  });

  it('BİLİNEN SINIR: düz değişkene sıfır dışı sayı varsayılanı yakalanmaz', async () => {
    // Gizlenmiyor, belgeleniyor: sözdiziminden bunun aranmış bir sonuç mu yoksa
    // çağıranın atlayabileceği bir seçenek mi olduğu anlaşılmıyor.
    expect(await lint('const a = deger ?? 1;')).toHaveLength(0);
  });

  it('yapılandırma düz bir ESLint flat-config dizisidir', () => {
    expect(Array.isArray(abacusEslint.configs.recommended)).toBe(true);
    expect(abacusEslint.configs.recommended).toHaveLength(1);
    expect(abacusEslint.minorUnitGates.map((g: { property: string }) => g.property)).toEqual([
      'format',
      'compact',
    ]);
  });
});
