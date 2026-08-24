import Link from "next/link";
import type { SiteSettings } from "@/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const title = settings?.title || "Gulddal Piercings";
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-pink-100 bg-pink-50/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-pink-700">
            {title}
          </h3>
          {settings?.tagline && (
            <p className="mt-2 text-sm text-pink-900/70">{settings.tagline}</p>
          )}
        </div>

        <div className="text-sm text-pink-900/80">
          <h4 className="mb-2 font-semibold text-pink-700">Kontakt</h4>
          {settings?.phone && <p>Tlf: {settings.phone}</p>}
          {settings?.email && <p>{settings.email}</p>}
          {settings?.address && (
            <p className="mt-1 whitespace-pre-line">{settings.address}</p>
          )}
          {settings?.openingHours && (
            <p className="mt-2 whitespace-pre-line">{settings.openingHours}</p>
          )}
        </div>

        <div className="text-sm">
          <h4 className="mb-2 font-semibold text-pink-700">Følg med</h4>
          <div className="flex flex-col gap-1">
            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:underline"
              >
                Instagram
              </a>
            )}
            {settings?.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:underline"
              >
                Facebook
              </a>
            )}
            {settings?.tiktok && (
              <a
                href={settings.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:underline"
              >
                TikTok
              </a>
            )}
          </div>
          <Link
            href="/book"
            className="mt-4 inline-block rounded-full bg-pink-500 px-5 py-2 font-semibold text-white hover:bg-pink-600"
          >
            Book en tid
          </Link>
        </div>
      </div>

      <div className="border-t border-pink-100 py-4 text-center text-xs text-pink-900/50">
        © {year} {title}
      </div>
    </footer>
  );
}
