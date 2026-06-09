'use client'

import { useActionState } from 'react'
import { registerAction } from '@/app/actions/auth'
import Link from 'next/link'

const inputClass = [
  'w-full rounded-lg px-3 py-2.5 text-sm transition-colors',
  'text-slate-200 placeholder-[#334155]',
  'bg-[#0f1822] border border-[#1e3048]',
  'focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500',
].join(' ')

const labelClass = 'block text-[11px] font-semibold tracking-widest uppercase mb-1.5 text-[#475569]'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, {})

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
        Criar conta
      </h2>

      <form action={action} className="space-y-4">
        {state.error && (
          <div className="rounded-lg border border-red-800/60 bg-red-950/40 text-red-400 text-xs px-4 py-3">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="name" className={labelClass}>
            Nome{' '}
            <span className="normal-case tracking-normal font-normal text-[#334155]">(opcional)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className={inputClass}
            placeholder="Seu nome"
          />
        </div>

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
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          style={{ background: 'var(--c-accent)' }}
        >
          {pending ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>

      <p
        className="mt-5 text-center text-xs"
        style={{ color: 'var(--c-muted)' }}
      >
        Já tem conta?{' '}
        <Link
          href="/login"
          className="font-medium transition-colors hover:text-sky-300"
          style={{ color: 'var(--c-accent)' }}
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}
