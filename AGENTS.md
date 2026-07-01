# AGENTS.md

Bu repo uzerinde calisan her AI ajan once bu dosyayi, sonra yapacagi isle ilgili rehber dosyalarini okumalidir. Amac, kod yazarken rastgele karar almak yerine guvenlik, frontend tasarim, mimari ve kalite kurallarini takip etmektir.

## Zorunlu Calisma Sekli

1. Istenen isi anlamadan kod yazma.
2. Once ilgili rehberleri oku:
   - Frontend veya React isi: `docs/ai-guides/frontend-guidelines.md`
   - Guvenlik, auth, veri, API veya dosya islemi: `docs/ai-guides/security-guidelines.md`
   - Proje yapisi, klasor, naming veya mimari karar: `docs/ai-guides/architecture-guidelines.md`
   - Deployment, hosting, ortam degiskeni veya ucretsiz altyapi: `docs/ai-guides/deployment-strategy.md`
   - Kod temizligi, test, review veya refactor: `docs/ai-guides/code-quality-checklist.md`
   - Projenin amaci ve hedef urun: `docs/project-brief.md`
   - Yeni AI oturumu/prompta baslama: `docs/ai-guides/master-prompt.md`
3. Savunma, radar, RF, jammer, musteri veya proje dokumani gibi hassas iceriklerde yerel `docs/yeni-is-pdf-ozeti.md` dosyasi varsa gizlilik ve risk notlarini dikkate al. Bu dosya remote repo'ya push edilmez.
4. Kullanici acikca istemedikce PDF dosyalarini, is notlarini veya hassas dokumanlari kopyalama, disari aktarma, ozetleme ya da baska klasorlere tasima.
5. Kod yazarken kucuk, okunabilir ve geri alinabilir degisiklikler yap.
6. Davranis degistiren veya yeni ozellik ekleyen kodlarda uygun test yaz veya mevcut testi guncelle.
7. Her degisiklikten sonra uygun dogrulama komutunu calistir. Ornek: TypeScript icin `npm run ...`, build/test varsa ilgili komut.
8. Klasor disina kullanici istemeden erisme.

## Kodlama Prensipleri

- Once basit calisan cozum, sonra iyilestirme.
- TypeScript kullaniliyorsa tipleri belirsiz birakma; `any` son care olsun.
- UI kodunda componentleri kucuk tut, tekrar eden yapilari ayir.
- Form, tablo, dashboard ve harita gibi is ekranlarinda okunabilirlik ve is akisi oncelikli olsun.
- Guvenlik tarafinda "client'a guvenme" prensibiyle dusun.
- Gizli bilgi, token, API key veya musteri verisi kaynak koda yazilmaz.
- Deployment karari verirken ucretsiz katman limitlerini ve vendor lock-in riskini belirt.

## Yapay Zeka Icin Karar Kurali

Bir kod parcasina baslamadan once kendine sunlari sor:

- Bu is frontend mi, backend mi, guvenlik mi, mimari mi?
- Hangi rehber dosyalari bu isle ilgili?
- Kullanici verisi veya hassas bilgi var mi?
- Bu degisiklik hangi dosyalari etkiler?
- Calistirmam gereken dogrulama komutu ne?

Ilgili rehber okunmadan kod yazilmis sayilmaz.
