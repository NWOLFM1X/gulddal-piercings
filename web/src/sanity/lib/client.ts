import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Læse-klient til offentligt indhold (bruger CDN for hastighed).
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})
