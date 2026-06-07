import { schedule } from 'node-cron'
import { prisma } from './prisma'
import { performCheck } from './monitor'

const globalForScheduler = globalThis as unknown as { _schedulerStarted?: boolean }

export function startScheduler() {
  if (globalForScheduler._schedulerStarted) return
  globalForScheduler._schedulerStarted = true

  schedule('* * * * *', async () => {
    const now = new Date()

    let services: { id: string; intervalMinutes: number; lastCheckedAt: Date | null }[]
    try {
      services = await prisma.monitoredService.findMany({
        where: { isActive: true },
        select: { id: true, intervalMinutes: true, lastCheckedAt: true },
      })
    } catch (err) {
      console.error('[scheduler] failed to query services:', err)
      return
    }

    const due = services.filter((s) => {
      if (!s.lastCheckedAt) return true
      const elapsed = now.getTime() - s.lastCheckedAt.getTime()
      return elapsed >= s.intervalMinutes * 60 * 1000
    })

    if (due.length === 0) return

    if (process.env.NODE_ENV === 'development') {
      console.log(`[scheduler] ${due.length} service(s) due`)
    }

    await Promise.allSettled(
      due.map(async (s) => {
        try {
          const outcome = await performCheck(s.id)
          if (process.env.NODE_ENV === 'development') {
            const status = outcome.isOnline ? 'online' : 'offline'
            const ms = outcome.responseMs != null ? `${outcome.responseMs}ms` : '?ms'
            console.log(`[scheduler] ${s.id} → ${status} ${ms}`)
          }
        } catch (err) {
          console.error(`[scheduler] error on service ${s.id}:`, err)
        }
      })
    )
  })

  console.log('[scheduler] started — checking every minute')
}
