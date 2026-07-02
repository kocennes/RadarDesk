# Architecture Guidelines

Bu rehber proje yapisi, dosya isimleri, moduller ve buyuyebilirlik kararlari icin kullanilir.

## Baslangic Mantigi

Proje kucuk baslasa bile buyuyebilir. Bu yuzden dosyalar amacina gore ayrilmalidir.

Onerilen React + TypeScript yapisi:

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    ui/
    layout/
  features/
    devices/
    alerts/
    projects/
    map/
  services/
    apiClient.ts
  types/
    domain.ts
  utils/
    formatters.ts
  styles/
    globals.css
```

## Dosya ve Isimlendirme

- Component dosyalari PascalCase: `DeviceCard.tsx`
- Hook dosyalari camelCase: `useDevices.ts`
- Type dosyalari acik isimli: `device.types.ts` veya `domain.ts`
- CSS module kullaniliyorsa: `DeviceCard.module.css`
- Genel helperlar `utils/`, API islemleri `services/` altinda tutulur.

## Feature Bazli Dusunme

Buyuyen projede sadece teknik klasorleme yetmez. Is alanina gore bolmek daha okunur:

```text
features/devices
features/alerts
features/map
features/customer-questionnaire
features/reports
```

Her feature kendi component, type ve helperlarini icerebilir.

## Veri Modeli

Domain tipleri erken netlestirilmelidir:

```ts
type DeviceStatus = 'online' | 'offline' | 'warning' | 'alarm'

type Device = {
  id: string
  name: string
  status: DeviceStatus
  latitude?: number
  longitude?: number
}
```

RadarDesk buyurken musteri/proje/paket/yetki ayrimi merkezi model olarak ele alinmalidir:

```text
Customer
  Project/Site
    Device
    CameraFeed

ProductPackage
  allowedDeviceTypes
  allowedModules

AccessGroup
  customerId
  projectIds
  packageId
  role

User
  groupMemberships
```

Lokal cihaz kurulumu asamasinda cihaz kaydi su ayrimi korumalidir:

```text
DiscoveredDevice
  detectedLabel
  deviceType
  productProfile
  capabilities
  rawSource / ingestMode

RegisteredDevice
  displayName        -> kullanici yazar
  deviceType         -> backend/discovery belirler
  productProfile     -> backend/discovery belirler
  capabilities       -> backend/discovery belirler
  connectionStatus   -> active / disconnected / reconnecting
  localEvidencePath? -> olay kaniti icin lokal dosya referansi
```

Kurallar:

- Kullanici `displayName` alanini secer; `deviceType`, `productProfile` ve `capabilities` serbest metin olarak client'tan kabul edilmez.
- Backend cihaz profiline gore analiz pipeline'i secer.
- Kamera/termal, radar, RF ve C2 verileri ayni ham formatta varsayilmaz; backend sinirinda typed event modeline normalize edilir.
- Ham medya lokal dosyada, event metadata'si typed domain modelinde tutulur.
- Lokal ilk urun deneyiminde tum operasyon modulleri var kabul edilir; frontend panelleri paket kisitiyle saklamak yerine bagli cihaz var/yok durumuna gore bos veya aktif durum gosterir.
- Cihaz baglantisi kaldirilinca yeni ingest/event uretimi durmalidir; eski evidence ve olay gecmisi kullanici acikca silmedikce korunmalidir.
- Cihaz silme, registered-device kaydini aktif listeden cikarma isidir; historical evidence, sensor event ve incident kayitlari ayri retention/cleanup aksiyonu olmadan silinmemelidir.
- Ayni fiziksel cihaz tekrar baglanabilmelidir; reconnect akisi eski display name'i korumayi veya yeni ad vermeyi desteklemelidir.

Sensor fusion ve incident modeli buyurken su ayrim korunmalidir:

```text
SensorEvent
  id
  deviceId
  kind
  severity
  detectedAt
  metadata
  evidence.snapshotPath?
  evidence.clipPath?
  evidence.dataPath?
  evidence.hash?

Incident / CorrelatedEvent
  id
  projectId/siteId
  title
  severity
  confidence
  confirmationLevel: single-sensor / multi-sensor / operator-confirmed
  status: open / reviewing / confirmed / dismissed
  sensorEventIds[]
  evidenceRefs[]
  operatorNote?
  createdAt
  updatedAt
