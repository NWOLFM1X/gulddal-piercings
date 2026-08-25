import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

// Cookie-navn til login-sessionen.
export const SESSION_COOKIE = 'gp_session'

// Levetider.
const MAGIC_TTL = '15m'
const SESSION_TTL = '30d'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 dage i sekunder

const ISSUER = 'gulddal-piercings'
const AUD_MAGIC = 'magic'
const AUD_SESSION = 'session'

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET mangler — login kan ikke fungere.')
  }
  return new TextEncoder().encode(secret)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Signeret engangs-token til magic link.
 *
 * Standard-levetid er kort (15 min) til login. Bekræftelses-mails efter en
 * booking bruger en længere levetid, så kunden kan klikke sig direkte ind og
 * administrere sin booking i dagene efter.
 */
export async function createMagicToken(
  email: string,
  ttl: string = MAGIC_TTL,
): Promise<string> {
  return new SignJWT({ email: normalizeEmail(email) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(AUD_MAGIC)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(getSecret())
}

/** Verificér magic-token og returnér den bekræftede email eller null. */
export async function verifyMagicToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUD_MAGIC,
    })
    const email = payload.email
    return typeof email === 'string' ? email : null
  } catch {
    return null
  }
}

/** Signeret session-token (længere levetid), gemmes i httpOnly-cookie. */
export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email: normalizeEmail(email) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(AUD_SESSION)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret())
}

async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUD_SESSION,
    })
    const email = payload.email
    return typeof email === 'string' ? email : null
  } catch {
    return null
  }
}

export type Session = { email: string }

/** Læs den nuværende session fra cookie. Returnerer null hvis ikke logget ind. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  const email = await verifySessionToken(token)
  return email ? { email } : null
}

/** Sæt session-cookie efter verificeret login. */
export async function setSessionCookie(email: string): Promise<void> {
  const token = await createSessionToken(email)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

/** Ryd session-cookie (log ud). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
