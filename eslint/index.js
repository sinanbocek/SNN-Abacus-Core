/**
 * ABACUS ÇEKİRDEĞİNİN YAYINLADIĞI ESLint YAPILANDIRMASI
 *
 * Tüketici raporu §5 (SNN Portföy Yönetimi, 1 Eylül 2026) karşılığı.
 *
 * SORUN: `money.format` ALT birim (kuruş), `money.formatMajor` ANA birim
 * (lira) okur. Bir geliştirici — veya bir AI asistanı — doğal olarak önce
 * `money.format`'a uzanır. Tutarlar ana birimde saklanıyorsa sonuç 100 KAT
 * hatalı çıkar ve bu SESSİZ bir hatadır: ekranda makul görünen yanlış sayı.
 *
 *   money.formatMajor(1500)  ->  "₺1.500"
 *   money.format(1500)       ->  "₺15"     ← aynı sayı, 100 kat fark
 *
 * Bu yapılandırma o riski tüketicinin derleme hattına bağlar. Kırıcı bir
 * yeniden adlandırma (`formatMinor`/`formatMajor`) yerine seçilmiştir; o
 * değişiklik MAJOR sürüm ve tüm tüketicilerde göç demektir.
 *
 * KULLANIM — tüketicinin `eslint.config.js` dosyasında:
 *
 *   import abacus from '@snn/abacus-core/eslint';
 *
 *   export default [
 *     ...abacus.configs.recommended,
 *     // ... kendi yapılandırmanız
 *   ];
 *
 * Varsayılan kapsam: proje genelindeki ts / tsx / js / jsx dosyaları. Kapsamı
 * daraltmak için `files` alanını kendiniz verin:
 *
 *   { ...abacus.configs.recommended[0], files: ['src/ui/**'] }
 *
 * BİLİNÇLİ ALT BİRİM KULLANIMI kural dışı bırakılabilir — tutarları gerçekten
 * kuruş olarak tutan kod için doğru çağrı `money.format`'tır:
 *
 *   // eslint-disable-next-line no-restricted-properties -- tutar kuruş cinsinden
 *   const etiket = money.format(satir.tutar_kurus);
 *
 * NOT: Kural ADA bakar, TİPE değil. `money.format` yazan her çağrıyı işaretler;
 * `format` adını başka bir nesneden çağıran kod (ör. `tarih.format`) etkilenmez.
 */

/** Alt birim (kuruş) okuyan kapılar ve ana birim ikizleri. */
const MINOR_UNIT_GATES = [
  {
    object: 'money',
    property: 'format',
    message:
      "money.format ALT birim (kuruş) okur — 1500 girdisi '₺15' üretir. " +
      'Tutarınız ana birimdeyse (lira) money.formatMajor kullanın. ' +
      'Girdi gerçekten kuruşsa: eslint-disable-next-line ile bilinçli olarak geçin.',
  },
  {
    object: 'money',
    property: 'compact',
    message:
      "money.compact ALT birim (kuruş) okur — 1500 girdisi '₺15' üretir. " +
      'Tutarınız ana birimdeyse (lira) money.compactMajor kullanın (v2.5.0). ' +
      'Girdi gerçekten kuruşsa: eslint-disable-next-line ile bilinçli olarak geçin.',
  },
];

/**
 * ÇEKİRDEK DIŞI BİÇİMLEME VE HARF KAPILARI (v3.3.0, talep #7 madde F).
 *
 * Bu kapılar çekirdekte KARŞILIĞI OLDUĞU HÂLDE tüketicide yeniden yazılıyordu.
 * Ölçüm (2026-09-18, 6 proje + kopya depolar): rakam süzme kalıbı 63 geçiş /
 * 45 dosya; `FormattedInput.tsx` giriş kutusunu `Intl.NumberFormat` ile
 * kuruyordu. Kural ADA bakar, TİPE değil (madde 5a ile aynı sınır).
 *
 * `toUpperCase` neden HATA, uyarı değil: ham çağrı Türkçe metinde sessizce
 * YANLIŞ harf üretir ('irmak' -> 'IRMAK', doğrusu 'İRMAK'). Kod alanlarında
 * ise doğru çağrıdır; o durumda bilinçli geçiş beklenir:
 *
 *   // eslint-disable-next-line no-restricted-properties -- ASCII şasi numarası
 *
 * v3.3.0'dan sonra o satır bile gerekmez: kod alanı için `text.toAsciiUpper`.
 */
