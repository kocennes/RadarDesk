# CLAUD.md

Bu dosya Claude veya benzeri AI kod yardimcilari icin proje talimatidir. Kod yazmadan once `AGENTS.md` ve ilgili `docs/ai-guides/*.md` dosyalari esas alinmalidir.

## Ana Talimat

Bu projede kod yazarken amac sadece calisan kod uretmek degildir. Kod; guvenli, okunabilir, bakimi kolay, frontend acisindan kullanisli ve proje alanina uygun olmalidir.

## Her Gorevde Uygulanacak Akis

1. Kullanici istegini analiz et.
2. Ise uygun rehber dosyasini sec:
   - UI, React, CSS, component: `docs/ai-guides/frontend-guidelines.md`
   - Auth, token, veri, API, dosya, izin: `docs/ai-guides/security-guidelines.md`
   - Klasor yapisi, mimari, naming: `docs/ai-guides/architecture-guidelines.md`
   - Deployment, hosting, env, CI/CD: `docs/ai-guides/deployment-strategy.md`
   - Refactor, test, kalite: `docs/ai-guides/code-quality-checklist.md`
   - Proje hedefi: `docs/project-brief.md`
3. Rehberdeki kurallari uygulayarak kod yaz.
4. Davranis degistiren veya yeni ozellik ekleyen kodlarda test yaz ya da mevcut testi guncelle.
5. Degisiklikleri kisaca acikla.
6. Mumkunse test/build/lint komutlarini calistir.

## Yasaklar

- Kullanici istemeden bilgisayardaki baska klasorlere erisme.
- PDF veya hassas is dokumanlarini izinsiz tasima, paylasma, disari aktarma.
- API key, token, sifre veya musteri bilgisini koda gommek.
- Guvenlik kontrolunu sadece frontend tarafinda yapmak.
- UI'da karmasik ve kullanici akisini bozan tasarimlar yapmak.

## Beklenen Kod Tarzi

- TypeScript tercih edilir.
- Fonksiyon ve degisken adlari niyeti anlatir.
- Componentler tek sorumluluk tasir.
- UI durumlari dusunulur: loading, error, empty, success.
- Formlarda dogrulama ve kullanici geri bildirimi bulunur.
- Kod yorumu az ama anlamli olur.

## Proje Baglami

Bu repo web gelistirme ogrenimi ve ileride is alanina yakin dashboard/form/harita uygulamalari icin kullanilacaktir. Ozellikle savunma, C-UAS, RF, radar, EO/IR, C2 ve jammer gibi kavramlar hassas olabilir. Bu konularda kod ve dokuman uretirken gizlilik ve guvenlik rehberleri dikkate alinmalidir.

Deployment varsayilani:

- Frontend: Firebase Hosting veya Vercel Hobby.
- Backend: Render Free Web Service.
- Database: Neon Free Postgres.
- Secret/env degerleri sadece platform environment variables alanlarinda tutulur.
