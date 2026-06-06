import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const stats = [
  { label: 'Total de Serviços', value: '—', description: 'serviços cadastrados' },
  { label: 'Online', value: '—', description: 'respondendo normalmente', accent: 'green' },
  { label: 'Offline', value: '—', description: 'com falha ou sem resposta', accent: 'red' },
  { label: 'Uptime Médio', value: '—', description: 'nas últimas 24h', accent: 'indigo' },
] as const

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const firstName = session?.user?.name?.split(' ')[0] ?? session?.user?.email

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Olá, {firstName}! Aqui está o resumo dos seus serviços monitorados.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Últimas Verificações</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg
              className="w-10 h-10 text-gray-200 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm text-gray-400">
              Nenhuma verificação ainda.
              <br />
              Adicione seus primeiros serviços.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Incidentes Recentes</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg
              className="w-10 h-10 text-gray-200 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-gray-400">Nenhum incidente registrado.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
