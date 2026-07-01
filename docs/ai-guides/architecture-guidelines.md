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

## API Katmani

- `fetch` cagrilari her component icine dagitilmamali.
- Ortak `apiClient` veya servis fonksiyonlari kullanilmali.
- API response tipleri tanimli olmali.
- Hata durumlari standardize edilmeli.

## Buyume Kurali

Bir dosya asiri uzuyorsa su sinyallere bak:

- Birden fazla sorumluluk var mi?
- Form logic, API logic ve UI ayni yerde mi?
- Tekrar eden component var mi?
- Type tanimlari component dosyasini sisiriyor mu?

Bu sinyaller varsa parcala.

## Mimari Kontrol Listesi

- [ ] Dosyalar amacina gore ayrildi.
- [ ] Componentler feature veya ortak component olarak dogru yerde.
- [ ] Domain tipleri merkezi ve tekrar kullanilabilir.
- [ ] API cagrilari daginik degil.
- [ ] Naming tutarli.
- [ ] Yeni ekran eklendiginde yapi bozulmayacak.
