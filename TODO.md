# TODO

## Simdiki Odak: Lokal Tek Kullanici Cihaz Kurulumu

- [x] Admin panel/musteri-yetki ekranlarini simdilik ikinci plana al; ilk acilista herhangi bir kullanicinin cihaz baglayip isimlendirebildigi lokal kurulum akisini one al.
- [x] Ilk ekranda cihaz kesfi, cihaz secimi, kullanici tarafindan adlandirma ve kayitli cihaz listesi ana is olsun.
- [x] Lokal ilk urun deneyiminde tum operasyon modulleri kullanicinin paketinde var kabul edilsin; ekranlar cihaz baglantisina gore dolsun, paket bariyeri ilk ekranda kullaniciyi engellemesin.
- [x] Musteri/proje/paket/yetki modeli kodda kirilmadan kalsin, fakat UI'da kullanicinin onune ilk bariyer olarak cikmasin; kurumsal/admin satis modeline gecince tekrar ayrintilandirilsin.
- [x] Gercek radar/kamera/RF cihaz baglantisi icin once backend kontrollu kesif/probe akisini kullan; secret, stream URL veya genis ag taramasi ekleme.
- [x] Kamera snapshot, kisa olay klibi, alarm kaniti ve cihaz baglanti ayarlarini varsayilan olarak lokal backend makinesinde tut; bulut/storage entegrasyonunu opsiyonel ve sonradan yap.
- [x] Olay verilerinde database'e ham goruntu yerine metadata ve lokal dosya referansi yazma stratejisini tasarla.
- [x] Kamera feed icin backend snapshot capture endpointi ekle; real modda `snapshotUrl` backend'den okunup lokal evidence klasorune yazilsin, mock modda placeholder kanit uretilsin.
- [x] Lokal kanit klasorunu env ile ayarlanabilir yap ve git disinda tut: `LOCAL_EVIDENCE_DIR`.
- [x] Kamera/radar/RF verisi backend'e geldiginde kanit/metadata otomatik kaydedilsin; frontend manuel snapshot butonu gostermesin.
- [x] Lokal sensor event store ekle; mock/gercek ingest sonucu uretilen kamera/radar/RF olaylarini typed event olarak backend'de tut.
- [x] `/api/sensor-events` endpointi ekle; frontend olay panelinde event tipi, cihaz, severity ve lokal kanit referansini goster.
- [x] Cihaz kaydinda kullanici sadece display name yazsin; `deviceType`, `productProfile` ve `capabilities` backend/discovery tarafindan belirlensin.
- [x] Frontend cihaz kesfi kartinda algilanan cihaz tipi, urun profili ve analiz yeteneklerini goster; kullanicinin bunlari serbest metinle degistirmesine izin verme.
- [x] Backend analiz pipeline taslagi olustur: kamera/termal icin snapshot-motion/object event, radar icin track/range/zone event, RF icin signal/frequency event.
- [x] Mock data disinda gelecek gercek veriler icin `rawSource`, `ingestMode`, `capabilities` ve lokal evidence path alanlarini domain modeline hazirla.
- [x] Gercek cihaz baglanmadan once lokal backend ingest akisini denemek icin frontend'de kamera/radar/RF test olayi ureten kontrol ekle; kamera olayinda snapshot kaniti backend tarafinda otomatik olussun, radar/RF olayinda metadata kaydi olussun.
- [x] Radar/RF gibi goruntu uretmeyen sensor event'lerinde normalize metadata'yi lokal JSON evidence dosyasi olarak kaydet; event modelinde `dataPath` referansi goster.
- [x] `DEVICE_DISCOVERY_SOURCE=config` ve `DEVICE_DISCOVERY_JSON` ile backend kontrollu cihaz kesfi kaynagi ekle; frontend'e sadece guvenli metadata donsun.
- [x] Kayitli cihazlar icin iki ayri kaldirma akisi ekle: `Baglantiyi kaldir` cihazi pasif/offline yapip yeni event/kanit uretimini durdurmali; `Cihazi sil` kayitli cihaz listesinden tamamen cikarmali ki yerine baska cihaz eklenebilsin.
- [x] `Cihazi sil` islemi eski lokal evidence ve olay gecmisini otomatik silmemeli; kanit temizleme daha sonra ayri ve acik onayli bir aksiyon olarak tasarlanmali.
- [x] Baglantisi kaldirilmis veya kopmus cihaz icin sorunsuz tekrar baglama akisi ekle; ayni fiziksel cihaz tekrar secilip yeni/var olan display name ile calisabilsin.
- [x] Frontend modulleri paket yetkisine gore gizlemek yerine lokal kurulumda bagli cihazlara gore bos/dolu durum goster; cihaz yoksa ilgili panel bos durum gostersin.

