import { defineQuery } from 'next-sanity'

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings"][0]{
    title,
    tagline,
    description,
    logo,
    phone,
    email,
    address,
    openingHours,
    instagram,
    facebook,
    tiktok
  }
`)

export const homePageQuery = defineQuery(`
  *[_type == "homePage"][0]{
    heroHeading,
    heroSubheading,
    heroImage,
    apprenticeNotice,
    aboutHeading,
    aboutBody,
    aboutImage,
    gallery[]{
      ...,
      "alt": alt
    },
    faq[]{
      question,
      answer
    }
  }
`)

export const piercingsQuery = defineQuery(`
  *[_type == "piercingType" && active == true] | order(order asc, name asc){
    _id,
    name,
    "slug": slug.current,
    category,
    description,
    price,
    durationMinutes,
    image,
    popular
  }
`)

export const piercingBySlugQuery = defineQuery(`
  *[_type == "piercingType" && slug.current == $slug && active == true][0]{
    _id,
    name,
    "slug": slug.current,
    category,
    description,
    price,
    durationMinutes,
    image
  }
`)

// Efterbehandling / pleje (singleton).
export const aftercareQuery = defineQuery(`
  *[_type == "aftercare"][0]{
    heading,
    intro,
    body
  }
`)

// Før din booking (singleton).
export const beforeBookingQuery = defineQuery(`
  *[_type == "beforeBooking"][0]{
    heading,
    intro,
    sections[]{
      title,
      body
    }
  }
`)

// Ledige tider fra nu og frem.
export const availableSlotsQuery = defineQuery(`
  *[_type == "timeSlot" && status == "available" && startsAt >= $now]
    | order(startsAt asc){
      _id,
      startsAt,
      durationMinutes
    }
`)

// En kundes egne bookinger (nyeste først). Sammenlign i små bogstaver, så
// ældre bookinger med store bogstaver i emailen også matcher login-sessionen.
export const bookingsByEmailQuery = defineQuery(`
  *[_type == "booking" && lower(email) == $email] | order(_createdAt desc){
    _id,
    status,
    message,
    _createdAt,
    "piercingId": piercing->_id,
    "piercingName": piercing->name,
    "slotStartsAt": slot->startsAt,
    "slotStatus": slot->status
  }
`)
