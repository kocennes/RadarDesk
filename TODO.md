# TODO

## Kisa Vade

- [x] UI-first MVP yaklasimini takip et: once gorunen demo, sonra backend/database.
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
- [x] Backend calismasa bile demo icin mock veriden goruntu uret.

## JavaScript ve TypeScript Ogrenme

- [ ] JavaScript temel konularini tekrar et.
- [ ] TypeScript temel tiplerini calis.
- [ ] `hello-world.ts` dosyasini temiz ders orneklerine cevir.
- [ ] Basit degisken, fonksiyon, array ve object alistirmalari ekle.
- [ ] Her yeni konu icin kucuk test veya calistirma kontrolu ekle.

## Backend

- [ ] Backend'i UI MVP'den sonra ele al.
- [ ] Node.js + TypeScript backend yapisini planla.
- [ ] Express veya Fastify sec.
- [ ] `/health` endpointi ekle.
- [ ] Cihaz listesi icin mock API endpointi ekle.
- [ ] Form kaydi icin API endpointi ekle.
- [ ] Input validation ekle.
- [ ] Hata cevap formatini standartlastir.

## Database

- [ ] Neon Free Postgres hesabi/projesi planla.
- [ ] Temel tablolar icin schema tasarla.
- [ ] `projects`, `devices`, `alerts`, `users` tablolarini dusun.
- [ ] Migration araci sec.
- [ ] `.env.example` dosyasini ekle.

## Security

- [ ] Secret ve tokenlarin koda yazilmadigini kontrol et.
- [ ] PDF ve hassas is dokumanlarinin git'e eklenmedigini kontrol et.
- [ ] CORS stratejisini belirle.
- [ ] Kullanici rolleri taslagini hazirla: admin, operator, viewer.
- [ ] Auth yaklasimini sec: Firebase Auth veya backend JWT.

## Deployment

- [ ] Frontend icin Firebase Hosting veya Vercel sec.
- [ ] Backend icin Render ayarlarini planla.
- [ ] Database icin Neon connection string ortam degiskeni olarak tutulacak.
- [ ] Production CORS domainini ayarla.
- [ ] Build ve deploy komutlarini README'ye ekle.

## Dokumantasyon

- [ ] `README.md` dosyasini proje ilerledikce guncelle.
- [ ] `docs/project-brief.md` dosyasini MVP kararlarina gore guncelle.
- [ ] `docs/ai-guides/*` rehberlerini yeni ihtiyaclara gore guncelle.
- [ ] Yeni ozelliklerden sonra test ve dogrulama notlarini ekle.
