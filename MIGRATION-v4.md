# Geçiş Rehberi — v3.x → v4.0.0

> Bu rehber `@snn/abacus-core` kullanan tüketici projeler içindir.
> Sürümün tam değişiklik listesi: [CHANGELOG.md](CHANGELOG.md).
> Kararın gerekçesi: [`docs/teknik-borc.md`](docs/teknik-borc.md) TB-010.
>
> **Bu dosyadaki her kod örneği `src/abacus/docs-claims.test.ts` ile test edilir.**

---

## Özet: tek davranış değişti, hiçbir ad kaldırılmadı

`money.parseNumber` artık **yalnız Türkçe biçimi** okur. Başka her yazım `null` döner.

**Hiçbir ad kaldırılmadı veya yeniden adlandırılmadı**; kodunuz derlenmeye devam eder.
Dönüş tipi zaten `number | null`'dı — TypeScript size **hiçbir şey söylemeyecek**.
Değişen, hangi girdilerin `null` döndüğüdür.

| Girdi | v3.x | v4.0.0 |
|---|---|---|
| `'1.234,56'` | `1234.56` | `1234.56` — değişmedi |
| `'1 234,56'` · `'1 234,56'` | `1234.56` | `1234.56` — değişmedi |
| `'1.250.000'` | `1250000` | `1250000` — değişmedi |
| `'-1.234,56'` | `-1234.56` | `-1234.56` — değişmedi |
| **`'1234.56'`** | **`123456`** ← 100 kat yanlış | **`null`** |
| **`'1.5'`** | **`15`** | **`null`** |
| **`'1e3'`** | **`13`** | **`null`** |
| **`'12abc34'`** | **`1234`** | **`null`** |
| **`'(1.210,50)'`** | **`1210.5`** ← işaret kaybı | **`null`** |

Türkçe biçimli girdilerin hiçbiri değişmedi. Değişen yalnız, v3'ün **sessizce yanlış
sayı ürettiği** yazımlardır.

## Neden kırıcı bir düzeltme

v3'ün JSDoc'u *"Çözümlenemeyen girdide `null` döner"* diyordu; kod bunu yapmıyordu.
`'1234.56'` girdisi için `123456` üretiyordu — yüz kat yanlış bir para değeri, hata yok,
uyarı yok. `null` denetimi yazan çağıranın denetimi hiç çalışmıyordu.

Bu bir davranış değişikliğidir ve `AI-RULES §4.0` gereği MAJOR'dur: bir tüketici
(`SNN-Ihale-Maliyet`) v3'ün bu davranışını **bir teste yazmış** ve etrafına kendi
koruma katmanını örmüştü.

## ⚠️ Önce şuna bakın: `?? 0` zinciri

Ölçüldü (2026-09-19): iki tüketici `parseNumber` sonucunu `?? 0` ile sarıyor.

```ts
// trade-kasa/src/components/tabs/trade/format.ts:15
export const parseNumber = (text: string): number => money.parseNumber(text) ?? 0;

// SNN-Yonetici-Ozeti/src/infrastructure/parsers/mizanParser.ts:36
return money.parseNumber(String(val)) ?? 0;
```

Bu kalıpta v4 **sessiz bir sapma** üretir: v3'te *yanlış ama sıfırdan farklı* bir sayı
dönen girdiler artık `null` → `0` olur. Mizan toplamı ya da risk hesabı sessizce kayar.

**Yapılacak:** `?? 0` yerine geçersiz girdiyi açıkça ele alın.

```ts
const parsed = money.parseNumber(text);
if (parsed === null) {
  // ekranda uyar / satırı geçersiz say / kullanıcıdan düzeltme iste
  return { kind: 'invalid' };
}
```

## Nokta ondalık ayracı bekliyorsanız

Dış kaynak (API, CSV, İngilizce yerel ayarlı Excel) `1234.56` yazımı gönderiyorsa,
çekirdek **tahmin etmez**. Kendi katmanınızda Türkçe biçime çevirin:

```ts
// Dış kaynaktan gelen İngilizce yazımı Türkçeye çevir
const trFormat = raw.replace(/,/g, '').replace('.', ',');
const value = money.parseNumber(trFormat);
```

Muhasebe parantezi (`(1.210,50)` = negatif) de kapsam dışıdır; kendiniz soyun:

```ts
const negative = /^\(.*\)$/.test(raw);
const inner = raw.replace(/^\(|\)$/g, '');
const parsed = money.parseNumber(inner);
const value = parsed === null ? null : negative ? -parsed : parsed;
```

## Kendi kapısını yazmış olanlar

`SNN-Ihale-Maliyet` v3'ün gevşekliğine karşı `readDecimalCell` kapısını yazmıştı.
v4'ün dilbilgisi **o kapıdan alındı** (aynı üç kural: isteğe bağlı eksi · 3'erli
nokta/boşluk/U+00A0 binlik grupları · virgülden sonra ondalık). Kapınız çalışmaya devam
eder; artık gereksizdir ama zarar vermez. Kaldırmadan önce kendi testlerinizi koşturun.

## Kurulum — major sürüm otomatik gelmez

`#semver:^3.x` ile bağlıysanız v4 size **kendiliğinden inmez**. Pin'i elle yükseltin:

```bash
npm install github:sinanbocek/SNN-Abacus-Core#semver:^4.0.0
```

## Kontrol listesi

- [ ] `parseNumber` çağrılarını bulun: `grep -rn "parseNumber" src/`
- [ ] Her çağrıda girdinin **nereden geldiğini** sorun: kullanıcı kutusu mu, dış kaynak mı?
- [ ] `?? 0` ile saranları açık `null` denetimine çevirin
- [ ] Dış kaynaklı nokta-ondalık yazımı kendi katmanınızda çevirin
- [ ] Testlerinizi koşturun — v3 davranışını çivileyen bir testiniz varsa kırılacaktır