## Arastirma Sonrasi Urun Yonu: Sensor Fusion ve Incident Dosyasi

- [x] Gercek urun orneklerinden cikan ortak modeli dokumante et: radar + RF + EO/IR kamera + C2/dashboard + lokal/on-prem evidence.
- [x] `Incident` veya `CorrelatedEvent` domain modelini tasarla; birden fazla `SensorEvent` kaydini tek olay dosyasi altinda birlestirsin.
- [x] Kamera snapshot/clip, radar JSON evidence ve RF JSON evidence referanslarini ayni incident uzerinden gosterecek veri modelini planla.
- [x] Backend'de ilk basit korelasyon kuralini tasarla: yakin zaman araliginda ayni proje/saha icindeki radar, RF ve kamera event'lerini aday incident olarak grupla.
- [x] Frontend'de tekil sensor event listesinin yanina incident/olay dosyasi gorunumu ekle; operator notu, inceleme durumu ve evidence referanslarini gostersin.
- [x] Incident icin lokal review overlay ekle; operator `open/reviewing/confirmed/dismissed` status ve kisa notu backend validation ile kaydedebilsin.
- [x] False alarm azaltma hedefi icin sensor fusion karar notu yaz: tek sensor alarmi, coklu sensor dogrulamasi ve operator onayi farkli severity/guven seviyeleri uretsin.
- [ ] Gercek urun arastirmasinda gecen cloud/on-prem seceneklerini deployment kararlarina bagla; varsayilan lokal/on-prem, bulut opsiyonel kalsin.

## En Oncelikli: Musteri/Paket/Yetki Modeli

- [ ] Login sonrasi kullanicinin `customer`, `project/site`, `role`, `access group` ve paket yetkisini backend tarafinda hesaplayan modeli tasarla.
- [x] `camera-thermal`, `rf-monitoring`, `radar-ops`, `full-ops` gibi product package tanimlarini domain modeline ekle.
- [x] Paketlerin izin verdigi `allowedDeviceTypes` ve `allowedModules` alanlarini netlestir.
- [x] Her musterinin sadece kendi proje/saha cihazlarini, camera feedlerini, alarmlarini ve verisini gorecegi veri izolasyonu kuralini uygula.
- [x] Cok sayida viewer icin tek tek cihaz atamak yerine `access group` tabanli yetkilendirme tasarla.
- [x] API response'larini kullanicinin effective access sonucuna gore filtrele; yetkisiz radar/RF/C2/kamera verisini client'a hic dondurme.
- [x] Frontend dashboardu lokal kurulum modunda paket/modul saklama yerine bagli cihazlara gore sekillendir; satin alma/paket kisitlari ileride kurumsal/admin modda uygulanacak.
- [ ] Database schema taslagina `customers`, `projects/sites`, `product_packages`, `modules`, `access_groups`, `group_memberships` ve ilgili iliskileri ekle.

## Kisa Vade

