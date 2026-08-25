import type { PortableTextBlock } from "next-sanity";

export type SanityImage = {
  asset?: { _ref?: string };
  alt?: string;
  hotspot?: { x: number; y: number };
};

export type SiteSettings = {
  title?: string;
  tagline?: string;
  description?: string;
  logo?: SanityImage;
  phone?: string;
  email?: string;
  address?: string;
  openingHours?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
} | null;

export type Piercing = {
  _id: string;
  name?: string;
  slug?: string;
  category?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  image?: SanityImage;
  popular?: boolean;
};

export type Slot = {
  _id: string;
  startsAt?: string;
  durationMinutes?: number;
};

export type MyBooking = {
  _id: string;
  status?: "new" | "confirmed" | "cancelled";
  message?: string;
  _createdAt?: string;
  piercingId?: string;
  piercingName?: string;
  slotStartsAt?: string;
  slotStatus?: string;
};

export type FaqItem = { question?: string; answer?: string };

export type HomePage = {
  heroHeading?: string;
  heroSubheading?: string;
  heroImage?: SanityImage;
  aboutHeading?: string;
  aboutBody?: PortableTextBlock[];
  aboutImage?: SanityImage;
  gallery?: SanityImage[];
  faq?: FaqItem[];
} | null;

export const CATEGORY_LABELS: Record<string, string> = {
  ansigt: "Ansigt",
  oere: "Øre",
  mund: "Mund",
  krop: "Krop",
  intim: "Intim",
  andet: "Andet",
};
