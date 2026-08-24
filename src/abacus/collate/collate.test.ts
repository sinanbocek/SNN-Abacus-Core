import { describe, expect, it } from 'vitest';
import { compare, key, sortBy } from './index';

describe('ABACUS collate Türkçe sıralama motoru', () => {
  describe('Türk alfabesi sırası', () => {
    it('ç harfini c ile d arasına koyar', () => {
      expect(compare('can', 'çan')).toBe(-1);
      expect(compare('çan', 'dan')).toBe(-1);
    });

    it('ı harfini h ile i arasına koyar', () => {
      expect(compare('ısı', 'iyi')).toBe(-1);
      expect(compare('hır', 'ısı')).toBe(-1);
    });

    it('ğ, ö, ş, ü harflerini doğru konumlara koyar', () => {
      expect(compare('gam', 'ğam')).toBe(-1);
      expect(compare('ğam', 'ham')).toBe(-1);
      expect(compare('oda', 'öde')).toBe(-1);
      expect(compare('öde', 'para')).toBe(-1);
      expect(compare('sar', 'şar')).toBe(-1);
      expect(compare('şar', 'tar')).toBe(-1);
      expect(compare('ulu', 'ülü')).toBe(-1);
      expect(compare('ülü', 'var')).toBe(-1);
    });

    it('alfabede p’den sonra q gelmez, r gelir', () => {
      expect(compare('pak', 'rak')).toBe(-1);
      // q, w, x alfabede yoktur; z’den sonra sıralanır
      expect(compare('zam', 'qam')).toBe(-1);
      expect(compare('zam', 'wam')).toBe(-1);
    });
  });

  describe('büyük/küçük harf ve şapkalı harfler', () => {
    it('büyük harf sırayı değiştirmez', () => {
      expect(compare('Çan', 'çan')).toBe(0);
      expect(compare('İSTANBUL', 'istanbul')).toBe(0);
      expect(compare('IŞIK', 'ışık')).toBe(0);
    });

    it('şapkalı harf şapkasızıyla aynı sırada kabul edilir', () => {
      expect(compare('kâr', 'kar')).toBe(0);
      expect(compare('hâl', 'hal')).toBe(0);
    });
  });

  describe('rakam ve noktalama sırası', () => {
    it('noktalama < rakam < harf', () => {
      expect(compare('1abc', 'abc')).toBe(-1);
      expect(compare(' abc', '1abc')).toBe(-1);
    });

    it('rakamları kendi içinde sıralar', () => {
      expect(compare('2', '10')).toBe(1); // metin sıralaması: "2" > "1..."
      expect(compare('1', '2')).toBe(-1);
    });
  });

  describe('key', () => {
    it('sabit genişlikte kod üretir, düz karşılaştırma çalışır', () => {
      expect(key('çam') < key('dal')).toBe(true);
      expect(key('ısı') < key('iyi')).toBe(true);
    });

    it('boş / null / undefined girdide boş dize döner', () => {
      expect(key('')).toBe('');
      expect(key(null)).toBe('');
      expect(key(undefined)).toBe('');
    });
  });

  describe('sortBy', () => {
    it('metin dizisini Türkçe sıraya göre sıralar', () => {
      const input = ['Zeynep', 'Çiğdem', 'Ali', 'İrem', 'Işıl', 'Ömer', 'Şule'];
      expect(sortBy(input)).toEqual(['Ali', 'Çiğdem', 'Işıl', 'İrem', 'Ömer', 'Şule', 'Zeynep']);
    });

    it('JavaScript’in varsayılan sıralamasından farklıdır (motorun varlık sebebi)', () => {
      const input = ['Işıl', 'İrem'];
      // Ham sort: 'I' (73) < 'İ' (304) -> tesadüfen doğru;
      // ama 'çam' / 'dal' / 'zam' örneğinde ham sort bozulur:
      const words = ['zam', 'çam', 'dal'];
      expect(sortBy(words)).toEqual(['çam', 'dal', 'zam']);
      expect([...words].sort()).toEqual(['dal', 'zam', 'çam']); // ham sort yanlış
      expect(sortBy(input)).toEqual(['Işıl', 'İrem']);
    });

    it('selector ile nesne dizisini sıralar', () => {
      const rows = [
        { ad: 'Ömer', no: 3 },
        { ad: 'Ali', no: 1 },
        { ad: 'Çiğdem', no: 2 },
      ];
      expect(sortBy(rows, (r) => r.ad).map((r) => r.no)).toEqual([1, 2, 3]);
    });

    it('girdi dizisini değiştirmez (saf davranış)', () => {
      const input = ['zam', 'çam'];
      const out = sortBy(input);
      expect(input).toEqual(['zam', 'çam']);
      expect(out).toEqual(['çam', 'zam']);
    });

    it('eşit anahtarlarda özgün sırayı korur (kararlı sıralama)', () => {
      const rows = [
        { ad: 'kâr', id: 1 },
        { ad: 'kar', id: 2 },
        { ad: 'kar', id: 3 },
      ];
      expect(sortBy(rows, (r) => r.ad).map((r) => r.id)).toEqual([1, 2, 3]);
    });

    it('boş dizide boş dizi döner', () => {
      expect(sortBy([])).toEqual([]);
    });
  });
});
