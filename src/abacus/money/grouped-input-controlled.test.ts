import { describe, expect, it } from 'vitest';
import { type GroupedInputOptions, formatGroupedInput, parse, parseNumber } from './index';

/**
 * Talep #48 (GHS-Panel) — `dotAsDecimal` KONTROLLÜ kutuda kullanılamıyordu.
 *
 * Kontrollü kutuda (React `value` + `onChange`) her tuşta kutunun ÖNCEKİ çıktısı
 * ile yeni karakter yeniden biçimlenir. 1.000 ve üzerindeki her tutarda çıktı bir
 * binlik noktası taşır (`8.534`); bir sonraki tuşta o nokta ondalık sanılıyordu:
 * `8.534` + `0` -> `8,5340` — 10.000 kat sapma. Silerken de aynısı: `85.340,`
 * kutusunda virgül silinince `85,340` — 1000 kat.
 *
 * Madde 38 ile aynı sınıf: kütüphanenin KENDİ çıktısı kendi girdisini bozuyor.
 * 37A ve 38'in testleri adımları ham metinle veriyordu, çıktıyı kutuya geri
 * beslemiyordu; bu dosyanın her testi geri besler.
 */

const DOT: GroupedInputOptions = { dotAsDecimal: true };

/** Kontrollü kutuyu taklit eder: her tuşta `box = f(box + tuş, { previous: box })`. */
function typeKeys(keys: string, opts: GroupedInputOptions = DOT): string[] {
  let box = '';
  return [...keys].map((key) => {
    box = formatGroupedInput(box + key, { ...opts, previous: box });
    return box;
  });
}

/** Kutunun son hâli. */
function last(steps: string[]): string {
  return steps[steps.length - 1] ?? '';
}

/** Sondan geri silme (Backspace) — kutu boşalana kadar. */
function backspace(start: string, opts: GroupedInputOptions = DOT): string[] {
  let box = start;
  const steps: string[] = [];
  while (box !== '') {
    box = formatGroupedInput(box.slice(0, -1), { ...opts, previous: box });
    steps.push(box);
  }
  return steps;
}

