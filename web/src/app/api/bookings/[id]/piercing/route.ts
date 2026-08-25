import { type NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/writeClient'
import { getSession } from '@/lib/auth'

export const runtime = 'nodejs'

type Body = { piercingId?: string }

type BookingRow = {
  _id: string
  _rev: string
  email?: string
  status?: string
  slot?: { startsAt?: string } | null
}

export async function POST(
  req: NextRequest,
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

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Ugyldig forespørgsel.' }, { status: 400 })
  }

  const piercingId = body.piercingId?.trim()
  if (!piercingId) {
    return NextResponse.json({ error: 'Vælg en piercing.' }, { status: 400 })
  }

  try {
    const [booking, piercing] = await Promise.all([
      writeClient.fetch<BookingRow | null>(
        `*[_type == "booking" && _id == $id][0]{
          _id, _rev, email, status,
          "slot": slot->{ startsAt }
        }`,
        { id },
      ),
      writeClient.fetch<{ _id: string; name: string } | null>(
        `*[_type == "piercingType" && _id == $id && active == true][0]{ _id, name }`,
        { id: piercingId },
      ),
    ])

    if (!booking) {
      return NextResponse.json({ error: 'Booking findes ikke.' }, { status: 404 })
    }

    // Ejerskabstjek: en kunde kan kun ændre sine egne bookinger.
    if ((booking.email ?? '').toLowerCase() !== session.email) {
      return NextResponse.json({ error: 'Ingen adgang.' }, { status: 403 })
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Bookingen er aflyst og kan ikke ændres.' },
        { status: 409 },
      )
    }

    // Kan ikke ændre en tid der allerede er passeret.
    if (booking.slot?.startsAt && new Date(booking.slot.startsAt) < new Date()) {
      return NextResponse.json(
        { error: 'Tiden er allerede passeret og kan ikke ændres.' },
        { status: 400 },
      )
    }

    if (!piercing) {
      return NextResponse.json(
        { error: 'Piercingen findes ikke.' },
        { status: 404 },
      )
    }

    try {
      await writeClient
        .patch(booking._id)
        .ifRevisionId(booking._rev)
        .set({ piercing: { _type: 'reference', _ref: piercingId } })
        .commit({ returnDocuments: false })
    } catch (err) {
      console.error('Skift-piercing-transaktion fejlede:', err)
      return NextResponse.json(
        { error: 'Kunne ikke ændre lige nu. Prøv igen.' },
        { status: 409 },
      )
    }

    return NextResponse.json({ ok: true, piercingName: piercing.name })
  } catch (err) {
    console.error('Skift-piercing-fejl:', err)
    return NextResponse.json(
      { error: 'Noget gik galt. Prøv igen om lidt.' },
      { status: 500 },
    )
  }
}
