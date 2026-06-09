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
    <div className="max-w-4xl mx-auto">
      <div className="mb-7">
        <h1
          className="text-xl font-semibold"
          style={{ color: 'var(--c-text)' }}
        >
          Incidentes
        </h1>
        <p
          className="text-xs mt-1"
          style={{ color: 'var(--c-muted)' }}
        >
          <span style={{ color: open.length > 0 ? 'var(--c-warning)' : 'var(--c-muted)' }}>
            {open.length} aberto{open.length !== 1 ? 's' : ''}
          </span>
          {' · '}
          {resolved.length} resolvido{resolved.length !== 1 ? 's' : ''}
        </p>
      </div>

      {incidents.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border py-16 px-8 text-center"
          style={{
            background: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--c-online)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text)' }}>
            Nenhum incidente
          </h3>
          <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
            Todos os serviços estão operando normalmente.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="rounded-xl border border-l-2 px-5 py-4"
              style={{
                background: 'var(--c-surface)',
                borderColor: 'var(--c-border)',
                borderLeftColor: incident.isResolved ? 'var(--c-online)' : 'var(--c-warning)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status + duration */}
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-semibold tracking-widest px-2 py-0.5 rounded-full border"
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
                      {incident.isResolved ? 'RESOLVIDO' : 'ABERTO'}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{
                        color: 'var(--c-muted)',
                        fontFamily: 'var(--font-ibm-mono)',
                      }}
                    >
                      {duration(incident.startedAt, incident.resolvedAt)}
                    </span>
                  </div>

                  {/* Service name */}
                  <Link
                    href={`/services/${incident.service.id}`}
                    className="text-sm font-semibold block transition-colors"
                    style={{ color: 'var(--c-text)' }}
                  >
                    {incident.service.name}
                  </Link>

                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: 'var(--c-muted)' }}
                  >
                    {incident.service.url}
                  </p>

                  {incident.reason && (
                    <p
                      className="text-xs mt-2 rounded px-2.5 py-1.5 inline-block border"
                      style={{
                        color: 'var(--c-muted)',
                        background: 'var(--c-surface2)',
                        borderColor: 'var(--c-border)',
                        fontFamily: 'var(--font-ibm-mono)',
                      }}
                    >
                      {incident.reason}
                    </p>
                  )}
                </div>

                {/* Timestamps */}
                <div
                  className="shrink-0 text-right text-[11px] space-y-0.5"
                  style={{
                    color: 'var(--c-muted)',
                    fontFamily: 'var(--font-ibm-mono)',
                  }}
                >
                  <p>início {fmt(incident.startedAt)}</p>
                  {incident.resolvedAt && (
                    <p>fim {fmt(incident.resolvedAt)}</p>
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
