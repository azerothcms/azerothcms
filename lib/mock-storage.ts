type StorageListener = () => void

const storageListeners = new Map<string, Set<StorageListener>>()

export function readMockStorageValue(key: string): unknown {
  if (typeof window === "undefined") return null

  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function getMockStorageSnapshot(key: string) {
  if (typeof window === "undefined") return ""

  try {
    return window.localStorage.getItem(key) ?? ""
  } catch {
    return ""
  }
}

export function getMockStorageServerSnapshot() {
  return ""
}

function notifyStorageListeners(key: string) {
  storageListeners.get(key)?.forEach((listener) => listener())
}

export function writeMockStorageValue(key: string, value: unknown) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    notifyStorageListeners(key)
  } catch {
    // The in-memory UI state remains usable when browser storage is unavailable.
  }
}

export function subscribeMockStorage(key: string, listener: StorageListener) {
  if (typeof window === "undefined") return () => undefined

  const listeners = storageListeners.get(key) ?? new Set<StorageListener>()
  listeners.add(listener)
  storageListeners.set(key, listeners)

  const handleStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener()
  }
  window.addEventListener("storage", handleStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", handleStorage)
    if (!listeners.size) storageListeners.delete(key)
  }
}