```

Kurallar:

- `SensorEvent`, tek cihazdan gelen normalize ham olmayan kayittir.
- `Incident`, bir veya daha fazla sensor event'inin operator tarafindan incelenecek olay dosyasidir.
- Kamera kaniti `snapshotPath` veya `clipPath`, radar/RF/C2 kaniti `dataPath` olarak lokal evidence klasorune referans vermelidir.
- Ilk korelasyon basit baslamalidir: ayni proje/saha, yakin zaman penceresi ve uyumlu sensor tipleri ayni incident adayina baglanabilir.
- False alarm azaltma icin tek sensor event'i ile coklu sensor dogrulamasi farkli `confidence` seviyeleri uretmelidir.
- `confirmationLevel`, bu guven seviyesinin nedenini aciklamalidir: tek sensor, coklu sensor veya operator onayi.
- Frontend incident'i gosterirken ham RTSP URL, RF ham kaydi veya radar ic protokol detayini istememeli; sadece backend'in dondurdugu event/evidence referanslarini kullanmalidir.

Kurallar:

- Paket, kurumsal/admin asamada hangi ekran/modul ve cihaz tiplerinin gorulebilecegini tanimlar.
- Lokal ilk urun asamasinda paket kisiti ana davranis degildir; bagli cihazlar hangi verinin aktif oldugunu belirler.
- Project/Site, hangi gercek cihaz ve kamera feedlerinin kullaniciya ait oldugunu tanimlar.
- AccessGroup, cok sayida viewer/operator kullanicisini toplu yetkilendirmek icin kullanilir.
- User bazli override sadece istisna durumlarda dusunulmelidir; ana yetkilendirme grup uzerinden ilerlemelidir.
- Ayni paket farkli musterilerde tekrar kullanilabilir, ancak cihaz ve veri kayitlari musteri/proje bazinda ayrilmalidir.

## API Katmani

- `fetch` cagrilari her component icine dagitilmamali.
- Ortak `apiClient` veya servis fonksiyonlari kullanilmali.
- API response tipleri tanimli olmali.
- Hata durumlari standardize edilmeli.

RadarDesk icin onerilen gecis:

```text
src/mocks/* -> src/services/mockApi.ts -> backend endpointleri -> database
```

Bu geciste ekran componentleri once servis fonksiyonlarina baglanmali; servislerin ic kaynagi mock data iken daha sonra backend'e tasinabilir.

Backend basladiginda ayri bir klasor tercih edilebilir:

```text
server/
  src/
    app.ts
    routes/
    middleware/
    services/
    types/
```

Frontend ve backend ayni repoda kalacaksa ortak domain tiplerinin tekrarini azaltmak icin ileride `shared/` klasoru degerlendirilebilir; ilk MVP'de basitlik onceliklidir.

Auth ve paket bazli yetki eklendiginde API response'lari kullanicinin effective access sonucuna gore filtrelenmelidir. Frontend sadece gelen modulleri render etmeli; yetkisiz cihaz tiplerini client tarafinda saklamak tek basina yeterli kabul edilmemelidir.

## Buyume Kurali

Bir dosya asiri uzuyorsa su sinyallere bak:

- Birden fazla sorumluluk var mi?
- Form logic, API logic ve UI ayni yerde mi?
- Tekrar eden component var mi?
- Type tanimlari component dosyasini sisiriyor mu?

Bu sinyaller varsa parcala.

Mevcut durumda `src/app/App.tsx` dashboard layout, form, liste, filtre ve state preview sorumluluklarini birlikte tasiyor. Yeni ozellik eklenmeden once su parcalama sirasi makuldur:

- `features/dashboard` icine metrik ve state toolbar componentleri.
- `features/projects` icine project form componenti.
- `features/devices` icine device list/filter componenti.
- `features/alerts` icine alert list/filter componenti.
- `components/layout` icine shell/sidebar/topbar parcalari.

## Mimari Kontrol Listesi

- [ ] Dosyalar amacina gore ayrildi.
- [ ] Componentler feature veya ortak component olarak dogru yerde.
- [ ] Domain tipleri merkezi ve tekrar kullanilabilir.
- [ ] API cagrilari daginik degil.
- [ ] Naming tutarli.
- [ ] Yeni ekran eklendiginde yapi bozulmayacak.
