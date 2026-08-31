import type { StructureResolver } from 'sanity/structure'
import {
  CalendarIcon,
  CheckmarkCircleIcon,
  TagIcon,
  CogIcon,
  HomeIcon,
  HeartIcon,
  ClipboardIcon,
} from '@sanity/icons'

// Singletons — dokumenter der kun findes ét af.
const singletons = ['siteSettings', 'homePage', 'aftercare', 'beforeBooking']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Gulddal Piercings')
    .items([
      S.listItem()
        .title('Bookinger')
        .icon(CheckmarkCircleIcon)
        .child(
          S.documentTypeList('booking')
            .title('Bookinger')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
        ),
      S.listItem()
        .title('Ledige tider')
        .icon(CalendarIcon)
        .child(
          S.documentTypeList('timeSlot')
            .title('Ledige tider')
            .defaultOrdering([{ field: 'startsAt', direction: 'asc' }]),
        ),
      S.listItem()
        .title('Piercinger')
        .icon(TagIcon)
        .child(
          S.documentTypeList('piercingType')
            .title('Piercinger')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
      S.divider(),
      S.listItem()
        .title('Forside')
        .icon(HomeIcon)
        .id('homePage')
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('Efterbehandling')
        .icon(HeartIcon)
        .id('aftercare')
        .child(S.document().schemaType('aftercare').documentId('aftercare')),
      S.listItem()
        .title('Før din booking')
        .icon(ClipboardIcon)
        .id('beforeBooking')
        .child(S.document().schemaType('beforeBooking').documentId('beforeBooking')),
      S.listItem()
        .title('Indstillinger')
        .icon(CogIcon)
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])

// Skjul singletons fra den generiske "create new"-liste.
export const singletonTypes = new Set(singletons)
