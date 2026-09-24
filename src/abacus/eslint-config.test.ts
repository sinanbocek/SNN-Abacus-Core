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

/** Verilen kaynağı İSTENEN yapılandırmayla denetler, mesajları döner. */
async function lintWith(
  config: unknown,
  source: string,
): Promise<ESLint.LintResult['messages']> {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config as never,
  });
  const results = await eslint.lintText(source, { filePath: 'tuketici-ornek.ts' });
  const first = results[0];
  return first === undefined ? [] : first.messages;
}

/** Yayınlanan `recommended` ile denetler — tüketiciye OTOMATİK inen sözleşme. */
const lint = (source: string): Promise<ESLint.LintResult['messages']> =>
  lintWith(abacusEslint.configs.recommended, source);

/** Opt-in `strict` ile denetler — tüketici isteyerek açar. */
const lintStrict = (source: string): Promise<ESLint.LintResult['messages']> =>
  lintWith(abacusEslint.configs.strict, source);

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

  // v3.5.1: `recommended` MAJOR hat içinde SABİT SÖZLEŞMEDİR. Sessiz varsayılan
  // kapısı v3.4.0'da oraya eklendi; v3.5.0 yayılınca bir tüketicinin CI'ı 92 hatayla
  // kırmızıya döndü — kendi kodlarına hiç dokunmadıkları hâlde. Kapı doğruydu,
  // YERİ yanlıştı. Aşağıdaki iki test o geri gidişi tutar.
  it('recommended sessiz varsayılan kapısını İÇERMEZ', async () => {
    for (const source of ['const a = deger ?? 0;', 'const b = GERI_GUN[kod] ?? 1;']) {
      expect(await lint(source), source).toHaveLength(0);
    }
  });

  it('strict, recommended kapılarının hepsini taşır (üst küme)', () => {
    const props = (c: { rules: Record<string, unknown[]> }) =>
      (c.rules['no-restricted-properties'] as unknown[]).length;
    const syntax = (c: { rules: Record<string, unknown[]> }) =>
      (c.rules['no-restricted-syntax'] as unknown[]).length;
    const rec = abacusEslint.configs.recommended[0];
    const str = abacusEslint.configs.strict[0];
    expect(props(str)).toBe(props(rec));
    expect(syntax(str)).toBeGreaterThan(syntax(rec));
  });

  // TB-005: kural bugüne dek yalnız INSTALL §6.2 şablonundaydı, pakette yoktu;
  // üstelik yalnız `0` literaline bakıyordu, `GERI_GUN[kod] ?? 1` kaçıyordu.
  it('strict: sıfır varsayılanı her yerde yakalanır', async () => {
    for (const source of ['const a = deger ?? 0;', 'const b = deger || 0;']) {
      const messages = await lintStrict(source);
      expect(messages, source).toHaveLength(1);
      expect(messages[0]?.message, source).toContain('Sessiz');
    }
  });

  it('strict: aranmış/hesaplanmış değere HERHANGİ bir sayı varsayılanı yakalanır', async () => {
    for (const source of [
      'const a = GERI_GUN[kod] ?? 1;',
      'const b = POW_2_MAP[10 - i] ?? 1;',
      'const c = toMinor(v) ?? 0;',
      'const d = hesapla() || 0;',
      'const e = liste[0] ?? -1;',
    ]) {
      const messages = await lintStrict(source);
      expect(messages, source).toHaveLength(1);
    }
  });

  it('strict: meşru seçenek varsayılanı yakalanmaz — yanlış alarm üretilmiyor', async () => {
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
      const messages = await lintStrict(source);
      expect(messages, source).toHaveLength(0);
    }
  });

  it('strict BİLİNEN SINIR: düz değişkene sıfır dışı sayı varsayılanı yakalanmaz', async () => {
    // Gizlenmiyor, belgeleniyor: sözdiziminden bunun aranmış bir sonuç mu yoksa
    // çağıranın atlayabileceği bir seçenek mi olduğu anlaşılmıyor.
    expect(await lintStrict('const a = deger ?? 1;')).toHaveLength(0);
  });

  // Madde 39F (talep #11, issue #47): GHS-Panel'in `1.234,56 ₺` biçimi çekirdekten
  // gelmiyordu; sayı çekirdekten alınıp sonuna elle ' ₺' ekleniyordu. Kaba desen
  // taraması aynı alışkanlığı başka tüketicilerde de gösterdi.
  it('strict: elle eklenen para simgesi ve TL yakalanır', async () => {
    for (const source of [
      "const a = tutar + ' ₺';",
      "const b = '₺' + tutar;",
      'const c = `${tutar} ₺`;',
      'const d = `₺${tutar}`;',
      "const e = tutar + ' TL';",
      'const f = `${tutar} TL`;',
      "const g = money.fmtDecimalGrouped(v, 2) + ' ₺';",
      "const h = 'Toplam: ₺' + tutar;",
    ]) {
      const messages = await lintStrict(source);
      expect(messages, source).toHaveLength(1);
      expect(messages[0]?.message, source).toContain('money.formatMajor');
    }
  });

  it('strict: para simgesi elle eklenmeyen yazımlar yakalanmaz', async () => {
    for (const source of [
      'const a = money.formatMajor(v, { kurus: true });',
      "const b = 'Tutar (TL)';",
      "const c = '₺';",
      'const d = `Toplam: ${money.formatMajor(v)}`;',
      "const e = baslik + ' (TL)';",
      'const f = `${adet} TLF kodu`;',
      'const g = `Tutar ₺ cinsinden`;',
      "const h = 'TL cinsinden: ' + tutar;",
    ]) {
      expect(await lintStrict(source), source).toHaveLength(0);
    }
  });

  it('recommended elle simge kapısını İÇERMEZ (madde 35: minor sürümde eklenmez)', async () => {
    expect(await lint("const a = tutar + ' ₺';")).toHaveLength(0);
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
