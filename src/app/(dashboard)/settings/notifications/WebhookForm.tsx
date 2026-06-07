'use client'

import { useActionState, useTransition, useState } from 'react'
import { saveWebhook, removeWebhook, testWebhook } from '@/app/actions/notifications'

type Props = {
  maskedUrl: string | null
  isConfigured: boolean
}

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined }

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
      {isConfigured && maskedUrl && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-green-800">Webhook configurado</p>
            <p className="text-xs text-green-700 font-mono mt-0.5 truncate">{maskedUrl}</p>
          </div>
        </div>
      )}

      <form action={saveAction} className="space-y-3">
        <div>
          <label htmlFor="webhookUrl" className="block text-xs font-medium text-gray-700 mb-1.5">
            {isConfigured ? 'Alterar webhook' : 'URL do Webhook'}
          </label>
          <input
            id="webhookUrl"
            name="webhookUrl"
            type="url"
            placeholder="https://discord.com/api/webhooks/…"
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
            required
          />
        </div>

        {saveState?.error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {saveState.error}
          </p>
        )}
        {saveState?.success && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
            Webhook salvo com sucesso.
          </p>
        )}

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          Salvar
        </button>
      </form>

      {isConfigured && (
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleTest}
            disabled={testPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {testPending ? (
              <svg className="animate-spin w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {removePending ? 'Removendo…' : 'Remover webhook'}
          </button>

          {testResult?.success && (
            <span className="text-xs text-green-700 font-medium">Mensagem enviada.</span>
          )}
          {testResult?.error && (
            <span className="text-xs text-red-600">{testResult.error}</span>
          )}
        </div>
      )}
    </div>
  )
}
