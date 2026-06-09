'use client'

import { useActionState, useTransition, useState } from 'react'
import { saveWebhook, removeWebhook, testWebhook } from '@/app/actions/notifications'

type Props = {
  maskedUrl: string | null
  isConfigured: boolean
}

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined }

const inputClass = [
  'w-full rounded-lg px-3 py-2.5 text-sm transition-colors',
  'text-slate-200 placeholder-[#334155]',
  'bg-[#0f1822] border border-[#1e3048]',
  'focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500',
].join(' ')

export function WebhookForm({ maskedUrl, isConfigured }: Props) {
  const [saveState, saveAction] = useActionState(saveWebhook, initialState)
  const [testPending, startTest] = useTransition()
  const [removePending, startRemove] = useTransition()
  const [testResult, setTestResult] = useState<{ error?: string; success?: boolean } | null>(null)

  function handleTest() {
    startTest(async () => {
      const result = await testWebhook()
      setTestResult(result)
      setTimeout(() => setTestResult(null), 4000)
    })
  }

  function handleRemove() {
    startRemove(async () => {
      await removeWebhook()
    })
  }

  return (
    <div className="space-y-4">
      {/* Configured badge */}
      {isConfigured && maskedUrl && (
        <div
          className="flex items-center gap-3 rounded-lg border px-4 py-3"
          style={{
            background: 'rgba(34,211,238,0.05)',
            borderColor: 'rgba(34,211,238,0.2)',
          }}
        >
          <span
            className="relative flex h-2 w-2 shrink-0"
          >
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: 'var(--c-online)' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: 'var(--c-online)' }}
            />
          </span>
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--c-online)' }}
            >
              Webhook configurado
            </p>
            <p
              className="text-xs mt-0.5 truncate"
              style={{
                color: 'var(--c-muted)',
                fontFamily: 'var(--font-ibm-mono)',
              }}
            >
              {maskedUrl}
            </p>
          </div>
        </div>
      )}

      {/* Save form */}
      <form action={saveAction} className="space-y-3">
        <div>
          <label
            htmlFor="webhookUrl"
            className="block text-[11px] font-semibold tracking-widest uppercase mb-1.5"
            style={{ color: 'var(--c-muted)' }}
          >
            {isConfigured ? 'Alterar webhook' : 'URL do Webhook'}
          </label>
          <input
            id="webhookUrl"
            name="webhookUrl"
            type="url"
            placeholder="https://discord.com/api/webhooks/…"
            className={inputClass}
            required
          />
        </div>

        {saveState?.error && (
          <p
            className="text-xs rounded-lg border px-3 py-2"
            style={{
              color: 'var(--c-offline)',
              background: 'rgba(248,113,113,0.07)',
              borderColor: 'rgba(248,113,113,0.25)',
            }}
          >
            {saveState.error}
          </p>
        )}
        {saveState?.success && (
          <p
            className="text-xs rounded-lg border px-3 py-2"
            style={{
              color: 'var(--c-online)',
              background: 'rgba(34,211,238,0.06)',
              borderColor: 'rgba(34,211,238,0.2)',
            }}
          >
            Webhook salvo com sucesso.
          </p>
        )}

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
          style={{ background: 'var(--c-accent)' }}
        >
          Salvar
        </button>
      </form>

      {/* Test + remove */}
      {isConfigured && (
        <div
          className="flex flex-wrap items-center gap-3 pt-3 border-t"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <button
            type="button"
            onClick={handleTest}
            disabled={testPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
            style={{
              color: 'var(--c-muted)',
              borderColor: 'var(--c-borderhi)',
              background: 'transparent',
            }}
          >
            {testPending ? (
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            )}
            Testar
          </button>

          <button
            type="button"
            onClick={handleRemove}
            disabled={removePending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
            style={{
              color: 'var(--c-offline)',
              borderColor: 'rgba(248,113,113,0.25)',
              background: 'transparent',
            }}
          >
            {removePending ? 'Removendo…' : 'Remover webhook'}
          </button>

          {testResult?.success && (
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--c-online)' }}
            >
              Mensagem enviada.
            </span>
          )}
          {testResult?.error && (
            <span className="text-xs" style={{ color: 'var(--c-offline)' }}>
              {testResult.error}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
