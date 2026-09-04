import type { SessionState } from "@/lib/types"

export const DEMO_CREDENTIALS = {
  email: "admin@admin.com",
  password: "admin@admin",
} as const

const SESSION_KEY = "azerothcms-demo-session"
export const DEMO_SESSION_EVENT = "azerothcms-demo-session-change"

export function getDemoSession(): SessionState {
  if (typeof window === "undefined") {
    return { authenticated: false }
  }

  const stored = window.localStorage.getItem(SESSION_KEY)

  if (!stored) {
    return { authenticated: false }
  }

  try {
    return JSON.parse(stored) as SessionState
  } catch {
    return { authenticated: false }
  }
}

export function startDemoSession(
  username: string = "Admin",
  email: string = DEMO_CREDENTIALS.email,
  role: "admin" | "player" = "admin"
) {
  const session: SessionState = {
    authenticated: true,
    username,
    email,
    role,
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event(DEMO_SESSION_EVENT))
}

export function clearDemoSession() {
  window.localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event(DEMO_SESSION_EVENT))
}

export function subscribeDemoSession(callback: () => void) {
  window.addEventListener("storage", callback)
  window.addEventListener(DEMO_SESSION_EVENT, callback)

  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(DEMO_SESSION_EVENT, callback)
  }
}

export function getDemoSessionSnapshot() {
  return getDemoSession().authenticated
}

export function getServerDemoSessionSnapshot() {
  return false
}

export function getDemoAdminSnapshot() {
  return getDemoSession().role === "admin"
}

export function getServerDemoAdminSnapshot() {
  return false
}

export function subscribeHydration() {
  return () => {}
}

export function getHydrationSnapshot() {
  return true
}

export function getServerHydrationSnapshot() {
  return false
}
