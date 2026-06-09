import Link from 'next/link'
import { createService } from '@/app/actions/services'
import { ServiceForm } from '@/components/services/ServiceForm'

export default function NewServicePage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-1 text-xs transition-colors mb-4"
          style={{ color: 'var(--c-muted)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Serviços
        </Link>
        <h1 className="text-xl font-semibold mt-3" style={{ color: 'var(--c-text)' }}>
          Novo Serviço
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--c-muted)' }}>
          Cadastre um endpoint para ser monitorado periodicamente.
        </p>
      </div>

      <div
        className="rounded-xl border p-6"
        style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
      >
        <ServiceForm action={createService} submitLabel="Criar Serviço" />
      </div>
    </div>
  )
}
