const DISCORD_WEBHOOK_PREFIX = 'https://discord.com/api/webhooks/'

export function isValidDiscordWebhook(url: string): boolean {
  if (!url.startsWith(DISCORD_WEBHOOK_PREFIX)) return false
  const rest = url.slice(DISCORD_WEBHOOK_PREFIX.length)
  const parts = rest.split('/')
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0
}

export function maskWebhookUrl(url: string): string {
  const last4 = url.slice(-4)
  return `${DISCORD_WEBHOOK_PREFIX}••••••/••••••${last4}`
}

type DownPayload = {
  serviceName: string
  serviceUrl: string
  reason: string | null
  statusCode: number | null
  responseMs: number | null
  startedAt: Date
}

type UpPayload = {
  serviceName: string
  serviceUrl: string
  resolvedAt: Date
  durationMs: number
}

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(date)
}

function fmtDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}min`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

async function post(webhookUrl: string, body: object): Promise<boolean> {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function sendDownAlert(webhookUrl: string, payload: DownPayload): Promise<boolean> {
  const fields: { name: string; value: string; inline: boolean }[] = [
    { name: 'URL', value: payload.serviceUrl, inline: false },
    { name: 'Horário', value: fmtDate(payload.startedAt), inline: true },
  ]

  if (payload.statusCode != null) {
    fields.push({ name: 'HTTP', value: String(payload.statusCode), inline: true })
  }
  if (payload.responseMs != null) {
    fields.push({ name: 'Resposta', value: `${payload.responseMs}ms`, inline: true })
  }
  if (payload.reason) {
    fields.push({ name: 'Motivo', value: payload.reason, inline: false })
  }

  return post(webhookUrl, {
    embeds: [
      {
        title: `🔴 Serviço offline: ${payload.serviceName}`,
        color: 15158332,
        fields,
        timestamp: payload.startedAt.toISOString(),
      },
    ],
  })
}

export async function sendUpAlert(webhookUrl: string, payload: UpPayload): Promise<boolean> {
  return post(webhookUrl, {
    embeds: [
      {
        title: `✅ Serviço recuperado: ${payload.serviceName}`,
        color: 3066993,
        fields: [
          { name: 'URL', value: payload.serviceUrl, inline: false },
          { name: 'Horário de resolução', value: fmtDate(payload.resolvedAt), inline: true },
          { name: 'Duração do incidente', value: fmtDuration(payload.durationMs), inline: true },
        ],
        timestamp: payload.resolvedAt.toISOString(),
      },
    ],
  })
}

export async function sendTestAlert(webhookUrl: string): Promise<boolean> {
  return post(webhookUrl, {
    embeds: [
      {
        title: '🔔 Teste de webhook — PulseOps',
        description: 'Seu webhook está configurado corretamente. Alertas serão enviados aqui quando serviços ficarem offline ou voltarem ao normal.',
        color: 5793266,
        timestamp: new Date().toISOString(),
      },
    ],
  })
}
