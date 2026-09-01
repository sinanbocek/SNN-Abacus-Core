import { describe, expect, it } from 'vitest';
import { equals, irr, pow } from './index';

/**
 * TÜKETİCİ RAPORU #2 §1 (SNN Portföy Yönetimi, 1 Eylül 2026).
 *
 * Gerçek ekran: Kredi Ekle sihirbazının "Yıllık Maliyet Oranı" alanı yalnızca
 * faiz ve vergiyi ölçüyordu; dosya masrafı ve sigorta primi dışarıda kalıyordu.
 * 900.000 TL anapara · 12 taksit · aylık faiz %0 · 450 TL masraf durumunda
 * ekran %0,00 gösteriyordu — kullanıcı 450 TL ödemiş olmasına rağmen.
 * Doğru hesap nakit akışının tamamı üzerinden iç verim oranıdır.
 *
 * ASSERT DEĞERLERİNİN KAYNAĞI (AI-RULES §2 — dış otorite, kodun çıktısı DEĞİL):
 *
 * 1) irr([1000, -600, -600]) KAPALI FORMDAN gelir. x = 1/(1+r) koyulursa
 *    1000 - 600x - 600x² = 0  →  3x² + 3x - 5 = 0  →  x = (√69 - 3) / 6.
 *    Buradan r = 1/x - 1 = 0.130662386291807485...
 *    Bu değer ikinci derece denklemin çözümüdür; koddan okunmamıştır.
 *
 * 2) irr([1000, -500, -500]) = 0 TANIM GEREĞİ: NPV(0) = 1000 - 500 - 500 = 0.
 *
 * 3) Rapordaki üretim vakası, bağımsız bir yüksek hassasiyetli çözücüyle
 *    (Python decimal, 50 basamak, bisection) doğrulandı:
 *    r = 0.000076950702200370362946... aylık · NPV(kök) ≈ -2e-43.
 *    Yıllık karşılığı (1+r)^12 - 1 = 0.00092379933976...  (≈ %0,0923)
 */

/** Kapalı formdan gelen kök: x = (√69 - 3)/6 · r = 1/x - 1 */
const KOK_1000_600_600 = 0.13066238629180748;

/** Bağımsız çözücüyle doğrulanmış üretim vakası kökü (aylık). */
const KOK_URETIM_VAKASI = 0.00007695070220037036;

/** Finansal oran karşılaştırmaları için tolerans (1e-9 mutlak). */
const TOL = 1e-9;

describe('math.irr — kök bulma', () => {
  it('temiz kök: 1000 al, iki taksitte 600 öde (kapalı form doğrulaması)', () => {
    const r = irr([1000, -600, -600]);
    expect(r).not.toBeNull();
    expect(equals(r as number, KOK_1000_600_600, TOL)).toBe(true);
  });

  it('sıfır maliyet TAM OLARAK 0 döner', () => {
    expect(irr([1000, -500, -500])).toBe(0);
  });

  it('raporun üretim vakası: 899.550 giriş, 12 × 75.000 çıkış', () => {
    const akis = [899550, ...Array<number>(12).fill(-75000)];
    const r = irr(akis);
    expect(r).not.toBeNull();
    expect(equals(r as number, KOK_URETIM_VAKASI, TOL)).toBe(true);
  });

  it('bulunan kök NPV\'yi gerçekten sıfırlar (kökün tanımı)', () => {
    const akis = [899550, ...Array<number>(12).fill(-75000)];
    const r = irr(akis) as number;
    let npv = 0;
    for (let t = 0; t < akis.length; t++) {
      const iskonto = pow(1 + r, t);
      expect(iskonto).not.toBeNull();
      npv += (akis[t] as number) / (iskonto as number);
    }
    // 900 bin TL ölçeğinde 1e-6 TL'lik artık, kuruşun çok altındadır.
    expect(equals(npv, 0, 1e-6)).toBe(true);
  });

  it('işaret yönünden bağımsızdır — akış ters çevrilince aynı kök', () => {
    const duz = irr([1000, -600, -600]);
    const ters = irr([-1000, 600, 600]);
    expect(ters).not.toBeNull();
    expect(equals(ters as number, duz as number, TOL)).toBe(true);
  });

  it('negatif kök bulabilir (zarar eden akış)', () => {
    // 1000 al, iki taksitte 400 öde: toplam 800 < 1000 → oran negatif olmalı
    const r = irr([1000, -400, -400]);
    expect(r).not.toBeNull();
    expect(r as number).toBeLessThan(0);
    expect(r as number).toBeGreaterThan(-1);
  });

  it('dönemseldir — yıllığa çevirmek tüketicinin işidir', () => {
    const akis = [899550, ...Array<number>(12).fill(-75000)];
    const aylik = irr(akis) as number;
    const yillik = pow(1 + aylik, 12) as number;
    expect(equals(yillik - 1, 0.0009237993397638396, 1e-12)).toBe(true);
  });
});

