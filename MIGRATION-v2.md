# Geçiş Rehberi — v1.1.0 → v2.0.0

> Bu rehber `@snn/abacus-core` kullanan tüketici projeler içindir.
> Sürümün tam değişiklik listesi: [CHANGELOG.md](CHANGELOG.md).
>
> **Bu dosyadaki her kod örneği `src/abacus/docs-claims.test.ts` ile test edilir.**
> Bir davranış değişip rehber güncellenmezse CI kırılır.

---

## Özet: hiçbir `import` kırılmaz, üç yerde sessiz davranış değişir

API karşılaştırması yapıldı: **v1.1.0'daki hiçbir isim kaldırılmadı**, 27 yeni isim
eklendi. Yani mevcut kodun derlenmeye devam eder. Risk, aynı çağrının farklı sonuç
vermesindedir.

| Ne | Nasıl fark edilir |
|---|---|
| Tarih: saat dilimi çevrimi | **Sessiz** — gün kayabilir |
| Tarih: takvim doğrulaması | **Sessiz** — geçersiz tarih artık `'—'` |
| `money.parseNumber` | **Derleme hatası** — TypeScript yakalar |
| `money.fmtDecimalGrouped` | **Sessiz** — `'0'` yerine `'—'` |
| `money.toWords` (negatif) | **Sessiz** — metin değişti |
| `text.phone` / `mask.phone` | **Sessiz** — sabit hat artık geçerli |

Kurulum:

```bash
npm install github:sinanbocek/SNN-Abacus-Core#semver:^2.1.0
```

> **Pin biçimini de değiştirin.** v1.1.0'da sabit tag (`#v1.1.0`) kullanılıyordu.
> v2'den itibaren aralık (`#semver:^2.1.0`) önerilir: yama ve ek özellik
> sürümleri otomatik gelir, kırıcı major sürüm gelmez.
> Ayrıntı: [INSTALL.md §4](INSTALL.md).

---

## Adım 1 — Tarih kullanımını tara (en önemli adım)

`date` motorunda iki ayrı değişiklik var ve ikisi de sessizdir.

### 1a. Saat dilimi eki taşıyan ISO artık Europe/Istanbul'a çevriliyor

v1.1.0 saat kısmını tümüyle yok sayıyordu. v2.0.0 `Z` veya `±HH:MM` eki taşıyan
değerleri İstanbul saatine (sabit UTC+3) çevirir — bu **tarihi de** kaydırabilir.

```ts
date.format('2026-08-15T21:30:00Z')
// v1.1.0 → "15.08.2026"
// v2.0.0 → "16.08.2026"   (İstanbul'da ertesi gün 00:30)
```

Etkilenen fonksiyonlar: `format`, `dayName`, `relative`, `daysBetween`, `daysUntil`.

**Saat dilimi eki OLMAYAN değerlerde hiçbir şey değişmedi:**

```ts
date.format('2026-08-15')            // "15.08.2026"  (v1.1.0 ile aynı)
date.format('2026-08-15T21:30:00')   // "15.08.2026"  (ek yok → duvar saati)
```

Tarama:

```bash
grep -rn "date\.\(format\|dayName\|relative\|daysBetween\|daysUntil\)" src/
```

Bulduğun her çağrıda **girdinin nereden geldiğine** bak:

- API/veritabanından `"2026-08-15T21:30:00Z"` geliyorsa → **etkilenirsin**
- Formdan/kullanıcıdan `"2026-08-15"` geliyorsa → etkilenmezsin

> Karar gerekçesi: `format(x, 'short')` ile `format(x, 'dateTime')` aynı günü
> göstermeliydi. v1.1.0'da saat yok sayıldığı için bu tutarlılık yoktu.

### 1b. Var olmayan takvim günleri artık reddediliyor

```ts
date.format('2024-02-30', 'long')          // v1.1.0 → "30 Şubat 2024"   v2.0.0 → "—"
date.format('2025-02-29', 'long')          // v1.1.0 → "29 Şubat 2025"   v2.0.0 → "—"
date.daysBetween('2024-02-30', '2024-03-01') // v1.1.0 → 0               v2.0.0 → null
```

