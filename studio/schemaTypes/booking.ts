import { defineField, defineType } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons'

export const booking = defineType({
  name: 'booking',
  title: 'Booking',
  type: 'document',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'piercing',
      title: 'Piercing',
      type: 'reference',
      to: [{ type: 'piercingType' }],
      readOnly: true,
    }),
    defineField({
      name: 'slot',
      title: 'Tid',
      type: 'reference',
      to: [{ type: 'timeSlot' }],
      readOnly: true,
    }),
    defineField({
      name: 'message',
      title: 'Besked fra kunde',
      type: 'text',
      rows: 3,
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Ny', value: 'new' },
          { title: 'Bekræftet', value: 'confirmed' },
          { title: 'Aflyst', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Betaling',
      type: 'string',
      description: 'Bruges senere hvis online betaling tilføjes.',
      options: {
        list: [
          { title: 'Ingen', value: 'none' },
          { title: 'Afventer', value: 'pending' },
          { title: 'Betalt', value: 'paid' },
        ],
        layout: 'radio',
      },
      initialValue: 'none',
    }),
  ],
  orderings: [
    {
      title: 'Nyeste først',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      name: 'name',
      status: 'status',
      piercing: 'piercing.name',
      startsAt: 'slot.startsAt',
    },
    prepare({ name, status, piercing, startsAt }) {
      const labels: Record<string, string> = {
        new: '🆕 Ny',
        confirmed: '✅ Bekræftet',
        cancelled: '❌ Aflyst',
      }
      const date = startsAt
        ? new Date(startsAt).toLocaleString('da-DK', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : ''
      return {
        title: `${name ?? 'Ukendt'}${piercing ? ` · ${piercing}` : ''}`,
        subtitle: `${labels[status] ?? status}${date ? ` · ${date}` : ''}`,
      }
    },
  },
})
