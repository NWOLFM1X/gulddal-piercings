import { type NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/writeClient'

export const runtime = 'nodejs'

type BookingBody = {
  name?: string
  email?: string
  phone?: string
  message?: string
  piercingId?: string
  slotId?: string
  // Honeypot mod spam-bots. Skal være tom.
  company?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: BookingBody
  try {
    body = (await req.json()) as BookingBody
  } catch {
    return NextResponse.json({ error: 'Ugyldig forespørgsel.' }, { status: 400 })
  }

  const name = body.name?.trim()
  const email = body.email?.trim()
  const phone = body.phone?.trim()
  const message = body.message?.trim() || ''
  const { piercingId, slotId } = body

  // Honeypot: hvis udfyldt, lad som om alt gik godt (bot).
  if (body.company) {
    return NextResponse.json({ ok: true })
  }

  // Validering
  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Indtast dit navn.' }, { status: 400 })
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Indtast en gyldig email.' }, { status: 400 })
  }
  if (!phone || phone.length < 6) {
    return NextResponse.json({ error: 'Indtast et telefonnummer.' }, { status: 400 })
  }
  if (!piercingId || !slotId) {
    return NextResponse.json(
      { error: 'Vælg både piercing og tid.' },
      { status: 400 },
    )
  }

  try {
    // Hent tid + piercing frisk fra API'et (ikke CDN) for korrekt status/_rev.
    const [slot, piercing] = await Promise.all([
      writeClient.fetch<{
        _id: string
        _rev: string
        status: string
        startsAt: string
      } | null>(
        `*[_type == "timeSlot" && _id == $id][0]{ _id, _rev, status, startsAt }`,
        { id: slotId },
      ),
      writeClient.fetch<{ _id: string; name: string; price: number } | null>(
        `*[_type == "piercingType" && _id == $id && active == true][0]{ _id, name, price }`,
        { id: piercingId },
      ),
    ])

    if (!slot) {
      return NextResponse.json({ error: 'Tiden findes ikke.' }, { status: 404 })
    }
    if (!piercing) {
      return NextResponse.json(
        { error: 'Piercingen findes ikke.' },
        { status: 404 },
      )
    }
    if (slot.status !== 'available') {
      return NextResponse.json(
        { error: 'Beklager, tiden er lige blevet booket. Vælg en anden.' },
        { status: 409 },
      )
    }

    // Transaktion: markér tiden som booket KUN hvis den ikke er ændret imens
    // (ifRevisionId), og opret bookingen i samme atomiske operation.
    const tx = writeClient
      .transaction()
      .patch(slotId, (p) => p.ifRevisionId(slot._rev).set({ status: 'booked' }))
      .create({
        _type: 'booking',
        name,
        email,
        phone,
        message,
        piercing: { _type: 'reference', _ref: piercingId },
        slot: { _type: 'reference', _ref: slotId },
        status: 'new',
        paymentStatus: 'none',
      })

    let bookingId: string | undefined
    try {
      const result = await tx.commit({ returnDocuments: false })
      bookingId = result.results?.find((r) => r.operation === 'create')?.id
    } catch (err) {
      // ifRevisionId-mismatch => nogen bookede tiden i mellemtiden.
      console.error('Booking-transaktion fejlede:', err)
      return NextResponse.json(
        { error: 'Beklager, tiden er lige blevet booket. Vælg en anden.' },
        { status: 409 },
      )
    }

    // Send webhook-event (fejl her må ikke vælte bookingen).
    await notifyWebhook({
      bookingId,
      name,
      email,
      phone,
      message,
      piercing,
      slot,
    })

    return NextResponse.json({ ok: true, bookingId })
  } catch (err) {
    console.error('Booking-fejl:', err)
    return NextResponse.json(
      { error: 'Noget gik galt. Prøv igen om lidt.' },
      { status: 500 },
    )
  }
}

/**
 * Sender en struktureret JSON-event til et valgfrit endpoint.
 *
 * Sæt BOOKING_WEBHOOK_URL i miljøet til din egen URL, hvor du selv koder
 * videresendelsen til fx Discord. Payloadet ser sådan ud:
 *
 * {
 *   "event": "booking.created",
 *   "booking": {
 *     "id": "…",
 *     "name": "…",
 *     "email": "…",
 *     "phone": "…",
 *     "message": "…",
 *     "piercing": { "id": "…", "name": "Septum", "price": 400 },
 *     "slot": { "id": "…", "startsAt": "2026-09-01T12:00:00.000Z" },
 *     "createdAt": "2026-08-23T…Z"
 *   }
 * }
 */
async function notifyWebhook(data: {
  bookingId?: string
  name: string
  email: string
  phone: string
  message: string
  piercing: { _id: string; name: string; price: number }
  slot: { _id: string; startsAt: string }
}) {
  const url = process.env.BOOKING_WEBHOOK_URL
  if (!url) return

  const payload = {
    event: 'booking.created',
    booking: {
      id: data.bookingId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      piercing: {
        id: data.piercing._id,
        name: data.piercing.name,
        price: data.piercing.price,
      },
      slot: {
        id: data.slot._id,
        startsAt: data.slot.startsAt,
      },
      createdAt: new Date().toISOString(),
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.BOOKING_WEBHOOK_SECRET
          ? { 'X-Webhook-Secret': process.env.BOOKING_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('Webhook svarede med status', res.status)
    }
  } catch (err) {
    console.error('Kunne ikke sende webhook:', err)
  }
}
