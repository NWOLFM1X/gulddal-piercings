import { type NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/writeClient'
import { getSession } from '@/lib/auth'

export const runtime = 'nodejs'

type BookingRow = {
  _id: string
  _rev: string
  email?: string
  status?: string
  slot?: {
    _id: string
    _rev: string
    status?: string
    startsAt?: string
  } | null
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { error: 'Du skal være logget ind.' },
      { status: 401 },
    )
  }

  const { id } = await params

  try {
    const booking = await writeClient.fetch<BookingRow | null>(
      `*[_type == "booking" && _id == $id][0]{
        _id, _rev, email, status,
        "slot": slot->{ _id, _rev, status, startsAt }
      }`,
      { id },
    )

    if (!booking) {
      return NextResponse.json({ error: 'Booking findes ikke.' }, { status: 404 })
    }

    // Ejerskabstjek: en kunde kan kun aflyse sine egne bookinger.
    if ((booking.email ?? '').toLowerCase() !== session.email) {
      return NextResponse.json({ error: 'Ingen adgang.' }, { status: 403 })
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Bookingen er allerede aflyst.' },
        { status: 409 },
      )
    }

    // Kan ikke aflyse en tid der allerede er passeret.
    if (booking.slot?.startsAt && new Date(booking.slot.startsAt) < new Date()) {
      return NextResponse.json(
        { error: 'Tiden er allerede passeret og kan ikke aflyses.' },
        { status: 400 },
      )
    }

    // Atomisk: markér booking som aflyst og frigiv tiden igen.
    let tx = writeClient
      .transaction()
      .patch(booking._id, (p) =>
        p.ifRevisionId(booking._rev).set({ status: 'cancelled' }),
      )

    if (booking.slot && booking.slot.status === 'booked') {
      const slot = booking.slot
      tx = tx.patch(slot._id, (p) =>
        p.ifRevisionId(slot._rev).set({ status: 'available' }),
      )
    }

    try {
      await tx.commit({ returnDocuments: false })
    } catch (err) {
      console.error('Aflysnings-transaktion fejlede:', err)
      return NextResponse.json(
        { error: 'Kunne ikke aflyse lige nu. Prøv igen.' },
        { status: 409 },
      )
    }

    await notifyWebhook({
      bookingId: booking._id,
      email: session.email,
      slotStartsAt: booking.slot?.startsAt,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Aflysnings-fejl:', err)
    return NextResponse.json(
      { error: 'Noget gik galt. Prøv igen om lidt.' },
      { status: 500 },
    )
  }
}

async function notifyWebhook(data: {
  bookingId: string
  email: string
  slotStartsAt?: string
}) {
  const url = process.env.BOOKING_WEBHOOK_URL
  if (!url) return

  const payload = {
    event: 'booking.cancelled',
    booking: {
      id: data.bookingId,
      email: data.email,
      slot: { startsAt: data.slotStartsAt },
      cancelledAt: new Date().toISOString(),
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
