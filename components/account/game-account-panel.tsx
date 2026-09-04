"use client"

import { useState } from "react"

import { GameAccountActions } from "@/components/account/game-account-actions"
import { GameAccountList } from "@/components/account/game-account-list"
import type { GameAccount } from "@/lib/types"

export function GameAccountPanel({
  initialAccounts,
}: {
  initialAccounts: GameAccount[]
}) {
  const [accounts, setAccounts] = useState(initialAccounts)

  return (
    <>
      <GameAccountActions
        onCreated={(account) => setAccounts((current) => [...current, account])}
      />
      <GameAccountList accounts={accounts} />
    </>
  )
}
