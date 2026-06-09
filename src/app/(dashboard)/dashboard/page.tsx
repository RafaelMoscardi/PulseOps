import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

function fmt(date: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const firstName = session?.user?.name?.split(' ')[0] ?? session?.user?.email

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [total, online, offline, openIncidents, checksFor24h, recentChecks] = await Promise.all([
    prisma.monitoredService.count({ where: { userId } }),
    prisma.monitoredService.count({ where: { userId, lastStatus: 'online' } }),
    prisma.monitoredService.count({ where: { userId, lastStatus: 'offline' } }),
    prisma.incident.count({ where: { service: { userId }, isResolved: false } }),
    prisma.checkResult.findMany({
      where: { service: { userId }, checkedAt: { gte: since24h } },
      select: { isOnline: true },
    }),
    prisma.checkResult.findMany({
      where: { service: { userId } },
      orderBy: { checkedAt: 'desc' },
      take: 8,
      include: { service: { select: { name: true, id: true } } },
    }),
  ])

  const uptime =
    checksFor24h.length > 0
      ? Math.round((checksFor24h.filter((c) => c.isOnline).length / checksFor24h.length) * 100)
      : null

  const stats = [
    {
      label: 'Serviços',
      value: String(total),
      sub: 'cadastrados',
      valueColor: 'var(--c-text)',
    },
    {
      label: 'Online',
      value: String(online),
      sub: 'respondendo',
      valueColor: 'var(--c-online)',
    },
    {
      label: 'Offline',
      value: String(offline),
      sub: 'com falha',
      valueColor: offline > 0 ? 'var(--c-offline)' : 'var(--c-muted)',
    },
    {
      label: 'Incidentes',
      value: String(openIncidents),
      sub: 'em aberto',
      valueColor: openIncidents > 0 ? 'var(--c-warning)' : 'var(--c-muted)',
    },
    {
      label: 'Uptime 24h',
      value: uptime != null ? `${uptime}%` : '—',
      sub: 'últimas 24h',
      valueColor:
        uptime == null
          ? 'var(--c-muted)'
          : uptime >= 99
          ? 'var(--c-online)'
          : uptime >= 90
          ? 'var(--c-warning)'
          : 'var(--c-offline)',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-7">
        <h1
          className="text-xl font-semibold"
          style={{ color: 'var(--c-text)' }}
        >
          Dashboard
        </h1>
        <p
          className="text-xs mt-1"
          style={{ color: 'var(--c-muted)' }}
        >
          Olá, {firstName} · resumo dos serviços monitorados
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{
              background: 'var(--c-surface)',
              borderColor: 'var(--c-border)',
            }}
          >
            <p
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--c-muted)' }}
            >
              {stat.label}
            </p>
            <p
              className="text-3xl font-semibold mt-2 leading-none"
              style={{
                color: stat.valueColor,
                fontFamily: 'var(--font-ibm-mono)',
              }}
            >
              {stat.value}
            </p>
            <p
              className="text-[11px] mt-1.5"
              style={{ color: 'var(--c-dim)' }}
            >
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Recent checks */}
      <div
        className="rounded-xl border"
        style={{
          background: 'var(--c-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <h2
            className="text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--c-muted)' }}
          >
            Últimas Verificações
          </h2>
          <Link
            href="/services"
            className="text-[11px] transition-colors"
            style={{ color: 'var(--c-accent)' }}
          >
            Ver todos →
          </Link>
        </div>

        {recentChecks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-8">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'var(--c-border)' }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--c-muted)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--c-text)' }}
            >
              Nenhuma verificação ainda
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--c-muted)' }}
            >
              Adicione seus primeiros serviços para começar.
            </p>
            <Link
              href="/services/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors"
              style={{ background: 'var(--c-accent)' }}
            >
              Adicionar serviço
            </Link>
          </div>
        ) : (
          <ul>
            {recentChecks.map((check, i) => (
              <li
                key={check.id}
                className="flex items-center gap-3 px-5 py-3 border-b last:border-b-0"
                style={{ borderColor: 'var(--c-border)' }}
              >
                {/* Status dot */}
                <span
                  className="relative flex h-1.5 w-1.5 shrink-0"
                >
                  {check.isOnline && i === 0 && (
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                      style={{ background: 'var(--c-online)' }}
                    />
                  )}
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{
                      background: check.isOnline ? 'var(--c-online)' : 'var(--c-offline)',
                    }}
                  />
                </span>

                <Link
                  href={`/services/${check.service.id}`}
                  className="text-sm font-medium flex-1 min-w-0 truncate transition-colors"
                  style={{ color: 'var(--c-text)' }}
                >
                  {check.service.name}
                </Link>

                <span
                  className="text-xs font-medium shrink-0"
                  style={{
                    color: check.isOnline ? 'var(--c-online)' : 'var(--c-offline)',
                    fontFamily: 'var(--font-ibm-mono)',
                  }}
                >
                  {check.isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
                <span
                  className="text-xs shrink-0"
                  style={{
                    color: 'var(--c-muted)',
                    fontFamily: 'var(--font-ibm-mono)',
                  }}
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
