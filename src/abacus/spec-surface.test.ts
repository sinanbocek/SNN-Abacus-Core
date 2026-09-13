/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import * as abacus from './index';
// `?raw`: Vite dosyayı metin olarak içe aktarır. Node API'si (fs) yerine bu yol
// seçildi — proje @types/node taşımıyor ve yalnız bu test için bağımlılık eklemek
// gereksiz. vite, vitest'in kendi bağımlılığıdır.
import SPEC from '../../ABACUS-SPEC.md?raw';

/**
 * ŞARTNAME ↔ API EŞLEŞME KİLİDİ
 *
 * `ABACUS-SPEC.md` §2'deki "Dışa açılan fonksiyonlar (tam liste)" tablosu
 * bağlayıcıdır, ama elle tutulur. v2.5.0–v2.7.0 arasında üç sürüm boyunca
 * eskidi: `compactMajor`, `irr`, `ceil`, `log10`, `weekday`, `isWeekend`
 * tabloya hiç girmedi ve "tam liste" iddiası yanlış kaldı. Hiçbir test bunu
 * yakalamadı çünkü tablonun bir zorlayıcısı yoktu.
 *
 * AI-RULES §1: zorlanamayan madde kural değil öneridir. Bu test tabloyu
 * gerçek barrel ile karşılaştırır — bir ad dışa açılıp tabloya yazılmazsa
 * (veya tablodan silinmiş bir ad hâlâ açıksa) kırmızı verir.
 *
 * `api-surface.test.ts` ile ilişkisi: o test ADLARI sürüm disiplinine kilitler;
 * bu test ŞARTNAMEYİ o adlara kilitler. Yeni bir ad eklendiğinde ikisi birden
 * kırılır — bu kasıtlıdır.
 */

/** §2 tablosunda bir motor satırının ikinci sütunundaki adları toplar. */
function specNames(engine: string): string[] | null {
  const satir = SPEC.split('\n').find((l: string) => l.startsWith(`| \`${engine}\` |`));
  if (satir === undefined) return null;

  // Sütunlar: | `motor` | adlar | not |  — kaçışlı \| sütun ayırıcı değildir.
  const sutunlar = satir.split(/(?<!\\)\|/);
  const adlar = sutunlar[2];
  if (adlar === undefined) return null;

  const bulunan = new Set<string>();
  for (const m of adlar.matchAll(/`([A-Za-z_][A-Za-z0-9_]*)/g)) {
    if (m[1] !== undefined) bulunan.add(m[1]);
  }
  return [...bulunan].sort();
}

describe('ABACUS-SPEC §2 — dışa açılan fonksiyon tablosu gerçek API ile eşleşir', () => {
  const motorlar = Object.keys(abacus).sort();

  it('her motorun şartnamede bir satırı var', () => {
    const eksik = motorlar.filter((m) => specNames(m) === null);
    expect(eksik).toEqual([]);
  });

  for (const motor of motorlar) {
    it(`\`${motor}\` satırı barrel'ın açtığı adların TAM listesidir`, () => {
      const gercek = Object.keys((abacus as Record<string, object>)[motor] as object).sort();
      expect(specNames(motor)).toEqual(gercek);
    });
  }
});
