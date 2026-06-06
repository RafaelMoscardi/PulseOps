import Link from 'next/link'
import { createService } from '@/app/actions/services'
import { ServiceForm } from '@/components/services/ServiceForm'

export default function NewServicePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Serviços
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-3">Novo Serviço</h2>
        <p className="text-sm text-gray-500 mt-1">
          Cadastre um endpoint para ser monitorado periodicamente.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <ServiceForm action={createService} submitLabel="Criar Serviço" />
      </div>
    </div>
  )
}
