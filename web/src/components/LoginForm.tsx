"use client";

import { useState } from "react";

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, returnTo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Noget gik galt. Prøv igen.");
        return;
      }
      setSent(true);
    } catch {
      setError("Kunne ikke oprette forbindelse. Prøv igen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-pink-100 bg-white/90 p-10 text-center shadow-lg shadow-pink-100">
        <div className="mb-4 text-5xl">📬</div>
        <h2 className="font-display text-2xl font-semibold text-pink-700">
          Tjek din mail
        </h2>
        <p className="mt-3 text-pink-900/70">
          Vi har sendt et login-link til <strong>{email}</strong>. Klik på linket
          for at logge ind. Det udløber om 15 minutter.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-pink-100 bg-white/80 p-6 shadow-lg shadow-pink-100 sm:p-8">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-pink-800">
            Email <span className="text-pink-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            required
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dig@eksempel.dk"
            className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 text-pink-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-pink-500 px-7 py-3 font-semibold text-white shadow-sm shadow-pink-300 transition-transform hover:scale-105 hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sender…" : "Send login-link"}
        </button>
      </form>
    </div>
  );
}
