import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ServiceCard } from '@/components/services/ServiceCard'

export default async function ServicesPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const services = await prisma.monitoredService.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      checks: {
        take: 1,
        orderBy: { checkedAt: 'desc' },
      },
      incidents: {
        where: { isResolved: false },
        take: 1,
      },
    },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Serviços</h2>
          <p className="text-sm text-gray-500 mt-1">
            {services.length}{' '}
            {services.length === 1 ? 'serviço cadastrado' : 'serviços cadastrados'}
          </p>
        </div>
        <Link
          href="/services/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Serviço
        </Link>
      </div>

      {services.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 py-16 px-8 text-center shadow-sm">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Nenhum serviço cadastrado
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Adicione um serviço para começar o monitoramento.
      </p>
      <Link
        href="/services/new"
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Adicionar Serviço
      </Link>
    </div>
  )
}
