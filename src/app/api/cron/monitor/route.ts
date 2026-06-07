import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { performCheck } from '@/lib/monitor'

// Called by Vercel Cron Jobs every minute.
// Protected by CRON_SECRET (Vercel injects it automatically).
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const services = await prisma.monitoredService.findMany({
    where: { isActive: true },
    select: { id: true, intervalMinutes: true, lastCheckedAt: true },
  })

  const due = services.filter((s) => {
    if (!s.lastCheckedAt) return true
    return now.getTime() - s.lastCheckedAt.getTime() >= s.intervalMinutes * 60 * 1000
  })

  const results = await Promise.allSettled(due.map((s) => performCheck(s.id)))

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({ checked: due.length, succeeded, failed })
}
