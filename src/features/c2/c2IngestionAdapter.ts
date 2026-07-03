import type { C2IngestPacket } from './c2Types'

export type C2PacketConsumer = (packet: C2IngestPacket) => void

export interface C2IngestionAdapter {
  connect: (consume: C2PacketConsumer) => () => void
}

export function createDisabledRealtimeAdapter(): C2IngestionAdapter {
  return {
    connect: () => () => undefined,
  }
}
