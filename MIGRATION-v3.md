# Geçiş Rehberi — v2.x → v3.0.0

> Bu rehber `@snn/abacus-core` kullanan tüketici projeler içindir.
> Sürümün tam değişiklik listesi: [CHANGELOG.md](CHANGELOG.md).
>
> **Bu dosyadaki her kod örneği `src/abacus/docs-claims.test.ts` ile test edilir.**

---

## Özet: hiçbir `import` kırılmaz, üç yerde davranış değişir

**Hiçbir ad kaldırılmadı veya yeniden adlandırılmadı**; kodunuz derlenmeye devam eder.
Değişen, bazı fonksiyonların **ekranda gösterdiği metin** ve geçersiz hane sayısındaki
davranışıdır. Hiçbiri TypeScript tarafından yakalanmaz.

| Ne | Kimleri etkiler | v2.x | v3.0.0 |
|---|---|---|---|
| `money.percent` — işaret konumu | **Negatif** yüzde veya `sign: 'always'` kullanan herkes | `%-4,3` · `%+4,3` | `-%4,3` · `+%4,3` |
| `text.suffix` — negatif ve ondalıklı sayı | Negatif veya ondalıklı değere ek getiren herkes | `%-2'e` · `%2.5'e` | `-%2'ye` · `%2,5'e` |
| Geçersiz hane sayısı (`decimal`, `percent`, `fmtDecimalGrouped`, `dataSize`) | `digits`'i hesaplayıp veren veya `try/catch` ile saran herkes | **hata fırlatır** | `'—'` döner |

Pozitif ve işaretsiz yüzdeler (`%4,3`), `sign: 'never'` çıktıları ve tam, pozitif
sayılara getirilen ekler **değişmedi**.

Kurulum — major sürüm otomatik gelmez, pin'i elle yükseltin:

```bash
npm install github:sinanbocek/SNN-Abacus-Core#semver:^3.0.0
```

---

## 1. `money.percent` — eksi artık en başta

**Neden:** Yüzde işareti Türkçede sayıdan önce yazılır (TDK: `%25`), ama TDK negatif
yüzde için hüküm koymaz. v2.x bu kuralı harfiyen uygulayıp eksiyi iki sembolün arasına
sıkıştırıyordu (`%-4,3`); tabloda yön ilk karakterden okunamıyordu. Unicode CLDR'nin
Türkçe biçimi — tarayıcıların ve `Intl.NumberFormat`'ın ürettiği yazım — `-%4,3`'tür.

```ts
money.percent(-4.3, 1)                      // v2.x "%-4,3"   → v3.0.0 "-%4,3"
money.percent(4.3, 1, { sign: 'always' })   // v2.x "%+4,3"   → v3.0.0 "+%4,3"
money.percent(-4.3, 2, { fixed: true })     // v2.9 "%-4,30"  → v3.0.0 "-%4,30"
```

### Yapmanız gerekenler

**a) Kendi testlerinizi tarayın.** Beklenen metninde `%-` veya `%+` geçen testler
kırılacak:

```bash
grep -rnE "['\"\`]%[-+][0-9]" src/ test/
```

Desen yalnız tırnak içindeki yüzde metnini arar. Tırnak şartı bilinçlidir: Tailwind
sınıflarındaki `calc(100%+8px)` gibi ifadeler yanlış alarm vermez.

**b) Metin ayrıştıran kodu tarayın.** Çıktının `%-` ile başladığını varsayan kod
(ör. `etiket.startsWith('%-')` ile renk seçmek) sessizce yanlış çalışır. Yönü metinden
okumayın; sayının kendisine bakın (`deger < 0`).

**c) Eski yazım gerçekten gerekiyorsa** (ör. dışarıya verilen sabit biçimli bir rapor):

```ts
money.percent(-4.3, 1, { signPosition: 'inner' })   // "%-4,3"
```

---

## 2. `text.suffix` — negatif ve ondalıklı sayılarda doğru ek

**Neden:** Ek, sayının okunuşunun son kelimesine göre seçilir. v2.x okunuşu
`numberToWords` ile üretiyordu; o fonksiyon negatif ve ondalıklı sayılarda boş döndüğü
için **ek rastgele düşüyordu**. Ondalık sayı ayrıca İngilizce noktayla yazılıyordu.
TDK: ondalık virgülle yazılır ve ek okunuşa göre seçilir (`7,65'lik`).

```ts
text.suffix(-2, 'percent', 'dat')   // v2.x "%-2'e"   → v3.0.0 "-%2'ye"   (eksi iki → ikiye)
text.suffix(-2, 'number', 'dat')    // v2.x "-2'e"    → v3.0.0 "-2'ye"
text.suffix(2.5, 'percent', 'dat')  // v2.x "%2.5'e"  → v3.0.0 "%2,5'e"   (onda beş → beşe)
text.suffix(7.65, 'number', 'loc')  //                  v3.0.0 "7,65'te"
```

v2.x'teki çıktılar **yanlıştı**; eski davranışı geri getiren bir seçenek yoktur.

### Yapmanız gerekenler

Negatif veya ondalıklı değere `suffix` uygulayan testlerinizde beklenen metni
güncelleyin. Bu çıktılar v2.x'te bir hatayı yansıttığı için, onları "doğru" diye
kodlamış bir test büyük ihtimalle hatayı kilitlemiş demektir.

---

## 3. Geçersiz hane sayısı artık çökmez

**Neden:** Hane sayısı alan biçimleme fonksiyonları geçersiz `digits` değerinde
decimal.js hatası **fırlatıyordu**. `ABACUS-SPEC §2.1`'e göre biçimleme işi çökmez,
`'—'` döner. Çok büyük hane sayısı da anlamsız çıktı üretiyordu
(`fmtDecimalGrouped(4.3, 100)` virgülden sonra 100 hane).

Kural: `digits` **0 ile 20 arasında bir tam sayı** olmalıdır.

```ts
money.decimal(2.5, 1.5)                    // v2.x fırlatır  → v3.0.0 "—"
money.percent(4.3, -1)                     // v2.x fırlatır  → v3.0.0 "—"
money.fmtDecimalGrouped(4.3, 21)           // v2.x "4,300000000000000000000" → v3.0.0 "—"
unit.dataSize(5242880, { digits: 1.5 })    // v2.x fırlatır  → v3.0.0 "—"
```

`money.formatMinorInput` değişmedi; zaten 0–4 dışını `'—'` döndürüyordu.

### Yapmanız gerekenler

- Bu çağrıları **`try/catch` ile sarmış** kodunuz artık hata yakalamaz; `'—'` değerini
  kontrol edin.
- `digits`'i **hesaplıyorsanız** (ör. `n / 2`), sonucun tam sayı olduğundan emin olun.
- 20'den fazla hane isteyen bir çağrınız varsa `'—'` alırsınız; JavaScript sayısı
  ~17 anlamlı basamak taşır, fazlası uydurma sıfırdı.

---

## Kontrol listesi

- [ ] Pin `#semver:^3.0.0` olarak güncellendi
- [ ] `%-` / `%+` arayan testler ve kod tarandı
- [ ] Yüzde yönünü metinden okuyan kod sayıya bakacak şekilde değiştirildi
- [ ] Negatif/ondalıklı `suffix` beklentileri güncellendi
- [ ] Hane sayısı alan çağrılardaki `try/catch` ve hesaplanan `digits` gözden geçirildi
- [ ] Projenin kendi testleri yeşil
