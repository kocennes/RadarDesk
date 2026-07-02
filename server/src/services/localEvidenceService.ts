import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { LocalEvidenceRef } from '../../../src/types/domain'

export type StoredEvidence = LocalEvidenceRef & {
  capturedAt: string
  contentType: string
  feedId: string
  sizeBytes: number
}

export async function storeLocalEvidence(input: {
  content: Buffer
  contentType: string
  extension: string
  feedId: string
  now?: Date
}): Promise<StoredEvidence> {
  const storedFile = await writeLocalEvidenceFile(input)

  return {
    ...storedFile,
    snapshotPath: storedFile.filePath,
  }
}

export async function storeStructuredEvidence(input: {
  content: Buffer
  contentType: string
  extension: string
  feedId: string
  now?: Date
}): Promise<StoredEvidence> {
  const storedFile = await writeLocalEvidenceFile(input)

  return {
    ...storedFile,
    dataPath: storedFile.filePath,
  }
}

async function writeLocalEvidenceFile(input: {
  content: Buffer
  contentType: string
  extension: string
  feedId: string
  now?: Date
}): Promise<Omit<StoredEvidence, 'snapshotPath' | 'clipPath' | 'dataPath'> & { filePath: string }> {
  const capturedAt = input.now ?? new Date()
  const evidenceDir = getEvidenceDir()
  await mkdir(evidenceDir, { recursive: true })

  const safeFeedId = input.feedId.replace(/[^a-zA-Z0-9_-]/g, '-')
  const fileName = `${safeFeedId}-${capturedAt.toISOString().replace(/[:.]/g, '-')}.${input.extension}`
  const absolutePath = path.join(evidenceDir, fileName)
  await writeFile(absolutePath, input.content)

  return {
    capturedAt: capturedAt.toISOString(),
    contentType: input.contentType,
    filePath: path.relative(process.cwd(), absolutePath),
    hash: createHash('sha256').update(input.content).digest('hex'),
    sizeBytes: input.content.byteLength,
    feedId: input.feedId,
  }
}

export function getEvidenceDir(): string {
  return path.resolve(process.env.LOCAL_EVIDENCE_DIR?.trim() || 'local-evidence')
}