describe('formatGroupedInput — dotAsDecimal kontrollü kutuda (previous)', () => {
  describe('tuş tuş yazım — çıktı kutuya geri beslenir', () => {
    it('virgülle: 85340,50', () => {
      expect(typeKeys('85340,50')).toEqual([
        '8',
        '85',
        '853',
        '8.534',
        '85.340',
        '85.340,',
        '85.340,5',
        '85.340,50',
      ]);
    });

    it('sayısal tuş takımının noktasıyla: 85340.50 (seçeneğin amacı)', () => {
      expect(typeKeys('85340.50')).toEqual([
        '8',
        '85',
        '853',
        '8.534',
        '85.340',
        '85.340,',
        '85.340,5',
        '85.340,50',
      ]);
    });

    it('milyonlarca: 1234567.89', () => {
      expect(last(typeKeys('1234567.89'))).toBe('1.234.567,89');
    });

    it('1.000 altı da bozulmaz (37A yolu)', () => {
      expect(typeKeys('98.50')).toEqual(['9', '98', '98,', '98,5', '98,50']);
    });

    it('virgül varken basılan nokta yok sayılır — ikinci ondalık ayracı olmaz', () => {
      expect(formatGroupedInput('85.340,5.', { ...DOT, previous: '85.340,5' })).toBe('85.340,5');
    });

    it('uçtan uca: kutu metni doğru sayıya döner', () => {
      const box = last(typeKeys('85340.50'));
      expect(parseNumber(box)).toBe(85340.5);
      expect(parse(box)).toBe(8534050);
    });
  });

  describe('silme ve araya ekleme', () => {
    it('sondan silme: gruplar yeniden kurulur, ondalığa dönmez', () => {
      expect(backspace('85.340,50')).toEqual([
        '85.340,5',
        '85.340,',
        '85.340',
        '8.534',
        '853',
        '85',
        '8',
        '',
      ]);
    });

    it('değişmeyen kutu aynen kalır (ör. imleç hareketi sonrası yeniden çizim)', () => {
      expect(formatGroupedInput('85.340,50', { ...DOT, previous: '85.340,50' })).toBe('85.340,50');
      expect(formatGroupedInput('1.000', { ...DOT, previous: '1.000' })).toBe('1.000');
    });

    it('tekrar eden rakamlarda silme: 1.000.000', () => {
      // Ortak baş ve son örtüşmemeli; yoksa silinen '0' ortak sona da sayılır.
      expect(backspace('1.000.000')).toEqual([
        '100.000',
        '10.000',
        '1.000',
        '100',
        '10',
        '1',
        '',
      ]);
    });

    it('ortadaki virgül silinirse rakamlar birleşir (varsayılan kiple aynı)', () => {
      const raw = '85.34050';
      expect(formatGroupedInput(raw, { ...DOT, previous: '85.340,50' })).toBe('8.534.050');
      expect(formatGroupedInput(raw)).toBe('8.534.050');
    });

    it('araya rakam eklenir: 1.2|34 -> 12.934', () => {
      expect(formatGroupedInput('1.2934', { ...DOT, previous: '1.234' })).toBe('12.934');
    });

    it('gruplanmış sayının sonuna basılan nokta ondalık olur', () => {
      expect(formatGroupedInput('85.340.', { ...DOT, previous: '85.340' })).toBe('85.340,');
    });

    it('binlik noktasının yanına basılan nokta ondalık olur: 1.|000 -> 1,000', () => {
      // Ortak baş ve son örtüşmemeli: yeni nokta, eski noktayla aynı karakter
      // olduğu için ortak sona sayılırsa kaybolur ve kutu '1.000'da kalırdı.
      expect(formatGroupedInput('1..000', { ...DOT, previous: '1.000' })).toBe('1,000');
    });
  });

  describe('yapıştırma — 37A, 38 ve TAKAS sözleşmesi DEĞİŞMEDİ', () => {
    it.each([
      ['98.50', '98,50'],
      ['1.234,56', '1.234,56'],
      ['1.250.000', '1.250.000'],
      ['1.234', '1,234'],
    ])('boş kutuya %j -> %j', (raw, expected) => {
      expect(formatGroupedInput(raw, { ...DOT, previous: '' })).toBe(expected);
      expect(formatGroupedInput(raw, DOT)).toBe(expected);
    });

    it('tümü seçilip üstüne yapıştırılır', () => {
      expect(formatGroupedInput('1234.5', { ...DOT, previous: '85.340,50' })).toBe('1.234,5');
    });
  });

  describe('previous kutunun kendi çıktısı DEĞİLSE durumsuz kurala düşülür', () => {
    it("başlangıç değeri String(98.5) gibi yazılmışsa noktası binlik sanılmaz", () => {
      // '98.5' formatGroupedInput'un üretebileceği bir metin değil; noktası
      // kütüphaneden gelmiyor, dolayısıyla binlik ayracı diye silinmez.
      expect(formatGroupedInput('98.50', { ...DOT, previous: '98.5' })).toBe('98,50');
    });
  });

  describe('previous verilmezse bugünkü davranış sürer (kırıcı değil)', () => {
    it('durumsuz çağrı geri beslemede hâlâ bozulur — belgelenmiş sınır', () => {
      let box = '';
      for (const key of '85340') box = formatGroupedInput(box + key, DOT);
      expect(box).toBe('8,5340');
    });

    it('varsayılan kipte previous etkisizdir', () => {
      expect(formatGroupedInput('98.50', { previous: '98.5' })).toBe('9.850');
      expect(last(typeKeys('85340,50', {}))).toBe('85.340,50');
    });
  });
});