Gerçek artık yıllar elbette geçerli:

```ts
date.format('2024-02-29', 'long')   // "29 Şubat 2024"
date.format('2000-02-29', 'long')   // "29 Şubat 2000"
```

Ekranda beklenmedik bir `'—'` görürsen sebebi budur: **veri zaten bozukmuş**,
v1.1.0 bunu sessizce gizliyordu.

---

## Adım 2 — `money.parseNumber` çağrılarını düzelt

Tek **derleme hatası** veren değişiklik budur — bu yüzden gözden kaçmaz.

```ts
// v1.1.0: number  döndürürdü, 'abc' için 0
// v2.0.0: number | null döndürür, 'abc' için null
```

Önce:

```ts
const tutar = money.parseNumber(input);
hesapla(tutar);                      // artık TS hatası
```

Sonra:

```ts
const tutar = money.parseNumber(input);
if (tutar === null) {
  // geçersiz giriş — kullanıcıya bildir, sessizce 0 sayma
  return;
}
hesapla(tutar);
```

Gerçek sıfır ile geçersiz girdi artık ayrılır:

```ts
money.parseNumber('0')          // 0      ← gerçek sıfır
money.parseNumber('')           // null   ← değer yok
money.parseNumber('abc')        // null   ← çözümlenemedi
money.parseNumber('1.234,56')   // 1234.56 (değişmedi)
```

Tarama:

```bash
grep -rn "parseNumber" src/
```

---

## Adım 3 — Üç sessiz davranış değişikliği

### 3a. `money.fmtDecimalGrouped` yoklukta `'—'` dönüyor

```ts
money.fmtDecimalGrouped(null)      // v1.1.0 → "0"    v2.0.0 → "—"
money.fmtDecimalGrouped(0)         // "0"  (gerçek sıfır, değişmedi)
money.fmtDecimalGrouped(70000.5, 2) // "70.000,50"  (değişmedi)
```

Tabloda boş hücre yerine `0` göstermek isteyen bir yerin varsa artık bunu
**kendin** seçmelisin — çekirdek "veri yok" ile "değer sıfır"ı karıştırmıyor.

### 3b. `money.toWords` negatif metni düzeldi

```ts
money.toWords(-15000)
// v1.1.0 → "-Yalnız YüzElliTürkLirası"      (Türkçede geçersiz)
// v2.0.0 → "Yalnız EksiYüzElliTürkLirası"
```

Çek/sözleşme metni üreten bir yerin varsa çıktıyı bir kez gözden geçir.
Ayrıca geçersiz girdi artık sessizce "Sıfır" yazmıyor:

```ts
money.toWords(NaN)     // v1.1.0 → "Yalnız SıfırLiraKuruş"   v2.0.0 → "—"
```

### 3c. `text.phone` sabit hattı kabul ediyor

Bu, **filtreleme mantığını** etkileyebilecek tek değişikliktir.

```ts
text.phone('02123334455').valid   // v1.1.0 → false    v2.0.0 → true
text.phone('02123334455').kind    // v2.0.0 → "landline"
mask.phone('02123334455')         // v1.1.0 → "—"      v2.0.0 → "+90 2** *** ** 55"
```

**Cep numarası davranışı hiç değişmedi** (regresyon testleriyle çivilendi):

```ts
text.phone('5321234567').kind     // "mobile"
mask.phone('05321234567')         // "+90 5** *** ** 67"
```

"Sadece cep numarası kabul et" mantığın varsa niyetini açıkça yaz:

```ts
// ÖNCE — v1.1.0'da tesadüfen çalışıyordu
if (!text.phone(x).valid) reddet();

// SONRA — niyet açık
const p = text.phone(x);
if (!p.valid || p.kind !== 'mobile') reddet();
```

`whatsapp()` zaten yalnız cep için link üretir, ayrıca korumaya gerek yok:

```ts
text.whatsapp('02123334455')   // ""
text.whatsapp('5321234567')    // "https://wa.me/905321234567"
```

