# Hosting af Gulddal Piercings

Få siden online gratis: **Sanity** (backend + CMS), **Next.js på Vercel** (selve siden), og et **.dk-domæne**.

## Steps

### Trin 0 — Forbered (én gang)
1. Opret/log ind på konti: [sanity.io](https://www.sanity.io/manage), GitHub og Vercel (log ind på Vercel med GitHub).
2. Køb domænet `gulddalpiercings.dk` hos en dansk registrar (fx Simply.com eller DanDomain).

### Trin 1 — Sanity backend klar
3. Bekræft projekt `2ae9cktt` / dataset `production` findes.
4. **API → Tokens**: opret token med rollen **Editor**, kopiér det (bruges af booking-API'en). Del det aldrig.
5. **API → CORS Origins**: tilføj `http://localhost:3000` med *Allow credentials* (prod-domæne tilføjes i trin 6).

### Trin 1b — Email + auth klar (kunde-login)
5a. Opret konto på [resend.com](https://resend.com), verificér afsender-domæne, og lav en `RESEND_API_KEY` (bruges til magic-link login-emails).
5b. Generér en lang tilfældig `AUTH_SECRET` (fx `openssl rand -base64 32`) — signerer login/session-JWT for kunde-login og aflysning.

### Trin 2 — Saml projektet i ét git-repo
6. Kør i roden: `git init`, tjek at `.gitignore` dækker `node_modules`, `.env*`, `.next`.
7. `git add . && git commit -m "Initial"` → opret repo på GitHub → `git push`.
8. Hele mappen pushes som ét repo (`web/` og `studio/` som undermapper).

### Trin 3 — Deploy siden på Vercel *(afhænger af trin 2)*
9. Vercel → **New Project** → importér GitHub-repoet.
10. Sæt **Root Directory = `web`**.
11. Tilføj Environment Variables (Production — se nedenfor). Marker `SANITY_API_WRITE_TOKEN`, `SANITY_API_READ_TOKEN`, `AUTH_SECRET` og `RESEND_API_KEY` som **Secret**.
12. **Deploy**. Du får en `*.vercel.app`-URL. Auto-deploy ved hvert push til `main`.

### Trin 4 — Publicér Studio (CMS) *(kan køre parallelt med trin 3)*
13. `cd studio && npm install && npm run deploy` → bliver til `gulddal-piercings.sanity.studio` (host er allerede sat).

### Trin 5 — Kobl domænet på *(afhænger af trin 3)*
14. Vercel → Project → **Domains** → tilføj `gulddalpiercings.dk` (+ evt. `www`).
15. Sæt DNS hos registraren efter Vercels anvisning (A-record / CNAME).
16. Opdater `NEXT_PUBLIC_SITE_URL` til `https://gulddalpiercings.dk` i Vercel → redeploy.

### Trin 6 — Produktions-finish
17. Sanity **CORS**: tilføj `https://gulddalpiercings.dk` (+ Vercel preview-domæne) med credentials.
18. (Valgfrit) Discord-besked ved booking: opret Discord-webhook, sæt `DISCORD_WEBHOOK_URL`, `BOOKING_WEBHOOK_URL=https://gulddalpiercings.dk/api/webhooks/discord` og en fælles `BOOKING_WEBHOOK_SECRET`.

### Trin 7 — Verifikation
19. Siden loader på domænet; `/piercinger` og `/book` virker.
20. Lav en testbooking → den dukker op i Studio, tiden markeres booket, og Discord-besked kommer (hvis sat op).
21. Test kunde-login: bed om magic-link på `/login`, tjek at emailen ankommer (Resend) og at `/mine-bookinger` + aflysning virker.
22. Redigér noget i Studio → ændringen slår igennem på siden.
23. Tjek `gulddalpiercings.dk/robots.txt` og `/sitemap.xml` peger på prod-domænet.

## Komponenter
1. **Sanity backend** (data/API/CDN) — hostet af Sanity, gratis plan. Project ID `2ae9cktt`, dataset `production`. Ingen ekstra hosting.
2. **Sanity Studio** (CMS UI) — `sanity deploy` → gratis på `gulddal-piercings.sanity.studio` (studioHost sat i `studio/sanity.cli.ts`). Auto-updates.
3. **Next.js site** (`web/`) — Vercel Hobby (gratis). Serverless kører `/api/book` (runtime nodejs).
4. **Domæne** — køb `gulddalpiercings.dk` (Simply.com/DanDomain), peg på Vercel.

## Git / CI
- Saml ét git-repo i roden (`web/` har p.t. eget `.git` — fjern `web/.git` eller gør roden til repoet). Push til GitHub.
- Vercel-projekt: **Root Directory = `web`**. Auto-deploy ved push til `main`.

## Env-variabler i Vercel (Production)
- `NEXT_PUBLIC_SANITY_PROJECT_ID=2ae9cktt`
- `NEXT_PUBLIC_SANITY_DATASET=production`
- `NEXT_PUBLIC_SANITY_API_VERSION=2026-02-01`
- `NEXT_PUBLIC_SITE_URL=https://gulddalpiercings.dk`
- `SANITY_API_WRITE_TOKEN=<editor-token>` *(Secret)* — booking-API'ens skrive-token
- `SANITY_API_READ_TOKEN=<viewer-token>` *(Secret)* — server-side live-forbindelse, så publiceret indhold vises uden redeploy
- `AUTH_SECRET=<lang tilfældig streng>` *(Secret)* — signerer login/session-JWT (kunde-login + aflysning)
- `RESEND_API_KEY=<resend key>` *(Secret)* — sender magic-link login-emails
- `RESEND_FROM="Gulddal Piercings <no-reply@verificeret-domæne>"` — afsender på login-emails
- `BOOKING_WEBHOOK_URL` / `BOOKING_WEBHOOK_SECRET` / `DISCORD_WEBHOOK_URL` *(valgfrit)*

> Studio (`studio/`) bruger separat `SANITY_STUDIO_PROJECT_ID` (+ evt. `SANITY_STUDIO_DATASET`) ved lokal kørsel/deploy — sættes i `studio/.env`, ikke i Vercel.
> Til lokal udvikling: læg samme web-variabler i `web/.env.local` (med `NEXT_PUBLIC_SITE_URL=http://localhost:3000`).

## Relevante filer
- [studio/sanity.cli.ts](studio/sanity.cli.ts) — `studioHost: 'gulddal-piercings'` styrer studio-URL'en
- [web/src/app/api/book/route.ts](web/src/app/api/book/route.ts) — booking-API, kræver `SANITY_API_WRITE_TOKEN`
- [web/src/sanity/lib/live.ts](web/src/sanity/lib/live.ts) — live-forbindelse, kræver `SANITY_API_READ_TOKEN` for at vise nyt indhold i prod
- [web/src/lib/auth.ts](web/src/lib/auth.ts) — kræver `AUTH_SECRET` til login/session-JWT
- [web/src/lib/email.ts](web/src/lib/email.ts) — kræver `RESEND_API_KEY` (+ `RESEND_FROM`) til login-emails
- [web/src/app/api/webhooks/discord/route.ts](web/src/app/api/webhooks/discord/route.ts) — Discord-eksempel til trin 6

## Omkostninger
0 kr. hosting (Vercel Hobby + Sanity Free) + ~50-120 kr./år for domænet.