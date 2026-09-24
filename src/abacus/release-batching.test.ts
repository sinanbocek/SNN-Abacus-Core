import { describe, expect, it } from 'vitest';
// @ts-expect-error — betik düz JS'tir, tip bildirimi yoktur.
import { findPending } from '../../scripts/check-release-batching.mjs';

/**
 * TOPLU SÜRÜM KURALI — ZORLAYICININ ZORLAYICISI (AI-RULES §4.3).
 *
 * `scripts/check-release-batching.mjs`, kayıtta "bekliyor" durumunda kabul edilmiş madde
 * varken sürüm çıkmasını durdurur (PR'da ve etiket anında). Bu test betiğin kayıt
 * tablosunu doğru okuduğunu ölçer; okuyamazsa kural sessizce ölür.
 */
const LOG = (rows: string, after = '') =>
  [
    '# Geri Bildirim Kaydı',
    '',
    '## Durum tablosu',
    '',
    '| # | Talep | Kaynak | Karar | Sürüm |',
    '|---|---|---|---|---|',
    rows,
    '',
    '---',
    after,
  ].join('\r\n');

describe('findPending — durum tablosunda bekleyen kabuller', () => {
  it('son sütunu "bekliyor" olan satırları bulur', () => {
    const text = LOG(
      [
        '| 38 | a | b | ✅ Kabul | 4.1.1 |',
        '| 39C | a | b | ✅ Kabul | bekliyor |',
        '| 39E | a | b | ❌ Red | — |',
        '| 39F | a | b | ✅ Kabul | bekliyor |',
      ].join('\r\n')
    );
    expect(findPending(text)).toEqual(['39C', '39F']);
  });

  it('bekleyen yoksa boş döner', () => {
    expect(findPending(LOG('| 38 | a | b | ✅ Kabul | 4.1.1 |'))).toEqual([]);
  });

  it('tablonun DIŞINDAKİ "bekliyor" sayılmaz', () => {
    // Tablodan sonraki başka bir tabloda son hücresi tam "bekliyor" olan satır.
    const text = LOG('| 38 | a | b | ✅ Kabul | 4.3.0 |', '| #11 | tarih | kapsam | bekliyor |');
    expect(findPending(text)).toEqual([]);
  });

  it('karar metninde geçen "bekliyor" sayılmaz; yalnız Sürüm sütunu', () => {
    expect(findPending(LOG('| 40 | a | b | uygulama bekliyor | 4.3.0 |'))).toEqual([]);
  });

  it('tablo bulunamazsa sessiz geçmez, hata fırlatır', () => {
    expect(() => findPending('# başka bir belge')).toThrow('Durum tablosu');
  });
});
