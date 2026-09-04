import {
  getMockStorageServerSnapshot,
  getMockStorageSnapshot,
  readMockStorageValue,
  subscribeMockStorage,
  writeMockStorageValue,
} from "@/lib/mock-storage"

export type MockSubmittedTopic = {
  title: string
  body: string
}

export type MockSubmittedReply = {
  id: string
  content: string
}

const topicStorageKey = "azerothcms:mock-topic"

function repliesStorageKey(threadSlug: string) {
  return `azerothcms:mock-replies:${encodeURIComponent(threadSlug)}`
}

export function readMockTopic(): MockSubmittedTopic | null {
  const value = readMockStorageValue(topicStorageKey)
  if (!value || typeof value !== "object") return null

  const topic = value as Record<string, unknown>
  if (typeof topic.title !== "string" || typeof topic.body !== "string") {
    return null
  }

  return { title: topic.title, body: topic.body }
}

export function writeMockTopic(topic: MockSubmittedTopic) {
  writeMockStorageValue(topicStorageKey, topic)
}

export function subscribeMockTopic(listener: () => void) {
  return subscribeMockStorage(topicStorageKey, listener)
}

export function getMockTopicSnapshot() {
  return getMockStorageSnapshot(topicStorageKey)
}

export function getMockForumServerSnapshot() {
  return getMockStorageServerSnapshot()
}

export function readMockReplies(threadSlug: string): MockSubmittedReply[] {
  const value = readMockStorageValue(repliesStorageKey(threadSlug))
  if (!Array.isArray(value)) return []

  return value.filter((reply): reply is MockSubmittedReply => {
    return (
      Boolean(reply) &&
      typeof reply === "object" &&
      typeof reply.id === "string" &&
      typeof reply.content === "string"
    )
  })
}

export function writeMockReplies(
  threadSlug: string,
  replies: MockSubmittedReply[]
) {
  writeMockStorageValue(repliesStorageKey(threadSlug), replies)
}

export function subscribeMockReplies(threadSlug: string, listener: () => void) {
  return subscribeMockStorage(repliesStorageKey(threadSlug), listener)
}

export function getMockRepliesSnapshot(threadSlug: string) {
  return getMockStorageSnapshot(repliesStorageKey(threadSlug))
}
