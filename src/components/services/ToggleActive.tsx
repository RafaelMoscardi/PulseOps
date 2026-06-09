'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleServiceActive } from '@/app/actions/services'

interface ToggleActiveProps {
  serviceId: string
  isActive: boolean
}

export function ToggleActive({ serviceId, isActive }: ToggleActiveProps) {
  const [optimisticActive, setOptimisticActive] = useOptimistic(isActive)
  const [, startTransition] = useTransition()

  function handleToggle() {
    const next = !optimisticActive
    startTransition(async () => {
      setOptimisticActive(next)
      await toggleServiceActive(serviceId, next)
    })
  }

  return (
    <button
      onClick={handleToggle}
      title={optimisticActive ? 'Desativar serviço' : 'Ativar serviço'}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide border transition-colors"
      style={
        optimisticActive
          ? {
              color: 'var(--c-online)',
              borderColor: 'rgba(34,211,238,0.25)',
              background: 'rgba(34,211,238,0.07)',
              fontFamily: 'var(--font-ibm-mono)',
            }
          : {
              color: 'var(--c-muted)',
              borderColor: 'var(--c-border)',
              background: 'transparent',
              fontFamily: 'var(--font-ibm-mono)',
            }
      }
    >
      {optimisticActive ? 'ATIVO' : 'INATIVO'}
    </button>
  )
}
