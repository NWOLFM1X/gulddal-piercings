import { defineField, defineType } from 'sanity'
import { ClipboardIcon } from '@sanity/icons'

export const beforeBooking = defineType({
  name: 'beforeBooking',
  title: 'Før din booking',
  type: 'document',
  icon: ClipboardIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Overskrift',
      type: 'string',
      initialValue: 'Før din booking',
    }),
    defineField({
      name: 'intro',
      title: 'Indledning',
      type: 'text',
      rows: 3,
      description: 'Kort tekst der vises øverst på siden.',
    }),
    defineField({
      name: 'sections',
      title: 'Sektioner',
      type: 'array',
      description: 'Tilføj sektioner, fx "Hvad du skal huske", "Forberedelse" og "Hvad du skal informere om".',
      of: [
        {
          type: 'object',
          name: 'section',
          title: 'Sektion',
          fields: [
            defineField({
              name: 'title',
              title: 'Titel',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Indhold',
              type: 'array',
              of: [{ type: 'block' }],
            }),
          ],
          preview: {
            select: { title: 'title' },
          },
        },
      ],
      initialValue: [
        {
          _type: 'section',
          title: 'Hvad du skal huske',
          body: [],
        },
        {
          _type: 'section',
          title: 'Sådan forbereder du dig',
          body: [],
        },
        {
          _type: 'section',
          title: 'Det skal du informere din piercingartist om',
          body: [],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Før din booking' }
    },
  },
})
