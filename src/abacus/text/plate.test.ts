import { describe, expect, it } from 'vitest';
import { plate } from './index';

/**
 * TÜRKİYE TESCİL PLAKASI NORMALİZASYONU (v2.8.0).
 *
 * BEKLENEN DEĞERLERİN KAYNAĞI — bu dosya önemli bir sınırı açıkça belirtir:
 *
 * 1) İL KODU (01–81): Türkiye'nin 81 ili. Resmî ve değişmesi kanun gerektiren
 *    bir olgu; yeni il kurulursa MINOR sürümle güncellenir.
 *
 * 2) HARF/RAKAM GRUPLARI: YÖNETMELİKTE YAZILI DEĞİLDİR. Karayolları Trafik
 *    Yönetmeliği Madde 55 (Harf ve Rakam Grupları) 4/11/2025 tarihli ve 33067
 *    sayılı Resmî Gazete ile yürürlükten kaldırıldı. Güncel dayanak, Araçların
 *    Satış, Devir ve Tescil Hizmetlerinin Yürütülmesi Hakkında Yönetmelik
 *    Madde 34'tür ve yalnızca "harf ve rakam grupları ... İçişleri Bakanlığınca
 *    belirlenir" der. Gruplar bu yüzden FİİLÎ UYGULAMADAN derlenmiştir ve
 *    rakam grubu bilinçli olarak GEVŞEK tutulur (2–5 hane): Bakanlığın yeni
 *    bir kombinasyon açması gerçek plakaları reddettirmemelidir.
 *
 * 3) HARF KÜMESİ (23 harf): Ç Ğ İ Ö Ş Ü ile Q W X plakada kullanılmaz.
 *    Çekirdek sahibinin kararıdır (fiilî uygulama).
 *
 * 4) YENİ KAYIT (il kodu + "YK", arkasında rakam yok): Resmî bir plaka DEĞİLDİR.
 *    Sigorta sektöründe, tescili yapılmamış sıfır araçlara poliçe kesilirken
 *    kullanılan yazılı olmayan bir teamüldür. AI-RULES §4.1 önerisine karşın
 *    çekirdek sahibinin kararıyla her zaman kabul edilir ve `yeniKayit`
 *    bayrağıyla işaretlenir. Bkz. GERI-BILDIRIM-KAYDI.md.
 */

describe('text.plate — girdi temizleme ve biçimlendirme', () => {
  it('tüketicinin örnek girdileri', () => {
    expect(plate('54apy281')).toEqual({
      stored: '54APY281', display: '54 APY 281', raw: '54apy281', valid: true, yeniKayit: false,
    });
    expect(plate('34.ABD.344').display).toBe('34 ABD 344');
    expect(plate('34-acb-23').display).toBe('34 ACB 23');
    expect(plate('34abc23').display).toBe('34 ABC 23');
  });

  it('saklama biçimi boşluksuzdur — aynı plaka iki yazımla iki kez kaydedilmez', () => {
    const a = plate('34 ABC 23');
    const b = plate('34abc23');
    const c = plate('34.abc.23');
    expect(a.stored).toBe('34ABC23');
    expect(b.stored).toBe(a.stored);
    expect(c.stored).toBe(a.stored);
  });

  it('ham girdi olduğu gibi korunur', () => {
    expect(plate('  34-acb-23 ').raw).toBe('  34-acb-23 ');
  });

  it('kabul edilen ayraçlar: boşluk, nokta, tire — karışık da olabilir', () => {
    expect(plate('  34 abc 23  ').display).toBe('34 ABC 23');
    expect(plate('34 - ABC . 23').display).toBe('34 ABC 23');
  });

  it('tek haneli il koduna sıfır eklenir', () => {
    expect(plate('6abc12').display).toBe('06 ABC 12');
    expect(plate('6abc12').stored).toBe('06ABC12');
    expect(plate('1 A 1234').display).toBe('01 A 1234');
  });

  it('il kodu sınırları dâhil', () => {
    expect(plate('01 A 1234').valid).toBe(true);
    expect(plate('81 ABC 123').valid).toBe(true);
  });
});

describe('text.plate — Türkçe klavye tuzağı', () => {
  it('küçük i ve ı ikisi de ASCII I olur, asla İ olmaz', () => {
    expect(plate('34abi12').display).toBe('34 ABI 12');
    expect(plate('34abı12').display).toBe('34 ABI 12');
    expect(plate('34 ıı 123').display).toBe('34 II 123');
  });

  it('çıktıda hiçbir zaman Türkçe özel harf bulunmaz', () => {
    const sonuc = plate('34abi12');
    expect(sonuc.display).not.toContain('İ');
    expect(sonuc.stored).not.toContain('İ');
  });
});

