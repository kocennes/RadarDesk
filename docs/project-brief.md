# RadarDesk Project Brief

RadarDesk, JavaScript/TypeScript ogrenimiyle baslayip ileride is alanina yakin bir web uygulamasina evrilecek sekilde planlanir.

## Hedef

Kullanicinin webci olarak gelismesi icin once temel dil bilgisi, sonra React + TypeScript, daha sonra dashboard/form/harita odakli bir uygulama gelistirmek.

## Uzun Vadeli Uygulama Fikri

Proje ileride "operasyonel dashboard" mantigina tasinabilir:

- Musteri/proje kayit formu.
- Cihaz listesi.
- Cihaz durumlari: online, offline, warning, alarm.
- Alarm listesi.
- Harita uzerinde koordinat, menzil ve bolge gosterimi.
- Basit raporlama ve filtreleme.
- Rol bazli kullanici arayuzu: admin, operator, viewer.

Bu uygulama gercek hassas sistemlere baglanmadan once sahte/mock veriyle gelistirilmelidir.

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
