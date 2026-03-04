import type { DeviceIdentity } from '../types/game'

const STORAGE_KEY = 'dj_device_identity'

export function getDeviceId(): string {
  let id = localStorage.getItem('dj_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('dj_device_id', id)
  }
  return id
}

export function saveIdentity(identity: DeviceIdentity) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
}

export function loadIdentity(): DeviceIdentity | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DeviceIdentity
  } catch {
    return null
  }
}

export function clearIdentity() {
  localStorage.removeItem(STORAGE_KEY)
}

// Returns true if the stored identity matches the given room code
export function identityMatchesRoom(code: string): DeviceIdentity | null {
  const identity = loadIdentity()
  if (!identity) return null
  if (identity.join_code.toUpperCase() !== code.toUpperCase()) return null
  return identity
}
