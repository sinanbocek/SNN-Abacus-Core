/**
 * ABACUS dahili sabitler (yaprak modül — hiçbir motoru import etmez).
 *
 * Aynı sabitin iki motorda ayrı ayrı tanımlanmasını (SSOT ihlali) önler.
 * `gold`, `silver` ve `unit` motorları bu tek kaynağı kullanır ve kendi
 * genel API'lerinde aynı adla yeniden dışa açar.
 */

/** 1 troy ons = 31.1034768 gram (LBMA/COMEX evrensel standardı). */
export const ONS_TO_GRAM = 31.1034768;

/**
 * Türkiye'deki il sayısı — tescil plakasındaki il kodunun üst sınırı (01–81).
 *
 * VERİDİR, kalıcı sabit değildir: il kodları sıra esasına göre verilir ve yeni
 * bir il kurulursa bir sonraki numarayı alır (81 numara 1999'da Düzce ile
 * eklendi). Yeni il kurulduğunda bu değer artırılır ve MINOR sürüm çıkarılır —
 * geçerli plaka kümesi yalnızca GENİŞLER, hiçbir plaka geçersizleşmez.
 */
export const IL_SAYISI = 81;
