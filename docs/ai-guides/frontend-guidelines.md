# Frontend Guidelines

Bu rehber React, TypeScript, CSS, component, form, dashboard, tablo ve harita ekranlari icin kullanilir.

## Genel Yaklasim

- Ilk ekran gercek isi yaptirsin; gereksiz landing/hero tasarimindan kacin.
- Operasyonel uygulamalarda sade, okunabilir ve is odakli tasarim kullan.
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

## CSS Kurallari

- Responsive tasarla.
- Sabit genislik yerine `min`, `max`, `clamp`, grid/flex kullan.
- Metinler buton veya karttan tasmamali.
- Gereksiz gradient, dekoratif kalabalik ve tek renkli agir paletlerden kacin.
- Operasyonel uygulamalarda okunabilirlik gorsellikten once gelir.

## UI Kontrol Listesi

- [ ] Component gorevi net.
- [ ] Loading/empty/error durumlari var.
- [ ] Formlarda label ve hata mesaji var.
- [ ] Mobil/dar ekran dusunuldu.
- [ ] Renkler anlam tasiyor.
- [ ] Hassas bilgi gereksiz gosterilmiyor.
- [ ] Kod TypeScript tipleriyle okunabilir.