- [x] UI-first MVP yaklasimini takip et: once mock operasyon verisi, sonra backend/database.
- [x] Vite + React + TypeScript projesi kur.
- [x] Fluent UI veya benzer component library ekle.
- [x] Ilk calisan dashboard ekranini ayaga kaldir.

## UI-First MVP

- [x] Ana layout olustur: ust bar, sol panel, ana icerik, sag alarm paneli.
- [x] Ustte ozet kartlari koy: aktif cihaz, aktif alarm, online cihaz, kritik durum.
- [x] Cihaz listesi UI'i yap.
- [x] Cihaz listesi arama ve durum filtresi ekle.
- [x] Alarm listesi UI'i yap.
- [x] Musteri/proje formu UI'i yap.
- [x] Musteri/proje formu validation ve success feedback ekle.
- [x] Basit harita/operasyon alani placeholder'i yap.
- [x] Mock koordinatlarla marker ve menzil cemberi goster.
- [x] Loading, empty, error ve success durumlarini goster.
- [x] Otomatik kanit kaydi ve sensor event uretimi icin loading/error/success durumlarini backend event panelinde goster.
- [x] Mobil/dar ekran icin responsive duzen ekle.

## RadarDesk MVP

- [x] 8 adimli proje planini takip et.
- [x] Veri gecis stratejisini koru: mock data -> mock API -> gercek API -> Neon Postgres.
- [x] Proje dashboard ana ekranini tasarla.
- [x] `src/mocks/devices.ts` dosyasini olustur.
- [x] `src/mocks/alerts.ts` dosyasini olustur.
- [x] `src/mocks/projects.ts` dosyasini olustur.
- [x] Mock cihaz listesi olustur.
- [x] Cihaz durumlarini goster: online, offline, warning, alarm.
- [x] Alarm listesi ekle.
- [x] Alarm listesi severity filtresi ekle.
- [x] Musteri/proje formu ekle.
- [x] Harita ekrani icin teknoloji sec: Leaflet, Mapbox veya Google Maps.
- [x] Backend calismasa bile mock veriden operasyon gorunumu uret.

## JavaScript ve TypeScript Ogrenme

- [ ] JavaScript temel konularini tekrar et.
- [x] TypeScript temel tiplerini calis.
- [x] `hello-world.ts` dosyasini temiz ders orneklerine cevir.
- [x] Basit degisken, fonksiyon, array ve object alistirmalari ekle.
- [x] Her yeni konu icin kucuk test veya calistirma kontrolu ekle.

## Backend

- [x] Backend'i UI MVP'den sonra ele al.
- [x] Node.js + TypeScript backend yapisini planla.
- [x] Express veya Fastify sec.
- [x] `/health` endpointi ekle.
- [x] Cihaz listesi icin mock API endpointi ekle.
- [x] Alarm listesi icin mock API endpointi ekle.
- [x] Proje listesi icin mock API endpointi ekle.
- [x] Kamera dogrulama metadata'si icin mock API endpointi ekle.
- [x] Satis oncesi lokal test icin backend tarafinda gercek kamera metadata provider hazirla; stream URL ve credential'lari client'a dondurme.
- [x] `/api/camera-feeds/:id/snapshot` endpointi ekle; response sadece lokal kanit metadata'si dondursun, kamera URL/credential dondurmesin.
- [x] Cihazlari onceden Kuzey/Guney gibi sabit adlarla tutmak yerine once kesfedilen cihaz listesinden sectir, sonra kullanicinin verdigi saha adiyla kaydet.
- [ ] Gercek cihaz kesfi icin izinli IP araligi/port/protokol stratejisini dokumante et; rastgele veya genis ag taramasi yapma.
- [x] Cihaz tipine gore analiz servisi secen backend mapping ekle: `thermal-camera`, `visible-camera`, `radar`, `rf-receiver`, `c2`.
- [x] Analiz pipeline taslagindan mock sensor event ureten servis ekle; gercek ingest gelince ayni event sozlesmesini kullansin.
- [x] Form kaydi icin API endpointi ekle.
- [x] Input validation ekle.
- [x] Hata cevap formatini standartlastir.
- [x] Backend klasor yapisini olustur: `server/src/app.ts`, `server/src/routes`, `server/src/middleware`, `server/src/types`.
- [x] Backend icin TypeScript build ve dev scriptlerini ekle.
- [x] Backend endpointlerinde sadece mock veri kullan; gercek musteri/saha/veri baglantisi yapma.
- [x] API response modellerini frontend `Device`, `Alert`, `Project` tipleriyle uyumlu tut.
- [x] Form kaydinda yazilabilir alanlari allowlist ile sinirla: `name`, `customer`, `site`, `status`.
- [x] Backend icin en az `/health` ve validation testlerini ekle.

