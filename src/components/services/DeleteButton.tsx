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
        <span className="text-xs text-gray-500 hidden sm:block">
          Excluir &quot;{serviceName}&quot;?
        </span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Excluindo…' : 'Confirmar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      Excluir
    </button>
  )
}
