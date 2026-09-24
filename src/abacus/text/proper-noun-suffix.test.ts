import { describe, expect, it } from 'vitest';
import { properNounSuffix } from './index';

/**
 * ÖZEL AD HÂL EKİ — talep #23 (GHS-Panel).
 * Üç tuzak talebin kendisinde bildirilmişti; hepsi burada.
 */
describe('text.properNounSuffix', () => {
  describe('talebin bildirdiği üç tuzak', () => {
    it('kısaltmada uyum OKUNUŞA bakar, harfe değil', () => {
      // "A.Ş." okunuşu "Anonim Şirketi" -> ince. Harfe bakılsa 'a' görünür ve
      // kalın ek düşerdi (A.Ş.'ndan) — yanlış olurdu.
      expect(properNounSuffix('A.Ş.', 'abl')).toBe("A.Ş.'nden");
      expect(properNounSuffix('A.Ş.', 'loc')).toBe("A.Ş.'nde");
      expect(properNounSuffix('A.Ş.', 'dat')).toBe("A.Ş.'ne");
      expect(properNounSuffix('A.Ş.', 'gen')).toBe("A.Ş.'nin");
    });

    it('iyelik ekiyle biten ad kaynaştırma n istiyor', () => {
      expect(properNounSuffix('Ziraat Bankası', 'loc')).toBe("Ziraat Bankası'nda");
      expect(properNounSuffix('Ziraat Bankası', 'dat')).toBe("Ziraat Bankası'na");
      expect(properNounSuffix('Ziraat Bankası', 'abl')).toBe("Ziraat Bankası'ndan");
    });

    it('iyelik -I biçimi -sI kalıbına uymaz, yine de yakalanır', () => {
      expect(properNounSuffix('Global Hedef Şirketi', 'abl')).toBe("Global Hedef Şirketi'nden");
      expect(properNounSuffix('Global Hedef Şirketi', 'loc')).toBe("Global Hedef Şirketi'nde");
    });
  });

  describe('düz özel adlar', () => {
    it('sert ünsüzle biten ad benzeşme alır', () => {
      expect(properNounSuffix('VakıfBank', 'loc')).toBe("VakıfBank'ta");
      expect(properNounSuffix('VakıfBank', 'abl')).toBe("VakıfBank'tan");
      expect(properNounSuffix('VakıfBank', 'dat')).toBe("VakıfBank'a");
      expect(properNounSuffix('VakıfBank', 'gen')).toBe("VakıfBank'ın");
      expect(properNounSuffix('VakıfBank', 'acc')).toBe("VakıfBank'ı");
    });

    it('yumuşak ünsüzle biten ad benzeşme almaz', () => {
      expect(properNounSuffix('Sigorta', 'abl')).toBe("Sigorta'dan");
      expect(properNounSuffix('İstanbul', 'loc')).toBe("İstanbul'da");
    });

    it('ünlüyle biten ad yönelme/belirtmede y kaynaştırması alır', () => {
      expect(properNounSuffix('Ayşe', 'dat')).toBe("Ayşe'ye");
      expect(properNounSuffix('Ayşe', 'acc')).toBe("Ayşe'yi");
      expect(properNounSuffix('Ayşe', 'gen')).toBe("Ayşe'nin");
      expect(properNounSuffix('Ankara', 'dat')).toBe("Ankara'ya");
    });

    it('dört yönlü uyum yuvarlak ünlüde de doğru', () => {
      expect(properNounSuffix('Oğuz', 'gen')).toBe("Oğuz'un");
      expect(properNounSuffix('Gürsu', 'gen')).toBe("Gürsu'nun");
    });
  });

  describe('sınır durumları', () => {
    it('ad aynen korunur, yalnız ses çözümlemesinde noktalama atılır', () => {
      expect(properNounSuffix('Şti.', 'loc')).toBe("Şti.'nde");
      expect(properNounSuffix('  VakıfBank  ', 'loc')).toBe("VakıfBank'ta");
    });

    it('geçersiz girdide sentinel döner, çökmez', () => {
      expect(properNounSuffix('', 'loc')).toBe('—');
      expect(properNounSuffix('   ', 'loc')).toBe('—');
      expect(properNounSuffix('...', 'loc')).toBe('—');
      expect(properNounSuffix(null as unknown as string, 'loc')).toBe('—');
    });

    it('ünlüsüz ad çökmez ve harf harf okunur', () => {
      // TB-014 öncesi burada bilinen yanlış çivilenmişti ("BRT'ta"). Ünlüsüz kısaltma
      // artık son harfin okunuşuna göre çekiliyor: "be re te" -> ince (TDK: THY'de).
      expect(properNounSuffix('BRT', 'loc')).toBe("BRT'de");
    });
  });

  describe('gerileme koruması ve bilinen sınırlar', () => {
    // 2026-09-19: ilk uygulamada `/(sı|si|su|sü|…)$/` deseni kullanıldı ve YER
    // ADLARINI iyelik sandı. Talebi gönderen tüketicinin 18 testi geçen kodu da
    // aynı kusuru taşıyordu. Bu testler o geri gidişi tutar.
    it('-su/-sı ile biten YER ADI iyelik sayılmaz', () => {
      expect(properNounSuffix('Gürsu', 'loc')).toBe("Gürsu'da");
      expect(properNounSuffix('Aksu', 'loc')).toBe("Aksu'da");
      expect(properNounSuffix('Karasu', 'abl')).toBe("Karasu'dan");
      expect(properNounSuffix('Aksu', 'dat')).toBe("Aksu'ya");
    });

    it('kurum adı sonu olanlar iyelik sayılır', () => {
      expect(properNounSuffix('Ziraat Bankası', 'loc')).toBe("Ziraat Bankası'nda");
      expect(properNounSuffix('Sağlık Bakanlığı', 'dat')).toBe("Sağlık Bakanlığı'na");
      expect(properNounSuffix('Boğaziçi Üniversitesi', 'abl')).toBe("Boğaziçi Üniversitesi'nden");
    });

    it('BİLİNEN SINIR: listede olmayan kurum adı sonu kaynaştırma almaz', () => {
      // Gizlenmiyor, belgeleniyor. Doğrusu "Kooperatifi'nde" olurdu.
      // Eksik sonu bildirmek için GERI-BILDIRIM-KAYDI.md yolu kullanılır.
      expect(properNounSuffix('Tarım Kooperatifi', 'loc')).toBe("Tarım Kooperatifi'de");
    });
  });
});
