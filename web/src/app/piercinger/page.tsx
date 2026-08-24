import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/lib/live";
import { piercingsQuery } from "@/sanity/lib/queries";
import { Reveal } from "@/components/Reveal";
import { PiercingCard } from "@/components/PiercingCard";
import { CATEGORY_LABELS, type Piercing } from "@/types";

export const metadata: Metadata = {
  title: "Piercinger",
  description: "Se alle vores piercinger og priser.",
};

export default async function PiercingerPage() {
  const { data } = await sanityFetch({ query: piercingsQuery });
  const list = (data as Piercing[]) ?? [];

  // Gruppér efter kategori
  const groups = list.reduce<Record<string, Piercing[]>>((acc, p) => {
    const key = p.category || "andet";
    (acc[key] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-bold text-pink-900">
          Piercinger &amp; priser
        </h1>
        <p className="mt-3 max-w-xl text-pink-900/70">
          Vælg din favorit og book en tid. Alle piercinger udføres med sterilt
          udstyr og smykker af høj kvalitet.
        </p>
      </Reveal>

      {list.length === 0 ? (
        <p className="mt-12 text-pink-900/60">
          Der er ikke tilføjet nogen piercinger endnu.
        </p>
      ) : (
        <div className="mt-12 space-y-14">
          {Object.entries(groups).map(([cat, items]) => (
            <section key={cat}>
              <Reveal>
                <h2 className="mb-6 font-display text-2xl font-semibold text-pink-700">
                  {CATEGORY_LABELS[cat] ?? cat}
                </h2>
              </Reveal>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {items.map((p, i) => (
                  <Reveal key={p._id} delay={(i % 3) * 0.08}>
                    <PiercingCard piercing={p} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
