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

function StatusBadge({ check }: { check: CheckResult | undefined }) {
  if (!check) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        Aguardando
      </span>
    )
  }
  if (check.isOnline) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Online {check.responseMs != null ? `· ${check.responseMs}ms` : ''}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Offline {check.statusCode ? `· ${check.statusCode}` : ''}
    </span>
  )
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(date)
  )
}

export function ServiceCard({ service }: ServiceCardProps) {
  const lastCheck = service.checks[0]
  const openIncident = service.incidents[0]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <StatusBadge check={lastCheck} />
            <span className="text-gray-300">·</span>
            <ToggleActive serviceId={service.id} isActive={service.isActive} />
            {openIncident && (
              <>
                <span className="text-gray-300">·</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  Incidente aberto
                </span>
              </>
            )}
          </div>

          <Link
            href={`/services/${service.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            {service.name}
          </Link>

          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-indigo-600 transition-colors truncate block mt-0.5"
          >
            {service.url}
          </a>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
            <span>Verificar a cada {service.intervalMinutes} min</span>
            <span>·</span>
            <span>Criado em {formatDate(service.createdAt)}</span>
            {lastCheck && (
              <>
                <span>·</span>
                <span>
                  Última checagem:{' '}
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

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          <CheckNowButton serviceId={service.id} />
          <Link
            href={`/services/${service.id}/edit`}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Editar
          </Link>
          <DeleteButton serviceId={service.id} serviceName={service.name} />
        </div>
      </div>
    </div>
  )
}
