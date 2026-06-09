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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--c-text)' }}
          >
            Serviços
          </h1>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--c-muted)' }}
          >
            {services.length === 1
              ? '1 serviço cadastrado'
              : `${services.length} serviços cadastrados`}
          </p>
        </div>
        <Link
          href="/services/new"
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-colors"
          style={{ background: 'var(--c-accent)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo Serviço
        </Link>
      </div>

      {services.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2.5">
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
    <div
      className="flex flex-col items-center justify-center rounded-xl border py-16 px-8 text-center"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'var(--c-border)' }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--c-muted)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </div>
      <h3
        className="text-sm font-semibold mb-1"
        style={{ color: 'var(--c-text)' }}
      >
        Nenhum serviço cadastrado
      </h3>
      <p
        className="text-xs mb-6"
        style={{ color: 'var(--c-muted)' }}
      >
        Adicione um endpoint para começar o monitoramento.
      </p>
      <Link
        href="/services/new"
        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors"
        style={{ background: 'var(--c-accent)' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Adicionar Serviço
      </Link>
    </div>
  )
}
