import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CheckNowButton } from '@/components/services/CheckNowButton'
import { ResponseTimeChart } from '@/components/charts/ResponseTimeChart'
import { UptimeGrid, type DayStats } from '@/components/charts/UptimeGrid'

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>
}

function fmt(date: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function duration(start: Date | string, end: Date | string | null): string {
  const ms = (end ? new Date(end) : new Date()).getTime() - new Date(start).getTime()
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}min`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const service = await prisma.monitoredService.findFirst({
    where: { id, userId: session.user.id },
    include: {
      checks: {
        orderBy: { checkedAt: 'desc' },
        take: 50,
      },
      incidents: {
        orderBy: { startedAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!service) notFound()

  const since90d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const checks90d = await prisma.checkResult.findMany({
    where: { serviceId: id, checkedAt: { gte: since90d } },
    select: { isOnline: true, checkedAt: true },
    orderBy: { checkedAt: 'asc' },
  })

  const lastCheck = service.checks[0]
  const openIncident = service.incidents.find((i) => !i.isResolved)

  const uptime90 =
    checks90d.length > 0
      ? (checks90d.filter((c) => c.isOnline).length / checks90d.length) * 100
      : null

  const onlineChecks = service.checks.filter((c) => c.isOnline && c.responseMs != null)
  const avgResponseMs =
    onlineChecks.length > 0
      ? Math.round(onlineChecks.reduce((s, c) => s + c.responseMs!, 0) / onlineChecks.length)
      : null

  const dayMap = new Map<string, { total: number; online: number }>()
  for (const c of checks90d) {
    const key = c.checkedAt.toISOString().slice(0, 10)
    const e = dayMap.get(key) ?? { total: 0, online: 0 }
    e.total++
    if (c.isOnline) e.online++
    dayMap.set(key, e)
  }

  const now = Date.now()
  const uptimeDays: DayStats[] = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(now - (89 - i) * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    return dayMap.get(key) ?? { total: 0, online: 0 }
  })

  const chartChecks = [...service.checks].reverse()

  const isOnline = lastCheck?.isOnline === true
  const statusColor = !lastCheck
    ? 'var(--c-muted)'
    : isOnline
    ? 'var(--c-online)'
    : 'var(--c-offline)'

  const uptimeColor =
    uptime90 == null
      ? 'var(--c-muted)'
      : uptime90 >= 99
      ? 'var(--c-online)'
      : uptime90 >= 95
      ? 'var(--c-warning)'
      : 'var(--c-offline)'

  const cardStyle = {
    background: 'var(--c-surface)',
    borderColor: 'var(--c-border)',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1 text-xs mb-4 transition-colors"
          style={{ color: 'var(--c-muted)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Serviços
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1
                className="text-xl font-semibold"
                style={{ color: 'var(--c-text)' }}
              >
                {service.name}
              </h1>
              {openIncident && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{
                    color: 'var(--c-warning)',
                    borderColor: 'rgba(251,146,60,0.3)',
                    background: 'rgba(251,146,60,0.08)',
                    fontFamily: 'var(--font-ibm-mono)',
                  }}
                >
                  INCIDENTE ABERTO
                </span>
              )}
            </div>
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs break-all transition-colors"
              style={{ color: 'var(--c-muted)' }}
            >
              {service.url}
            </a>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CheckNowButton serviceId={service.id} />
            <Link
              href={`/services/${service.id}/edit`}
              className="rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors"
              style={{
                color: 'var(--c-muted)',
                borderColor: 'var(--c-border)',
              }}
            >
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            label: 'Status',
            value: !lastCheck ? '—' : isOnline ? 'ONLINE' : 'OFFLINE',
            color: statusColor,
          },
          {
            label: 'Última resp.',
            value: lastCheck?.responseMs != null ? `${lastCheck.responseMs}ms` : '—',
            color: 'var(--c-text)',
          },
          {
            label: 'Média 50ch',
            value: avgResponseMs != null ? `${avgResponseMs}ms` : '—',
            color: 'var(--c-text)',
          },
          {
            label: 'Uptime 90d',
            value: uptime90 != null ? `${uptime90.toFixed(1)}%` : '—',
            color: uptimeColor,
          },
          {
            label: 'Intervalo',
            value: `${service.intervalMinutes}min`,
            color: 'var(--c-text)',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-4"
            style={cardStyle}
          >
            <p
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--c-muted)' }}
            >
              {s.label}
            </p>
            <p
              className="text-xl font-semibold mt-2 leading-none"
              style={{
                color: s.color,
                fontFamily: 'var(--font-ibm-mono)',
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Response time chart */}
      <div className="rounded-xl border" style={cardStyle}>
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <h3
            className="text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--c-muted)' }}
          >
            Tempo de Resposta
          </h3>
          <span
            className="text-[11px]"
            style={{ color: 'var(--c-dim)', fontFamily: 'var(--font-ibm-mono)' }}
          >
            últimos {service.checks.length} checks
          </span>
        </div>
        <div className="px-5 py-4">
          <ResponseTimeChart checks={chartChecks} />
        </div>
      </div>

      {/* Uptime grid */}
      <div className="rounded-xl border" style={cardStyle}>
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <h3
            className="text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--c-muted)' }}
          >
            Disponibilidade — 90 dias
          </h3>
          {uptime90 != null && (
            <span
              className="text-sm font-semibold"
              style={{
                color: uptimeColor,
                fontFamily: 'var(--font-ibm-mono)',
              }}
            >
              {uptime90.toFixed(2)}%
            </span>
          )}
        </div>
        <div className="px-5 py-5">
          <UptimeGrid days={uptimeDays} />
          <div className="flex items-center gap-2 mt-3">
            <span
              className="text-[10px]"
              style={{ color: 'var(--c-dim)' }}
            >
              Menos
            </span>
            {[
              { color: '#1e293b', label: 'Sem dados' },
              { color: '#7f1d1d', label: '< 50%' },
              { color: '#c2410c', label: '50–75%' },
              { color: '#15803d', label: '95–99%' },
              { color: '#22d3ee', label: '≥ 99%' },
            ].map((l) => (
              <div
                key={l.label}
                title={l.label}
                style={{ backgroundColor: l.color }}
                className="w-3 h-3 rounded-sm"
              />
            ))}
            <span
              className="text-[10px]"
              style={{ color: 'var(--c-dim)' }}
            >
              Mais
            </span>
          </div>
        </div>
      </div>

      {/* Incidents */}
      <div className="rounded-xl border" style={cardStyle}>
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <h3
            className="text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--c-muted)' }}
          >
            Histórico de Incidentes
          </h3>
        </div>
        {service.incidents.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--c-online)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--c-text)' }}>
              Nenhum incidente registrado
            </p>
          </div>
        ) : (
          <ul>
            {service.incidents.map((incident) => (
              <li
                key={incident.id}
                className="px-5 py-4 flex items-start gap-4 border-b last:border-b-0"
                style={{ borderColor: 'var(--c-border)' }}
              >
                <span
                  className="mt-0.5 shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  style={
                    incident.isResolved
                      ? {
                          color: 'var(--c-online)',
                          borderColor: 'rgba(34,211,238,0.25)',
                          background: 'rgba(34,211,238,0.07)',
                          fontFamily: 'var(--font-ibm-mono)',
                        }
                      : {
                          color: 'var(--c-warning)',
                          borderColor: 'rgba(251,146,60,0.3)',
                          background: 'rgba(251,146,60,0.08)',
                          fontFamily: 'var(--font-ibm-mono)',
                        }
                  }
                >
                  {incident.isResolved ? 'OK' : 'ABERTO'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: 'var(--c-text)' }}>
                    {incident.reason ?? 'Sem detalhes'}
                  </p>
                  <div
                    className="flex flex-wrap gap-3 mt-1 text-[11px]"
                    style={{
                      color: 'var(--c-muted)',
                      fontFamily: 'var(--font-ibm-mono)',
                    }}
                  >
                    <span>{fmt(incident.startedAt)}</span>
                    <span>· {duration(incident.startedAt, incident.resolvedAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent checks */}
      <div className="rounded-xl border" style={cardStyle}>
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <h3
            className="text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--c-muted)' }}
          >
            Últimas Verificações
          </h3>
          <span
            className="text-[11px]"
            style={{ color: 'var(--c-dim)', fontFamily: 'var(--font-ibm-mono)' }}
          >
            {service.checks.length} registros
          </span>
        </div>
        {service.checks.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs" style={{ color: 'var(--c-muted)' }}>
            Nenhuma verificação ainda. Clique em &ldquo;Verificar agora&rdquo; para iniciar.
          </div>
        ) : (
          <ul>
            {service.checks.map((check) => (
              <li
                key={check.id}
                className="px-5 py-3 flex items-center gap-3 border-b last:border-b-0"
                style={{ borderColor: 'var(--c-border)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: check.isOnline ? 'var(--c-online)' : 'var(--c-offline)',
                  }}
                />
                <span
                  className="text-[11px] font-semibold w-14 shrink-0"
                  style={{
                    color: check.isOnline ? 'var(--c-online)' : 'var(--c-offline)',
                    fontFamily: 'var(--font-ibm-mono)',
                  }}
                >
                  {check.isOnline ? 'OK' : 'FAIL'}
                </span>
                <span
                  className="text-[11px] w-16 shrink-0"
                  style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-ibm-mono)' }}
                >
                  {check.responseMs != null ? `${check.responseMs}ms` : '—'}
                </span>
                <span
                  className="text-[11px] flex-1 truncate"
                  style={{ color: 'var(--c-dim)', fontFamily: 'var(--font-ibm-mono)' }}
                >
                  {check.statusCode ? `HTTP ${check.statusCode}` : check.error ?? ''}
                </span>
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-ibm-mono)' }}
                >
                  {fmt(check.checkedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
