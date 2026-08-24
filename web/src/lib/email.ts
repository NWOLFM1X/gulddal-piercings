import 'server-only'
import { Resend } from 'resend'
import { siteUrl } from '@/lib/site'

const from = process.env.RESEND_FROM || 'Gulddal Piercings <onboarding@resend.dev>'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('RESEND_API_KEY mangler — kan ikke sende emails.')
    return null
  }
  return new Resend(key)
}

/** Send et magic link-login til kunden. */
export async function sendMagicLinkEmail(
  email: string,
  loginUrl: string,
): Promise<void> {
  const resend = getResend()
  if (!resend) {
    // Dev-fallback: uden Resend-nøgle logges linket i terminalen, så login
    // stadig kan testes lokalt. I produktion bør RESEND_API_KEY altid være sat.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n🔗 Login-link til ${email}:\n${loginUrl}\n`)
      return
    }
    throw new Error('RESEND_API_KEY mangler — kan ikke sende login-email.')
  }

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: 'Log ind hos Gulddal Piercings',
    text: `Hej!\n\nKlik på linket herunder for at logge ind. Linket udløber om 15 minutter.\n\n${loginUrl}\n\nHvis du ikke har bedt om dette, kan du roligt ignorere denne mail.\n\nKærlig hilsen\nGulddal Piercings`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#500724">
        <h1 style="font-size:20px;color:#be185d">Log ind hos Gulddal Piercings</h1>
        <p>Klik på knappen herunder for at logge ind. Linket udløber om 15 minutter.</p>
        <p style="margin:28px 0">
          <a href="${loginUrl}" style="display:inline-block;background:#ec4899;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600">Log ind</a>
        </p>
        <p style="font-size:13px;color:#9d174d">Virker knappen ikke, så kopiér dette link ind i din browser:<br><a href="${loginUrl}" style="color:#be185d">${loginUrl}</a></p>
        <p style="font-size:13px;color:#9d174d">Hvis du ikke har bedt om dette, kan du roligt ignorere denne mail.</p>
      </div>
    `,
  })

  if (error) {
    console.error('Kunne ikke sende login-email:', error)
    throw new Error('Kunne ikke sende login-email.')
  }
}

/** Byg en absolut login-URL til callback-ruten. */
export function buildLoginUrl(token: string, returnTo?: string): string {
  const url = new URL('/api/auth/callback', siteUrl)
  url.searchParams.set('token', token)
  if (returnTo) url.searchParams.set('returnTo', returnTo)
  return url.toString()
}
