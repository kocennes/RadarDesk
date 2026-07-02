# RadarDesk Project Brief

RadarDesk, JavaScript/TypeScript ogrenimiyle baslayip ileride is alanina yakin bir web uygulamasina evrilecek sekilde planlanir.

## Hedef

Kullanicinin webci olarak gelismesi icin once temel dil bilgisi, sonra React + TypeScript, daha sonra dashboard/form/harita odakli bir uygulama gelistirmek.

## Guncel Urun Onceligi

Ilk calisan urun deneyimi admin panel degil, lokal tek kullanici cihaz kurulumudur. Kullanici uygulamayi actiginda once elindeki radar, kamera, RF alicisi veya diger cihazi baglayabilmeli/kesfedebilmeli, listeden secebilmeli ve kendi verdigi adla kaydedebilmelidir.

Musteri, paket, rol ve access group modeli daha sonra kurumsal/admin yapiya geciste kullanilacak; simdilik ilk ekranin on kosulu olmamalidir.

## Lokal Veri Saklama Karari

Varsayilan mimari lokal-first olmalidir. Kamera snapshot'lari, termal olay goruntuleri, kisa klipler, alarm kanitlari, cihaz baglanti ayarlari ve operasyon loglari mumkun oldugunca backend'in calistigi lokal makinede tutulmalidir.

Database ileride eklendiginde ham medya dosyasi database'e gomulmemelidir. Bunun yerine olay tipi, cihaz id, kullanici tarafindan verilen cihaz adi, zaman, severity, lokal dosya yolu, opsiyonel hash ve inceleme durumu gibi metadata tutulmalidir.

Kamera/termal olaylarda lokal dosya yolu `snapshotPath` veya `clipPath` olabilir. Radar, RF ve C2 gibi yapilandirilmis veri ureten cihazlarda ise normalize edilmis event payload'i lokal JSON evidence dosyasina yazilmali ve event response'unda `dataPath` + hash referansi tutulmalidir.

Bulut storage, uzaktan analiz veya ucuncu parti servis entegrasyonu varsayilan degildir; sadece acik kullanici karari ve risk notu ile eklenmelidir.

## Uzun Vadeli Uygulama Fikri

Proje ileride "operasyonel dashboard" mantigina tasinabilir:

- Musteri/proje kayit formu.
- Cihaz listesi.
- Cihaz kesfi: agda veya bilgisayara bagli gorunen cihaz once secilir, sonra kullanici sahadaki gorevine gore kendi adini verir.
- Cihaz durumlari: online, offline, warning, alarm.
- Alarm listesi.
- Harita uzerinde koordinat, menzil ve bolge gosterimi.
- Basit raporlama ve filtreleme.
- Rol bazli kullanici arayuzu: admin, operator, viewer.

Bu uygulama gercek hassas sistemlere baglanmadan once sahte/mock veriyle gelistirilmelidir.

## Urun, Musteri ve Yetki Modeli Karari

RadarDesk ileride tek tip ekran olarak degil, musteri/proje bazli kurulan bir admin panel olarak dusunulmelidir.

Temel kararlar:

- Her musteri kendi proje/saha kurulumundaki cihazlari gorur.
- Ayni urun paketi birden fazla musteriye satilabilir, ancak cihazlar, kamera streamleri, alarmlar ve veriler musteri/proje bazinda ayridir.
- Paket ekrani ve modulleri belirler; proje/saha gercek cihazlari belirler; rol/grup kullanicinin ne yapabilecegini belirler.
- Kamera + termal kamera alan musteriye radar, RF veya C2 ekranlari gosterilmez.
- Radar/RF/C2 modulleri sadece ilgili paket ve proje yetkisi varsa gorunur.
- Viewer sayisi cok olsa bile tek tek cihaz atamasi yerine access group kullanilir.
- Istisna gerekiyorsa kullanici bazli override eklenebilir, fakat ana model grup/proje/paket uzerinden ilerler.

Ornek paketler:

```text
camera-thermal -> EO/IR, kamera feedleri, alarm, harita
rf-monitoring  -> RF node, RF alarm/veri ekrani, harita
radar-ops      -> radar, radar alarm/iz bilgisi, menzil gosterimi
full-ops       -> radar, RF, EO/IR, C2 ve tum operasyon dashboardu
```

Login sonrasi hedef davranis:

1. Kullanici kimligi backend tarafinda dogrulanir.
2. Backend kullanicinin customer, project/site, role, access group ve paket yetkilerini hesaplar.
3. API sadece kullanicinin yetkili oldugu cihazlari, kamera feedlerini, alarmlari ve modulleri dondurur.
4. Frontend bu response'a gore paneli sekillendirir; yetkisiz modul ekranda hic gorunmez.

## Cihaz Kesfi ve Kullanici Tarafindan Adlandirma Karari

RadarDesk cihazlari sahaya ozel sabit isimlerle hazir tutmamalidir. `Kuzey Kamera`, `Guney Radar` gibi adlar ancak kullanici isterse yazilmalidir.

