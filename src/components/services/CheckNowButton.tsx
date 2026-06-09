'use client'

import { useState, useTransition } from 'react'
import { runManualCheck } from '@/app/actions/monitor'

export function CheckNowButton({ serviceId }: { serviceId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await runManualCheck(serviceId)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          color: 'var(--c-accent)',
          borderColor: 'rgba(14,165,233,0.25)',
          background: 'rgba(14,165,233,0.05)',
        }}
      >
        {isPending ? (
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verificando…
          </span>
        ) : (
          'Verificar agora'
        )}
      </button>
      {error && (
        <span className="text-[11px]" style={{ color: 'var(--c-offline)' }}>
          {error}
        </span>
      )}
    </div>
  )
}
