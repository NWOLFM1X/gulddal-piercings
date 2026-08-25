import { defineField, defineType } from 'sanity'
import { HeartIcon } from '@sanity/icons'

export const aftercare = defineType({
  name: 'aftercare',
  title: 'Efterbehandling',
  type: 'document',
  icon: HeartIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Overskrift',
      type: 'string',
      initialValue: 'Efterbehandling',
    }),
    defineField({
      name: 'intro',
      title: 'Indledning',
      type: 'text',
      rows: 3,
      description: 'Kort tekst der vises øverst på siden.',
    }),
    defineField({
      name: 'body',
      title: 'Efterbehandling / pleje',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Skriv plejevejledningen her.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Efterbehandling' }
    },
  },
})
