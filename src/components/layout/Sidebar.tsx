import { Badge, Text } from '@fluentui/react-components'

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Cihaz kurulum bilgisi">
      <div>
        <Text size={600} weight="semibold">
          RadarDesk
        </Text>
        <Text className="muted" size={200}>
          Lokal cihaz kurulumu
        </Text>
      </div>

      <div className="admin-panel-summary">
        <Badge appearance="filled" color="brand">
          Tek kullanici
        </Badge>
        <Text className="muted" size={200}>
          Elindeki kamera, radar, RF veya diger cihazi bul, sec ve kendi verdigin adla kaydet.
        </Text>
      </div>
    </aside>
  )
}
