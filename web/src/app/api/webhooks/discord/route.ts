import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * EKSEMPEL-modtager til booking-webhooken.
 *
 * Sådan bruges den:
 * 1. Opret en Discord-webhook i din kanal (Kanalindstillinger → Integrationer →
 *    Webhooks → Ny webhook) og kopiér webhook-URL'en.
 * 2. Sæt i miljøet (.env.local / Vercel):
 *      DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/…"
 *      BOOKING_WEBHOOK_URL="https://din-side.dk/api/webhooks/discord"
 *      BOOKING_WEBHOOK_SECRET="en-hemmelig-streng"   (samme værdi begge steder)
 *
 * Booking-API'et (src/app/api/book/route.ts) kalder denne route ved hver ny
 * booking. Du kan frit ændre teksten/formatet nedenfor.
 */

type BookingEvent = {
  event?: string;
  booking?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    piercings?: { id?: string; name?: string; price?: number }[];
    slot?: { id?: string; startsAt?: string };
    createdAt?: string;
  };
};

export async function POST(req: NextRequest) {
  // Verificér hemmeligheden, så kun dit eget booking-API kan kalde denne route.
  const secret = process.env.BOOKING_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "Ugyldig hemmelighed." }, { status: 401 });
  }

  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!discordUrl) {
    return NextResponse.json(
      { error: "DISCORD_WEBHOOK_URL mangler." },
      { status: 500 },
    );
  }

  let payload: BookingEvent;
  try {
    payload = (await req.json()) as BookingEvent;
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  const b = payload.booking;
  if (!b) {
    return NextResponse.json({ error: "Mangler booking." }, { status: 400 });
  }

  const when = b.slot?.startsAt
    ? new Date(b.slot.startsAt).toLocaleString("da-DK", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Copenhagen",
      })
    : "Ukendt tid";

  // Pæn Discord-besked med "embed".
  const piercingNames = b.piercings?.map((p) => p.name).filter(Boolean).join(", ");
  const totalPrice = b.piercings?.reduce((sum, p) => sum + (p.price ?? 0), 0);
  const discordMessage = {
    content: "💖 **Ny booking!**",
    embeds: [
      {
        title: piercingNames || "Piercing",
        color: 0xf5338a, // pink
        fields: [
          { name: "Navn", value: b.name || "—", inline: true },
          {
            name: "Pris",
            value: totalPrice != null && totalPrice > 0 ? `${totalPrice} kr.` : "—",
            inline: true,
          },
          { name: "Tid", value: when, inline: false },
          { name: "Telefon", value: b.phone || "—", inline: true },
          { name: "Email", value: b.email || "—", inline: true },
          ...(b.message
            ? [{ name: "Besked", value: b.message, inline: false }]
            : []),
        ],
        timestamp: b.createdAt || new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(discordUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordMessage),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Discord svarede med", res.status, text);
      return NextResponse.json(
        { error: "Kunne ikke sende til Discord." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("Fejl ved kald til Discord:", err);
    return NextResponse.json(
      { error: "Netværksfejl mod Discord." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
