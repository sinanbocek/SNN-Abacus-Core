import { describe, expect, it } from 'vitest';
import { properNounSuffix } from './index';

/**
 * TB-014 — harf harf okunan kısaltmalar yanlış ek alıyordu (`THY'da`, doğrusu `THY'de`).
 *
 * Otorite: TDK Yazım Kuralları, "Kısaltmalar" (tdk.gov.tr/icerik/yazim-kurallari/kisaltmalar):
 *   - Büyük harfli kısaltmada ek SON HARFİN OKUNUŞUNA göre gelir:
 *     BDT'ye, TDK'den, THY'de, TRT'den, TL'nin.
 *   - Kelime gibi okunan kısaltmada ek KISALTMANIN OKUNUŞUNA göre gelir:
 *     ASELSAN'da, BOTAŞ'ın, NATO'dan, UNESCO'ya; sert ünsüz yumuşamaz: AGİK'in, RTÜK'e.
 *
 * İki tür de büyük harfle yazılır ve metinden ayırt edilemez. Kesin olan tek durum:
 * HİÇ ÜNLÜ İÇERMEYEN kısaltma kelime gibi okunamaz, harf harf okunur. Çekirdek
 * yalnız o durumu harf okunuşuna çevirir (§4.1 Sınır durumu 3, madde 34D emsali).
 */
