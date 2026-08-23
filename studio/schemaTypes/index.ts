import { type SchemaTypeDefinition } from 'sanity'

import { piercingType } from './piercingType'
import { timeSlot } from './timeSlot'
import { booking } from './booking'
import { siteSettings } from './siteSettings'
import { homePage } from './homePage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [piercingType, timeSlot, booking, siteSettings, homePage],
}
