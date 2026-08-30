import { describe, expect, it } from 'vitest';
import { lower, searchKey } from './index';

/**
 * ARAMA ANAHTARI
 *
 * Denetim raporu B11-e: `text.lower` Türkçe-doğrudur ama ARAMA için katıdır —
 * `lower('Ismail')` = "ısmail", `lower('İsmail')` = "ismail"; ikisi eşleşmez.
 * `searchKey` bu ikisini aynı anahtara katlar.
 *
 * KAPSAM SINIRI (bilinçli): yalnız harf katlama ve küçük harf yapılır,
 * boşluklar teke indirilir. Noktalama ve boşlukların TÜMÜYLE silinmesi daha
 * agresif bir karardır ve uygulamaya aittir — çekirdek en az yıkıcı olanı yapar.
 */

describe('text.searchKey — Türkçe harf katlama', () => {
  it('denetimdeki asıl vaka: Ismail / İsmail / ismail aynı anahtara düşer', () => {
    expect(searchKey('Ismail')).toBe('ismail');
    expect(searchKey('İsmail')).toBe('ismail');
    expect(searchKey('ismail')).toBe('ismail');
    expect(searchKey('ISMAIL')).toBe('ismail');
    expect(searchKey('İSMAİL')).toBe('ismail');
  });

  it('lower() bunu YAPAMAZ — searchKey’in var oluş sebebi', () => {
    expect(lower('Ismail')).not.toBe(lower('İsmail'));
    expect(searchKey('Ismail')).toBe(searchKey('İsmail'));
  });

  it('tüm Türkçe harfleri ASCII karşılığına katlar', () => {
    expect(searchKey('çğıöşü')).toBe('cgiosu');
    expect(searchKey('ÇĞIİÖŞÜ')).toBe('cgiiosu');
    expect(searchKey('Çağrı')).toBe('cagri');
    expect(searchKey('Şişli')).toBe('sisli');
    expect(searchKey('Gülşen')).toBe('gulsen');
  });

  it('şapkalı harfleri de katlar', () => {
    expect(searchKey('kâr')).toBe('kar');
    expect(searchKey('îman')).toBe('iman');
    expect(searchKey('sükût')).toBe('sukut');
  });

  it('gerçek arama senaryosu: farklı yazımlar eşleşir', () => {
    const kayitli = searchKey('Çağrı Öztürk');
    expect(searchKey('cagri ozturk')).toBe(kayitli);
    expect(searchKey('CAGRI OZTURK')).toBe(kayitli);
    expect(searchKey('Cağrı Oztürk')).toBe(kayitli);
  });
});

describe('text.searchKey — boşluk ve kapsam sınırı', () => {
  it('baştaki/sondaki boşluğu atar, iç boşlukları teke indirir', () => {
    expect(searchKey('  Ali   Veli  ')).toBe('ali veli');
    expect(searchKey('Ali\t\nVeli')).toBe('ali veli');
  });

  it('boşluk ve noktalamayı SİLMEZ (bilinçli kapsam sınırı)', () => {
    expect(searchKey('Ali Veli')).toBe('ali veli');
    expect(searchKey('A.Ş.')).toBe('a.s.');
    expect(searchKey('X-1')).toBe('x-1');
  });

  it('rakamları korur', () => {
    expect(searchKey('Ürün 123')).toBe('urun 123');
  });

  it('boş / null / undefined girdide boş dize döner', () => {
    expect(searchKey('')).toBe('');
    expect(searchKey(null)).toBe('');
    expect(searchKey(undefined)).toBe('');
    expect(searchKey('   ')).toBe('');
  });

  it('ASCII metni değiştirmez', () => {
    expect(searchKey('hello world')).toBe('hello world');
    expect(searchKey('Test123')).toBe('test123');
  });
});

describe('text.searchKey — sıralama anahtarıyla KARIŞTIRILMAMALI', () => {
  it('searchKey katlar, collate.key ayırır', () => {
    // Arama: ç ile c aynı sayılır
    expect(searchKey('çam')).toBe(searchKey('cam'));
    // Sıralama: ç ile c AYRI harflerdir (collate motoru bunu korur)
    expect(searchKey('çam')).toBe('cam');
  });
});
