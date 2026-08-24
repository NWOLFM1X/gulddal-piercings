import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import { piercingsQuery, availableSlotsQuery } from "@/sanity/lib/queries";
import { BookingForm } from "@/components/BookingForm";
import { Reveal } from "@/components/Reveal";
import { getSession } from "@/lib/auth";
import type { Piercing, Slot } from "@/types";

export const metadata: Metadata = {
  title: "Book tid",
  description: "Book din piercing online. Vælg piercing og en ledig tid.",
};

// Booking skal altid have friske ledige tider.
export const dynamic = "force-dynamic";

export default async function BookPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?returnTo=/book");
  }

  const now = new Date().toISOString();
  const [{ data: piercings }, { data: slots }] = await Promise.all([
    sanityFetch({ query: piercingsQuery }),
    sanityFetch({ query: availableSlotsQuery, params: { now } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <Reveal>
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-pink-900">
            Book en tid
          </h1>
          <p className="mt-3 text-pink-900/70">
            Vælg piercing, find en ledig tid, og udfyld dine oplysninger.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <BookingForm
          piercings={(piercings as Piercing[]) ?? []}
          slots={(slots as Slot[]) ?? []}
          email={session.email}
        />
      </Reveal>
    </div>
  );
}
