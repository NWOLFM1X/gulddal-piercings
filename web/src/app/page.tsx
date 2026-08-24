import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { homePageQuery, piercingsQuery } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { Reveal } from "@/components/Reveal";
import { PiercingCard } from "@/components/PiercingCard";
import type { HomePage, Piercing } from "@/types";

export default async function Home() {
  const [{ data: home }, { data: piercings }] = await Promise.all([
    sanityFetch({ query: homePageQuery }),
    sanityFetch({ query: piercingsQuery }),
  ]);

  const page = home as HomePage;
  const list = (piercings as Piercing[]) ?? [];
  const featured = list.filter((p) => p.popular).slice(0, 3);
  const showcase = (featured.length ? featured : list).slice(0, 3);

  const heroImg = page?.heroImage?.asset
    ? urlForImage(page.heroImage).width(900).height(1100).fit("crop").url()
    : null;
  const aboutImg = page?.aboutImage?.asset
    ? urlForImage(page.aboutImage).width(800).height(800).fit("crop").url()
    : null;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <Reveal>
            <p className="mb-4 inline-block rounded-full bg-pink-100 px-4 py-1 text-sm font-medium text-pink-700">
              ✨ Piercinger med omhu
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-pink-900 sm:text-5xl md:text-6xl">
              <span className="text-gradient">
                {page?.heroHeading || "Gulddal Piercings"}
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-pink-900/70">
              {page?.heroSubheading ||
                "Professionelle piercinger i trygge, rene og hyggelige rammer. Book din tid online på få klik."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/book"
                className="rounded-full bg-pink-500 px-7 py-3 font-semibold text-white shadow-md shadow-pink-300 transition-transform hover:scale-105 hover:bg-pink-600"
              >
                Book en tid
              </Link>
              <Link
                href="/piercinger"
                className="rounded-full border border-pink-300 px-7 py-3 font-semibold text-pink-700 transition-colors hover:bg-pink-100"
              >
                Se piercinger
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
              <div className="animate-float absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-pink-200 to-pink-400 opacity-60 blur-2xl" />
              <div className="animate-float relative h-full w-full overflow-hidden rounded-[2.5rem] border-4 border-white shadow-xl">
                {heroImg ? (
                  <Image
                    src={heroImg}
                    alt={page?.heroHeading || "Gulddal Piercings"}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-pink-100 text-7xl">
                    💎
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FREMHÆVEDE PIERCINGER */}
      {showcase.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-12">
          <Reveal>
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-3xl font-semibold text-pink-800">
                Populære piercinger
              </h2>
              <Link
                href="/piercinger"
                className="text-sm font-medium text-pink-600 hover:underline"
              >
                Se alle →
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {showcase.map((p, i) => (
              <Reveal key={p._id} delay={i * 0.1}>
                <PiercingCard piercing={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* OM MIG */}
      {(page?.aboutBody || aboutImg) && (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            {aboutImg && (
              <Reveal>
                <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-4 border-white shadow-lg">
                  <Image
                    src={aboutImg}
                    alt={page?.aboutHeading || "Om mig"}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            )}
            <Reveal delay={0.1}>
              <h2 className="font-display text-3xl font-semibold text-pink-800">
                {page?.aboutHeading || "Om mig"}
              </h2>
              <div className="prose prose-pink mt-4 max-w-none text-pink-900/75">
                {page?.aboutBody ? (
                  <PortableText value={page.aboutBody} />
                ) : (
                  <p>Skriv lidt om dig selv i Studio&apos;en, så det vises her.</p>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* GALLERI */}
      {page?.gallery && page.gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-12">
          <Reveal>
            <h2 className="mb-8 font-display text-3xl font-semibold text-pink-800">
              Galleri
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {page.gallery.map((img, i) =>
              img?.asset ? (
                <Reveal key={i} delay={(i % 4) * 0.08}>
                  <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-white shadow-sm">
                    <Image
                      src={urlForImage(img).width(400).height(400).fit("crop").url()}
                      alt={img.alt || "Galleri-billede"}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                </Reveal>
              ) : null,
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      {page?.faq && page.faq.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 py-16">
          <Reveal>
            <h2 className="mb-8 text-center font-display text-3xl font-semibold text-pink-800">
              Spørgsmål &amp; svar
            </h2>
          </Reveal>
          <div className="space-y-3">
            {page.faq.map((item, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <details className="group rounded-2xl border border-pink-100 bg-white/80 p-5 open:shadow-md">
                  <summary className="cursor-pointer list-none font-medium text-pink-800 marker:hidden">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-pink-900/70">{item.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <div className="rounded-[2.5rem] bg-gradient-to-br from-pink-400 to-pink-600 px-8 py-14 text-center text-white shadow-xl">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Klar til din næste piercing?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/85">
              Vælg piercing og tid – det tager under et minut at booke.
            </p>
            <Link
              href="/book"
              className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-pink-600 shadow-md transition-transform hover:scale-105"
            >
              Book en tid
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
