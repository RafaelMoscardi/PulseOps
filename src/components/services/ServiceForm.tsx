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

const inputClass = [
  'w-full rounded-lg px-3 py-2.5 text-sm transition-colors',
  'text-slate-200 placeholder-[#334155]',
  'bg-[#0f1822] border border-[#1e3048]',
  'focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500',
].join(' ')

const labelClass = 'block text-[11px] font-semibold tracking-widest uppercase mb-1.5'

export function ServiceForm({
  action,
  defaultValues,
  submitLabel = 'Salvar',
}: ServiceFormProps) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div
          className="rounded-lg border px-4 py-3 text-xs"
          style={{
            color: 'var(--c-offline)',
            background: 'rgba(248,113,113,0.07)',
            borderColor: 'rgba(248,113,113,0.25)',
          }}
        >
          {state.error}
        </div>
      )}

      {/* Nome */}
      <div>
        <label htmlFor="name" className={labelClass} style={{ color: 'var(--c-muted)' }}>
          Nome do serviço <span style={{ color: 'var(--c-offline)' }}>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={defaultValues?.name}
          placeholder="Minha API de Produção"
          className={inputClass}
        />
      </div>

      {/* URL */}
      <div>
        <label htmlFor="url" className={labelClass} style={{ color: 'var(--c-muted)' }}>
          URL <span style={{ color: 'var(--c-offline)' }}>*</span>
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          defaultValue={defaultValues?.url}
          placeholder="https://api.meusite.com/health"
          className={inputClass}
        />
        <p className="mt-1.5 text-[11px]" style={{ color: 'var(--c-dim)' }}>
          HTTP ou HTTPS. O endpoint será verificado periodicamente.
        </p>
      </div>

      {/* Intervalo */}
      <div>
        <label htmlFor="intervalMinutes" className={labelClass} style={{ color: 'var(--c-muted)' }}>
          Intervalo <span style={{ color: 'var(--c-offline)' }}>*</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            id="intervalMinutes"
            name="intervalMinutes"
            type="number"
            required
            min={1}
            max={1440}
            defaultValue={defaultValues?.intervalMinutes ?? 5}
            className={inputClass + ' w-28'}
          />
          <span className="text-xs" style={{ color: 'var(--c-muted)' }}>
            minutos (1–1440)
          </span>
        </div>
      </div>

      {/* Ativo */}
      <div className="flex items-center gap-3">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          defaultChecked={defaultValues?.isActive ?? true}
          className="h-4 w-4 rounded cursor-pointer accent-sky-500"
          style={{ borderColor: 'var(--c-borderhi)' }}
        />
        <label
          htmlFor="isActive"
          className="text-sm font-medium cursor-pointer"
          style={{ color: 'var(--c-text)' }}
        >
          Ativar monitoramento imediatamente
        </label>
      </div>

      {/* Ações */}
      <div
        className="flex items-center justify-end gap-3 pt-4 border-t"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <Link
          href="/services"
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--c-muted)' }}
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--c-accent)' }}
        >
          {pending ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
