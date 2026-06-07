import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { maskWebhookUrl } from '@/lib/discord'
import { WebhookForm } from './WebhookForm'

export default async function NotificationsSettingsPage() {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { discordWebhookUrl: true },
  })

  const masked = user?.discordWebhookUrl
    ? maskWebhookUrl(user.discordWebhookUrl)
    : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Notificações</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure alertas por Discord Webhook.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="px-6 py-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Discord Webhook</h3>
          <p className="text-xs text-gray-500">
            Receba alertas no Discord quando serviços ficarem offline ou voltarem ao normal.
          </p>
        </div>

        <div className="px-6 py-5">
          <WebhookForm maskedUrl={masked} isConfigured={!!user?.discordWebhookUrl} />
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-400">
            Use um webhook do Discord em formato{' '}
            <code className="font-mono bg-gray-100 px-1 rounded">
              https://discord.com/api/webhooks/&#123;id&#125;/&#123;token&#125;
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}
