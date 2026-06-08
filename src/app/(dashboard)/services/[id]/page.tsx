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

  // --- Stats ---
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

  // --- 90-day uptime grid ---
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

  // --- Chart data (oldest first) ---
  const chartChecks = [...service.checks].reverse()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Serviços
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
              {openIncident && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Incidente aberto
                </span>
              )}
              {!lastCheck && (
                <span className="text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                  Aguardando primeira verificação
                </span>
              )}
            </div>
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-indigo-600 transition-colors break-all"
            >
              {service.url}
            </a>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CheckNowButton serviceId={service.id} />
            <Link
              href={`/services/${service.id}/edit`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            label: 'Status',
            value: !lastCheck ? '—' : lastCheck.isOnline ? 'Online' : 'Offline',
            color: !lastCheck
              ? 'text-gray-400'
              : lastCheck.isOnline
              ? 'text-green-600'
              : 'text-red-600',
          },
          {
            label: 'Última resposta',
            value: lastCheck?.responseMs != null ? `${lastCheck.responseMs}ms` : '—',
            color: 'text-gray-900',
          },
          {
            label: 'Média (50 checks)',
            value: avgResponseMs != null ? `${avgResponseMs}ms` : '—',
            color: 'text-gray-900',
          },
          {
            label: 'Uptime 90d',
            value: uptime90 != null ? `${uptime90.toFixed(1)}%` : '—',
            color:
              uptime90 == null
                ? 'text-gray-400'
                : uptime90 >= 99
                ? 'text-green-600'
                : uptime90 >= 95
                ? 'text-yellow-600'
                : 'text-red-600',
          },
          {
            label: 'Intervalo',
            value: `${service.intervalMinutes} min`,
            color: 'text-gray-900',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
              {s.label}
            </p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Response time chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Tempo de Resposta</h3>
          <span className="text-xs text-gray-400">últimos {service.checks.length} checks</span>
        </div>
        <div className="px-6 py-4">
          <ResponseTimeChart checks={chartChecks} />
        </div>
      </div>

      {/* Uptime grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Disponibilidade — 90 dias</h3>
          {uptime90 != null && (
            <span
              className={`text-xs font-semibold ${
                uptime90 >= 99
                  ? 'text-green-600'
                  : uptime90 >= 95
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {uptime90.toFixed(2)}%
            </span>
          )}
        </div>
        <div className="px-6 py-5">
          <UptimeGrid days={uptimeDays} />
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-400">Menos</span>
            {[
              { color: '#e5e7eb', label: 'Sem dados' },
              { color: '#ef4444', label: '< 50%' },
              { color: '#fb923c', label: '50–75%' },
              { color: '#86efac', label: '95–99%' },
              { color: '#22c55e', label: '≥ 99%' },
            ].map((l) => (
              <div
                key={l.label}
                title={l.label}
                style={{ backgroundColor: l.color }}
                className="w-3 h-3 rounded-sm"
              />
            ))}
            <span className="text-xs text-gray-400">Mais</span>
          </div>
        </div>
      </div>

      {/* Incidents */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Histórico de Incidentes</h3>
        </div>
        {service.incidents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Nenhum incidente registrado</p>
            <p className="text-xs text-gray-400 mt-1">Este serviço nunca ficou offline.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {service.incidents.map((incident) => (
              <li key={incident.id} className="px-6 py-4 flex items-start gap-4">
                <span
                  className={`mt-0.5 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                    incident.isResolved
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {incident.isResolved ? 'Resolvido' : 'Aberto'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{incident.reason ?? 'Sem detalhes'}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                    <span>Início: {fmt(incident.startedAt)}</span>
                    <span>· Duração: {duration(incident.startedAt, incident.resolvedAt)}</span>
                    {incident.resolvedAt && (
                      <span>· Resolução: {fmt(incident.resolvedAt)}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent checks */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Últimas Verificações</h3>
          <span className="text-xs text-gray-400">{service.checks.length} registros</span>
        </div>
        {service.checks.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            Nenhuma verificação ainda. Clique em &ldquo;Verificar agora&rdquo; para iniciar.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {service.checks.map((check) => (
              <li key={check.id} className="px-6 py-3 flex items-center gap-4">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    check.isOnline ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span
                  className={`text-xs font-medium w-14 shrink-0 ${
                    check.isOnline ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {check.isOnline ? 'Online' : 'Offline'}
                </span>
                <span className="text-xs text-gray-500 w-16 shrink-0">
                  {check.responseMs != null ? `${check.responseMs}ms` : '—'}
                </span>
                <span className="text-xs text-gray-400 flex-1 truncate">
                  {check.statusCode ? `HTTP ${check.statusCode}` : check.error ?? ''}
                </span>
                <span className="text-xs text-gray-400 shrink-0">{fmt(check.checkedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
