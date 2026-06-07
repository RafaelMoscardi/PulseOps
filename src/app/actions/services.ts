'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type FormState = { error?: string }

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidUrl(raw: string): boolean {
  try {
    const { protocol } = new URL(raw)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

function validate(name: string, url: string, intervalMinutes: number): string | null {
  if (!name.trim()) return 'Nome é obrigatório.'
  if (name.trim().length > 100) return 'Nome deve ter no máximo 100 caracteres.'
  if (!url.trim()) return 'URL é obrigatória.'
  if (!isValidUrl(url.trim())) return 'URL inválida. Use o formato https://exemplo.com'
  if (isNaN(intervalMinutes) || intervalMinutes < 1) return 'Intervalo mínimo é 1 minuto.'
  if (intervalMinutes > 1440) return 'Intervalo máximo é 1440 minutos (24h).'
  return null
}

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

async function assertOwnership(serviceId: string, userId: string) {
  const service = await prisma.monitoredService.findFirst({
    where: { id: serviceId, userId },
    select: { id: true },
  })
  if (!service) return false
  return true
}

// ─── Create ─────────────────────────────────────────────────────────────────

export async function createService(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const userId = await requireUserId()

  const name = formData.get('name')?.toString() ?? ''
  const url = formData.get('url')?.toString() ?? ''
  const intervalMinutes = parseInt(formData.get('intervalMinutes')?.toString() ?? '5', 10)
  const isActive = formData.get('isActive') === 'on'

  const error = validate(name, url, intervalMinutes)
  if (error) return { error }

  await prisma.monitoredService.create({
    data: { name: name.trim(), url: url.trim(), intervalMinutes, isActive, userId },
  })

  redirect('/services')
}

// ─── Update ─────────────────────────────────────────────────────────────────

export async function updateService(
  serviceId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const userId = await requireUserId()

  const owned = await assertOwnership(serviceId, userId)
  if (!owned) return { error: 'Serviço não encontrado.' }

  const name = formData.get('name')?.toString() ?? ''
  const url = formData.get('url')?.toString() ?? ''
  const intervalMinutes = parseInt(formData.get('intervalMinutes')?.toString() ?? '5', 10)
  const isActive = formData.get('isActive') === 'on'

  const error = validate(name, url, intervalMinutes)
  if (error) return { error }

  await prisma.monitoredService.update({
    where: { id: serviceId },
    data: { name: name.trim(), url: url.trim(), intervalMinutes, isActive },
  })

  redirect('/services')
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export async function deleteService(serviceId: string): Promise<void> {
  const userId = await requireUserId()

  const owned = await assertOwnership(serviceId, userId)
  if (!owned) return

  await prisma.monitoredService.delete({ where: { id: serviceId } })

  redirect('/services')
}

// ─── Toggle active ───────────────────────────────────────────────────────────

export async function toggleServiceActive(
  serviceId: string,
  isActive: boolean
): Promise<void> {
  const userId = await requireUserId()

  const owned = await assertOwnership(serviceId, userId)
  if (!owned) return

  await prisma.monitoredService.update({
    where: { id: serviceId },
    data: { isActive },
  })

  revalidatePath('/services')
}
