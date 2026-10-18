import { defineField, defineType } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const bookingPage = defineType({
  name: 'bookingPage',
  title: 'Booking',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'piercingHelpText',
      title: 'Hjælpetekst (vælg piercinger)',
      type: 'text',
      rows: 2,
      description:
        'Vises under overskriften på booking-siden, hvor kunden vælger piercinger.',
      initialValue: 'Du kan vælge en eller flere piercinger.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Booking' }
    },
  },
})
