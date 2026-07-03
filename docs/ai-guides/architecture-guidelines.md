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

Yeni frontend parcasi eklenirken once su eslestirme yapilmalidir:

```text
Frontend Panel / Component
  -> Domain Model
  -> Service/API Function
  -> Mock Data veya Backend Endpoint
  -> Gercek Cihaz/Database gecis notu
```

Bir ekran henuz gercek backend endpointine bagli degilse bile hangi domain modelinden beslenecegi net olmalidir. Ornek: PPI radar paneli `RadarTrack`, RF waterfall `SpectrumFrame`, kamera evidence paneli `SensorEvent.evidence`, command paneli `CommandRequest/CommandResult`, cihaz saglik paneli `DeviceHealth` modeliyle eslesmelidir.

Kurallar:

- Frontend componentleri kalici olarak sadece dekoratif/mock veriyle birakilmamalidir.
- Mock veri, gelecekteki API response sozlesmesinin yerel temsilidir; gercek veriye geciste componentin temel davranisi degismemelidir.
- Backend modeli yoksa yeni UI davranisi eklenmeden once TODO veya proje karar notuna model/endpoint ihtiyaci yazilmalidir.
- UI cihaz tipi, paket yetkisi, alarm sonucu, threat score veya command yetkisini kendi basina uretmemeli; backend veya typed servis response'una gore render etmelidir.

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

## Canli Sensor, Parser ve Komut Katmani

Radar/RF/kamera entegrasyonu buyudukce ham cihaz protokolleri backend sinirinda adapter/parser katmaninda tutulmalidir. Frontend ASTERIX byte dizisi, vendor radar paketi, RTSP URL, ONVIF credential veya RF ham kaydi gormemelidir.

Onerilen ayrim:

```text
Device Adapter / Parser
  -> ham cihaz verisini okur
  -> ICD veya vendor sozlesmesine gore normalize eder

Sensor Event Service
  -> typed SensorEvent uretir
  -> lokal evidence metadata'si ekler

Incident Correlation Service
  -> SensorEvent kayitlarini incident adaylarina baglar

Realtime Delivery
  -> SSE/WebSocket ile frontend'e sadece normalize event/incident ozeti yayinlar

Command Service
  -> operator/supervisor onayi, role/access kontrolu, rate limit ve audit ile cihaz komutlarini yonetir

Device Command Adapter
  -> PTZ, kamera, termal kamera veya countermeasure gibi gercek cihaz komutlarini vendor/protokol detaylari frontend'e cikmadan uygular

Frontend Render State
  -> harita, PPI, alarm feed ve camera/evidence panellerini besler
```

Canli veri yogunlugu arttiginda frontend tarafinda Web Worker degerlendirilmelidir. Worker, canli event dinleme, koordinat donusumu ve filtreleme gibi isleri yapabilir; UI thread'e yalnizca cizilecek hedefler ve panel ozeti gonderilmelidir.

PTZ veya cihaz komutu gibi hareketli cihaz kontrolu frontend'den direkt protokol komutu olarak cikmamalidir. Komutlar backend'de allowlist, role/yetki kontrolu, rate limit, audit log ve test adapter destegiyle ayrica tasarlanmalidir.

Gercek komut katmani sensor ingest akisindan ayrilmalidir. Sensor ingest; radar, RF, kamera ve termal kaynaklardan gelen veriyi normalize edip `SensorEvent` ve `Incident` uretir. Command service ise operatorun niyetini, secili target/incident baglamini ve yetkisini alir; gerekli onay, audit, cooldown/rate limit ve cihaz sahipligi kontrollerinden sonra adapter'a guvenli komut istegi gonderir.

Onerilen komut modeli:

```text
CommandRequest
  id
  commandType: ptz-slew / camera-preset / capture-evidence / countermeasure-request / cancel
  targetId?
  incidentId?
  deviceId
  projectId/siteId
  requestedBy
  approvalState: none / operator-approved / supervisor-required / approved / rejected / expired
  status: requested / pending-approval / executing / succeeded / failed / cancelled
  createdAt
  updatedAt

CommandAuditEntry
  commandId
  actorId
  actorRole
  action
  reason?
  timestamp
  result
```

Kurallar:

- Command endpointleri frontend'e credential, RTSP URL, ONVIF endpoint, jammer protokolu, RF ham payload veya vendor detayi dondurmez.
- PTZ/camera komutlari bile backend tarafinda allowlist cihaz, customer/project/site sahipligi ve role/access group kontrolu ister.
- Countermeasure/jammer gibi yuksek riskli aksiyonlar iki asamali operator + supervisor onayi, dry-run/test adapter, audit log, rate limit ve iptal akisi olmadan uygulanmaz.
- ROE/rule engine ilk asamada gercek komut tetikleyen otomasyon degil, operatora onerilen aksiyon ve incident onceligi ureten karar destek katmani olarak kalir.

## Musteri Gereksinim Anketi Modeli

Anti-drone satis/kesif anketleri `Project` modelinin icine rastgele alan eklenerek buyutulmamali. `Project`, is/proje baglamini; `RequirementSurvey` veya `SiteAssessment`, satis oncesi teknik gereksinim cevaplarini temsil etmelidir.

Onerilen ayrim:

```text
Project
  id
  customerId
  name
  site
  status

RequirementSurvey
  id
  projectId?
  customerContact
  endUserContact?
  projectPriority
  procurementTimeline
  protectedSiteTypes[]
  threatProfile
  technicalRequirements
  externalSystemNeeds
  operationalRequirements
  mappingRequirements
  dataSecurityRequirements
  advancedRequirements
  declaration
  status: draft / submitted / under-review / archived
  createdAt
  updatedAt

SurveyAttachment
  id
  surveyId
  kind: map-screenshot / kml / kmz / site-photo / authorization-doc / other
  localPath
  contentType
  sizeBytes
  hash
  uploadedAt
```

Kurallar:

- Cok secimli alanlar string metin yerine union type ve allowlist ile modellenmelidir.
- Koordinat, tesis siniri, savunma/tespit cevresi ve KML/KMZ ekleri `mappingRequirements` icinde hassas saha verisi olarak ayrilmalidir.
- Frekans bantlari, menzil beklentileri, kripto/uzaktan erisim ve jammer ihtiyaci gibi alanlar UI secimi olsa bile backend validation'dan gecmeden kalici kayda alinmamalidir.
- Dosya ekleri database'e gomulmemeli; lokal dosya yolu, hash, content type, boyut ve kategori metadata'si tutulmalidir.
- Bu model ilk etapta mock/demo cevaplarla denenmeli; gercek musteri anketleri icin auth, access control, audit ve retention kararlari hazir olmadan production veri akisi acilmamalidir.

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