describe('properNounSuffix — ünlüsüz kısaltma harf harf okunur (TDK)', () => {
  it.each([
    ['BDT', 'dat', "BDT'ye"],
    ['THY', 'loc', "THY'de"],
    ['TRT', 'abl', "TRT'den"],
    ['TL', 'gen', "TL'nin"],
  ] as const)('TDK örneği: %s %s -> %s', (name, kind, expected) => {
    expect(properNounSuffix(name, kind)).toBe(expected);
  });

  /**
   * SAHİP KARARIYLA İSTİSNA (madde 44D, 2026-09-24) — emsal değildir.
   * TDK'nın harf adı "ke"dir ve kendi örneği `TDK'den`dir. Çekirdek sahibinin kararıyla
   * K, halk arasındaki okunuşuyla "ka" okunur: `SGK'da`, `SGK'ya`. TDK'nın örneği bu
   * yüzden BİLEREK farklı çıkar (`TDK'dan`).
   */
  it.each([
    ['SGK', 'loc', "SGK'da"],
    ['SGK', 'dat', "SGK'ya"],
    ['BDDK', 'gen', "BDDK'nın"],
    ['TSK', 'acc', "TSK'yı"],
    ['TDK', 'abl', "TDK'dan"],
  ] as const)('K "ka" okunur (sahip kararı): %s %s -> %s', (name, kind, expected) => {
    expect(properNounSuffix(name, kind)).toBe(expected);
  });

  it.each([
    ['PTT', 'loc', "PTT'de"],
    ['BMW', 'dat', "BMW'ye"],
    ['TBMM', 'abl', "TBMM'den"],
    ['HSBC', 'acc', "HSBC'yi"],
    ['Plan B', 'dat', "Plan B'ye"],
    ['3D', 'loc', "3D'de"],
    ['Ek-C', 'loc', "Ek-C'de"],
    ['Türk Telekom PTT', 'abl', "Türk Telekom PTT'den"],
  ] as const)('%s %s -> %s', (name, kind, expected) => {
    expect(properNounSuffix(name, kind)).toBe(expected);
  });

  it('Türkçe alfabede olmayan harfler fiilî okunuşla: Q "kü", W "ve", X "iks"', () => {
    expect(properNounSuffix('QNB', 'dat')).toBe("QNB'ye");
    expect(properNounSuffix('Model Q', 'loc')).toBe("Model Q'de");
    expect(properNounSuffix('Model X', 'loc')).toBe("Model X'te");
    expect(properNounSuffix('Model X', 'dat')).toBe("Model X'e");
  });

  describe('kelime gibi okunan kısaltmalar DEĞİŞMEDİ (TDK örnekleri)', () => {
    it.each([
      ['ASELSAN', 'loc', "ASELSAN'da"],
      ['BOTAŞ', 'gen', "BOTAŞ'ın"],
      ['NATO', 'abl', "NATO'dan"],
      ['UNESCO', 'dat', "UNESCO'ya"],
      ['AGİK', 'gen', "AGİK'in"],
      ['RTÜK', 'dat', "RTÜK'e"],
      // Tek ünlüsü büyük I / İ olan kelime okunuşlu kısaltmalar: ünlüsüz sayılmamalı.
      ['TIR', 'loc', "TIR'da"],
      ['MİT', 'loc', "MİT'te"],
    ] as const)('%s %s -> %s', (name, kind, expected) => {
      expect(properNounSuffix(name, kind)).toBe(expected);
    });
  });

  describe('dokunulmayanlar', () => {
    it('küçük harfle biten ad kısaltma sayılmaz', () => {
      expect(properNounSuffix('VakıfBank', 'loc')).toBe("VakıfBank'ta");
    });

    it('kelimeye bitişik ünlüsüz büyük harf dizisi de harf harf okunur', () => {
      // "ge-me-be-he": son harf H -> "he". Dizi ayrı kelime olmasa da okunuş değişmez.
      expect(properNounSuffix('Almanya GmbH', 'loc')).toBe("Almanya GmbH'de");
    });

    it('kaynaştırma n\'si gereken kısaltmalar eski kuralla: A.Ş., Ltd.Şti.', () => {
      expect(properNounSuffix('A.Ş.', 'abl')).toBe("A.Ş.'nden");
      expect(properNounSuffix('Global Hedef Ltd.Şti.', 'dat')).toBe("Global Hedef Ltd.Şti.'ne");
    });

    it('büyük harfle yazılmış Türkçe ad kısaltma sayılmaz', () => {
      expect(properNounSuffix('HDI SİGORTA', 'loc')).toBe("HDI SİGORTA'da");
      expect(properNounSuffix('GARANTİ BBVA', 'dat')).toBe("GARANTİ BBVA'ya");
    });
  });

  /**
   * HATA (TB-014 çalışılırken ölçüldü, v3.5.0'dan beri): "AŞ" kısaltmasının noktasız
   * yazımını tanıyan kural adın SONUNA bakıyordu; "-aş" ile biten her ad şirket
   * kısaltması sanılıyordu: `Ahmet Kocataş'ne` (doğrusu `Kocataş'a`), `BOTAŞ'nin`.
   * Aktaş, Bektaş, Karataş yaygın soyadlarıdır ve GHS-Panel WhatsApp hatırlatmasında
   * müşteri adı bu işleve gidiyor. Kısaltma artık yalnız AYRI KELİME olarak tanınır.
   */
  describe('"-aş" ile biten ad şirket kısaltması sanılmaz', () => {
    it.each([
      ['Ahmet Kocataş', 'dat', "Ahmet Kocataş'a"],
      ['Karataş', 'gen', "Karataş'ın"],
      ['Yavaş', 'loc', "Yavaş'ta"],
      ['Arkadaş', 'abl', "Arkadaş'tan"],
      ['Kardeşti', 'loc', "Kardeşti'de"],
    ] as const)('%s %s -> %s', (name, kind, expected) => {
      expect(properNounSuffix(name, kind)).toBe(expected);
    });

    it.each([
      ['Koç AŞ', 'dat', "Koç AŞ'ne"],
      ['Eureko Sigorta A.Ş.', 'abl', "Eureko Sigorta A.Ş.'nden"],
      ['Vefa Group Ltd.Şti.', 'loc', "Vefa Group Ltd.Şti.'nde"],
      ['Vefa Group Ltd. Şti.', 'loc', "Vefa Group Ltd. Şti.'nde"],
      ['AŞ', 'gen', "AŞ'nin"],
    ] as const)('ayrı kelime olan kısaltma tanınır: %s %s -> %s', (name, kind, expected) => {
      expect(properNounSuffix(name, kind)).toBe(expected);
    });
  });

  it('BİLİNEN SINIR: ünlü içeren harf harf kısaltma metinden ayırt edilemez', () => {
    // TDK'ye göre doğrusu "ABD'ye" (a-be-de), ama "AGİK" gibi kelime okunan kısaltmalarla
    // aynı biçimde yazılıyor. Çekirdek tahmin etmez; kelime okunuşu kalır.
    expect(properNounSuffix('ABD', 'dat')).toBe("ABD'a");
  });
});
