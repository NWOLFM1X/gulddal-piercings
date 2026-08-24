import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
      <div className="mb-4 text-6xl">💔</div>
      <h1 className="font-display text-4xl font-bold text-pink-900">
        Siden blev ikke fundet
      </h1>
      <p className="mt-3 text-pink-900/70">
        Vi kunne ikke finde den side, du ledte efter.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-md shadow-pink-300 transition-transform hover:scale-105 hover:bg-pink-600"
        >
          Til forsiden
        </Link>
        <Link
          href="/book"
          className="rounded-full border border-pink-300 px-6 py-3 font-semibold text-pink-700 transition-colors hover:bg-pink-100"
        >
          Book en tid
        </Link>
      </div>
    </div>
  );
}