Hedef akis:

1. Backend kontrollu bir kesif kaynagindan ag/USB/seri baglanti uzerinden gorunen cihazlari listeler.
2. Kullanici listeden kamerayi, radari, RF alicisini veya diger cihazi secer.
3. Secimden sonra adlandirma alani acilir.
4. Kullanici cihazin gercek saha gorevine gore ad yazar: `Giris Kamera`, `Arka Bahce Kamera`, `Kuzeyi Izleyen Radar` gibi.
5. Backend bu adi validate eder ve cihaz kaydina display name olarak yazar.

Gercek ag kesfi baslamadan once izinli IP araligi, protokol, timeout, loglama ve ortam modu netlestirilmelidir. Uygulama genis/rastgele ag taramasi yapmamalidir.

## Cihaz Profili ve Analiz Pipeline Karari

Kullanici cihaz adini serbestce secebilir, fakat cihazin tipi ve analiz profili serbest metin olmamalidir. `Giris Kamera` veya `Kuzeyi Izleyen Radar` gibi adlar kullaniciya aittir; `thermal-camera`, `radar`, `rf-receiver` gibi cihaz profilleri backend/discovery/config tarafindan belirlenmelidir.

Baslangic cihaz profilleri:

- `thermal-camera`: termal snapshot/stream, isi imzasi, hareket/nesne olayi, lokal kanit goruntusu.
- `visible-camera`: gorunur kamera snapshot/stream, hareket/nesne olayi, lokal kanit goruntusu.
- `radar`: track id, mesafe, azimut/yon, hiz, zone/range kural olayi.
- `rf-receiver`: frekans, bant, sinyal seviyesi, sure, bilinmeyen/yuksek sinyal olayi.
- `c2`: komuta/kontrol ve birlesik durum; ana sensor analizi degil.

Backend cihazin profilini bildigi icin analiz pipeline'ini buna gore secer:

- Kamera/termal verisi frame veya snapshot olarak alinir; hareket, isi degisimi veya nesne olayi uretir.
- Radar verisi goruntu degil, yapilandirilmis track/range/zone verisi olarak islenir.
- RF verisi frekans/sinyal/bant aktivitesi olarak islenir.
- C2 verisi cihazlarin birlesik durumu ve komut akisi olarak ele alinir.

Frontend bu profili ve yetenekleri gosterir, fakat kullanicinin kritik tipi serbestce degistirmesine izin vermez.

## Lokal Sensor Event Akisi

Gercek cihaz verisi frontend'e ham olarak verilmemelidir. Backend kamera, radar, RF ve C2 kaynaklarindan gelen veriyi once typed sensor event modeline normalize etmelidir.

Baslangic event tipleri:

- `thermal-motion`: termal kamera hareket/isi olayi, lokal snapshot kaniti.
- `camera-motion` / `camera-object`: gorunur kamera hareket/nesne olayi.
- `radar-track` / `radar-zone`: radar track, menzil, azimut, hiz ve bolge kurali olayi.
- `rf-signal` / `rf-frequency`: frekans, sinyal seviyesi, bant aktivitesi olayi.
- `device-state`: cihaz/C2 saglik ve durum olayi.

Frontend bu olaylari alarm/kanit panelinde gosterir; ham stream, RTSP URL, RF ham kaydi veya radar ic protokol detayini client'a acmaz.

Gercek cihaz sahaya baglanmadan once frontend'de yalnizca lokal test amacli bir olay uretme kontrolu olabilir. Bu kontrol kamera/radar/RF icin backend ingest endpointine ornek event gonderir; kamera event'lerinde snapshot kaniti backend tarafindan otomatik uretilir, radar ve RF event'lerinde ise track/sinyal metadata'si kaydedilir. Bu akis manuel snapshot alma yerine gercek veri gelmis gibi backend pipeline'ini denemek icindir.

Radar/RF olaylarinda ekran goruntusu aranmaz; kanit kaydi, gelen track/sinyal verisinin backend tarafinda normalize edilip lokal JSON olarak saklanmasidir. Frontend sadece bu `dataPath` referansini gosterir.

## Lokal Kamera Snapshot Kaniti

Ilk gercek kamera denemesi canli RTSP oynatma yerine backend snapshot capture ile baslamalidir. Frontend kameraya direkt baglanmaz.

Hedef akis:

1. Backend kamera feed config'inden `snapshotUrl` bilgisini okur; bu bilgi client'a donmez.
2. `POST /api/camera-feeds/:id/snapshot` cagrisi snapshot alir.
3. Snapshot veya mock placeholder lokal evidence klasorune yazilir.
4. API sadece lokal evidence metadata'si dondurur: dosya yolu, hash, zaman, kaynak feed id.
5. Bu metadata otomatik olarak `SensorEvent.evidence` alanina baglanir.
6. Frontend manuel snapshot butonu yerine backend tarafinda olusan event ve kanit metadata'sini gosterir.

