import { createHash, randomBytes, timingSafeEqual } from "node:crypto"

const GRUNT_SRP6_N = BigInt(
  "0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7"
)
const ZERO = BigInt(0)
const GENERATOR = BigInt(7)
const BYTE_LENGTH = 32

function sha1(...parts: Array<Buffer | string>): Buffer {
  const hash = createHash("sha1")

  for (const part of parts) {
    hash.update(part)
  }

  return hash.digest()
}

function toLittleEndianInteger(value: Buffer): bigint {
  return BigInt(`0x${Buffer.from(value).reverse().toString("hex")}`)
}

function toLittleEndianBuffer(value: bigint, length: number): Buffer {
  const result = Buffer.alloc(length)
  let remaining = value

  for (let index = 0; index < length; index += 1) {
    result[index] = Number(remaining & BigInt(0xff))
    remaining >>= BigInt(8)
  }

  return result
}

function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  let result = BigInt(1)
  let currentBase = base % modulus
  let currentExponent = exponent

  while (currentExponent > ZERO) {
    if (currentExponent & BigInt(1)) {
      result = (result * currentBase) % modulus
    }

    currentBase = (currentBase * currentBase) % modulus
    currentExponent >>= BigInt(1)
  }

  return result
}

export function normalizeTrinityCredential(value: string): string {
  return value.replace(/[a-z]/g, (character) => character.toUpperCase())
}

/**
 * TrinityCore's Grunt SRP6 registration format:
 *   x = H(salt || H(USERNAME || ':' || PASSWORD))
 *   v = g^x mod N
 *
 * TrinityCore treats these credentials as ASCII/Latin uppercase values and
 * stores the binary numbers in little-endian order.
 */
export function makeTrinityRegistrationData(username: string, password: string) {
  const normalizedUsername = normalizeTrinityCredential(username)
  const normalizedPassword = normalizeTrinityCredential(password)
  const salt = randomBytes(BYTE_LENGTH)
  const identityHash = sha1(`${normalizedUsername}:${normalizedPassword}`)
  const x = toLittleEndianInteger(sha1(salt, identityHash))
  const verifier = toLittleEndianBuffer(modPow(GENERATOR, x, GRUNT_SRP6_N), BYTE_LENGTH)

  return { salt, verifier }
}

export function verifyTrinityPassword(
  username: string,
  password: string,
  salt: Buffer,
  verifier: Buffer
): boolean {
  const normalizedUsername = normalizeTrinityCredential(username)
  const normalizedPassword = normalizeTrinityCredential(password)
  const identityHash = sha1(`${normalizedUsername}:${normalizedPassword}`)
  const x = toLittleEndianInteger(sha1(salt, identityHash))
  const calculatedVerifier = toLittleEndianBuffer(modPow(GENERATOR, x, GRUNT_SRP6_N), BYTE_LENGTH)
  const storedVerifier = Buffer.from(verifier).subarray(0, BYTE_LENGTH)

  return (
    storedVerifier.length === calculatedVerifier.length &&
    timingSafeEqual(storedVerifier, calculatedVerifier)
  )
}
