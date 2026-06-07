export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') return
  // On Vercel, monitoring runs via /api/cron/monitor (vercel.json)
  if (process.env.VERCEL) return

  const { startScheduler } = await import('./lib/scheduler')
  startScheduler()
}
