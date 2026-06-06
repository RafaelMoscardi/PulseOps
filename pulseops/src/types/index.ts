export type ServiceStatus = 'online' | 'offline' | 'unknown'

export type ServiceWithStatus = {
  id: string
  name: string
  url: string
  intervalMinutes: number
  isActive: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
  lastCheck?: {
    isOnline: boolean
    statusCode: number | null
    responseMs: number | null
    error: string | null
    checkedAt: Date
  } | null
  status: ServiceStatus
  uptime: number
}
