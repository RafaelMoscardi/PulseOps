import { prisma } from './prisma'
import { sendDownAlert, sendUpAlert } from './discord'

const TIMEOUT_MS = 10_000

export type CheckOutcome = {
  isOnline: boolean
  statusCode: number | null
  responseMs: number | null
  error: string | null
}

export async function checkService(url: string): Promise<CheckOutcome> {
  const start = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    })
    const responseMs = Date.now() - start
    const isOnline = response.status < 500

    return {
      isOnline,
      statusCode: response.status,
      responseMs,
      error: isOnline ? null : `HTTP ${response.status}`,
    }
  } catch (err: unknown) {
    const responseMs = Date.now() - start

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return { isOnline: false, statusCode: null, responseMs: TIMEOUT_MS, error: 'Timeout após 10s' }
      }

      const msg = err.message
      const friendly = msg.includes('ENOTFOUND')
        ? 'DNS não resolvido'
        : msg.includes('ECONNREFUSED')
        ? 'Conexão recusada'
        : msg.includes('ECONNRESET')
        ? 'Conexão resetada'
        : msg.includes('ETIMEDOUT')
        ? 'Timeout de conexão'
        : msg.slice(0, 120)

      return { isOnline: false, statusCode: null, responseMs, error: friendly }
    }

    return { isOnline: false, statusCode: null, responseMs, error: 'Erro desconhecido' }
  } finally {
    clearTimeout(timer)
  }
}

export async function performCheck(serviceId: string): Promise<CheckOutcome> {
  const service = await prisma.monitoredService.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      name: true,
      url: true,
      lastStatus: true,
      user: { select: { id: true, discordWebhookUrl: true } },
    },
  })
  if (!service) throw new Error(`Service not found: ${serviceId}`)

  const outcome = await checkService(service.url)
  const now = new Date()
  const wasOffline = service.lastStatus === 'offline'

  let newIncident: { id: string; startedAt: Date } | null = null
  let resolvedIncident: { id: string; startedAt: Date } | null = null

  await prisma.$transaction(async (tx) => {
    await tx.checkResult.create({
      data: {
        serviceId,
        isOnline: outcome.isOnline,
        statusCode: outcome.statusCode,
        responseMs: outcome.responseMs,
        error: outcome.error,
        checkedAt: now,
      },
    })

    await tx.monitoredService.update({
      where: { id: serviceId },
      data: {
        lastStatus: outcome.isOnline ? 'online' : 'offline',
        lastCheckedAt: now,
        lastStatusCode: outcome.statusCode,
        lastResponseMs: outcome.responseMs,
      },
    })

    if (!outcome.isOnline) {
      const openIncident = await tx.incident.findFirst({
        where: { serviceId, isResolved: false },
      })
      if (!openIncident) {
        const created = await tx.incident.create({
          data: {
            serviceId,
            reason: outcome.error ?? (outcome.statusCode ? `HTTP ${outcome.statusCode}` : 'Serviço inacessível'),
            startedAt: now,
          },
        })
        newIncident = { id: created.id, startedAt: created.startedAt }
      }
    } else if (wasOffline) {
      const open = await tx.incident.findFirst({
        where: { serviceId, isResolved: false },
        select: { id: true, startedAt: true },
      })
      if (open) {
        resolvedIncident = { id: open.id, startedAt: open.startedAt }
        await tx.incident.updateMany({
          where: { serviceId, isResolved: false },
          data: { isResolved: true, resolvedAt: now },
        })
      }
    }
  })

  const webhookUrl = service.user.discordWebhookUrl
  if (webhookUrl) {
    if (newIncident) {
      const incident = newIncident as { id: string; startedAt: Date }
      const alreadySent = await prisma.notification.findFirst({
        where: { incidentId: incident.id, type: 'discord_down' },
      })
      if (!alreadySent) {
        const success = await sendDownAlert(webhookUrl, {
          serviceName: service.name,
          serviceUrl: service.url,
          reason: outcome.error,
          statusCode: outcome.statusCode,
          responseMs: outcome.responseMs,
          startedAt: incident.startedAt,
        })
        await prisma.notification.create({
          data: {
            type: 'discord_down',
            message: `Alerta de queda: ${service.name}`,
            success,
            userId: service.user.id,
            incidentId: incident.id,
          },
        })
      }
    } else if (resolvedIncident) {
      const incident = resolvedIncident as { id: string; startedAt: Date }
      const alreadySent = await prisma.notification.findFirst({
        where: { incidentId: incident.id, type: 'discord_up' },
      })
      if (!alreadySent) {
        const durationMs = now.getTime() - incident.startedAt.getTime()
        const success = await sendUpAlert(webhookUrl, {
          serviceName: service.name,
          serviceUrl: service.url,
          resolvedAt: now,
          durationMs,
        })
        await prisma.notification.create({
          data: {
            type: 'discord_up',
            message: `Recuperação: ${service.name}`,
            success,
            userId: service.user.id,
            incidentId: incident.id,
          },
        })
      }
    }
  }

  return outcome
}
