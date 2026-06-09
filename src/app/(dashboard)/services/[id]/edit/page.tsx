import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { updateService } from '@/app/actions/services'
import { ServiceForm } from '@/components/services/ServiceForm'

interface EditServicePageProps {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const service = await prisma.monitoredService.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!service) notFound()

  const updateWithId = updateService.bind(null, service.id)

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
          Editar Serviço
        </h1>
        <p className="text-xs mt-1 truncate" style={{ color: 'var(--c-muted)' }}>
          {service.name}
        </p>
      </div>

      <div
        className="rounded-xl border p-6"
        style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
      >
        <ServiceForm
          action={updateWithId}
          defaultValues={{
            name: service.name,
            url: service.url,
            intervalMinutes: service.intervalMinutes,
            isActive: service.isActive,
          }}
          submitLabel="Salvar Alterações"
        />
      </div>
    </div>
  )
}
