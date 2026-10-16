import { describe, expect, it } from 'vitest';
import { abbreviationSteps } from './index';

/**
 * Madde 46A — kurum ve şirket unvanını GÖSTERİM için adım adım kısaltma (talep #14).
 *
 * Kısaltma biçimlerinin kaynağı TDK Kısaltmalar Dizini (tdk.gov.tr, `Kısaltmalar_Dizini.pdf`,
 * aslından okundu 2026-09-24 ve 2026-10-16): `Bşk.`, `Md.`, `gn.`, `Şb.`, `Mah.`, `Cad.`,
 * `Sok.`, `Bul.`, `Apt.`, `Fak.`, `Ens.`, `Müh.`, `Ort.`, `Ltd.`, `tic.`, `T.C.` TDK'da
 * olmayanlar fiilî uygulamadır: `BŞB`, `Bld.`, `OSB`, `Şti.`, `A.Ş.`, `San.`, `İnş.`, `Dai.`,
 * `Hiz.`, `Üniv.`, `Rekt.`, `Koop.`, `Taah.`, `Dan.`, `Mak.`, `Nak.`, `İth.`, `İhr.`, `Paz.`
 * Sahip kararları (2026-10-16): kalıplar önce, `Büyükşehir Belediye Başkanlığı` doğrudan `BŞB`;
 * `Genel Müdürlüğü` → `Gn. Md.`
 */
const final = (steps: string[]) => steps[steps.length - 1];
const last = (value: string, extra?: Parameters<typeof abbreviationSteps>[1]) =>
  final(abbreviationSteps(value, extra));

