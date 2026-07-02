import { Card, CardHeader, Text } from '@fluentui/react-components'
import { useEffect, useRef } from 'react'
import type { SensorEvent } from '../../types/domain'
import { getRadarPpiTargets, type RadarPpiTarget } from './radarPpiTargets'

type RadarPpiPanelProps = {
  events: SensorEvent[]
}

const maxRangeM = 1000
const targetColorBySeverity: Record<RadarPpiTarget['severity'], string> = {
  critical: '#ff5c6c',
  high: '#ff5c6c',
  medium: '#f6b443',
  low: '#56a7ff',
}

export function RadarPpiPanel({ events }: RadarPpiPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const targets = getRadarPpiTargets(events, maxRangeM)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const canvasElement = canvas
    const context = canvasElement.getContext('2d')

    if (!context) {
      return
    }

    const canvasContext = context
    let animationFrameId = 0
    let sweepDeg = 0

    function resizeCanvas() {
      const rect = canvasElement.getBoundingClientRect()
      const pixelRatio = window.devicePixelRatio || 1
      canvasElement.width = Math.max(1, Math.floor(rect.width * pixelRatio))
      canvasElement.height = Math.max(1, Math.floor(rect.height * pixelRatio))
      canvasContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    function drawFrame() {
      const rect = canvasElement.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const radius = Math.max(20, Math.min(width, height) * 0.42)
      const centerX = width / 2
      const centerY = height / 2

      canvasContext.fillStyle = 'rgba(5, 12, 22, 0.16)'
      canvasContext.fillRect(0, 0, width, height)
      drawGrid(canvasContext, centerX, centerY, radius)
      drawTargets(canvasContext, targets, centerX, centerY, radius)
      drawSweep(canvasContext, centerX, centerY, radius, sweepDeg)

      sweepDeg = (sweepDeg + 1.8) % 360
      animationFrameId = window.requestAnimationFrame(drawFrame)
    }

    resizeCanvas()
    canvasContext.fillStyle = '#050c16'
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height)
    animationFrameId = window.requestAnimationFrame(drawFrame)
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [targets])

  return (
    <Card className="ppi-card">
      <CardHeader
        header={<Text weight="semibold">PPI Radar</Text>}
        description={<Text size={200}>Mock radar-track event gorunumu</Text>}
      />
      <div className="ppi-surface">
        <canvas aria-label="Radar PPI ekrani" className="ppi-canvas" ref={canvasRef} />
        <div className="ppi-readout">
          <span>RNG {maxRangeM}m</span>
          <span>TRK {targets.length}</span>
        </div>
      </div>
    </Card>
  )
}

function drawGrid(context: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) {
  context.save()
  context.strokeStyle = 'rgba(86, 167, 255, 0.24)'
  context.lineWidth = 1

  for (const scale of [0.25, 0.5, 0.75, 1]) {
    context.beginPath()
    context.arc(centerX, centerY, radius * scale, 0, Math.PI * 2)
    context.stroke()
  }

  for (let bearing = 0; bearing < 360; bearing += 45) {
    const radians = bearingToRadians(bearing)
    context.beginPath()
    context.moveTo(centerX, centerY)
    context.lineTo(centerX + Math.sin(radians) * radius, centerY - Math.cos(radians) * radius)
    context.stroke()
  }

  context.restore()
}

function drawTargets(
  context: CanvasRenderingContext2D,
  targets: RadarPpiTarget[],
  centerX: number,
  centerY: number,
  radius: number,
) {
  for (const target of targets) {
    const distanceRatio = Math.min(1, target.rangeM / maxRangeM)
    const radians = bearingToRadians(target.bearingDeg)
    const x = centerX + Math.sin(radians) * radius * distanceRatio
    const y = centerY - Math.cos(radians) * radius * distanceRatio

    context.save()
    context.fillStyle = targetColorBySeverity[target.severity]
    context.shadowBlur = 10
    context.shadowColor = targetColorBySeverity[target.severity]
    context.beginPath()
    context.arc(x, y, 4.5, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
}

function drawSweep(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  sweepDeg: number,
) {
  const radians = bearingToRadians(sweepDeg)
  const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  gradient.addColorStop(0, 'rgba(86, 167, 255, 0.44)')
  gradient.addColorStop(1, 'rgba(86, 167, 255, 0)')

  context.save()
  context.strokeStyle = '#56a7ff'
  context.fillStyle = gradient
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(centerX, centerY)
  context.arc(centerX, centerY, radius, radians - 0.08, radians + 0.08)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(centerX, centerY)
  context.lineTo(centerX + Math.sin(radians) * radius, centerY - Math.cos(radians) * radius)
  context.stroke()
  context.restore()
}

function bearingToRadians(bearingDeg: number): number {
  return (bearingDeg * Math.PI) / 180
}
