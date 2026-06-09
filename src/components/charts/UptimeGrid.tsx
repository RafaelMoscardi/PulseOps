export type DayStats = {
  total: number
  online: number
}

type Props = {
  days: DayStats[] // 90 entries, oldest first
}

function cellColor(day: DayStats): string {
  if (day.total === 0) return '#1e293b'
  const p = day.online / day.total
  if (p >= 0.99) return '#22d3ee'
  if (p >= 0.95) return '#0891b2'
  if (p >= 0.75) return '#d97706'
  if (p >= 0.50) return '#c2410c'
  return '#b91c1c'
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