## 8 Adimli Gelistirme Plani

1. JavaScript ve TypeScript temelleri.
2. Vite + React + TypeScript frontend iskeleti.
3. Fluent UI ile temel componentler: Button, Input, Card, Table, Dialog.
4. Mock database dosyalari: `devices`, `alerts`, `projects`, `users`.
5. RadarDesk Dashboard MVP: cihaz listesi, alarm listesi, ozet kartlari, proje/musteri formu.
6. Harita ekrani: mock koordinatlar, markerlar, menzil cemberleri ve bolge gosterimi.
7. Backend + mock API: Node.js + TypeScript ile `/api/devices`, `/api/alerts`, `/api/projects`.
8. Gercek database: Neon Postgres ile kalici veri, migration ve deploy.

## Veri Gecis Stratejisi

Proje baslangicta gercek hassas veriye baglanmayacak. Veri kaynagi asama asama degisecek:

```text
Mock data -> Mock API -> Gercek API -> Neon Postgres
```

Bu sayede once arayuz, veri modeli ve kullanici akisi netlesir. Daha sonra ayni ekranlar bozulmadan backend ve database'e baglanir.

Mock veri ornek klasorleri:

```text
src/mocks/devices.ts
src/mocks/alerts.ts
src/mocks/projects.ts
src/mocks/users.ts
```

Gercek database'e gecilene kadar musteri, saha, koordinat, savunma sistemi veya PDF kaynakli hassas veriler kullanilmaz.

## Hassasiyet

Bu repo icinde PDF'ler ve is notlari bulunabilir. Bunlar:

- Kopyalanmamalidir.
- Izinsiz upload edilmemelidir.
- Kod icine gomulmemelidir.
- Demo uygulamada gercek veri yerine mock veri kullanilmalidir.
- Gercek cihaz kesfi veya kamera denemesi sadece kontrollu lokal/backend ortaminda ve acik izinli ag araliginda yapilmalidir.

## Teknik Varsayilanlar

Frontend:

- React + TypeScript.
- Vite.
- Fluent UI veya benzer component library.

Backend:

- Node.js + TypeScript.
- Baslangicta Express veya Fastify.
- Buyurse NestJS dusunulebilir.

Database:

- PostgreSQL.
- Ucretsiz baslangic icin Neon.

Ilk gercek veri modeli tasarlanirken su kavramlar dikkate alinmalidir:

- `customers`
- `projects` veya `sites`
- `devices`
- `camera_feeds`
- `product_packages`
- `modules`
- `access_groups`
- `users`
- `user_access` veya `group_memberships`

Deployment:

- Frontend: Firebase Hosting veya Vercel Hobby.
- Backend: Render Free Web Service.
- Database: Neon Free Postgres.

## Basari Olcutu

Bu proje basarili sayilirsa kullanici sunlari yapabiliyor olur:

- JS/TS kodunu okuyup temel degisiklik yapma.
- React component yazma.
- Form, tablo ve kart tasarlama.
- API'den veri cekip ekranda gosterme.
- Basit backend endpoint yazma.
- PostgreSQL'e temel veri kaydetme/okuma.
- Ucretsiz platformlara deploy etme.

## Arastirma Sonrasi MVP Gelistirme Notlari

2026-07-01 tarihinde mevcut repo ve resmi/ana dokumanlar incelenerek asagidaki gelistirme yonu belirlendi:

- Frontend MVP calisir durumda oldugu icin sonraki buyume adimi `App.tsx` icindeki UI parcalarini feature componentlerine ayirmaktir.
- Mock veriden mock API'ye geciste ekranlarin davranisi degismemeli; once typed service/helper katmani eklenmeli, sonra backend endpointlerine baglanilmalidir.
- Backend baslarken `/health`, `/api/devices`, `/api/alerts`, `/api/projects` endpointleriyle ilerlenmeli; form kaydi icin sadece izin verilen alanlar kabul edilmelidir.
- Harita tarafi mock koordinatlarla kalmali; gercek musteri koordinati veya saha verisi kullanilmamalidir.
- Test stratejisi mevcut unit testleri koruyup coverage raporu eklemeyi degerlendirmelidir.

Kaynak notlari:

- React `useMemo`, render sirasindaki hesaplamalari cache'lemek icin vardir; bu projede sadece buyuyen veri setlerinde veya olculen performans sorunlarinda kullanilmali.
- React erisilebilirlik dokumani form kontrollerinin etiketlenmesini vurgular; dashboard form ve filtrelerinde bu kontrol korunmalidir.
- Vite dokumani `VITE_` ile baslayan env degerlerinin client bundle'a acildigini belirtir; secret'lar frontend env degiskeni olmamalidir.
- OWASP API Security 2023, obje ve obje alani yetkilendirmesini ayri riskler olarak ele alir; backend endpointleri ID ve alan bazli yetki kontrolu yapacak sekilde tasarlanmalidir.