const FORMAT_GATES = [
  {
    property: 'toLocaleString',
    message:
      'Ham toLocaleString yasak (ABACUS-SPEC §4.2). Para için money.formatMajor/format, ' +
      'tarih için date.format, giriş kutusu için money.formatGroupedInput kullanın.',
  },
  {
    property: 'toFixed',
    message:
      'Ham toFixed yasak (ABACUS-SPEC §4.4). math.round / money.fmtDecimalGrouped kullanın.',
  },
  {
    property: 'toUpperCase',
    message:
      'Ham toUpperCase Türkçe metinde YANLIŞ harf üretir: "irmak" -> "IRMAK" (doğrusu "İRMAK"). ' +
      'Türkçe metin için text.upper, ASCII kod alanı için (şasi, ürün kodu, barkod) ' +
      'text.toAsciiUpper kullanın (v3.3.0).',
  },
  {
    property: 'toLowerCase',
    message:
      'Ham toLowerCase Türkçe metinde YANLIŞ harf üretir: "IRMAK" -> "irmak" (doğrusu "ırmak"). ' +
      'Türkçe metin için text.lower/toTrLower, e-posta ve web adresi için text.toAsciiLower kullanın.',
  },
];

/**
 * `new Intl.NumberFormat(...)` / `Intl.DateTimeFormat(...)` çağrılarını yakalar.
 * Çekirdek Intl'siz çalışır; tüketicide Intl kullanmak iki farklı yazım demektir
 * (ölçüm: SNN-Portfoy-Yonetimi/src/NewApp/components/FormattedInput.tsx).
 */
const INTL_GATE = {
  selector: "MemberExpression[object.name='Intl']",
  message:
    'Ham Intl yasak (ABACUS-SPEC §4.2). Sayı ve para için money motoru, tarih için date motoru, ' +
    'giriş kutusu için money.formatGroupedInput + money.parseNumber kullanın.',
};

/**
 * Sessiz sayısal varsayılan yasağı (ABACUS-SPEC §2.1).
 *
 * `null` bir cevaptır: "hesaplanamadı". Onu uydurma bir sayıyla değiştirmek hatayı
 * sessizce akıtır.
 *
 * TB-005: kural bugüne dek YALNIZ `INSTALL §6.2` ev kuralı şablonundaydı, yayımlanan
 * pakette yoktu; üstelik yalnız `0` literaline bakıyordu. Tüketicinin kırılgan bulduğu
 * `GERI_GUN[kod] ?? 1` satırı tam bu yüzden hiçbir kapıya takılmamıştı.
 *
 * İKİ AYRI KOL — ölçülerek belirlendi:
 *   1. `?? 0` / `|| 0` her yerde yasak (eski davranış, aynen korunuyor).
 *   2. ARANMIŞ ya da HESAPLANMIŞ bir değere HERHANGİ bir sayı varsayılanı yasak:
 *      çağrı sonucu (`toMinor(v) ?? 0`) veya tablo araması (`GERI_GUN[kod] ?? 1`).
 *
 * Neden ikinci kol dar tutuldu: "her sayıyı yakala" denendi ve çekirdeğin KENDİ
 * kodunda yanlış alarm verdi — `opts?.digits ?? 1` (unit/index.ts:112) meşru bir
 * seçenek varsayılanıdır, hata gizlemez. Aranmış değer ile çağıranın atlayabileceği
 * seçenek arasındaki ayrım budur.
 *
 * BİLİNEN SINIR: düz bir değişkene sıfır dışı sayı varsayılanı (`deger ?? 1`)
 * yakalanmaz. Sözdiziminden o değişkenin aranmış bir sonuç mu yoksa seçenek mi
 * olduğu anlaşılmıyor; yanlış alarm üretmemek için kapsam dışı bırakıldı.
 */
