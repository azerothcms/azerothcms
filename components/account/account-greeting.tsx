"use client"

import { useSyncExternalStore } from "react"

import {
  getDemoSession,
  getDemoSessionSnapshot,
  getServerDemoSessionSnapshot,
  subscribeDemoSession,
} from "@/lib/session"

export function AccountGreeting({ fallback }: { fallback: string }) {
  const authenticated = useSyncExternalStore(
    subscribeDemoSession,
    getDemoSessionSnapshot,
    getServerDemoSessionSnapshot
  )
  const session = getDemoSession()
  const username = authenticated ? session.username ?? fallback : fallback

  return <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">欢迎回来，{username}</h1>
}
