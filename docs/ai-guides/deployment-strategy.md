# Deployment Strategy

Bu rehber, projenin ucretsiz veya dusuk maliyetli deploy stratejisini tanimlar. Ucretsiz planlar zamanla degisebilir; deploy oncesi resmi fiyat/limit sayfalari tekrar kontrol edilmelidir.

## Varsayilan Ucretsiz Mimari

```text
Frontend  -> Firebase Hosting veya Vercel Hobby
Backend   -> Render Free Web Service
Database  -> Neon Free Postgres
Auth      -> Baslangicta Firebase Auth veya backend JWT
Storage   -> Baslangicta kullanma; gerekirse Firebase Storage/alternatifleri degerlendir
```

## En Mantikli Baslangic Secimi

Ogrenme ve MVP icin onerilen kombinasyon:

```text
Frontend: Firebase Hosting
Backend: Render
Database: Neon
```

Neden:

- Firebase Hosting statik web uygulamalari icin hizli ve CDN destekli.
- Render Node.js backend'i Git repo uzerinden kolay deploy eder.
- Neon serverless Postgres ile SQL ogrenmek ve gercek backend mantigi kurmak icin uygun.
- Bu ayrim frontend, backend ve database rollerini net ogretir.

Alternatif:

```text
Frontend: Vercel
Backend: Render
Database: Neon
```

Vercel, React/Vite/Next.js deploy icin cok rahattir. Ancak Firebase Hosting ile baslamak, static frontend ve backend ayrimini daha net ogretir.

## Platform Rolleri

### Frontend

Frontend sadece kullanici arayuzudur:

- React app.
- HTML/CSS/JS bundle.
- API'ye istek atar.
- Secret tutmaz.
- Database'e direkt baglanmaz.

Frontend deployment secenekleri:

- Firebase Hosting: statik site ve SPA icin iyi.
- Vercel Hobby: React/Next projeleri icin cok pratik.

### Backend

Backend is kurallarinin ve guvenligin merkezidir:

- Auth kontrolu.
- API endpointleri.
- Database sorgulari.
- Validasyon.
- Audit/log.
- Role-based access.

Backend deployment secenegi:

- Render Free Web Service.

Render free web servisleri test, hobi ve preview icin uygundur; production uygulamalar icin sinirlar vardir.

### Database

Database kalici veridir:

- Kullanici.
- Proje.
- Cihaz.
- Alarm.
- Log.
- Form kaydi.

Database secenegi:

- Neon Free Postgres.

Neon free plan ogrenme, prototip ve yan projeler icin uygundur. Kritik production verisi icin paid plan veya alternatif managed Postgres degerlendirilmelidir.

## Ortam Degiskenleri

Secret ve config degerleri koda yazilmaz.

Ornek `.env`:

```text
DATABASE_URL=...
JWT_SECRET=...
CORS_ORIGIN=...
```

Kurallar:

- `.env` git'e eklenmez.
- `.env.example` olusturulabilir ama gercek secret icermez.
- Render environment variables alanina backend secretlari girilir.
- Firebase/Vercel frontend environment degiskenlerinde sadece public degerler tutulur.
- `VITE_` ile baslayan degerlerin frontend bundle icinde gorunebilecegi unutulmaz.

## CORS Stratejisi

Backend sadece bilinen frontend origin'lerine izin vermelidir.

Development:

```text
http://localhost:5173
```

Production:

```text
https://<frontend-domain>
```

Wildcard `*` production icin kullanilmamalidir.

## CI/CD Akisi

Basit akış:

1. Kod GitHub'a push edilir.
2. Frontend platformu build alir ve deploy eder.
3. Render backend'i repo branch'inden build eder.
4. Neon database migration'lari backend deploy oncesi veya deploy sirasinda calistirilir.

## Branch Stratejisi

Baslangic:

```text
main       -> calisan stabil kod
dev        -> gelistirme
feature/*  -> yeni ozellikler
```

Tek kisi ogrenme projesinde `main` yeterli olabilir. Ancak deploy edilmeye baslandiginda `dev` ve `main` ayrimi daha guvenlidir.

## Ucretsiz Plan Limitleri ve Riskler

- Free planlar production garantisi vermez.
- Backend uykuya gecebilir veya soguk baslama yasayabilir.
- Database storage/compute limitleri vardir.
- Kota asimi veya plan degisikligi olabilir.
- Ucretsiz platformlarda hassas production verisi tutulmamalidir.

## Ilk MVP Deployment Plani

1. Frontend'i Vite + React + TypeScript olarak kur.
2. Backend'i Node.js + TypeScript + Express olarak kur.
3. Neon'da Postgres database olustur.
4. Backend'e `/health` endpointi ekle.
5. Backend'i Render'a deploy et.
6. Frontend'den Render `/health` endpointine istek at.
7. Frontend'i Firebase Hosting'e deploy et.
8. CORS'u Firebase domainine gore kisitla.
9. `.env.example` ekle.
10. README'ye deploy komutlarini yaz.

## Onerilen Komutlar

Frontend:

```bash
npm run build
firebase deploy
```

Backend:

```bash
npm run build
npm run start
```

Database migration icin ileride:

```bash
npm run db:migrate
```

## Deployment Kontrol Listesi

- [ ] Secretlar koda yazilmadi.
- [ ] `.env` git'e eklenmedi.
- [ ] `.env.example` var.
- [ ] CORS production domainine gore ayarlandi.
- [ ] Backend `/health` endpointi var.
- [ ] Frontend build basarili.
- [ ] Backend build basarili.
- [ ] Database connection sadece backend tarafinda.
- [ ] Free-tier limitleri README veya dokumanda belirtildi.
- [ ] Hassas PDF/proje verisi deploy edilmedi.

## Platform Notlari

Resmi dokumanlara gore:

- Render free web services, datastores ve free compute planlari hobi/test/preview icin sunar; production icin kullanilmamasi gerektigini belirtir.
- Firebase Spark plan no-cost plandir; Firebase Hosting statik ve SPA web app deploy icin uygundur.
- Neon Free plan no monthly cost ile prototip/side project icin Postgres sunar; limitler vardir.
- Vercel Hobby plan free olup kisisel projeler icin baslangic secenegidir.
