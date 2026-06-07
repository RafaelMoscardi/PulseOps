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
    { label: 'Total de Serviços', value: String(total), description: 'serviços cadastrados', color: 'text-gray-900' },
    { label: 'Online', value: String(online), description: 'respondendo normalmente', color: 'text-green-600' },
    { label: 'Offline', value: String(offline), description: 'com falha ou sem resposta', color: 'text-red-600' },
    { label: 'Incidentes Abertos', value: String(openIncidents), description: 'aguardando resolução', color: 'text-amber-600' },
    { label: 'Uptime 24h', value: uptime != null ? `${uptime}%` : '—', description: 'nas últimas 24h', color: 'text-indigo-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Olá, {firstName}! Aqui está o resumo dos seus serviços monitorados.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Últimas Verificações</h3>
        {recentChecks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-gray-400">Nenhuma verificação ainda.<br />Adicione seus primeiros serviços.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentChecks.map((check) => (
              <li key={check.id} className="py-3 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${check.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <Link
                  href={`/services/${check.service.id}`}
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex-1 min-w-0 truncate"
                >
                  {check.service.name}
                </Link>
                <span className={`text-xs font-medium ${check.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {check.isOnline ? 'Online' : 'Offline'}
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
