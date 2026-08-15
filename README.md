# 🧮 ABACUS Core Reference Engine (`snn-abacus-core`)

> **ABACUS Engine Standard**: Tüm SNN projelerinde finansal hesaplama, Türkçe metin normalizasyonu, tarih biçimlendirme, PII gizleme ve doğrulama işlemlerinde **Tek Otorite (Single Source of Truth)** olan bağımsız referans çekirdek deposu.

---

## 📦 Motor Özeti (7 Çekirdek Motor)

| Motor | Klasör | Bir Satır Özeti |
|---|---|---|
| **`math`** | `src/abacus/math/` | `decimal.js` tabanlı hassas kuruş matematiği (IEEE-754 float hatasız toplama, çıkarma, çarpma, bölme, half-up yuvarlama). |
| **`money`** | `src/abacus/money/` | TCMB standartlarında para biçimlendirme (`format`), tutar yazısı (`toWords`) ve compact kısaltma (`compact`: 1M, 1.5Mn). |
| **`currency`** | `src/abacus/currency/` | Parametrik kur çevrimi (`convert`, `cross`). Kur enjeksiyon prensibiyle çalışır; dış HTTP/DB bağımlılığı yoktur. |
| **`date`** | `src/abacus/date/` | `Intl` bağımsız Türkçe ISO tarih biçimlendirme (`format`), bağıl zaman (`relative`), gün farkı (`daysBetween`) ve gün adı (`dayName`). |
| **`text`** | `src/abacus/text/` | Türkçe ek çekim fonetiği (`suffix`: 5 hâl + 6 iyelik + pronominal-n), harf dönüşümü (`upper`, `lower`, `title`), `join` ve metin normalizasyonları (`phone`, `email`, `website`, `name`, `company`). |
| **`validate`** | `src/abacus/validate/` | Türkiye resmi kurum checksum algoritmaları (`vkn`, `tckn`, `iban` TR mod-97), `ikn` formatı ve `email` doğrulaması. |
| **`mask`** | `src/abacus/mask/` | Gösterim amaçlı PII gizleme motoru (`money`, `vkn`, `iban`, `phone`). Saklanan veriyi asla mutasyona uğratmaz. |

---

## 🔒 Kalite ve Kırmızı Çizgiler (Zero Tolerance Rules)

1. **Sıfır Ham Math.\***: Tüm finansal hesaplamalar `math` motoru üzerinden yürütülür.
2. **Sıfır Intl / toLocale\***: Tarih ve para formatlamasında `Intl` ve `toLocale*` kullanımı yasaktır.
3. **Sıfır Ham toLowerCase / toUpperCase**: Türkçe harf dönüşümleri (`İ->i`, `I->ı`) `text.lower` ve `text.upper` ile yapılır.
4. **Parametresiz Date Yok**: `relative` ve `daysUntil` fonksiyonları bugün tarihini parametre olarak alır.
