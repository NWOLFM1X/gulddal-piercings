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
  const [drafts, setDrafts] = useState<Record<string, string[]>>({});

  function draftFor(b: MyBooking): string[] {
    return drafts[b._id] ?? b.piercings?.map((p) => p._id) ?? [];
  }

  function toggleDraft(b: MyBooking, piercingId: string) {
    setDrafts((prev) => {
      const current = prev[b._id] ?? b.piercings?.map((p) => p._id) ?? [];
      const next = current.includes(piercingId)
        ? current.filter((id) => id !== piercingId)
        : [...current, piercingId];
      return { ...prev, [b._id]: next };
    });
  }

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

  async function changePiercings(id: string, piercingIds: string[]) {
    if (piercingIds.length === 0) return;
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}/piercing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ piercingIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke skifte piercing. Prøv igen.");
        return;
      }
      setItems((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, piercings: data.piercings } : b,
        ),
      );
      setDrafts((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
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
                  {b.piercings && b.piercings.length > 0
                    ? b.piercings.map((p) => p.name).join(", ")
                    : "Piercing"}
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
                <label className="mb-1 block text-sm font-medium text-pink-800">
                  Skift piercinger
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {piercings.map((p) => {
                    const selected = draftFor(b).includes(p._id);
                    return (
                      <button
                        key={p._id}
                        type="button"
                        disabled={savingId === b._id}
                        onClick={() => toggleDraft(b, p._id)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          selected
                            ? "border-pink-400 bg-pink-50"
                            : "border-pink-100 bg-white"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-md border text-[10px] text-white ${
                              selected
                                ? "border-pink-500 bg-pink-500"
                                : "border-pink-300 bg-white"
                            }`}
                          >
                            {selected && "✓"}
                          </span>
                          {p.name}
                        </span>
                        {p.price != null && (
                          <span className="text-pink-600">{p.price} kr.</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  disabled={savingId === b._id || draftFor(b).length === 0}
                  onClick={() => changePiercings(b._id, draftFor(b))}
                  className="mt-3 rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingId === b._id ? "Gemmer…" : "Gem ændringer"}
                </button>
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
