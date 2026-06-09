import Link from 'next/link'
import type { MonitoredService, CheckResult, Incident } from '@/generated/prisma/client'
import { DeleteButton } from './DeleteButton'
import { ToggleActive } from './ToggleActive'
import { CheckNowButton } from './CheckNowButton'

type ServiceWithIncludes = MonitoredService & {
  checks: CheckResult[]
  incidents: Incident[]
}

interface ServiceCardProps {
  service: ServiceWithIncludes
}

export function ServiceCard({ service }: ServiceCardProps) {
  const lastCheck = service.checks[0]
  const openIncident = service.incidents[0]

  const isOnline = lastCheck?.isOnline === true
  const isOffline = lastCheck?.isOnline === false
  const hasCheck = !!lastCheck

  const leftBorderColor = !hasCheck
    ? 'var(--c-dim)'
    : isOnline
    ? 'var(--c-online)'
    : 'var(--c-offline)'

  const statusColor = !hasCheck
    ? 'var(--c-muted)'
    : isOnline
    ? 'var(--c-online)'
    : 'var(--c-offline)'

  const statusLabel = !hasCheck ? 'AGUARDANDO' : isOnline ? 'ONLINE' : 'OFFLINE'

  return (
    <div
      className="rounded-xl border border-l-2 px-5 py-4 transition-colors"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
        borderLeftColor: leftBorderColor,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left */}
        <div className="flex-1 min-w-0">
          {/* Status row */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className="text-[11px] font-semibold tracking-widest"
              style={{
                color: statusColor,
                fontFamily: 'var(--font-ibm-mono)',
              }}
            >
              {statusLabel}
              {hasCheck && lastCheck.responseMs != null && isOnline && (
                <span style={{ color: 'var(--c-muted)' }}>
                  {' '}· {lastCheck.responseMs}ms
                </span>
              )}
              {hasCheck && isOffline && lastCheck.statusCode && (
                <span style={{ color: 'var(--c-muted)' }}>
                  {' '}· {lastCheck.statusCode}
                </span>
              )}
            </span>

            <ToggleActive serviceId={service.id} isActive={service.isActive} />

            {openIncident && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                style={{
                  color: 'var(--c-warning)',
                  borderColor: 'rgba(251,146,60,0.3)',
                  background: 'rgba(251,146,60,0.08)',
                }}
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                Incidente aberto
              </span>
            )}
          </div>

          {/* Service name */}
          <Link
            href={`/services/${service.id}`}
            className="text-sm font-semibold transition-colors block"
            style={{ color: 'var(--c-text)' }}
          >
            {service.name}
          </Link>

          {/* URL */}
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs truncate block mt-0.5 transition-colors"
            style={{ color: 'var(--c-muted)' }}
          >
            {service.url}
          </a>

          {/* Meta */}
          <div
            className="flex flex-wrap items-center gap-2 mt-2 text-[11px]"
            style={{
              color: 'var(--c-dim)',
              fontFamily: 'var(--font-ibm-mono)',
            }}
          >
            <span>cada {service.intervalMinutes}min</span>
            {lastCheck && (
              <>
                <span style={{ color: 'var(--c-border)' }}>·</span>
                <span>
                  última:{' '}
                  {new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(lastCheck.checkedAt))}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <CheckNowButton serviceId={service.id} />
          <Link
            href={`/services/${service.id}/edit`}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={{ color: 'var(--c-muted)' }}
          >
            Editar
          </Link>
          <DeleteButton serviceId={service.id} serviceName={service.name} />
        </div>
      </div>
    </div>
  )
}
