import {
  getMockStorageServerSnapshot,
  getMockStorageSnapshot,
  readMockStorageValue,
  subscribeMockStorage,
  writeMockStorageValue,
} from "@/lib/mock-storage"
import type { GameAccount, PlayerProfile } from "@/lib/types"

export type MockProfileUpdates = Pick<PlayerProfile, "username" | "email">

const gameAccountsStorageKey = "azerothcms:mock-game-accounts"
const profileStorageKey = "azerothcms:mock-profile"

function isGameAccount(value: unknown): value is GameAccount {
  if (!value || typeof value !== "object") return false

  const account = value as Record<string, unknown>
  return (
    typeof account.id === "string" &&
    typeof account.username === "string" &&
    typeof account.expansion === "string" &&
    (account.status === "active" || account.status === "locked") &&
    typeof account.characterCount === "number" &&
    typeof account.lastLogin === "string"
  )
}

export function readMockGameAccounts(): GameAccount[] {
  const value = readMockStorageValue(gameAccountsStorageKey)
  return Array.isArray(value) ? value.filter(isGameAccount) : []
}

export function writeMockGameAccounts(accounts: GameAccount[]) {
  writeMockStorageValue(gameAccountsStorageKey, accounts)
}

export function subscribeMockGameAccounts(listener: () => void) {
  return subscribeMockStorage(gameAccountsStorageKey, listener)
}

export function getMockGameAccountsSnapshot() {
  return getMockStorageSnapshot(gameAccountsStorageKey)
}

export function readMockProfile(): MockProfileUpdates | null {
  const value = readMockStorageValue(profileStorageKey)
  if (!value || typeof value !== "object") return null

  const profile = value as Record<string, unknown>
  if (
    typeof profile.username !== "string" ||
    typeof profile.email !== "string"
  ) {
    return null
  }

  return { username: profile.username, email: profile.email }
}

export function writeMockProfile(profile: MockProfileUpdates) {
  writeMockStorageValue(profileStorageKey, profile)
}

export function subscribeMockProfile(listener: () => void) {
  return subscribeMockStorage(profileStorageKey, listener)
}

export function getMockProfileSnapshot() {
  return getMockStorageSnapshot(profileStorageKey)
}

export function getMockAccountServerSnapshot() {
  return getMockStorageServerSnapshot()
}
