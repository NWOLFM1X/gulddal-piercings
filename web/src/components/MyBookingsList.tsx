"use client";

import { useState } from "react";
import type { MyBooking, Piercing } from "@/types";

function formatSlot(iso?: string) {
  if (!iso) return "Tid ukendt";
  return new Date(iso).toLocaleString("da-DK", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Copenhagen",
  });
}

const STATUS_LABEL: Record<string, string> = {
  new: "Afventer bekræftelse",
  confirmed: "Bekræftet",
  cancelled: "Aflyst",
};

const STATUS_STYLE: Record<string, string> = {
  new: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-pink-100 text-pink-500",
};

export function MyBookingsList({
  bookings,
  piercings,
}: {
  bookings: MyBooking[];
  piercings: Piercing[];
}) {
  const [items, setItems] = useState(bookings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cancel(id: string) {
    if (!confirm("Er du sikker på, at du vil aflyse denne booking?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke aflyse. Prøv igen.");
        return;
      }
      setItems((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)),
      );
    } catch {
      setError("Kunne ikke oprette forbindelse. Prøv igen.");
    } finally {
      setBusyId(null);
    }
  }

  async function changePiercing(id: string, piercingId: string) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}/piercing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ piercingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke skifte piercing. Prøv igen.");
        return;
      }
      setItems((prev) =>
        prev.map((b) =>
          b._id === id
            ? { ...b, piercingId, piercingName: data.piercingName }
            : b,
        ),
      );
    } catch {
      setError("Kunne ikke oprette forbindelse. Prøv igen.");
    } finally {
      setSavingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-pink-100 bg-white/80 p-10 text-center shadow-lg shadow-pink-100">
        <p className="text-pink-900/70">Du har ingen bookinger endnu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {items.map((b) => {
        const status = b.status ?? "new";
        const isPast = b.slotStartsAt
          ? new Date(b.slotStartsAt) < new Date()
          : false;
        const canCancel = status !== "cancelled" && !isPast;
        const canChange = status !== "cancelled" && !isPast;
        return (
          <div
            key={b._id}
            className="rounded-3xl border border-pink-100 bg-white/80 p-5 shadow-lg shadow-pink-100 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-pink-800">
                  {b.piercingName ?? "Piercing"}
                </h3>
                <p className="mt-1 text-sm capitalize text-pink-900/70">
                  {formatSlot(b.slotStartsAt)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  STATUS_STYLE[status] ?? "bg-pink-100 text-pink-600"
                }`}
              >
                {STATUS_LABEL[status] ?? status}
              </span>
            </div>

            {canChange && piercings.length > 0 && (
              <div className="mt-4">
                <label
                  htmlFor={`piercing-${b._id}`}
                  className="mb-1 block text-sm font-medium text-pink-800"
                >
                  Skift piercing
                </label>
                <select
                  id={`piercing-${b._id}`}
                  value={b.piercingId ?? ""}
                  disabled={savingId === b._id}
                  onChange={(e) => changePiercing(b._id, e.target.value)}
                  className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-2.5 text-pink-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {b.piercingId == null && (
                    <option value="" disabled>
                      Vælg piercing
                    </option>
                  )}
                  {piercings.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                      {p.price != null ? ` · ${p.price} kr.` : ""}
                    </option>
                  ))}
                </select>
                {savingId === b._id && (
                  <p className="mt-1 text-xs text-pink-600">Gemmer…</p>
                )}
              </div>
            )}

            {canCancel && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => cancel(b._id)}
                  disabled={busyId === b._id}
                  className="rounded-full border border-pink-300 px-5 py-2 text-sm font-semibold text-pink-600 transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyId === b._id ? "Aflyser…" : "Aflys booking"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
