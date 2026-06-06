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

  // Bind the serviceId so updateService receives (serviceId, prev, formData)
  const updateWithId = updateService.bind(null, service.id)

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
        <h2 className="text-2xl font-bold text-gray-900 mt-3">Editar Serviço</h2>
        <p className="text-sm text-gray-500 mt-1 truncate">{service.name}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
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
