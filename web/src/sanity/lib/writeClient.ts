import 'server-only'
import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Skrive-klient bruges KUN på serveren (fx booking-API'en).
// Kræver et API-token med skriverettigheder. Aldrig useCdn ved skrivning.
const token = process.env.SANITY_API_WRITE_TOKEN

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
})

if (!token) {
  console.warn(
    'SANITY_API_WRITE_TOKEN mangler — booking-API kan ikke skrive til Sanity.',
  )
}