describe('math.irr — null sözleşmesi (ABACUS-SPEC §2.1)', () => {
  it('işaret değişimi yoksa null — sessiz 0 DEĞİL', () => {
    expect(irr([1000, 500])).toBeNull();
    expect(irr([-1000, -500, -500])).toBeNull();
    expect(irr([0, 0, 0])).toBeNull();
  });

  it('yetersiz eleman null', () => {
    expect(irr([1000])).toBeNull();
    expect(irr([])).toBeNull();
  });

  it('sonlu olmayan değer null', () => {
    expect(irr([1000, NaN])).toBeNull();
    expect(irr([1000, -600, Infinity])).toBeNull();
    expect(irr([1000, -600, -Infinity])).toBeNull();
  });

  it('geçersiz guess null üretmez — varsayılana düşer', () => {
    const beklenen = irr([1000, -600, -600]) as number;
    expect(equals(irr([1000, -600, -600], NaN) as number, beklenen, TOL)).toBe(true);
    expect(equals(irr([1000, -600, -600], 0.5) as number, beklenen, TOL)).toBe(true);
  });

  it('guess <= -1 KABUL EDİLMEZ — oran tekilliğine sokulamaz', () => {
    // r = -1'de (1+r)^t sıfırdır; -1 ve altı bir ipucu kabul edilseydi kök
    // arama tanımsız bölgeye taşınırdı. Geçersiz ipucu sessizce yok sayılır.
    const beklenen = irr([1000, -600, -600]) as number;
    expect(equals(irr([1000, -600, -600], -1) as number, beklenen, TOL)).toBe(true);
    expect(equals(irr([1000, -600, -600], -2) as number, beklenen, TOL)).toBe(true);
    expect(equals(irr([1000, -600, -600], -1000) as number, beklenen, TOL)).toBe(true);
  });

  it('arama tavanının ÜSTÜNDEKİ kök null döner — yanlış sayı değil', () => {
    // Kök tarama dönemsel %100.000'e kadar yapılır. Bunun ötesindeki kökler
    // (finansal akışlarda gerçekçi değildir) bulunamaz ve sessiz bir yanlış
    // sayı yerine null döner. BİLİNÇLİ kapsam sınırıdır.
    expect(irr([-1, 100000000])).toBeNull(); // kök ≈ %9.999.999.900
    expect(irr([-1, 2000])).toBeNull(); // kök = 1999 (dönemsel %199.900)
  });

  it('dizi girdisi DEĞİŞTİRİLMEZ', () => {
    const akis = [1000, -600, -600];
    const kopya = [...akis];
    irr(akis);
    expect(akis).toEqual(kopya);
  });
});

describe('math.irr — sayısal dayanıklılık', () => {
  it('uzun akışta yakınsar (360 dönemlik konut kredisi ölçeği)', () => {
    const akis = [1000000, ...Array<number>(360).fill(-6000)];
    const r = irr(akis);
    expect(r).not.toBeNull();
    expect(r as number).toBeGreaterThan(0);
    expect(r as number).toBeLessThan(0.01);
  });

  it('çok büyük oranda da kök bulur', () => {
    // 100 ver, bir dönem sonra 300 al → %200 dönemsel
    const r = irr([-100, 300]);
    expect(r).not.toBeNull();
    expect(equals(r as number, 2, TOL)).toBe(true);
  });

  it('kök -1 tekilliğine düşmez', () => {
    const r = irr([1000, -600, -600]) as number;
    expect(r).toBeGreaterThan(-1);
  });
});
