import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const piercingType = defineType({
  name: 'piercingType',
  title: 'Piercing',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      description: 'Fx Septum, Navle, Tunge, Snakebites',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-navn',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {
        list: [
          { title: 'Ansigt', value: 'ansigt' },
          { title: 'Øre', value: 'oere' },
          { title: 'Mund', value: 'mund' },
          { title: 'Krop', value: 'krop' },
          { title: 'Intim', value: 'intim' },
          { title: 'Andet', value: 'andet' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'andet',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'price',
      title: 'Pris (kr.)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Varighed (minutter)',
      type: 'number',
      description: 'Cirka hvor lang tid piercingen tager. Bruges til booking.',
      initialValue: 30,
      validation: (rule) => rule.required().min(5),
    }),
    defineField({
      name: 'image',
      title: 'Billede',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'popular',
      title: 'Populær (vis som fremhævet)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'active',
      title: 'Aktiv (vises på siden og kan bookes)',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Rækkefølge',
      type: 'number',
      description: 'Lavere tal vises først.',
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: 'Rækkefølge',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'category', media: 'image', price: 'price' },
    prepare({ title, subtitle, media, price }) {
      return {
        title,
        subtitle: `${subtitle ?? ''}${price != null ? ` · ${price} kr.` : ''}`,
        media,
      }
    },
  },
})
