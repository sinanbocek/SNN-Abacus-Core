# Talep Müdürü: kalıcı bilgi

## Sahip olunan dosyalar

| Yol | İçerik |
|---|---|
| `GERI-BILDIRIM-KAYDI.md` | Her talebin ve kararın tek kaydı. Durum tablosu burada. |
| `skills/abacus-talep/SKILL.md` | Tüketici oturumlarının talep gönderme becerisi |
| `.github/ISSUE_TEMPLATE/abacus-talep.yml` | Talep formu |

Beceri ile form birbirine bağlıdır. Birini değiştirince `npm run beceri:dogrula` çalıştır.

## Değerlendirme sırası

1. Kaydı tara: aynı talep reddedilmiş mi, yeniden başvuru koşulu karşılanmış mı?
2. Kaydın başındaki beş şartı denetle: gerçek ekran, ölçülmüş çıktı, alternatif, yazılı sınav ve sınav tablosu.
3. Yerleştirme sınavını yazılı uygula (`AI-RULES.md` §4.1). Elenen adaylar da yazılır.
4. İddiayı ölç. Sayıyı bağımsız hesapla, davranışı çalışan kodla göster.
5. Mevzuata dayanıyorsa aslını oku.
6. Karar taslağını kayda yaz: madde bölümü ve durum tablosu satırı.

Numara: madde numarası durum tablosundan, talep numarası `## Kaynak raporlar` tablosundan alınır; en büyüğün bir fazlasıdır.

## Durum tablosu sözleşmesi

`scripts/check-release-batching.mjs` yalnız `## Durum tablosu` bölümünü okur ve son sütuna bakar.

| Son sütun | Anlamı |
|---|---|
| `bekliyor` | Kabul edildi, uygulanmadı. Sürümü durdurur. |
| `yayınlanmadı (main)` | Uygulandı, `main`'de, sürüm almadı. Sürümü durdurmaz. |
| Sürüm numarası | Çıktı |
| `—` | Red, ertelendi |
| `sonraki MAJOR` | Kabul, kırıcı olduğu için bekliyor. Sürümü durdurmaz. |

Bölüm başlığını değiştirme; betik onu arar.

## Kalıcı sahip kararları

Bunları "düzeltme" diye geri alma (ayrıntı kayıtta):

- Madde 44D: K harfi "ka" okunur (`SGK'da`). TDK'dan bilerek ayrılır, emsal değildir.
- Madde 46A: `Hizmetleri` → `Hiz.`
- Madde 51B: `amortize` yalnız `remainder: 'last'`. Öteki modlar ölçülmüş ekranla gelir.
- Madde 51C: adat için ayrı işlev yok; `period.accrual` kullanılır.

## Ölçüm

- Geçici betik depo dışında durur.
- Tüketici projeler `SNN-AI-Asus-Z14` altındadır, yalnız okunur. Tüketicinin kendi kopyası onun işidir.

## Yayın

Sen yayın yapmazsın. Sürüm değerlendirmesi taslakta yazılır, karar sahibindir (`AI-RULES.md` §4.3).
