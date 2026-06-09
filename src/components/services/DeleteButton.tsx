'use client'

import { useState, useTransition } from 'react'
import { deleteService } from '@/app/actions/services'

interface DeleteButtonProps {
  serviceId: string
  serviceName: string
}

export function DeleteButton({ serviceId, serviceName }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteService(serviceId)
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] hidden sm:block" style={{ color: 'var(--c-muted)' }}>
          Excluir?
        </span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50 transition-colors"
          style={{ background: 'var(--c-offline)' }}
        >
          {isPending ? 'Excluindo…' : 'Confirmar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--c-muted)' }}
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
      style={{ color: 'var(--c-muted)' }}
      title={`Excluir ${serviceName}`}
    >
      Excluir
    </button>
  )
}