## Arastirma Sonrasi Gelistirme Firsatlari

- [x] `src/app/App.tsx` icindeki liste, form, metrik ve layout parcaciklarini feature componentlerine ayir.
- [ ] Dashboard'daki turetilmis verileri buyuk veri setine gecmeden once `useMemo` adaylari olarak not et; sadece olcum veya belirgin maliyet varsa uygula.
- [x] Form ve filtre kontrolleri icin erisilebilir ad, hata mesaji ve klavye ile kullanim kontrolu yap.
- [x] Leaflet haritasinda cihaz markerlari, menzil cemberleri ve alarm/bolge katmanlari icin layer group/layer control taslagi hazirla.
- [x] Mock data'dan mock API'ye gecis icin `src/services/` altinda typed data access fonksiyonlari planla.
- [x] Vitest coverage komutu eklemeyi degerlendir: `vitest run --coverage`.
- [x] Backend baslarken request validation, response allowlist ve merkezi error handler tasarimini birlikte ekle.

## Kod Incelemesinde Gorulen Eksikler

- [x] `src/mocks/users.ts` ekle; sadece mock admin/operator/viewer kullanicilari icersin.
- [x] `User` ve `UserRole` domain tiplerini `src/types/domain.ts` icine ekle.
- [x] Sidebar'daki `Devices`, `Projects`, `Reports` butonlari icin ya basit view state ekle ya da henuz pasif olduklarini UI'da tutarli goster.
- [x] `src/services/mockApi.ts` fonksiyonlarini ileride gercek API'ye gecisi kolaylastiracak async servis sozlesmesine yaklastir.
- [x] Frontend veri yukleme akisini servis katmanindan gelecek loading/error durumlarini kullanacak sekilde hazirla.
- [x] Frontend servis katmanini `VITE_API_BASE_URL` varsa backend API'ye, yoksa mock veriye gidecek sekilde ayarla.
- [x] `ProjectIntakeCard` submit davranisini backend gelene kadar mock servis fonksiyonuna bagla.
- [x] Harita panelinde alert/bolge overlay taslagini mock veriyle ekle; gercek koordinat veya saha bilgisi kullanma.
- [x] Liste satirlarinda tarih/saat formatlama icin kucuk bir `utils/formatters.ts` dosyasi ekle.
- [ ] `App.tsx` icindeki ana layout parcaciklarini ileride `components/layout` altina ayirma adaylarini not et.
- [x] Coverage raporunda acik kalan `dashboardViewState.ts` ve `projectForm.ts` branch'leri icin eksik test senaryolarini tamamla.
- [x] `npm.cmd run build`, `npm.cmd test`, `npm.cmd run test:coverage` sonuclarini README veya dokumantasyon notlarina kisa olarak ekle.

## Database

