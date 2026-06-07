export type DayStats = {
  total: number
  online: number
}

type Props = {
  days: DayStats[] // 90 entries, oldest first
}

function cellColor(day: DayStats): string {
  if (day.total === 0) return '#e5e7eb'
  const p = day.online / day.total
  if (p >= 0.99) return '#22c55e'
  if (p >= 0.95) return '#86efac'
  if (p >= 0.75) return '#facc15'
  if (p >= 0.50) return '#fb923c'
  return '#ef4444'
}

function cellTitle(day: DayStats): string {
  if (day.total === 0) return 'No data'
  return `${Math.round((day.online / day.total) * 100)}% uptime (${day.total} checks)`
}

export function UptimeGrid({ days }: Props) {
  return (
    <div className="flex flex-wrap gap-px" aria-label="90-day uptime grid">
      {days.map((day, i) => (
        <div
          key={i}
          title={cellTitle(day)}
          style={{ backgroundColor: cellColor(day) }}
          className="w-3 h-3 rounded-sm"
        />
      ))}
    </div>
  )
}
