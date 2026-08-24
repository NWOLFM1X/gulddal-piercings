import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import { CATEGORY_LABELS, type Piercing } from "@/types";

export function PiercingCard({ piercing }: { piercing: Piercing }) {
  const img = piercing.image?.asset
    ? urlForImage(piercing.image).width(600).height(400).fit("crop").url()
    : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-pink-100 bg-white/80 shadow-sm shadow-pink-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-200">
      <div className="relative aspect-[3/2] overflow-hidden bg-pink-100">
        {img ? (
          <Image
            src={img}
            alt={piercing.name || "Piercing"}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            💎
          </div>
        )}
        {piercing.popular && (
          <span className="absolute left-3 top-3 rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold text-white shadow">
            Populær
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-pink-800">
            {piercing.name}
          </h3>
          {piercing.price != null && (
            <span className="shrink-0 rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-700">
              {piercing.price} kr.
            </span>
          )}
        </div>

        {piercing.category && (
          <p className="mt-1 text-xs uppercase tracking-wide text-pink-400">
            {CATEGORY_LABELS[piercing.category] ?? piercing.category}
          </p>
        )}

        {piercing.description && (
          <p className="mt-3 flex-1 text-sm text-pink-900/70">
            {piercing.description}
          </p>
        )}

        {piercing.durationMinutes != null && (
          <p className="mt-4 text-xs text-pink-900/50">
            ⏱ Ca. {piercing.durationMinutes} min.
          </p>
        )}
      </div>
    </article>
  );
}
