'use client'

import { useActionState } from 'react'
import Link from 'next/link'

type FormState = { error?: string }

interface ServiceFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: {
    name?: string
    url?: string
    intervalMinutes?: number
    isActive?: boolean
  }
  submitLabel?: string
}

export function ServiceForm({
  action,
  defaultValues,
  submitLabel = 'Salvar',
}: ServiceFormProps) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {state.error}
        </div>
      )}

      {/* Nome */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do serviço <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={defaultValues?.name}
          placeholder="Minha API de Produção"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* URL */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          defaultValue={defaultValues?.url}
          placeholder="https://api.meusite.com/health"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          Use HTTP ou HTTPS. O endpoint será verificado periodicamente.
        </p>
      </div>

      {/* Intervalo */}
      <div>
        <label htmlFor="intervalMinutes" className="block text-sm font-medium text-gray-700 mb-1">
          Intervalo de verificação <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            id="intervalMinutes"
            name="intervalMinutes"
            type="number"
            required
            min={1}
            max={1440}
            defaultValue={defaultValues?.intervalMinutes ?? 5}
            className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-500">minutos (mín. 1, máx. 1440)</span>
        </div>
      </div>

      {/* Ativo */}
      <div className="flex items-center gap-3">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          defaultChecked={defaultValues?.isActive ?? true}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
          Ativar monitoramento imediatamente
        </label>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <Link
          href="/services"
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