Yeni `kind` alanı: `'mobile' | 'landline' | 'special' | null`
(BTK Milli Numaralandırma Planı: 2/3/4 sabit hat, 5 mobil, 8/9 coğrafi olmayan).

---

## Adım 4 — Yükseltmeyi doğrula

```bash
npm install github:sinanbocek/SNN-Abacus-Core#semver:^2.1.0
npm test
```

Kırmızıya dönen her test yukarıdaki maddelerden **birine** karşılık gelmelidir.
Beklemediğin bir yer kırılıyorsa çekirdek tarafında bir sorun olabilir — depoya
issue aç.

Geri almak gerekirse pin'i eski tag'e çekmek yeterlidir:

```bash
npm install github:sinanbocek/SNN-Abacus-Core#v1.1.0
```

---

## Değişmeyenler (kontrol etmene gerek yok)

- **Hiçbir dışa açık isim kaldırılmadı.** `gold.ONS_TO_GRAM`, `silver.ONS_TO_GRAM`,
  `FormatMoneyOptions` dâhil hepsi aynı adla duruyor.
- **Tüm hesap motorları:** `math`, `currency`, `gold`, `silver`, `tradingMath`
  çıktıları birebir aynı.
- **`validate` sonuçları birebir aynı.** `tckn`/`vkn`/`iban` iç yapısı yeniden
  yazıldı ama davranış eşdeğerliği 40.000 üretilmiş girdide referans algoritmayla
  karşılaştırılarak kanıtlandı.
- **Para biçimlendirme** (`format`, `percent`, `compact`) değişmedi.
- **Türkçe harf dönüşümü** (`upper`, `lower`, `title`) değişmedi.
- **decimal.js:** v1.1.0'daki `Decimal.set({rounding: ROUND_HALF_UP})` satırı
  kaldırıldı, ama bu **hiçbir davranışı değiştirmez**: decimal.js'in varsayılan
  yuvarlama modu zaten `ROUND_HALF_UP`'tır, yani o satır bir işe yaramıyordu.

---

## Bedava gelen kazanç

Kod değiştirmeden alacağın şey **paket ağırlığı**. Uygulaman ABACUS'un yalnız
metin/doğrulama tarafını kullanıyorsa decimal.js artık pakete hiç girmiyor:

| Tüketim | v1.1.0 | v2.0.0 |
|---|---|---|
| `text.upper` tek başına | 42.815 B | **506 B** |
| `validate.tckn` tek başına | 43.018 B | **790 B** |

Ölçüm: vite lib modu, minify, ESM.

---

## Yeni motorlar (isteğe bağlı)

```ts
import { unit, period, collate } from '@snn/abacus-core';

// unit — birim çevrimi
unit.convert(5000, 'm2', 'dönüm');   // 5
unit.dataSize(5242880);              // "5 MB"

// period — dönem aritmetiği
period.addMonths('2026-01-31', 1);   // "2026-02-28"  (ay sonuna kırpar)
period.quarterRange(2026, 3);        // { start: "2026-07-01", end: "2026-09-30" }

// collate — Türkçe sıralama
collate.sortBy(['zam', 'çam', 'dal']);   // ["çam", "dal", "zam"]
```

`collate` özellikle işine yarayabilir: listeleri ham `Array.sort()` ile
sıralayan her yer Türkçe harfleri **yanlış** sıralıyordur.

```ts
['zam', 'çam', 'dal'].sort()   // ["dal", "zam", "çam"]  ← yanlış
```

---

## Bilinen sınır

`date` motoru **sabit UTC+3** varsayar. Bu, Türkiye'nin 2016 sonrası kalıcı
düzenine uygundur. **2016 öncesi** tarihlerde yaz saati dönemleri için saat/tarih
bir saat sapabilir. `Intl` kullanımı çekirdekte yasak olduğu için tarihsel saat
dilimi veritabanı taşınmamıştır. Geçmiş tarihlerle çalışıyorsan bunu göz önünde
bulundur.