describe('text.abbreviationSteps', () => {
  it('ilk adım metnin kendisidir; her sonraki adım bir öncekinden kısadır', () => {
    const value =
      'Manisa Büyükşehir Belediyesi Mezarlıklar Dairesi Başkanlığı Defin Hizmetleri Şube Müdürlüğü';
    const steps = abbreviationSteps(value);
    expect(steps[0]).toBe(value);
    expect(final(steps)).toBe('Manisa BŞB Mezarlıklar Dai. Bşk. Defin Hiz. Şb. Md.');
    for (let i = 1; i < steps.length; i++)
      expect((steps[i] ?? '').length).toBeLessThan((steps[i - 1] ?? '').length);
  });

  it('kalıp ifade tek kelimelerden önce uygulanır: ikinci adım BŞB', () => {
    const steps = abbreviationSteps('Manisa Büyükşehir Belediye Başkanlığı Park Müdürlüğü');
    expect(steps[1]).toBe('Manisa BŞB Park Müdürlüğü');
    expect(final(steps)).toBe('Manisa BŞB Park Md.');
  });

  it('büyük harfli metin büyük harfle kısalır', () => {
    expect(last('MANİSA BÜYÜKŞEHİR BELEDİYE BAŞKANLIĞI MEZARLIKLAR DAİRESİ BAŞKANLIĞI')).toBe(
      'MANİSA BŞB MEZARLIKLAR DAİ. BŞK.',
    );
  });

  it('büyük harfli metinde İ yerine I yazılmışsa da tanınır (EKAP verisinde ölçüldü)', () => {
    expect(last('ANKARA BÜYÜKŞEHIR BELEDIYESI FEN ISLERI DAIRESI BAŞKANLIĞI')).toBe(
      'ANKARA BŞB FEN ISLERI DAİ. BŞK.',
    );
  });

  it('Genel Müdürlüğü ve bölge müdürlüğü', () => {
    expect(last('Karayolları Genel Müdürlüğü 3. Bölge Müdürlüğü')).toBe('Karayolları Gn. Md. 3. Bölge Md.');
  });

  it('şirket unvanı: Limited Şirketi bitişik Ltd.Şti. olur', () => {
    expect(last('TYC Grup Yapı Peyzaj Orman Ürünleri Limited Şirketi')).toBe(
      'TYC Grup Yapı Peyzaj Orman Ürünleri Ltd.Şti.',
    );
  });

  it('şirket unvanı: sektör kelimeleri ve Anonim Şirketi', () => {
    expect(last('Örnek İnşaat Taahhüt Sanayi ve Ticaret Anonim Şirketi')).toBe(
      'Örnek İnş. Taah. San. ve Tic. A.Ş.',
    );
    expect(last('ÖRNEK MAKİNA MÜHENDİSLİK DANIŞMANLIK NAKLİYAT İTHALAT İHRACAT PAZARLAMA LİMİTED ŞİRKETİ')).toBe(
      'ÖRNEK MAK. MÜH. DAN. NAK. İTH. İHR. PAZ. LTD.ŞTİ.',
    );
  });

  it('kurum kalıpları: OSB, T.C., üniversite, fakülte, enstitü, kooperatif, ortaklık', () => {
    expect(last('Manisa Organize Sanayi Bölgesi Müdürlüğü')).toBe('Manisa OSB Md.');
    expect(last('Türkiye Cumhuriyeti Ziraat Bankası Anonim Şirketi')).toBe('T.C. Ziraat Bankası A.Ş.');
    expect(last('Ege Üniversitesi Rektörlüğü Tıp Fakültesi')).toBe('Ege Üniv. Rekt. Tıp Fak.');
    expect(last('Sağlık Bilimleri Enstitüsü')).toBe('Sağlık Bilimleri Ens.');
    expect(last('Tarım Kredi Kooperatifi Adi Ortaklığı')).toBe('Tarım Kredi Koop. Adi Ort.');
  });

  it('adres sözcükleri TDK yazımıyla: Mah. Cad. Sok. Bul. Apt.', () => {
    expect(last('Laleli Mahallesi Mimarsinan Bulvarı No:242')).toBe('Laleli Mah. Mimarsinan Bul. No:242');
    expect(last('Atatürk Caddesi Gül Sokağı Deniz Apartmanı')).toBe('Atatürk Cad. Gül Sok. Deniz Apt.');
    expect(last('1453 Sokak')).toBe('1453 Sok.');
  });

  it('kelimenin parçası kısaltılmaz (madde 44B ve GHS-Panel KASAP dersi)', () => {
    expect(abbreviationSteps('Şubeler Birliği Dairesel Plan')).toEqual(['Şubeler Birliği Dairesel Plan']);
    expect(abbreviationSteps('Kasap Ahmet Sanayici Ticaretçi')).toEqual(['Kasap Ahmet Sanayici Ticaretçi']);
    expect(abbreviationSteps('Dışticaret Altşube')).toEqual(['Dışticaret Altşube']);
    expect(abbreviationSteps('DIŞTİCARET ALTŞUBE')).toEqual(['DIŞTİCARET ALTŞUBE']);
  });

  it('noktalama kelime sınırıdır', () => {
    expect(last('Park (Belediyesi), Şube.')).toBe('Park (Bld.), Şb..');
  });

  it('tüketicinin ek sözlüğü önce uygulanır ve büyük harfle de çalışır', () => {
    const extra = { extra: [['İstanbul Büyükşehir Belediyesi', 'İBB']] as const };
    const steps = abbreviationSteps('İstanbul Büyükşehir Belediyesi Fen İşleri Daire Başkanlığı', extra);
    expect(steps[1]).toBe('İBB Fen İşleri Daire Başkanlığı');
    expect(final(steps)).toBe('İBB Fen İşleri Daire Bşk.');
    expect(last('İSTANBUL BÜYÜKŞEHİR BELEDİYESİ', extra)).toBe('İBB');
  });

  it('kısaltmayan ya da boş ek kural yok sayılır', () => {
    const extra = {
      extra: [
        ['', 'X'],
        ['Park', 'Parkı Uzun'],
      ],
    } as const;
    expect(abbreviationSteps('Park Müdürlüğü', extra)).toEqual(['Park Müdürlüğü', 'Park Md.']);
  });

  it('ek kuralın kısa hâlindeki $ işareti düz metindir', () => {
    expect(last('Örnek Holding', { extra: [['Holding', 'H$&']] })).toBe('Örnek H$&');
  });

  it('ek kuraldaki düzenli ifade karakterleri düz metin sayılır', () => {
    expect(last('A.B.C Holding', { extra: [['A.B.C', 'ABC']] })).toBe('ABC Holding');
    expect(abbreviationSteps('AxBxC Holding', { extra: [['A.B.C', 'ABC']] })).toEqual(['AxBxC Holding']);
  });

  it('kısaltılacak bir şey yoksa ya da metin boşsa tek adım', () => {
    expect(abbreviationSteps('Ahmet Yılmaz')).toEqual(['Ahmet Yılmaz']);
    expect(abbreviationSteps('')).toEqual(['']);
  });
});
