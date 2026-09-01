import { describe, expect, it } from 'vitest';
import { dayName, format, isWeekend, weekday } from './index';

/**
 * TÜKETİCİ RAPORU #3 §1 (SNN Portföy Yönetimi, 1 Eylül 2026).
 *
 * Haftanın günü yalnızca AD olarak sunuluyordu. Ama haftanın günü çoğu zaman
 * bir GÖSTERİM değil bir KARAR girdisidir; tüketici "son iş günü"nü bulmak için
 * iş kuralını GÖRÜNTÜ METNİNE bağlamak zorunda kalmıştı:
 *
 *   const GERI_GUN: Record<string, number> = { Pzt: 3, Paz: 2, Cts: 1 };
 *   const geri = GERI_GUN[date.dayName(referenceIso, 'short')] ?? 1;
 *
 * Kısaltmalardan biri değişse (ör. "Cts" → "Cmt") iş kuralı SESSİZCE yanlış
 * çalışırdı: tip hatası yok, test kırmızısı yok, yalnızca `?? 1` dalı.
 * Görüntü metnini karar mantığına bağlamak, çekirdeğin her yerde savunduğu
 * gösterim/karar ayrımının tersidir.
 *
 * BEKLENEN DEĞERLERİN KAYNAĞI (AI-RULES §2 — dış otorite):
 * Gün indeksleri Gregoryen takviminden, bağımsız bir tarih kitaplığıyla
 * (Python `datetime.isoweekday`) üretildi; bu motorun çıktısından okunmadı.
 */

describe('date.weekday — sayısal gün indeksi (rapor #3 §1)', () => {
  it('0 = Pazar … 6 = Cumartesi', () => {
    expect(weekday('2026-09-06')).toBe(0); // Pazar
    expect(weekday('2026-09-07')).toBe(1); // Pazartesi
    expect(weekday('2026-09-02')).toBe(3); // Çarşamba
    expect(weekday('2026-09-05')).toBe(6); // Cumartesi
  });

  it('artık gün ve yüzyıl istisnası dâhil doğru', () => {
    expect(weekday('2026-01-01')).toBe(4); // Perşembe
    expect(weekday('2024-02-29')).toBe(4); // Perşembe
    expect(weekday('2000-02-29')).toBe(2); // Salı
    expect(weekday('2026-12-31')).toBe(4); // Perşembe
  });

  it('dayName ile AYNI günü gösterir — ikisi ayrışamaz', () => {
    const kisaAdlar = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'];
    for (const iso of ['2026-09-01', '2026-09-02', '2026-09-05', '2026-09-06', '2026-12-31']) {
      const idx = weekday(iso);
      expect(idx).not.toBeNull();
      expect(kisaAdlar[idx as number]).toBe(dayName(iso, 'short'));
    }
  });

  it('saat dilimi çevrimini uygular — gün kayabilir', () => {
    // 2026-09-01T21:30Z, İstanbul'da 2 Eylül Çarşamba 00:30'dur.
    expect(format('2026-09-01T21:30:00.123456+00:00')).toBe('02.09.2026');
    expect(weekday('2026-09-01T21:30:00.123456+00:00')).toBe(3); // Çarşamba
    expect(weekday('2026-09-01')).toBe(2); // Salı — saatsiz değer kaydırılmaz
  });

  it('geçersiz girdide null — 0 DEĞİL (0 geçerli bir gündür)', () => {
    expect(weekday('2024-02-30')).toBeNull();
    expect(weekday('abc')).toBeNull();
    expect(weekday('')).toBeNull();
    expect(weekday('2026-09')).toBeNull();
  });
});

describe('date.isWeekend — hafta sonu kararı (rapor #3 §1)', () => {
  it('Cumartesi ve Pazar true', () => {
    expect(isWeekend('2026-09-05')).toBe(true); // Cumartesi
    expect(isWeekend('2026-09-06')).toBe(true); // Pazar
  });

  it('hafta içi false', () => {
    for (const iso of ['2026-09-07', '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04']) {
      expect(isWeekend(iso)).toBe(false);
    }
  });

  it('weekday ile tutarlı', () => {
    for (const iso of ['2026-09-01', '2026-09-05', '2026-09-06', '2026-09-07']) {
      const idx = weekday(iso) as number;
      expect(isWeekend(iso)).toBe(idx === 0 || idx === 6);
    }
  });

  it('saat dilimi çevrimini uygular', () => {
    // Cuma 21:30Z → İstanbul Cumartesi 00:30 → hafta sonu
    expect(isWeekend('2026-09-04T21:30:00Z')).toBe(true);
    expect(isWeekend('2026-09-04')).toBe(false);
  });

  it('geçersiz girdide null — false DEĞİL', () => {
    // "hayır" ile "karşılaştıramadım" ayrılır (isBefore/isAfter ile aynı desen).
    expect(isWeekend('2024-02-30')).toBeNull();
    expect(isWeekend('abc')).toBeNull();
    expect(isWeekend('')).toBeNull();
  });

  it('raporun son iş günü kuralı artık metne bağlı değil', () => {
    // GERI_GUN sözlüğü ve `?? 1` sessiz varsayılanı yerine:
    const geriGun = (iso: string): number | null => {
      const g = weekday(iso);
      if (g === null) return null;
      if (g === 1) return 3; // Pazartesi → Cuma
      if (g === 0) return 2; // Pazar → Cuma
      return 1;
    };
    expect(geriGun('2026-09-07')).toBe(3); // Pazartesi
    expect(geriGun('2026-09-06')).toBe(2); // Pazar
    expect(geriGun('2026-09-05')).toBe(1); // Cumartesi
    expect(geriGun('2026-09-02')).toBe(1); // Çarşamba
    expect(geriGun('gecersiz')).toBeNull(); // sessiz varsayılan YOK
  });
});
