# Gulddal Piercings

Hjemmeside + booking-system til Gulddal Piercings.

- **`web/`** – Selve hjemmesiden (Next.js). Pink tema, animationer, booking-flow og booking-API.
- **`studio/`** – Sanity Studio. Her redigerer Silke alt uden kode: piercinger, ledige tider, forside-tekst, billeder og indstillinger. Her ses også indkomne bookinger.

---

## 1. Opret et Sanity-projekt (én gang)

1. Log ind / opret konto på <https://www.sanity.io/manage>.
2. Opret et nyt projekt. Vælg dataset-navn **`production`**.
3. Notér **Project ID** (fx `abc12345`).
4. Under **API → Tokens**: opret et token med rollen **Editor**. Notér tokenet
   (bruges af booking-API'en til at gemme bookinger). Del det aldrig offentligt.
5. Under **API → CORS Origins**: tilføj `http://localhost:3000` (og senere din
   rigtige side-URL) med *Allow credentials*.

## 2. Studio (CMS)

```bash
cd studio
cp .env.example .env        # udfyld SANITY_STUDIO_PROJECT_ID
npm install
npm run dev                 # åbner http://localhost:3333
```

I Studio kan Silke:

- **Piercinger** – tilføje septum, navle, tunge, snakebites osv. med pris, varighed og billede.
- **Ledige tider** – oprette de tider kunder kan booke.
- **Bookinger** – se og håndtere indkomne bookinger.
- **Forside / Indstillinger** – redigere tekster, billeder, kontaktinfo og åbningstider.

Udgiv Studio online (gratis) med:

```bash
npm run deploy              # bliver til fx gulddal-piercings.sanity.studio
```

## 3. Hjemmesiden

```bash
cd web
cp .env.example .env.local  # udfyld værdierne (se nedenfor)
npm install
npm run dev                 # åbner http://localhost:3000
```

Udfyld `web/.env.local`:

| Variabel | Beskrivelse |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Dit Project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SITE_URL` | Sidens URL (til SEO/sitemap) – localhost under udvikling |
| `SANITY_API_WRITE_TOKEN` | Editor-token fra trin 1.4 |
| `BOOKING_WEBHOOK_URL` | (valgfrit) URL der får besked ved ny booking |
| `BOOKING_WEBHOOK_SECRET` | (valgfrit) hemmelighed sendt som header |
| `DISCORD_WEBHOOK_URL` | (valgfrit) bruges kun af eksempel-modtageren |

---

## 4. Booking-webhook (Discord)

API'en gør arbejdet – **du koder selv modtageren** (fx en lille funktion der
sender til Discord). Når en booking oprettes, sender `web/src/app/api/book/route.ts`
en `POST` med JSON til `BOOKING_WEBHOOK_URL`:

```json
{
  "event": "booking.created",
  "booking": {
    "id": "…",
    "name": "…",
    "email": "…",
    "phone": "…",
    "message": "…",
    "piercing": { "id": "…", "name": "Septum", "price": 400 },
    "slot": { "id": "…", "startsAt": "2026-09-01T12:00:00.000Z" },
    "createdAt": "2026-08-23T…Z"
  }
}
```

Hvis du sætter `BOOKING_WEBHOOK_SECRET`, sendes den med som headeren
`X-Webhook-Secret`, så din modtager kan verificere kaldet.

> Tip: Discord-webhooks forventer formatet `{ "content": "…" }`. Peg derfor
> `BOOKING_WEBHOOK_URL` på dit eget lille endpoint, der oversætter payloadet
> ovenfor til en pæn Discord-besked og videresender til Discord-webhook-URL'en.

### Hurtig start med det medfølgende Discord-eksempel

Der ligger en færdig (og redigerbar) modtager i
`web/src/app/api/webhooks/discord/route.ts`, som formaterer bookingen til en pæn
Discord-besked. Sådan bruger du den:

1. Opret en Discord-webhook i din kanal: **Kanalindstillinger → Integrationer →
   Webhooks → Ny webhook**, og kopiér URL'en.
2. Sæt i `web/.env.local` (og i Vercel):
   - `DISCORD_WEBHOOK_URL` = din Discord-webhook-URL
   - `BOOKING_WEBHOOK_URL` = `http://localhost:3000/api/webhooks/discord`
     (i produktion: `https://din-side.dk/api/webhooks/discord`)
   - `BOOKING_WEBHOOK_SECRET` = en tilfældig streng (samme værdi bruges automatisk
     som verifikation mellem de to routes)

---

## 5. Deploy

- **Studio:** `cd studio && npm run deploy`
- **Hjemmeside:** Deploy `web/` til Vercel. Sæt de samme miljøvariabler i Vercel,
  og tilføj din Vercel-URL under Sanity CORS Origins.
