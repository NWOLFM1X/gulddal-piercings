import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { beforeBookingQuery } from "@/sanity/lib/queries";
import { Reveal } from "@/components/Reveal";
import type { BeforeBooking } from "@/types";

export const metadata: Metadata = {
  title: "Før din booking",
  description:
    "Hvad du skal huske, forberede og informere din piercingartist om inden din tid.",
};

export default async function ForberedelsePage() {
  const { data } = await sanityFetch({ query: beforeBookingQuery });
  const page = data as BeforeBooking;

  const heading = page?.heading || "Før din booking";

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-bold text-pink-900">
          {heading}
        </h1>
        {page?.intro && (
          <p className="mt-3 max-w-xl text-pink-900/70">{page.intro}</p>
        )}
      </Reveal>

      {page?.sections && page.sections.length > 0 ? (
        <div className="mt-10 space-y-10">
          {page.sections.map((section, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="rounded-2xl border border-pink-100 bg-white/60 p-6 shadow-sm">
                {section.title && (
                  <h2 className="mb-4 font-display text-xl font-semibold text-pink-800">
                    {section.title}
                  </h2>
                )}
                {(section.body?.length ?? 0) > 0 ? (
                  <div className="prose prose-pink max-w-none text-pink-900/80">
                    <PortableText value={section.body!} />
                  </div>
                ) : (
                  <p className="text-sm text-pink-900/40">
                    Indhold tilføjes snart.
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal delay={0.1}>
          <p className="mt-10 text-pink-900/60">
            Der er endnu ikke tilføjet indhold til denne side.
          </p>
        </Reveal>
      )}
    </div>
  );
}
