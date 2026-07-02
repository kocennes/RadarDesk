# Security Guidelines

Bu rehber; auth, API, veri, dosya islemleri, dashboard, musteri formlari ve savunma/gorev sistemleriyle ilgili frontend/backend kodlarinda kullanilir.

## Temel Prensipler

- Gizli bilgi varsayilan olarak korunur.
- Kamera snapshot'i, termal goruntu, radar izi, RF kaydi ve alarm kaniti varsayilan olarak lokal backend makinesinde tutulur; bulut veya ucuncu parti servise gonderilmez.
- Client tarafindaki kontrol tek basina guvenlik sayilmaz.
- API key, token, sifre, gizli URL, musteri bilgisi veya proje bilgisi kaynak koda yazilmaz.
- Hassas veri loglanmaz.
- PDF ve is dokumanlari kullanici izni olmadan kopyalanmaz, upload edilmez, disari aktarilmaz.
- Yetki kontrolu backend/API tarafinda yapilmalidir.
- Ham medya database'e gomulmemelidir; metadata ve lokal dosya referansi tutulmalidir.
- Cihaz baglantisini kaldirma islemi eski lokal evidence'i otomatik silmemelidir; silme ayri ve bilincli bir kullanici aksiyonu olmalidir.
- Kayitli cihaz listesinden cihaz silme islemi, eski event/evidence verisini temizleyen bir veri imha islemi gibi uygulanmamalidir; evidence purge daha guclu onay ve audit gerektiren ayri bir akis olmalidir.

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
- Login sonrasi backend, kullanicinin customer/project/site, role, access group, paket ve modul yetkilerini hesaplamalidir.
- Cok sayida viewer icin yetki tek tek kullaniciya degil, mumkunse access group uzerinden verilmelidir.
- User bazli ek izin veya kisit sadece istisna olarak dusunulmelidir.

## API Guvenligi

- API cagrisinda hata, loading ve timeout durumlari dusunulur.
- Gelen veri dogru formatta varsayilmaz; parse/validate edilir.
- ID, rol, fiyat, izin gibi kritik alanlar client'tan geldigi gibi kabul edilmez.
- CORS, rate limit, auth ve audit log backend konusu olarak planlanir.
- Endpointler obje ID'sine gore veri dondururken kullanicinin o objeye erisim yetkisini backend'de kontrol etmelidir.
- Request body icindeki her alan otomatik kaydedilmemelidir; yazilabilir alanlar allowlist ile secilmelidir.
- API response'lari sadece UI'in ihtiyaci olan alanlari dondurmelidir; hassas veya ic sistem alanlari response'a eklenmemelidir.
- Merkezi error handler teknik detaylari production response'larinda gostermemelidir.
- Musterinin satin almadigi paket/modul verisi API response'una eklenmemelidir.
- Kamera + termal kamera paketi olan bir kullaniciya radar, RF veya C2 cihazlari response olarak donmemelidir.
- Ayni paketi kullanan farkli musterilerin cihazlari, camera feedleri, alarmlari ve stream/config bilgileri kesin olarak customer/project/site bazinda ayrilmalidir.
- Frontend'de modul gizlemek sadece UX davranisidir; gercek veri izolasyonu backend ve database sorgularinda saglanmalidir.
- Cihaz kesfi endpointleri genis veya rastgele ag taramasi yapmamalidir; yalnizca acikca izin verilmis IP araligi, protokol ve timeout ile calismalidir.
- Kesfedilen cihazlara kullanici tarafindan verilen adlar backend'de validate edilmeli; client'tan gelen `type`, `projectId`, `customerId`, rol veya yetki alanlari oldugu gibi kabul edilmemelidir.
- Disconnect/reconnect endpointleri cihaz sahipligi ve proje baglamina gore backend'de kontrol edilmelidir; reconnect sirasinda credential, stream URL veya vendor protokol detayi client'a dondurulmemelidir.

## Backend Baslangic Guvenlik Taslagi

Node.js + Express secilirse ilk backend asamasinda:

- `/health` gibi public endpointler ile auth gerektiren endpointler ayrilmalidir.
- Route handler'lar validation'dan gecmeyen request'i islememelidir.
- Error middleware route'lardan sonra tanimlanmalidir.
- CORS development ve production origin'lerine gore ayri ayarlanmalidir.
- Form kaydi icin `projectId`, `role`, `createdBy`, `status` gibi kritik alanlar client'tan geldigi haliyle kabul edilmemelidir.

## Savunma ve Hassas Sistem Baglami

Bu proje ileride RF, radar, EO/IR, C2, jammer, C-UAS veya musteri kesif formlariyla iliskili ekranlara evrilebilir. Bu alanlarda:

- Teknik kabiliyetler, menziller, frekanslar ve entegrasyon detaylari hassas olabilir.
- Jammer, RF ve ihracat kontrolu konularinda yasal/regulasyon hassasiyeti vardir.
- Menzil ve performans degerleri kesin garanti gibi sunulmamalidir.
- Musteri koordinatlari, saha haritalari ve proje gereksinimleri gizli kabul edilir.

## Kod Yazarken Kontrol Listesi

- [ ] Davranis degisikligi once TODO ve ilgili `.md` dosyalarina yazildi.
- [ ] Gizli bilgi koda gomulmedi.
- [ ] Kullanici girdisi dogrulaniyor.
- [ ] Hata mesajlari veri sizdirmiyor.
- [ ] Token/session davranisi dusunuldu.
- [ ] API verisi guvenli varsayilmiyor.
- [ ] Dosya/PDF islemleri kullanici iznine bagli.
- [ ] Hassas savunma bilgisi disari aktarilmiyor.
