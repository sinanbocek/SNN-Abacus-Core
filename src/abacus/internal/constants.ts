/**
 * ABACUS dahili sabitler (yaprak modül — hiçbir motoru import etmez).
 *
 * Aynı sabitin iki motorda ayrı ayrı tanımlanmasını (SSOT ihlali) önler.
 * `gold`, `silver` ve `unit` motorları bu tek kaynağı kullanır ve kendi
 * genel API'lerinde aynı adla yeniden dışa açar.
 */

/** 1 troy ons = 31.1034768 gram (LBMA/COMEX evrensel standardı). */
export const ONS_TO_GRAM = 31.1034768;
