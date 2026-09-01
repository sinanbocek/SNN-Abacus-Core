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

/** ABACUS'un tüketiciye önerdiği kural kümesi. */
const recommended = [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-restricted-properties': ['error', ...MINOR_UNIT_GATES],
    },
  },
];

export default {
  configs: { recommended },
  /** Kural nesnelerini kendi yapılandırmanızla birleştirmek isterseniz. */
  minorUnitGates: MINOR_UNIT_GATES,
};

export { recommended, MINOR_UNIT_GATES };
