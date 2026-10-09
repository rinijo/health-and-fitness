import { formatChartDate } from '../../lib/dates'

export interface TrendPoint {
  date: string
  value: number
}

interface TrendChartProps {
  points: TrendPoint[]
  unit: string
  emptyLabel: string
}

export function TrendChart({ points, unit, emptyLabel }: TrendChartProps) {
  if (points.length < 2) {
    return <p className="mt-2 text-xs leading-5 text-fog/70">{emptyLabel}</p>
  }

  const width = 180
  const height = 120
  const left = 34
  const right = 8
  const top = 10
  const bottom = 22
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom

  const values = points.map((point) => point.value)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const yMin = dataMin === dataMax ? Math.max(0, dataMin - 1) : dataMin
  const yMax = dataMin === dataMax ? dataMax + 1 : dataMax
  const span = yMax - yMin || 1

  const yTicks = [yMax, yMin]
  const coords = points.map((point, index) => {
    const x = left + (index / (points.length - 1)) * plotWidth
    const y = top + plotHeight - ((point.value - yMin) / span) * plotHeight
    return { ...point, x, y }
  })

  function formatTick(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-1 w-full" role="img">
      <line x1={left} y1={top} x2={left} y2={top + plotHeight} stroke="#cfcfcf" strokeOpacity="0.35" />
      <line
        x1={left}
        y1={top + plotHeight}
        x2={left + plotWidth}
        y2={top + plotHeight}
        stroke="#cfcfcf"
        strokeOpacity="0.35"
      />
      {yTicks.map((tick) => {
        const y = top + plotHeight - ((tick - yMin) / span) * plotHeight
        return (
          <g key={`y-${tick}`}>
            <line x1={left} y1={y} x2={left + plotWidth} y2={y} stroke="#cfcfcf" strokeOpacity="0.12" />
            <text x={left - 4} y={y + 3} textAnchor="end" fill="#cfcfcf" fontSize="8">
              {formatTick(tick)}
              {unit ? ` ${unit}` : ''}
            </text>
          </g>
        )
      })}
      <polyline
        fill="none"
        stroke="#a6ff1e"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords.map((point) => `${point.x},${point.y}`).join(' ')}
      />
      {coords.map((point) => (
        <g key={`${point.date}-${point.value}`}>
          <circle cx={point.x} cy={point.y} r="3.5" fill="#3d3d3d" stroke="#a6ff1e" strokeWidth="1.5" />
          <text x={point.x} y={height - 4} textAnchor="middle" fill="#cfcfcf" fontSize="8">
            {formatChartDate(point.date)}
          </text>
        </g>
      ))}
    </svg>
  )
}
