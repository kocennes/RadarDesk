import { Badge, Card, CardHeader, Text } from '@fluentui/react-components'
import { ListState } from '../../components/ui/ListState'
import type { CameraFeed } from '../../types/domain'

type CameraFeedCardProps = {
  cameraFeeds: CameraFeed[]
}

const statusColor: Record<CameraFeed['status'], 'success' | 'warning' | 'danger'> = {
  offline: 'danger',
  online: 'success',
  standby: 'warning',
}

const statusLabel: Record<CameraFeed['status'], string> = {
  offline: 'Offline',
  online: 'Online',
  standby: 'Beklemede',
}

const modeLabel: Record<CameraFeed['mode'], string> = {
  day: 'gunduz',
  thermal: 'termal',
}

export function CameraFeedCard({ cameraFeeds }: CameraFeedCardProps) {
  const primaryFeed = cameraFeeds.find((cameraFeed) => cameraFeed.status !== 'offline') ?? cameraFeeds[0]

  return (
    <Card>
      <CardHeader
        header={<Text weight="semibold">Kamera dogrulama</Text>}
        description={<Text size={200}>Kamera API entegrasyonuna hazir mock stream metadatasi</Text>}
      />
      <div className="camera-preview" aria-label="Gorsel dogrulama video alani">
        <div className="camera-reticle" aria-hidden="true" />
        <Text weight="semibold">{primaryFeed?.name ?? 'Kamera feed yok'}</Text>
        <Text className="muted" size={200}>
          {primaryFeed ? `${primaryFeed.fieldOfView} / ${modeLabel[primaryFeed.mode]} / ${statusLabel[primaryFeed.status]}` : 'Bagli EO/IR cihaz bekleniyor'}
        </Text>
      </div>
      <div className="stack">
        {cameraFeeds.length === 0 ? (
          <ListState message="Mevcut veri kaynaginda kamera kanali yok" />
        ) : (
          cameraFeeds.map((cameraFeed) => (
            <article className="camera-row" key={cameraFeed.id}>
              <div>
                <Text weight="semibold">{cameraFeed.name}</Text>
                <Text block className="muted" size={200}>
                  {cameraFeed.fieldOfView} / {modeLabel[cameraFeed.mode]} / son frame {cameraFeed.lastFrameAt}
                </Text>
                <Text block className="muted" size={200}>
                  Kanit kaydi olay olusunca backend tarafinda otomatik alinir.
                </Text>
                <div className="hud-chip-row">
                  <span className="hud-chip">MODE: {cameraFeed.mode.toUpperCase()}</span>
                  <span className="hud-chip">STATUS: {cameraFeed.status.toUpperCase()}</span>
                  <span className="hud-chip">SRC: {cameraFeed.source.toUpperCase()}</span>
                </div>
              </div>
              <Badge appearance="filled" color={statusColor[cameraFeed.status]}>
                {statusLabel[cameraFeed.status]}
              </Badge>
            </article>
          ))
        )}
      </div>
    </Card>
  )
}
