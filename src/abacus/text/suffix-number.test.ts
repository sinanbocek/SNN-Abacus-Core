import { describe, expect, it } from 'vitest';
import { suffix } from './index';

/**
 * text.suffix — NEGATİF ve ONDALIKLI SAYILAR (v3.0.0, KIRICI).
 *
 * v2.x'teki HATA: ek, sayının Türkçe okunuşunun son kelimesine göre seçilir;
 * okunuş `numberToWords` ile üretilir. `numberToWords` negatif ve ondalıklı
 * sayılarda boş dize döndüğü için son kelime boş kalıyor ve ek rastgele
 * düşüyordu. Ondalıklı sayı ayrıca İngilizce noktayla yazılıyordu:
 *
 *   suffix(-2, 'percent', 'dat')   v2.x → "%-2'e"     (yanlış ek, eski işaret konumu)
 *   suffix(2.5, 'percent', 'dat')  v2.x → "%2.5'e"    (İngilizce ondalık)
 *
 * BEKLENEN DEĞERLERİN KAYNAĞI (AI-RULES §2 — dış otorite):
 * - TDK Yazım Kılavuzu, Kesme İşareti: sayılara getirilen ekler kesmeyle ayrılır,
 *   ondalıklı sayı virgülle yazılır ve ek okunuşa göre seçilir — örnek `7,65'lik`.
 * - TDK, Sayıların Yazılışı: kesirler virgülle ayrılır (`15,2` — "15 tam, onda 2").
 *   Ondalıklı sayının okunuşunun SON KELİMESİ kesir kısmının sayısıdır: `2,5` →
 *   "iki tam onda BEŞ" → beş-e. Negatif sayının okunuşu "eksi iki"dir → iki-ye.
 * - Yüzde işaretinin konumu `money.percent` 3.0.0 varsayılanıyla aynıdır (Unicode
 *   CLDR tr-TR, `-%4,3`); iki motor aynı sayıyı aynı yazar.
 */

describe('text.suffix — negatif sayılar (ek okunuşa göre)', () => {
  it('negatif sayıya doğru ek gelir', () => {
    expect(suffix(-2, 'number', 'dat')).toBe("-2'ye"); // eksi iki → ikiye
    expect(suffix(-3, 'number', 'dat')).toBe("-3'e"); // eksi üç → üçe
    expect(suffix(-4, 'number', 'loc')).toBe("-4'te"); // eksi dört → dörtte
    expect(suffix(-6, 'number', 'abl')).toBe("-6'dan"); // eksi altı → altıdan
  });

  it('negatif yüzde: işaret en başta, ek doğru', () => {
    expect(suffix(-2, 'percent', 'dat')).toBe("-%2'ye");
    expect(suffix(-4, 'percent', 'loc')).toBe("-%4'te");
  });

  it('negatif sayı iyelik ekiyle', () => {
    expect(suffix(-40, 'number', { iyelik: 'onların', hal: 'dat' })).toBe("-40'larına");
  });
});

describe('text.suffix — ondalıklı sayılar (virgül, ek kesir kısmına göre)', () => {
  it('virgülle yazılır ve ek kesir kısmının okunuşuna göre seçilir', () => {
    expect(suffix(2.5, 'number', 'dat')).toBe("2,5'e"); // onda beş → beşe
    expect(suffix(2.5, 'number', 'loc')).toBe("2,5'te"); // beşte
    expect(suffix(7.65, 'number', 'loc')).toBe("7,65'te"); // altmış beş → beşte
    expect(suffix(10.1, 'number', 'dat')).toBe("10,1'e"); // onda bir → bire
    expect(suffix(2.06, 'number', 'dat')).toBe("2,06'ya"); // yüzde altı → altıya
  });

  it('kesir kısmı tam kısmın ekini belirler — tam kısım değil', () => {
    // 2 → "ikiye" ama 2,4 → "dörde": son kelime "dört"
    expect(suffix(2, 'number', 'dat')).toBe("2'ye");
    expect(suffix(2.4, 'number', 'dat')).toBe("2,4'e");
  });

  it('ondalıklı yüzde', () => {
    expect(suffix(2.5, 'percent', 'dat')).toBe("%2,5'e");
    expect(suffix(0.5, 'percent', 'abl')).toBe("%0,5'ten");
  });

  it('negatif ondalıklı yüzde', () => {
    expect(suffix(-4.3, 'percent', 'loc')).toBe("-%4,3'te"); // onda üç → üçte
  });

  it('ondalıklı sayı iyelik ekiyle', () => {
    expect(suffix(2.5, 'percent', { iyelik: 'onun' })).toBe("%2,5'i");
  });
});

describe('text.suffix — tam ve pozitif sayılar DEĞİŞMEDİ (REGRESYON)', () => {
  it('v2.x çıktıları aynen korunur', () => {
    expect(suffix(2, 'percent', 'dat')).toBe("%2'ye");
    expect(suffix(2026, 'year', 'loc')).toBe("2026'da");
    expect(suffix(40, 'number', { iyelik: 'onların', hal: 'dat' })).toBe("40'larına");
    expect(suffix(150000, 'money', 'loc')).toBe("₺1.500'da");
    expect(suffix(0, 'number', 'dat')).toBe("0'a"); // sıfıra
  });

  it('negatif sıfır sıradan sıfırdır', () => {
    expect(suffix(-0, 'number', 'dat')).toBe("0'a");
  });
});
