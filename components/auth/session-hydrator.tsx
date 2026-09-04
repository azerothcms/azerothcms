"use client"

import { useEffect } from "react"

import { clearDemoSession, setClientSession } from "@/lib/session"
import type { SessionState } from "@/lib/types"

export function SessionHydrator() {
  useEffect(() => {
    let active = true

    fetch("/api/auth/session", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok || !active) {
          return
        }

        const data = (await response.json()) as { session?: SessionState }

        if (data.session?.authenticated) {
          setClientSession(data.session)
        } else {
          clearDemoSession()
        }
      })
      .catch(() => {
        // Keep the current client snapshot if the session endpoint is unavailable.
      })

    return () => {
      active = false
    }
  }, [])

  return null
}
