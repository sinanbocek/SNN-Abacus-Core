import { describe, expect, it } from 'vitest';
import { format } from './index';

/**
 * TB-004 — 2016 ÖNCESİ SAAT: BİLİNÇLİ KAPSAM SINIRI, HATA DEĞİL.
 *
 * Çekirdek sabit UTC+3 kullanır (`date/index.ts` ISTANBUL_OFFSET_MINUTES).
 * Türkiye 2016'dan beri kalıcı UTC+3 uyguluyor; öncesinde yaz saati vardı.
 * `Intl` ABACUS-SPEC §4.2 ile yasaklı olduğu için tarihsel saat dilimi
 * veritabanı çekirdeğe taşınmaz.
 *
 * Bu test sınırı ÇİVİLER: davranış kazara değişirse kırılır. Bir gün tarihsel
 * tablo eklenirse bu testin bilinçli olarak güncellenmesi gerekir.
 */
describe('date — İstanbul saat farkı kapsamı (TB-004)', () => {
  it('2016 SONRASI tarihlerde saat doğrudur', () => {
    // Türkiye kalıcı UTC+3: 12:00Z -> 15:00
    expect(format('2020-01-15T12:00:00Z', 'time')).toBe('15:00');
    expect(format('2020-07-15T12:00:00Z', 'time')).toBe('15:00');
    expect(format('2026-09-19T12:00:00Z', 'time')).toBe('15:00');
  });

  it('2016 ÖNCESİ KIŞ tarihlerinde saat BİR SAAT İLERİDİR — bilinen sınır', () => {
    // Ocak 2015'te Türkiye UTC+2'ydi; doğrusu 14:00. Çekirdek 15:00 verir.
    // Gizlenmiyor, çivileniyor.
    expect(format('2015-01-15T12:00:00Z', 'time')).toBe('15:00');
  });

  it('2016 ÖNCESİ YAZ tarihlerinde saat doğrudur (o dönem de UTC+3)', () => {
    // Temmuz 2015'te yaz saati yürürlükteydi: UTC+3. Çekirdek de 15:00 verir.
    expect(format('2015-07-15T12:00:00Z', 'time')).toBe('15:00');
  });

  it('TARİH (saat olmayan) biçimler 2016 öncesinde de doğrudur', () => {
    // Gün sınırına yakın olmayan saatlerde tarih kaymaz; asıl risk saat alanındadır.
    expect(format('2015-01-15T12:00:00Z', 'short')).toBe('15.01.2015');
    expect(format('2015-01-15T12:00:00Z', 'long')).toBe('15 Ocak 2015');
  });
});
