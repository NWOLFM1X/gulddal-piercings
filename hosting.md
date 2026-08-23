# Hosting-plan: Gulddal Piercings

## Komponenter
1. **Sanity backend** (data/API/CDN) — hostet af Sanity, gratis plan. Project ID `2ae9cktt`, dataset `production`. Ingen ekstra hosting.
2. **Sanity Studio** (CMS UI) — `sanity deploy` → gratis på `gulddal-piercings.sanity.studio` (studioHost sat i `studio/sanity.cli.ts`). Auto-updates.
3. **Next.js site** (`web/`) — Vercel Hobby (gratis). Serverless kører `/api/book` (runtime nodejs).
4. **Domæne** — køb `gulddalpiercings.dk` (Simply.com/DanDomain), peg på Vercel.

## Git / CI
- Saml ét git-repo i roden (`web/` har p.t. eget `.git` — fjern `web/.git` eller gør roden til repoet). Push til GitHub.
- Vercel-projekt: **Root Directory = `web`**. Auto-deploy ved push til `main`.

## Miljøvariabler i Vercel (Production)
- `NEXT_PUBLIC_SANITY_PROJECT_ID=2ae9cktt`
- `NEXT_PUBLIC_SANITY_DATASET=production`