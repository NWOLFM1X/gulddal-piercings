import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Indstillinger',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Sidens navn',
      type: 'string',
      initialValue: 'Gulddal Piercings',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Slogan',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse (til Google/SEO)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'notifyEmail',
      title: 'Besked-email (booking-notifikationer)',
      type: 'string',
      description:
        'Du får en email hertil, hver gang der kommer en ny booking. Lad stå tom for at slå fra.',
      validation: (rule) =>
        rule.email().warning('Skriv en gyldig email-adresse.'),
    }),
    defineField({
      name: 'notifyPhone',
      title: 'Besked-SMS (telefonnummer)',
      type: 'string',
      description:
        'Telefonnummer der får en SMS ved nye bookinger. Skriv med landekode, fx +4512345678. Kræver at SMS er sat op. Lad stå tom for at slå fra.',
    }),
    defineField({
      name: 'address',
      title: 'Adresse',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'openingHours',
      title: 'Åbningstider (tekst)',
      type: 'text',
      rows: 4,
      description: 'Fx "Man-Fre 10-18, Lør 10-14"',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram-link',
      type: 'url',
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook-link',
      type: 'url',
    }),
    defineField({
      name: 'tiktok',
      title: 'TikTok-link',
      type: 'url',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Indstillinger' }
    },
  },
})
