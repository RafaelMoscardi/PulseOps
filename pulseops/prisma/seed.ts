import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomBool(trueProbability: number) {
  return Math.random() < trueProbability
}

async function seedService(
  userId: string,
  name: string,
  url: string,
  intervalMinutes: number,
  uptimeProbability: number,
  minResponseMs: number,
  maxResponseMs: number,
  currentlyOffline: boolean,
  offlineSinceHoursAgo?: number
) {
  const existing = await prisma.monitoredService.findFirst({
    where: { userId, name },
  })
  if (existing) {
    console.log(`  skip: ${name} (already exists)`)
    return
  }

  const now = Date.now()
  const lastResponseMs = currentlyOffline ? null : randomBetween(minResponseMs, maxResponseMs)

  const service = await prisma.monitoredService.create({
    data: {
      userId,
      name,
      url,
      intervalMinutes,
      isActive: true,
      lastStatus: currentlyOffline ? 'offline' : 'online',
      lastStatusCode: currentlyOffline ? null : 200,
      lastResponseMs,
      lastCheckedAt: new Date(),
    },
  })

  // 30 days of hourly checks
  const checks = []
  for (let hoursAgo = 720; hoursAgo >= 0; hoursAgo--) {
    const checkedAt = new Date(now - hoursAgo * 60 * 60 * 1000)
    const isCurrentlyOfflineWindow =
      currentlyOffline && offlineSinceHoursAgo != null && hoursAgo <= offlineSinceHoursAgo
    const online = isCurrentlyOfflineWindow ? false : randomBool(uptimeProbability)
    const responseMs = online ? randomBetween(minResponseMs, maxResponseMs) : null

    checks.push({
      serviceId: service.id,
      isOnline: online,
      statusCode: online ? 200 : currentlyOffline ? null : randomBool(0.5) ? 503 : null,
      responseMs,
      error: online
        ? null
        : currentlyOffline
        ? 'DNS não resolvido'
        : randomBool(0.5)
        ? 'HTTP 503'
        : 'Timeout após 10s',
      checkedAt,
    })
  }

  await prisma.checkResult.createMany({ data: checks })

  // Incidents
  if (currentlyOffline && offlineSinceHoursAgo != null) {
    await prisma.incident.create({
      data: {
        serviceId: service.id,
        reason: 'DNS não resolvido',
        startedAt: new Date(now - offlineSinceHoursAgo * 60 * 60 * 1000),
        isResolved: false,
      },
    })
  }

  // A few resolved incidents in the past
  const resolvedCount = randomBetween(1, 3)
  for (let i = 0; i < resolvedCount; i++) {
    const daysAgo = randomBetween(3, 25)
    const durationH = randomBetween(1, 4)
    const startedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000)
    const resolvedAt = new Date(startedAt.getTime() + durationH * 60 * 60 * 1000)
    const reasons = ['HTTP 503', 'Timeout após 10s', 'Conexão recusada', 'HTTP 502']
    await prisma.incident.create({
      data: {
        serviceId: service.id,
        reason: reasons[randomBetween(0, reasons.length - 1)],
        startedAt,
        resolvedAt,
        isResolved: true,
      },
    })
  }

  console.log(`  created: ${name} (${checks.length} checks)`)
}

async function main() {
  console.log('Seeding demo data...')

  const passwordHash = await bcrypt.hash('demo123456', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@pulseops.dev' },
    update: {},
    create: {
      email: 'demo@pulseops.dev',
      name: 'Demo User',
      password: passwordHash,
    },
  })

  console.log(`User: ${user.email}`)

  await seedService(user.id, 'Google', 'https://www.google.com', 1, 0.999, 40, 160, false)
  await seedService(user.id, 'GitHub', 'https://github.com', 5, 0.995, 150, 550, false)
  await seedService(user.id, 'My REST API', 'https://jsonplaceholder.typicode.com/posts', 5, 0.97, 180, 850, false)
  await seedService(user.id, 'Legacy Server', 'https://this-domain-does-not-exist-pulseops.invalid', 10, 0.85, 400, 1800, true, 3)

  console.log('\nDone!')
  console.log('─────────────────────────────────')
  console.log('Demo login:')
  console.log('  Email:    demo@pulseops.dev')
  console.log('  Password: demo123456')
  console.log('─────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
