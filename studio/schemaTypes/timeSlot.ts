import { defineField, defineType } from 'sanity'
import { CalendarIcon } from '@sanity/icons'
import { TimeSlotDateTimeInput } from '../components/TimeSlotDateTimeInput'

export const timeSlot = defineType({
  name: 'timeSlot',
  title: 'Ledig tid',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'startsAt',
      title: 'Dato og tid',
      type: 'datetime',
      description: 'Vælg dato og klik på et tidspunkt.',
      options: {
        dateFormat: 'DD-MM-YYYY',
        timeFormat: 'HH:mm',
        timeStep: 15,
      },
      components: {
        input: TimeSlotDateTimeInput,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Varighed (minutter)',
      type: 'number',
      description: 'Hvor lang tid tiden varer. Lad stå tom for at bruge piercingens varighed.',
      initialValue: 30,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Ledig', value: 'available' },
          { title: 'Booket', value: 'booked' },
          { title: 'Blokeret', value: 'blocked' },
        ],
        layout: 'radio',
      },
      initialValue: 'available',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'note',
      title: 'Note (kun til dig selv)',
      type: 'string',
    }),
  ],
  orderings: [
    {
      title: 'Tidligste først',
      name: 'startsAtAsc',
      by: [{ field: 'startsAt', direction: 'asc' }],
    },
  ],
  preview: {
    select: { startsAt: 'startsAt', status: 'status', note: 'note' },
    prepare({ startsAt, status, note }) {
      const labels: Record<string, string> = {
        available: 'Ledig',
        booked: 'Booket',
        blocked: 'Blokeret',
      }
      const date = startsAt
        ? new Date(startsAt).toLocaleString('da-DK', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Copenhagen',
          })
        : 'Ingen tid valgt'
      return {
        title: date,
        subtitle: `${labels[status] ?? status}${note ? ` · ${note}` : ''}`,
      }
    },
  },
})
