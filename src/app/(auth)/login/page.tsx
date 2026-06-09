'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const inputClass = [
  'w-full rounded-lg px-3 py-2.5 text-sm transition-colors',
  'text-slate-200 placeholder-[#334155]',
  'bg-[#0f1822] border border-[#1e3048]',
  'focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500',
].join(' ')

const labelClass = 'block text-[11px] font-semibold tracking-widest uppercase mb-1.5 text-[#475569]'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email ou senha inválidos.')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div
      className="rounded-xl border p-7"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
      }}
    >
      <h2
        className="text-lg font-semibold mb-6"
        style={{ color: 'var(--c-text)' }}
      >
        Acessar conta
      </h2>

      {registered && (
        <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/40 text-emerald-400 text-xs px-4 py-3 mb-4">
          Conta criada. Faça login para continuar.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-800/60 bg-red-950/40 text-red-400 text-xs px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          style={{ background: 'var(--c-accent)' }}
        >
          {loading ? 'Verificando…' : 'Entrar'}
        </button>
      </form>

      <p
        className="mt-5 text-center text-xs"
        style={{ color: 'var(--c-muted)' }}
      >
        Sem conta?{' '}
        <Link
          href="/register"
          className="font-medium transition-colors hover:text-sky-300"
          style={{ color: 'var(--c-accent)' }}
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="rounded-xl border p-7 text-center text-xs"
          style={{
            background: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
            color: 'var(--c-muted)',
          }}
        >
          Carregando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
