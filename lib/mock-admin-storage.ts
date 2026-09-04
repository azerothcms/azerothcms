import {
  getMockStorageServerSnapshot,
  getMockStorageSnapshot,
  readMockStorageValue,
  subscribeMockStorage,
  writeMockStorageValue,
} from "@/lib/mock-storage"
import type { AdminUserSummary, RealmStatus } from "@/lib/types"

export type MockNewsDraft = {
  title: string
  content: string
}

const newsDraftStorageKey = "azerothcms:mock-news-draft"
const realmStatusStorageKey = "azerothcms:mock-realm-status"
const userStatusStorageKey = "azerothcms:mock-user-status"

const realmStatuses = new Set<RealmStatus>(["online", "offline", "maintenance"])
const userStatuses = new Set<AdminUserSummary["status"]>([
  "正常",
  "待验证",
  "已暂停",
])

function readStatusMap<T>(
  key: string,
  allowedStatuses: Set<T>
): Record<string, T> {
  const value = readMockStorageValue(key)
  if (!value || typeof value !== "object") return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([id, status]) => id && allowedStatuses.has(status as T)
    )
  ) as Record<string, T>
}

export function readMockNewsDraft(): MockNewsDraft | null {
  const value = readMockStorageValue(newsDraftStorageKey)
  if (!value || typeof value !== "object") return null

  const draft = value as Record<string, unknown>
  if (typeof draft.title !== "string" || typeof draft.content !== "string") {
    return null
  }

  return { title: draft.title, content: draft.content }
}

export function writeMockNewsDraft(draft: MockNewsDraft) {
  writeMockStorageValue(newsDraftStorageKey, draft)
}

export function subscribeMockNewsDraft(listener: () => void) {
  return subscribeMockStorage(newsDraftStorageKey, listener)
}

export function getMockNewsDraftSnapshot() {
  return getMockStorageSnapshot(newsDraftStorageKey)
}

export function readMockRealmStatuses() {
  return readStatusMap(realmStatusStorageKey, realmStatuses)
}

export function writeMockRealmStatus(realmId: string, status: RealmStatus) {
  writeMockStorageValue(realmStatusStorageKey, {
    ...readMockRealmStatuses(),
    [realmId]: status,
  })
}

export function subscribeMockRealmStatuses(listener: () => void) {
  return subscribeMockStorage(realmStatusStorageKey, listener)
}

export function getMockRealmStatusesSnapshot() {
  return getMockStorageSnapshot(realmStatusStorageKey)
}

export function readMockUserStatuses() {
  return readStatusMap(userStatusStorageKey, userStatuses)
}

export function writeMockUserStatus(
  userId: string,
  status: AdminUserSummary["status"]
) {
  writeMockStorageValue(userStatusStorageKey, {
    ...readMockUserStatuses(),
    [userId]: status,
  })
}

export function subscribeMockUserStatuses(listener: () => void) {
  return subscribeMockStorage(userStatusStorageKey, listener)
}

export function getMockUserStatusesSnapshot() {
  return getMockStorageSnapshot(userStatusStorageKey)
}

export function getMockAdminServerSnapshot() {
  return getMockStorageServerSnapshot()
}
