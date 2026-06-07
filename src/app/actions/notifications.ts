'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidDiscordWebhook, sendTestAlert } from '@/lib/discord'

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado.')
  return session.user.id
}

export async function saveWebhook(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const userId = await requireUserId()
  const url = formData.get('webhookUrl')?.toString().trim() ?? ''

  if (!url) return { error: 'URL é obrigatória.' }
  if (!isValidDiscordWebhook(url)) {
    return { error: 'URL inválida. Use um webhook válido do Discord (https://discord.com/api/webhooks/…).' }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { discordWebhookUrl: url },
  })

  revalidatePath('/settings/notifications')
  return { success: true }
}

export async function removeWebhook(): Promise<void> {
  const userId = await requireUserId()
  await prisma.user.update({
    where: { id: userId },
    data: { discordWebhookUrl: null },
  })
  revalidatePath('/settings/notifications')
}

export async function testWebhook(): Promise<{ error?: string; success?: boolean }> {
  const userId = await requireUserId()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { discordWebhookUrl: true },
  })

  if (!user?.discordWebhookUrl) return { error: 'Nenhum webhook configurado.' }

  const ok = await sendTestAlert(user.discordWebhookUrl)
  if (!ok) return { error: 'Falha ao enviar. Verifique a URL do webhook.' }
  return { success: true }
}
