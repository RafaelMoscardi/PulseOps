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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        optimisticActive
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          optimisticActive ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      {optimisticActive ? 'Ativo' : 'Inativo'}
    </button>
  )
}
