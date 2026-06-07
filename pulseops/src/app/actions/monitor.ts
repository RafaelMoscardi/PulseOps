'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { performCheck } from '@/lib/monitor'

export async function runManualCheck(serviceId: string): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: 'Não autenticado.' }
  const userId = session.user.id

  const service = await prisma.monitoredService.findFirst({
    where: { id: serviceId, userId },
    select: { id: true },
  })
  if (!service) return { error: 'Serviço não encontrado.' }

  await performCheck(serviceId)

  revalidatePath('/services')
  revalidatePath('/dashboard')
  return {}
}
