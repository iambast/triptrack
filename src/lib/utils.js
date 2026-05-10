export function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'TRP-'
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export function generateUserId() {
  return Math.random().toString(36).slice(2, 10)
}

export function timeLeft(expiresAt) {
  const diff = expiresAt - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const MEMBER_COLORS = [
  { bg: 'bg-emerald-100', text: 'text-emerald-800', pin: '#10b981' },
  { bg: 'bg-blue-100',    text: 'text-blue-800',    pin: '#3b82f6' },
  { bg: 'bg-amber-100',   text: 'text-amber-800',   pin: '#f59e0b' },
  { bg: 'bg-rose-100',    text: 'text-rose-800',    pin: '#f43f5e' },
  { bg: 'bg-violet-100',  text: 'text-violet-800',  pin: '#8b5cf6' },
  { bg: 'bg-cyan-100',    text: 'text-cyan-800',    pin: '#06b6d4' },
]