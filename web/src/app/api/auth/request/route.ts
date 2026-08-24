import { type NextRequest, NextResponse } from 'next/server'
import { createMagicToken } from '@/lib/auth'
import { sendMagicLinkEmail, buildLoginUrl } from '@/lib/email'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Body = { email?: string; returnTo?: string }

// Tillad kun interne, relative returnTo-stier (undgå open redirect).
function safeReturnTo(value?: string): string | undefined {
  if (!value) return undefined
  if (!value.startsWith('/') || value.startsWith('//')) return undefined
  return value
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Ugyldig forespørgsel.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const returnTo = safeReturnTo(body.returnTo)

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Indtast en gyldig email.' }, { status: 400 })
  }

  try {
    const token = await createMagicToken(email)
    const loginUrl = buildLoginUrl(token, returnTo)
    await sendMagicLinkEmail(email, loginUrl)
  } catch (err) {
    console.error('Kunne ikke sende login-link:', err)
    // Vi afslører ikke om noget fejlede internt; men her er det en reel serverfejl.
    return NextResponse.json(
      { error: 'Kunne ikke sende login-link. Prøv igen om lidt.' },
      { status: 500 },
    )
  }

  // Afslør aldrig om en email findes — svar altid ens.
  return NextResponse.json({ ok: true })
}
