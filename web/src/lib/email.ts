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

/** Formatér et ISO-tidspunkt pænt på dansk. */
function formatDateTime(iso?: string): string {
  if (!iso) return 'Ukendt tid'
  return new Date(iso).toLocaleString('da-DK', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export type BookingDetails = {
  name: string
  email: string
  phone: string
  message?: string
  piercingName: string
  price?: number
  startsAt?: string
}

/**
 * Bekræftelses-mail til kunden efter en booking. Indeholder et link, hvor
 * kunden kan skifte piercing eller aflyse tiden.
 */
export async function sendBookingConfirmationEmail(
  booking: BookingDetails,
  manageUrl: string,
): Promise<void> {
  const resend = getResend()
  const when = formatDateTime(booking.startsAt)
  const priceLine =
    booking.price != null ? ` (${booking.price} kr.)` : ''

  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `\n📧 Bekræftelse til ${booking.email}: ${booking.piercingName}${priceLine} — ${when}\n🔗 Administrér: ${manageUrl}\n`,
      )
      return
    }
    console.warn('RESEND_API_KEY mangler — kunne ikke sende bekræftelses-email.')
    return
  }

  const { error } = await resend.emails.send({
    from,
    to: booking.email,
    subject: 'Din booking hos Gulddal Piercings',
    text: `Hej ${booking.name}!\n\nTak for din booking hos Gulddal Piercings.\n\nPiercing: ${booking.piercingName}${priceLine}\nTid: ${when}\n\nHvis du vil skifte piercing eller aflyse tiden, kan du gøre det her:\n${manageUrl}\n\nVi glæder os til at se dig!\n\nKærlig hilsen\nGulddal Piercings`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#500724">
        <h1 style="font-size:20px;color:#be185d">Tak for din booking! 💖</h1>
        <p>Hej ${booking.name}, vi har modtaget din booking hos Gulddal Piercings.</p>
        <div style="background:#fdf2f8;border-radius:16px;padding:16px 20px;margin:20px 0">
          <p style="margin:0 0 6px"><strong>Piercing:</strong> ${booking.piercingName}${priceLine}</p>
          <p style="margin:0"><strong>Tid:</strong> ${when}</p>
        </div>
        <p>Vil du <strong>skifte piercing</strong> eller <strong>aflyse tiden</strong>, kan du gøre det her:</p>
        <p style="margin:24px 0">
          <a href="${manageUrl}" style="display:inline-block;background:#ec4899;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600">Administrér min booking</a>
        </p>
        <p style="font-size:13px;color:#9d174d">Virker knappen ikke, så kopiér dette link ind i din browser:<br><a href="${manageUrl}" style="color:#be185d">${manageUrl}</a></p>
        <p style="font-size:13px;color:#9d174d">Vi glæder os til at se dig!</p>
      </div>
    `,
  })

  if (error) {
    console.error('Kunne ikke sende bekræftelses-email:', error)
  }
}

/**
 * Notifikations-mail til ejeren (fx Silke) om en ny booking. Adressen sættes
 * i Sanity (Indstillinger → Besked-email).
 */
export async function sendOwnerBookingNotification(
  to: string,
  booking: BookingDetails,
): Promise<void> {
  const resend = getResend()
  const when = formatDateTime(booking.startsAt)
  const priceLine = booking.price != null ? ` (${booking.price} kr.)` : ''

  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `\n🔔 Ny booking (til ${to}): ${booking.name} — ${booking.piercingName}${priceLine} — ${when}\n`,
      )
      return
    }
    console.warn('RESEND_API_KEY mangler — kunne ikke sende notifikations-email.')
    return
  }

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: booking.email,
    subject: `Ny booking: ${booking.name} — ${booking.piercingName}`,
    text: `Der er kommet en ny booking!\n\nNavn: ${booking.name}\nPiercing: ${booking.piercingName}${priceLine}\nTid: ${when}\nTelefon: ${booking.phone}\nEmail: ${booking.email}${booking.message ? `\nBesked: ${booking.message}` : ''}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#500724">
        <h1 style="font-size:20px;color:#be185d">Ny booking! 💖</h1>
        <div style="background:#fdf2f8;border-radius:16px;padding:16px 20px;margin:16px 0">
          <p style="margin:0 0 6px"><strong>Navn:</strong> ${booking.name}</p>
          <p style="margin:0 0 6px"><strong>Piercing:</strong> ${booking.piercingName}${priceLine}</p>
          <p style="margin:0 0 6px"><strong>Tid:</strong> ${when}</p>
          <p style="margin:0 0 6px"><strong>Telefon:</strong> ${booking.phone}</p>
          <p style="margin:0"><strong>Email:</strong> ${booking.email}</p>
          ${booking.message ? `<p style="margin:6px 0 0"><strong>Besked:</strong> ${booking.message}</p>` : ''}
        </div>
      </div>
    `,
  })

  if (error) {
    console.error('Kunne ikke sende notifikations-email:', error)
  }
}

/**
 * Send en SMS via Twilio. Er kun aktiv hvis TWILIO_ACCOUNT_SID,
 * TWILIO_AUTH_TOKEN og TWILIO_FROM er sat i miljøet — ellers gør den ingenting
 * (og koster derfor ikke noget). Bruger Twilios REST-API direkte, så der er
 * ingen ekstra afhængigheder.
 */
export async function sendSms(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM

  if (!sid || !token || !fromNumber) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n📱 SMS (til ${to}) [Twilio ikke sat op]: ${body}\n`)
    }
    return
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: fromNumber, Body: body }),
      },
    )
    if (!res.ok) {
      console.error('Twilio svarede med status', res.status, await res.text())
    }
  } catch (err) {
    console.error('Kunne ikke sende SMS:', err)
  }
}
