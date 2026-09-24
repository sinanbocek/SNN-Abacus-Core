import { describe, expect, it } from 'vitest';
import { text } from './index';

/**
 * DÖNÜŞ NESNESİ ALAN KİLİDİ (TB-013'ün ortaya çıkardığı boşluk).
 *
 * `api-surface.test.ts` yalnız dışa açılan FONKSİYON adlarını çiviler. Bir fonksiyonun
 * döndürdüğü nesnenin ALAN adları da genel API'dir: tüketici `text.plate(x).yeniKayit`
 * diye okur. Bir alan silinir ya da yeniden adlandırılırsa tüketicide derleme hatası
 * olur ama hiçbir çekirdek testi kırılmazdı. Bu test o boşluğu kapatır.
 *
 * Listeyi güncellemek bilinçli bir adımdır (api-surface ile aynı kural):
 *   - alan EKLENDİYSE -> MINOR
 *   - alan SİLİNDİ ya da ADI DEĞİŞTİYSE -> MAJOR (AI-RULES §4.0)
 */
const SHAPES: [string, () => object, string[]][] = [
  ['text.plate', () => text.plate('34 ABC 123'), ['display', 'newRegistration', 'raw', 'stored', 'valid', 'yeniKayit']],
  ['text.phone', () => text.phone('0532 123 45 67'), ['display', 'kind', 'raw', 'stored', 'valid']],
  ['text.email', () => text.email('a@b.co'), ['display', 'raw', 'stored', 'valid']],
  ['text.website', () => text.website('ornek.com'), ['display', 'raw', 'stored', 'valid']],
  ['text.name', () => text.name('ali veli'), ['display', 'raw', 'stored', 'valid']],
  ['text.company', () => text.company('abc ltd'), ['display', 'raw', 'stored', 'valid']],
];

describe('dönüş nesnesi alanları — genel API kilidi', () => {
  it.each(SHAPES)('%s alanları', (_name, call, fields) => {
    expect(Object.keys(call()).sort()).toEqual(fields);
  });

  it('geçersiz girdide de aynı alanlar döner (alan kaybolmaz)', () => {
    for (const [name, , fields] of SHAPES) {
      const fn = (text as unknown as Record<string, (raw: string) => object>)[name.split('.')[1] ?? ''];
      expect(fn, name).toBeTypeOf('function');
      expect(Object.keys(fn?.('') ?? {}).sort(), name).toEqual(fields);
    }
  });
});
