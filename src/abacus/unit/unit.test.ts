import { describe, expect, it } from 'vitest';
import { ONS_TO_GRAM, categoryOf, convert, dataSize } from './index';
import * as gold from '../gold';
import * as silver from '../silver';

describe('ABACUS unit birim çevrim motoru', () => {
  describe('uzunluk (metrik SI)', () => {
    it('1 km = 1000 m', () => expect(convert(1, 'km', 'm')).toBe(1000));
    it('1 m = 100 cm = 1000 mm', () => {
      expect(convert(1, 'm', 'cm')).toBe(100);
      expect(convert(1, 'm', 'mm')).toBe(1000);
    });
    it('2500 m = 2,5 km', () => expect(convert(2500, 'm', 'km')).toBe(2.5));
    it('aynı birime çevirim değeri korur', () => expect(convert(7, 'm', 'm')).toBe(7));
  });

  describe('ağırlık', () => {
    it('1 kg = 1000 g, 1 ton = 1000 kg', () => {
      expect(convert(1, 'kg', 'g')).toBe(1000);
      expect(convert(1, 'ton', 'kg')).toBe(1000);
    });
    it('1 troy ons = 31,1034768 g (LBMA)', () => {
      expect(convert(1, 'ons', 'g')).toBe(31.1034768);
      expect(ONS_TO_GRAM).toBe(31.1034768);
    });
    it('31,1034768 g = 1 ons (ters yön kayıpsız)', () => {
      expect(convert(31.1034768, 'g', 'ons')).toBe(1);
    });
  });

  describe('alan (Tapu ve Kadastro metrik standardı)', () => {
    it('1 dönüm = 1 dekar = 1000 m²', () => {
      expect(convert(1, 'dönüm', 'm2')).toBe(1000);
      expect(convert(1, 'dekar', 'm2')).toBe(1000);
    });
    it('1 hektar = 10.000 m² = 10 dönüm', () => {
      expect(convert(1, 'hektar', 'm2')).toBe(10000);
      expect(convert(1, 'hektar', 'dönüm')).toBe(10);
    });
    it('1 km² = 1.000.000 m² = 100 hektar', () => {
      expect(convert(1, 'km2', 'm2')).toBe(1000000);
      expect(convert(1, 'km2', 'hektar')).toBe(100);
    });
    it('5000 m² = 5 dönüm', () => expect(convert(5000, 'm2', 'dönüm')).toBe(5));
  });

  describe('veri boyutu (ikili taban, 1 KB = 1024 B)', () => {
    it('1 KB = 1024 B, 1 MB = 1024 KB', () => {
      expect(convert(1, 'KB', 'B')).toBe(1024);
      expect(convert(1, 'MB', 'KB')).toBe(1024);
    });
    it('1 GB = 1.073.741.824 B', () => expect(convert(1, 'GB', 'B')).toBe(1073741824));
    it('5.242.880 B = 5 MB', () => expect(convert(5242880, 'B', 'MB')).toBe(5));
  });

  describe('kategori karışımı ve geçersiz girdi null döner (sessiz 0 yok)', () => {
    it('farklı kategoriler arası çevrimi reddeder', () => {
      expect(convert(1, 'kg', 'm')).toBeNull();
      expect(convert(1, 'MB', 'dönüm')).toBeNull();
      expect(convert(1, 'm', 'g')).toBeNull();
    });
    it('tanınmayan birimi reddeder', () => {
      expect(convert(1, 'mil' as never, 'm')).toBeNull();
      expect(convert(1, 'm', 'yarda' as never)).toBeNull();
    });
    it('geçersiz sayıyı reddeder', () => {
      expect(convert(NaN, 'm', 'km')).toBeNull();
      expect(convert(Infinity, 'm', 'km')).toBeNull();
    });
    it('sıfır ve negatif değer geçerlidir (gerçek değerdir, hata değil)', () => {
      expect(convert(0, 'km', 'm')).toBe(0);
      expect(convert(-2, 'km', 'm')).toBe(-2000);
    });
  });

  describe('dataSize okunur biçimlendirme', () => {
    it('en uygun ölçeği seçer', () => {
      expect(dataSize(5242880)).toBe('5 MB');
      expect(dataSize(1024)).toBe('1 KB');
      expect(dataSize(512)).toBe('512 B');
      expect(dataSize(1073741824)).toBe('1 GB');
    });
    it('ondalık ayraç Türkçe virgüldür', () => {
      expect(dataSize(1536)).toBe('1,5 KB');
    });
    it('sıfır bayt', () => expect(dataSize(0)).toBe('0 B'));
    it('geçersiz girdide — döner', () => {
      expect(dataSize(NaN)).toBe('—');
      expect(dataSize(-1)).toBe('—');
      expect(dataSize(null)).toBe('—');
    });
  });

  describe('categoryOf', () => {
    it('her birimin kategorisini döner', () => {
      expect(categoryOf('km')).toBe('length');
      expect(categoryOf('ons')).toBe('mass');
      expect(categoryOf('dönüm')).toBe('area');
      expect(categoryOf('GB')).toBe('data');
    });
    it('tanınmayan birimde null döner', () => {
      expect(categoryOf('mil' as never)).toBeNull();
    });
  });

  describe('ONS_TO_GRAM tek kaynaktan gelir (SSOT — rapor B11-n)', () => {
    it('gold, silver ve unit aynı sabiti paylaşır', () => {
      expect(gold.ONS_TO_GRAM).toBe(ONS_TO_GRAM);
      expect(silver.ONS_TO_GRAM).toBe(ONS_TO_GRAM);
    });
  });
});