describe('text.plate — harf ve rakam grupları (fiilî uygulama, gevşek)', () => {
  it('bilinen altı biçimin tamamı geçerli', () => {
    expect(plate('34 A 1234').valid).toBe(true);
    expect(plate('34 A 12345').valid).toBe(true);
    expect(plate('34 AB 123').valid).toBe(true);
    expect(plate('34 AB 1234').valid).toBe(true);
    expect(plate('34 ABC 12').valid).toBe(true);
    expect(plate('34 ABC 123').valid).toBe(true);
  });

  it('34CD3455 GEÇERLİDİR — 2 harf + 4 rakam, diplomatik seri', () => {
    // Tüketici reddedilmesi gerektiğini düşünüyordu; biçim fiilen geçerli ve
    // tüketici özel serileri kabul ediyor.
    expect(plate('34CD3455')).toEqual({
      stored: '34CD3455', display: '34 CD 3455', raw: '34CD3455', valid: true, yeniKayit: false,
    });
  });

  it('rakam grubu gevşektir: 2–5 hane her harf sayısıyla kabul edilir', () => {
    // Bilinçli ödünleşim: fiilen görülmeyen biçimler de geçer, ama Bakanlık
    // yeni bir kombinasyon açtığında hiçbir gerçek plaka reddedilmez.
    expect(plate('34 A 12').valid).toBe(true);
    expect(plate('34 ABC 12345').valid).toBe(true);
  });

  it('rakam grubu 2 haneden kısa olamaz', () => {
    expect(plate('34 AB 1').valid).toBe(false);
  });

  it('rakam grubu 5 haneden uzun olamaz', () => {
    expect(plate('34 A 123456').valid).toBe(false);
  });

  it('harf grubu 3 harften uzun olamaz', () => {
    expect(plate('34 ABCD 12').valid).toBe(false);
  });
});

describe('text.plate — reddedilenler', () => {
  const GECERSIZ = { stored: '', display: '', valid: false, yeniKayit: false };

  it('var olmayan il kodu', () => {
    expect(plate('82 AB 123')).toEqual({ ...GECERSIZ, raw: '82 AB 123' });
    expect(plate('83abc12').valid).toBe(false);
    expect(plate('00 AB 123').valid).toBe(false);
    expect(plate('0 AB 123').valid).toBe(false);
    expect(plate('99 AB 123').valid).toBe(false);
  });

  it('üç haneli il kodu', () => {
    expect(plate('034 AB 123').valid).toBe(false);
  });

  it('Türkçe özel harfler: Ç Ğ İ Ö Ş Ü', () => {
    for (const harf of ['Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü', 'ç', 'ğ', 'ö', 'ş', 'ü']) {
      expect(plate(`34 AB${harf} 12`).valid).toBe(false);
    }
  });

  it('Q, W, X plakada kullanılmaz — büyük ve küçük', () => {
    for (const harf of ['Q', 'W', 'X', 'q', 'w', 'x']) {
      expect(plate(`34 A${harf} 123`).valid).toBe(false);
    }
  });

  it('kullanılan 23 harfin tamamı kabul edilir', () => {
    for (const harf of 'ABCDEFGHIJKLMNOPRSTUVYZ') {
      expect(plate(`34 ${harf} 1234`).valid).toBe(true);
    }
  });

  it('kapalı ayraç listesi dışındaki karakterler', () => {
    expect(plate('34/ABC/23').valid).toBe(false);
    expect(plate('34_ABC_23').valid).toBe(false);
    expect(plate('34ABC23!').valid).toBe(false);
  });

  it('TR öneki kabul edilmez', () => {
    expect(plate('TR 34 ABC 23').valid).toBe(false);
  });

  it('grup sırası bozuk', () => {
    expect(plate('ABC 34 23').valid).toBe(false);
    expect(plate('34 ABC 23 D').valid).toBe(false);
    expect(plate('34 AB 12 CD').valid).toBe(false);
  });

  it('eksik plaka — rakamı olmayan ve YK olmayan', () => {
    expect(plate('34 AB').valid).toBe(false);
    expect(plate('34').valid).toBe(false);
    expect(plate('ABC').valid).toBe(false);
  });

  it('boş girdi', () => {
    expect(plate('')).toEqual({ ...GECERSIZ, raw: '' });
    expect(plate('   ').valid).toBe(false);
  });

  it('null / undefined çökmez — JS tüketicisi tip denetimi yapmayabilir', () => {
    // text.phone ile aynı sözleşme: çökme yerine geçersiz sonuç.
    expect(plate(null as unknown as string)).toEqual({ ...GECERSIZ, raw: '' });
    expect(plate(undefined as unknown as string)).toEqual({ ...GECERSIZ, raw: '' });
  });
});

describe('text.plate — YENİ KAYIT (YK) teamülü', () => {
  it('il kodu + YK, rakamsız: geçerli ve işaretli', () => {
    expect(plate('34yk')).toEqual({
      stored: '34YK', display: '34 YK', raw: '34yk', valid: true, yeniKayit: true,
    });
    expect(plate('54 YK').yeniKayit).toBe(true);
    expect(plate('67YK').display).toBe('67 YK');
  });

  it('tek haneli il koduyla da çalışır', () => {
    expect(plate('6yk').display).toBe('06 YK');
    expect(plate('6yk').yeniKayit).toBe(true);
  });

  it('YK arkasında rakam varsa SIRADAN plakadır, yeni kayıt değil', () => {
    expect(plate('34 YK 123')).toEqual({
      stored: '34YK123', display: '34 YK 123', raw: '34 YK 123', valid: true, yeniKayit: false,
    });
  });

  it('il kodu kuralı YK için de geçerlidir', () => {
    expect(plate('82yk').valid).toBe(false);
    expect(plate('82yk').yeniKayit).toBe(false);
    expect(plate('00YK').valid).toBe(false);
  });

  it('yalnız tam olarak YK — benzer harfler yeni kayıt sayılmaz', () => {
    expect(plate('34 Y').valid).toBe(false);
    expect(plate('34 K').valid).toBe(false);
    expect(plate('34 YKA').valid).toBe(false);
    expect(plate('34 AYK').valid).toBe(false);
  });

  it('geçersiz girdide yeniKayit her zaman false', () => {
    for (const girdi of ['', '82yk', '34 AB', 'YK', '34 YK!']) {
      expect(plate(girdi).yeniKayit).toBe(false);
    }
  });
});
