import {
  getMockStorageServerSnapshot,
  getMockStorageSnapshot,
  readMockStorageValue,
  subscribeMockStorage,
  writeMockStorageValue,
} from "@/lib/mock-storage"

export type MockShopCart = Record<string, number>

export type MockShopOrder = {
  productIds: string[]
  total: number
}

const cartStorageKey = "azerothcms:mock-shop-cart"
const orderStorageKey = "azerothcms:mock-shop-order"

export function readMockShopCart(): MockShopCart {
  const value = readMockStorageValue(cartStorageKey)
  if (!value || typeof value !== "object") return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([productId, quantity]) =>
        productId && typeof quantity === "number" && quantity > 0
    )
  ) as MockShopCart
}

export function writeMockShopCart(cart: MockShopCart) {
  writeMockStorageValue(cartStorageKey, cart)
}

export function subscribeMockShopCart(listener: () => void) {
  return subscribeMockStorage(cartStorageKey, listener)
}

export function getMockShopCartSnapshot() {
  return getMockStorageSnapshot(cartStorageKey)
}

export function readMockShopOrder(): MockShopOrder | null {
  const value = readMockStorageValue(orderStorageKey)
  if (!value || typeof value !== "object") return null

  const order = value as Record<string, unknown>
  if (
    !Array.isArray(order.productIds) ||
    !order.productIds.every((productId) => typeof productId === "string") ||
    typeof order.total !== "number"
  ) {
    return null
  }

  return { productIds: order.productIds, total: order.total }
}

export function writeMockShopOrder(order: MockShopOrder) {
  writeMockStorageValue(orderStorageKey, order)
}

export function subscribeMockShopOrder(listener: () => void) {
  return subscribeMockStorage(orderStorageKey, listener)
}

export function getMockShopOrderSnapshot() {
  return getMockStorageSnapshot(orderStorageKey)
}

export function getMockShopServerSnapshot() {
  return getMockStorageServerSnapshot()
}
