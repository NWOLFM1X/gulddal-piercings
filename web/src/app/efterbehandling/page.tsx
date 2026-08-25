import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { aftercareQuery } from "@/sanity/lib/queries";
import { Reveal } from "@/components/Reveal";
import type { Aftercare } from "@/types";

export const metadata: Metadata = {
  title: "Efterbehandling",
  description: "Sådan passer du bedst på din nye piercing.",
};

export default async function EfterbehandlingPage() {
  const { data } = await sanityFetch({ query: aftercareQuery });
  const aftercare = data as Aftercare;

  const heading = aftercare?.heading || "Efterbehandling";
  const hasBody = (aftercare?.body?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-bold text-pink-900">
          {heading}
        </h1>
        {aftercare?.intro && (
          <p className="mt-3 max-w-xl text-pink-900/70">{aftercare.intro}</p>
        )}
      </Reveal>

      <Reveal delay={0.1}>
        <div className="prose prose-pink mt-10 max-w-none text-pink-900/80">
          {hasBody ? (
            <PortableText value={aftercare!.body!} />
          ) : (
            <p className="text-pink-900/60">
              Der er endnu ikke tilføjet en plejevejledning.
            </p>
          )}
        </div>
      </Reveal>
    </div>
  );
}
