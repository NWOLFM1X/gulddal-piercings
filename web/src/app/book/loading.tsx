export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto h-10 w-48 animate-pulse rounded-full bg-pink-100" />
        <div className="mx-auto mt-4 h-4 w-72 animate-pulse rounded-full bg-pink-100" />
      </div>
      <div className="rounded-3xl border border-pink-100 bg-white/70 p-8 shadow-lg shadow-pink-100">
        <div className="mb-8 flex justify-center gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-8 w-8 animate-pulse rounded-full bg-pink-100"
            />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-pink-50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
