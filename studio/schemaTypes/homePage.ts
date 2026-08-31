import { defineField, defineType, defineArrayMember } from 'sanity'
import { HomeIcon } from '@sanity/icons'

export const homePage = defineType({
  name: 'homePage',
  title: 'Forside',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'hero', title: 'Hero (toppen)' },
    { name: 'about', title: 'Om mig' },
    { name: 'gallery', title: 'Galleri' },
    { name: 'faq', title: 'Spørgsmål & svar' },
  ],
  fields: [
    defineField({
      name: 'heroHeading',
      title: 'Overskrift',
      type: 'string',
      group: 'hero',
      initialValue: 'Gulddal Piercings',
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Undertekst',
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero-billede',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
    }),
    defineField({
      name: 'apprenticeNotice',
      title: 'Elev-besked (banner)',
      type: 'text',
      rows: 2,
      group: 'hero',
      description: 'Vises som en tydelig besked på forsiden, fx at du er elev-piercer under oplæring. Lad feltet være tomt for at skjule banneret.',
      initialValue: 'Jeg er elev-piercer og arbejder under professionel oplæring og vejledning.',
    }),
    defineField({
      name: 'aboutHeading',
      title: 'Overskrift',
      type: 'string',
      group: 'about',
      initialValue: 'Om mig',
    }),
    defineField({
      name: 'aboutBody',
      title: 'Tekst',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'about',
    }),
    defineField({
      name: 'aboutImage',
      title: 'Billede',
      type: 'image',
      options: { hotspot: true },
      group: 'about',
    }),
    defineField({
      name: 'gallery',
      title: 'Galleri-billeder',
      type: 'array',
      group: 'gallery',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
          ],
        }),
      ],
      options: { layout: 'grid' },
    }),
    defineField({
      name: 'faq',
      title: 'Spørgsmål & svar',
      type: 'array',
      group: 'faq',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({ name: 'question', title: 'Spørgsmål', type: 'string' }),
            defineField({ name: 'answer', title: 'Svar', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'question' },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Forside' }
    },
  },
})
