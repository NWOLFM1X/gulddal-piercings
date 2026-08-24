import { type NextRequest, NextResponse } from 'next/server'
import { verifyMagicToken, setSessionCookie } from '@/lib/auth'
import { siteUrl } from '@/lib/site'

export const runtime = 'nodejs'

function safeReturnTo(value: string | null): string {
  if (!value) return '/mine-bookinger'
  if (!value.startsWith('/') || value.startsWith('//')) return '/mine-bookinger'
  return value
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get('returnTo'))

  const email = token ? await verifyMagicToken(token) : null

  if (!email) {
    // Ugyldigt eller udløbet link.
    return NextResponse.redirect(new URL('/login?error=expired', siteUrl))
  }

  await setSessionCookie(email)
  return NextResponse.redirect(new URL(returnTo, siteUrl))
}
