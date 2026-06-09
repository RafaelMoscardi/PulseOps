type CheckPoint = {
  responseMs: number | null
  isOnline: boolean
}

type Props = {
  checks: CheckPoint[] // oldest → newest
}

export function ResponseTimeChart({ checks }: Props) {
  const W = 600
  const H = 80
  const PY = 6

  const online = checks.filter((c) => c.isOnline && c.responseMs != null)
  if (online.length < 3) {
    return (
      <div className="h-20 flex items-center justify-center text-xs italic" style={{ color: 'var(--c-dim)' }}>
        Sem dados suficientes para o gráfico
      </div>
    )
  }

  const maxMs = Math.max(...online.map((c) => c.responseMs!)) * 1.15
  const n = checks.length

  const sx = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W)
  const sy = (ms: number) => PY + (1 - ms / maxMs) * (H - PY * 2)

  const segments: string[] = []
  let seg = ''
  let prev = false

  for (let i = 0; i < checks.length; i++) {
    const c = checks[i]
    if (c.isOnline && c.responseMs != null) {
      const px = sx(i).toFixed(1)
      const py = sy(c.responseMs).toFixed(1)
      seg += prev ? ` L ${px} ${py}` : `M ${px} ${py}`
      prev = true
    } else {
      if (seg) segments.push(seg)
      seg = ''
      prev = false
    }
  }
  if (seg) segments.push(seg)

  const gridLines = [0.25, 0.5, 0.75]

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-20"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {gridLines.map((f) => (
          <line
            key={f}
            x1={0}
            y1={(PY + f * (H - PY * 2)).toFixed(1)}
            x2={W}
            y2={(PY + f * (H - PY * 2)).toFixed(1)}
            stroke="#16212e"
            strokeWidth={1}
          />
        ))}

        {checks.map((c, i) =>
          !c.isOnline ? (
            <rect
              key={i}
              x={(sx(i) - 0.5).toFixed(1)}
              y={0}
              width={Math.max(1, W / n)}
              height={H}
              fill="#f87171"
              opacity={0.15}
            />
          ) : null
        )}

        {segments.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>

      <div
        className="absolute top-0 right-0 flex flex-col justify-between h-20 py-1.5 pointer-events-none text-[10px] leading-none"
        style={{ color: 'var(--c-dim)', fontFamily: 'var(--font-ibm-mono)' }}
      >
        <span>{Math.round(maxMs)}ms</span>
        <span>{Math.round(maxMs / 2)}ms</span>
        <span>0</span>
      </div>
    </div>
  )
}
