import { defineLive } from 'next-sanity/live'
import { client } from './client'

// Server-token (Viewer/Read). Bruges kun server-side af sanityFetch, så det
// aldrig eksponeres i browseren. Kræves for at produktion henter det seneste
// "live event"-id og dermed viser nyt/publiceret indhold uden redeploy.
const token = process.env.SANITY_API_READ_TOKEN

export const { sanityFetch, SanityLive } = defineLive({
  // useCdn: false → hent altid friskt fra API'et (CDN kan være forsinket).
  client: client.withConfig({ apiVersion: '2026-02-01', useCdn: false }),
  serverToken: token,
})
