import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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

export default async function IncidentsPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const incidents = await prisma.incident.findMany({
    where: { service: { userId } },
    orderBy: { startedAt: 'desc' },
    include: {
      service: { select: { id: true, name: true, url: true } },
    },
  })

  const open = incidents.filter((i) => !i.isResolved)
  const resolved = incidents.filter((i) => i.isResolved)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Incidentes</h2>
        <p className="text-sm text-gray-500 mt-1">
          {open.length} aberto{open.length !== 1 ? 's' : ''} · {resolved.length} resolvido{resolved.length !== 1 ? 's' : ''}
        </p>
      </div>

      {incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 py-16 px-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Nenhum incidente</h3>
          <p className="text-sm text-gray-500">Todos os serviços estão operando normalmente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className={`bg-white rounded-xl border shadow-sm px-5 py-4 ${
                incident.isResolved ? 'border-gray-200' : 'border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                        incident.isResolved
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {incident.isResolved ? 'Resolvido' : 'Aberto'}
                    </span>
                    <span className="text-xs text-gray-400">
                      Duração: {duration(incident.startedAt, incident.resolvedAt)}
                    </span>
                  </div>

                  <Link
                    href={`/services/${incident.service.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {incident.service.name}
                  </Link>

                  <p className="text-xs text-gray-400 mt-0.5 truncate">{incident.service.url}</p>

                  {incident.reason && (
                    <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1 inline-block">
                      {incident.reason}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right text-xs text-gray-400 space-y-0.5">
                  <p>Início: {fmt(incident.startedAt)}</p>
                  {incident.resolvedAt && (
                    <p>Resolução: {fmt(incident.resolvedAt)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