const NUMERIC_DEFAULT =
  '([right.type="Literal"][right.raw=/^[0-9]/], ' +
  '[right.type="UnaryExpression"][right.argument.type="Literal"][right.argument.raw=/^[0-9]/])';

const silentNumericDefault = (operator) => ({
  selector: [
    `LogicalExpression[operator="${operator}"][right.type="Literal"][right.value=0]`,
    `LogicalExpression[operator="${operator}"][left.type="CallExpression"]:matches${NUMERIC_DEFAULT}`,
    `LogicalExpression[operator="${operator}"][left.type="MemberExpression"][left.computed=true]:matches${NUMERIC_DEFAULT}`,
  ].join(', '),
  message:
    `Sessiz \`${operator} <sayı>\` varsayılanı yasaktır (ABACUS-SPEC §2.1). ` +
    'null durumunu açıkça ele alın; sayı uydurmak hatayı gizler.',
});

const SILENT_DEFAULT_GATES = [silentNumericDefault('||'), silentNumericDefault('??')];

/**
 * `recommended` — MAJOR HAT İÇİNDE SABİT SÖZLEŞME.
 *
 * Tüketiciler `#semver:^3.x` ile bağlanır; minor sürümler onlara OTOMATİK iner.
 * Bu yüzden `recommended`'a minor sürümde YENİ KAPI EKLENMEZ: eklenirse tüketicinin
 * hiçbir şey yapmadan CI'ı kırmızıya döner — `AI-RULES §4.0`'ın tarif ettiği sessiz
 * kırılmanın ta kendisi ("ölçüt niyet değil, tüketicinin gördüğü çıktıdır").
 *
 * ÖLÇÜLDÜ (2026-09-19): sessiz varsayılan kapısı v3.4.0'da `recommended`'a eklendi.
 * v3.5.0 yayılınca SNN-Proje-ve-Nakit-Akis'in CI'ı **92 hatayla** kırmızıya döndü —
 * kendi kodlarına dokunmadıkları hâlde. Kapı doğruydu, yeri yanlıştı.
 *
 * KURAL: yeni kapı önce `strict`e girer (tüketici isteyerek açar), `recommended`'a
 * ancak MAJOR sürümde taşınır.
 */
const recommended = [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-restricted-properties': ['error', ...MINOR_UNIT_GATES, ...FORMAT_GATES],
      'no-restricted-syntax': ['error', INTL_GATE],
    },
  },
];

/**
 * `strict` — `recommended` + henüz major hatta taşınmamış kapılar.
 *
 * Tüketici bunu **isteyerek** açar; hazır olmadan CI'ı kırılmaz. Bugün içerdiği
 * ek kapı: sessiz sayısal varsayılan yasağı (`?? 0`, `GERI_GUN[kod] ?? 1`).
 *
 * Kullanımı: `...abacusEslint.configs.strict` (recommended yerine).
 */
const strict = [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-restricted-properties': ['error', ...MINOR_UNIT_GATES, ...FORMAT_GATES],
      'no-restricted-syntax': ['error', INTL_GATE, ...SILENT_DEFAULT_GATES],
    },
  },
];

export default {
  configs: { recommended, strict },
  /** Kural nesnelerini kendi yapılandırmanızla birleştirmek isterseniz. */
  minorUnitGates: MINOR_UNIT_GATES,
  formatGates: FORMAT_GATES,
  intlGate: INTL_GATE,
  silentDefaultGates: SILENT_DEFAULT_GATES,
};

export { recommended, strict, MINOR_UNIT_GATES, FORMAT_GATES, INTL_GATE, SILENT_DEFAULT_GATES };
