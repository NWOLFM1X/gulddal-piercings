"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SiteSettings } from "@/types";

const links = [
  { href: "/", label: "Forside" },
  { href: "/piercinger", label: "Piercinger" },
  { href: "/forberedelse", label: "Før din booking" },
  { href: "/efterbehandling", label: "Efterbehandling" },
  { href: "/book", label: "Book tid" },
];

export function Header({
  settings,
}: {
  settings: SiteSettings;
}) {
  const [open, setOpen] = useState(false);
  const title = settings?.title || "Gulddal Piercings";

  return (
    <header className="sticky top-0 z-40 border-b border-pink-100/70 bg-pink-50/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-xl font-semibold text-pink-700">
          {title}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-pink-800 transition-colors hover:bg-pink-100"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/book"
            className="ml-2 rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-pink-300 transition-transform hover:scale-105 hover:bg-pink-600"
          >
            Book nu
          </Link>
        </nav>

        <button
          className="rounded-full p-2 text-pink-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-pink-100 bg-pink-50 md:hidden"
          >
            <div className="flex flex-col p-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 font-medium text-pink-800 hover:bg-pink-100"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
