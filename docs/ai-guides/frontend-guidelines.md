# Frontend Guidelines

Bu rehber React, TypeScript, CSS, component, form, dashboard, tablo ve harita ekranlari icin kullanilir.

## Genel Yaklasim

- Ilk ekran gercek isi yaptirsin; gereksiz landing/hero tasarimindan kacin.
- Bu projenin simdiki ilk isi lokal cihaz kurulumudur: cihaz kesfi, secim, adlandirma ve kayitli cihaz listesi admin panel ayarlarindan once gelmelidir.
- Operasyonel uygulamalarda sade, okunabilir ve is odakli tasarim kullan.
- Yeni frontend parcasi sadece gorsel sus olarak eklenmemelidir; her panel, kart, buton, harita katmani veya durum gostergesi bir backend/domain modeliyle eslesmelidir.
- Backend modeli henuz hazir degilse frontend parcasi mock veriyle calisabilir, fakat hangi gelecekteki model veya endpoint ile beslenecegi TODO veya ilgili karar notunda yazilmalidir.
- Gercek veri geldiginde ekran davranisi backend response'una gore sekillenmelidir; UI kendi basina cihaz tipi, yetki, paket, alarm, command veya sensor sonucu uydurmamalidir.
- Kullanici ekranda ne yapacagini tahmin edebilmeli.
- Bilgi hiyerarsisi net olmali: baslik, aksiyon, icerik, durum.
- UI; loading, empty, error ve success durumlarini gostermeli.

## React + TypeScript Kurallari

- Componentler kucuk ve tek sorumluluklu olsun.
- Props icin `type` veya `interface` tanimla.
- Event tiplerini net yaz:
  - Input: `ChangeEvent<HTMLInputElement>`
  - Form: `FormEvent<HTMLFormElement>`
  - Button click gerekiyorsa ilgili event tipi veya parametresiz handler.
- State isimleri niyeti anlatsin: `selectedDevice`, `isLoading`, `alerts`.
- Derived value gerekiyorsa degisken olarak ayir.
- API cagrisini component icinde karmasiklastirma; buyurse servis/helper dosyasina ayir.

## Fluent UI veya Component Library

- Hazir componentleri tercih et: Button, Input, Card, Dialog, Table, Badge, Toolbar.
- Butonlarda aksiyon net olsun: Kaydet, Iptal, Filtrele, Detay.
- Kritik aksiyonlarda confirm dialog kullan.
- Status bilgilerini badge/tag ile goster: Online, Offline, Alarm, Normal.
- Form alanlari label, placeholder ve hata mesaji tasimali.

## Dashboard Tasarimi

Dashboard'da kullanici ayni anda cok bilgi gorecegi icin:

- Ustte kritik ozet metrikleri kullan.
- Orta alanda ana is: harita, tablo veya alarm listesi.
- Yan panelde filtreler veya detay bilgisi.
- Renkleri anlamli kullan:
  - Kirmizi: kritik/alarm
  - Sari: uyari
  - Yesil: normal/aktif
  - Gri: pasif/bilinmiyor
- Sadece renge guvenme; ikon veya metin de kullan.

## Form Tasarimi

- Alanlari mantikli gruplara ayir.
- Zorunlu alanlari belirt.
- Kaydetmeden once dogrulama yap.
- Basarili kayitta kullaniciya geri bildirim ver.
- Uzun formlarda bolumleme veya stepper dusun.

## Harita ve Operasyon Ekranlari

- Koordinat, cihaz, hedef ve bolge gosterimleri ayri katmanlar olarak dusunulmeli.
- Marker renkleri tutarli olmali.
- Menzil cemberleri acik isimlendirilmelidir.
- Harita uzerinde alarm/tehdit gosteriliyorsa zaman bilgisi de ver.
- Leaflet kullaniliyorsa cihaz markerlari, menzil cemberleri ve alarm/bolge gosterimleri ileride layer group/layer control mantigina ayrilabilir.
- Gercek musteri koordinati veya saha bilgisi yerine mock koordinat kullan.

## Erisilebilirlik ve Performans Notlari

- Form inputlari ve select kontrolleri gorunur label veya erisilebilir ad tasimali.
- Validation mesaji sadece renkle anlatilmamali; metin olarak da gosterilmeli.
- Loading, error, empty ve success durumlari ekran okuyucular icin anlasilir metin icermeli.
- Buyuk liste veya pahali hesaplama olmadikca `useMemo`/memoizasyon ekleme; once okunabilir kodu koru.
- Veri seti buyurse filtreleme, metrik hesaplama ve harita marker uretimi `useMemo` adayi olabilir.

## CSS Kurallari

- Responsive tasarla.
- Sabit genislik yerine `min`, `max`, `clamp`, grid/flex kullan.
- Metinler buton veya karttan tasmamali.
- Gereksiz gradient, dekoratif kalabalik ve tek renkli agir paletlerden kacin.
- Operasyonel uygulamalarda okunabilirlik gorsellikten once gelir.

## UI Kontrol Listesi

- [ ] Component gorevi net.
- [ ] Componentin beslendigi backend/domain modeli veya gelecekteki endpoint belli.
- [ ] Mock veri kullaniliyorsa gercek API/model gecisi not edildi.
- [ ] Loading/empty/error durumlari var.
- [ ] Formlarda label ve hata mesaji var.
- [ ] Mobil/dar ekran dusunuldu.
- [ ] Renkler anlam tasiyor.
- [ ] Hassas bilgi gereksiz gosterilmiyor.
- [ ] Kod TypeScript tipleriyle okunabilir.
