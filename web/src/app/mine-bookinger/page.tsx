import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { writeClient } from "@/sanity/lib/writeClient";
import { bookingsByEmailQuery, piercingsQuery } from "@/sanity/lib/queries";
import { MyBookingsList } from "@/components/MyBookingsList";
import { Reveal } from "@/components/Reveal";
import type { MyBooking, Piercing } from "@/types";

export const metadata: Metadata = {
  title: "Mine bookinger",
  description: "Se og aflys dine bookinger.",
};

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?returnTo=/mine-bookinger");
  }

  // Privat data hentes med skrive-klienten (token, ingen CDN).
  const [bookings, piercings] = await Promise.all([
    writeClient.fetch<MyBooking[]>(bookingsByEmailQuery, {
      email: session.email,
    }),
    writeClient.fetch<Piercing[]>(piercingsQuery),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <Reveal>
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-pink-900">
            Mine bookinger
          </h1>
          <p className="mt-3 text-pink-900/70">
            Logget ind som <strong>{session.email}</strong>
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <MyBookingsList bookings={bookings ?? []} piercings={piercings ?? []} />
      </Reveal>
    </div>
  );
}
