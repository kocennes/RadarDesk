# Security Guidelines

Bu rehber; auth, API, veri, dosya islemleri, dashboard, musteri formlari ve savunma/gorev sistemleriyle ilgili frontend/backend kodlarinda kullanilir.

## Temel Prensipler

- Gizli bilgi varsayilan olarak korunur.
- Client tarafindaki kontrol tek basina guvenlik sayilmaz.
- API key, token, sifre, gizli URL, musteri bilgisi veya proje bilgisi kaynak koda yazilmaz.
- Hassas veri loglanmaz.
- PDF ve is dokumanlari kullanici izni olmadan kopyalanmaz, upload edilmez, disari aktarilmaz.
- Yetki kontrolu backend/API tarafinda yapilmalidir.

## Frontend Guvenligi

- Form inputlari validate edilir.
- Hata mesajlari fazla teknik detay sizdirmaz.
- XSS riskine karsi kullanici girdisi HTML olarak basilmamalidir.
- React'te `dangerouslySetInnerHTML` kullanma; mecbursa sanitize et.
- Dosya yukleme varsa uzanti, boyut ve icerik tipi kontrol edilir.
- Kullanici rolleri UI'da saklanabilir ama asil yetki API tarafinda dogrulanir.

## Auth ve Session

- Token localStorage'a yazilacaksa riskleri bil; mumkunse httpOnly cookie tercih edilir.
- Logout akisi token/session temizlemelidir.
- Yetki seviyeleri net olmali: admin, operator, viewer gibi.
- Protected route sadece UI gizleme degil, API yetkisiyle desteklenmelidir.

## API Guvenligi

- API cagrisinda hata, loading ve timeout durumlari dusunulur.
- Gelen veri dogru formatta varsayilmaz; parse/validate edilir.
- ID, rol, fiyat, izin gibi kritik alanlar client'tan geldigi gibi kabul edilmez.
- CORS, rate limit, auth ve audit log backend konusu olarak planlanir.

## Savunma ve Hassas Sistem Baglami

Bu proje ileride RF, radar, EO/IR, C2, jammer, C-UAS veya musteri kesif formlariyla iliskili ekranlara evrilebilir. Bu alanlarda:

- Teknik kabiliyetler, menziller, frekanslar ve entegrasyon detaylari hassas olabilir.
- Jammer, RF ve ihracat kontrolu konularinda yasal/regulasyon hassasiyeti vardir.
- Menzil ve performans degerleri kesin garanti gibi sunulmamalidir.
- Musteri koordinatlari, saha haritalari ve proje gereksinimleri gizli kabul edilir.

## Kod Yazarken Kontrol Listesi

- [ ] Gizli bilgi koda gomulmedi.
- [ ] Kullanici girdisi dogrulaniyor.
- [ ] Hata mesajlari veri sizdirmiyor.
- [ ] Token/session davranisi dusunuldu.
- [ ] API verisi guvenli varsayilmiyor.
- [ ] Dosya/PDF islemleri kullanici iznine bagli.
- [ ] Hassas savunma bilgisi disari aktarilmiyor.