- [ ] Neon Free Postgres hesabi/projesi planla.
- [ ] Temel tablolar icin schema tasarla.
- [ ] `projects`, `devices`, `alerts`, `users` tablolarini dusun.
- [ ] Migration araci sec.
- [x] `.env.example` dosyasini ekle.
- [ ] Ilk schema taslaginda hassas savunma verisi, gercek koordinat ve musteri dokumani saklama.
- [ ] Kamera/radar olay kayitlarinda ham medya dosyasini database'e gommek yerine lokal dosya yolu, hash, zaman ve cihaz referansi tut.
- [ ] Seed verisini sadece mock egitim kayitlarindan olustur.
- [ ] Database baglantisini sadece backend tarafinda kullanacak sekilde planla.
- [ ] Migration komutlarini package scriptlerine eklemeden deploy akisini tamamlanmis sayma.

## Security

- [ ] Secret ve tokenlarin koda yazilmadigini kontrol et.
- [ ] PDF ve hassas is dokumanlarinin git'e eklenmedigini kontrol et.
- [ ] CORS stratejisini belirle.
- [ ] Kullanici rolleri taslagini hazirla: admin, operator, viewer.
- [ ] Auth yaklasimini sec: Firebase Auth veya backend JWT.
- [ ] API endpointlerinde kullanicinin erisebilecegi obje ve alanlar backend tarafinda kontrol edilecek sekilde planla.
- [x] Form kaydi icin client'tan gelen her alan kabul edilmeyecek; yazilabilir alanlar allowlist ile sinirlanacak.
- [ ] `.gitignore` hassas yerel dosyalari disarida tutuyor mu her release oncesi kontrol et.
- [ ] Frontend'de kullanici girdisini HTML olarak basan kod olmadigini kontrol et.
- [ ] Backend hata cevaplarinda stack trace veya teknik detay donmemesini sagla.
- [ ] Auth baslamadan once rol matrisi yaz: admin hangi islemleri yapar, operator ne yapar, viewer ne gorur.

## Deployment

- [ ] Frontend icin Firebase Hosting veya Vercel sec.
- [ ] Backend icin Render ayarlarini planla.
- [ ] Database icin Neon connection string ortam degiskeni olarak tutulacak.
- [ ] Production CORS domainini ayarla.
- [x] Build ve deploy komutlarini README'ye ekle.
- [x] `.env.example` ekle; gercek secret koyma.
- [x] `VITE_` ile baslayan frontend env degerlerinin bundle icinde gorunebilecegini README/deploy notlarinda belirt.
- [x] Frontend icin public `VITE_API_BASE_URL` ornegini `.env.example` dosyasinda acikla.
- [x] Backend icin `DATABASE_URL`, `CORS_ORIGIN`, auth secilirse `JWT_SECRET` orneklerini `.env.example` dosyasinda placeholder olarak belirt.
- [x] Render health check yolunu `/health` olarak dokumante et.
- [ ] Deploy oncesi resmi Firebase/Vercel/Render/Neon free-tier limitlerini tekrar kontrol et.
- [ ] Production deploy icin hassas PDF, is notu ve local dokumanlarin build/deploy paketine girmedigini kontrol et.

## Dokumantasyon

- [ ] `README.md` dosyasini proje ilerledikce guncelle.
- [ ] `docs/project-brief.md` dosyasini MVP kararlarina gore guncelle.
- [ ] `docs/ai-guides/*` rehberlerini yeni ihtiyaclara gore guncelle.
- [x] Yeni ozellik veya davranis degisikliginde once TODO ve ilgili `.md` dosyalarina karar notu yaz, sonra kodlamaya basla kuralini netlestir.
- [ ] Yeni ozelliklerden sonra test ve dogrulama notlarini ekle.
- [x] Frontend MVP tamamlanan ozellikleri ve kalan backend/database islerini README'de ayri bolumlerde listele.
- [ ] Yeni backend baslangici icin kisa karar kaydi yaz: neden Express/Fastify secildi, hangi endpointler once gelecek.
- [x] Mock veri kullanimi politikasini README'de netlestir: gercek musteri, saha, koordinat ve PDF verisi kullanilmaz.
