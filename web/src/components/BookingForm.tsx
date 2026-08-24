"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Piercing, Slot } from "@/types";

type Step = 0 | 1 | 2 | 3;

function formatSlot(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("da-DK", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingForm({
  piercings,
  slots,
}: {
  piercings: Piercing[];
  slots: Slot[];
}) {
  const [step, setStep] = useState<Step>(0);
  const [piercing, setPiercing] = useState<Piercing | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const upcomingSlots = useMemo(
    () =>
      slots
        .filter((s) => s.startsAt && new Date(s.startsAt) > new Date())
        .sort(
          (a, b) =>
            new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime(),
        ),
    [slots],
  );

  async function submit() {
    if (!piercing || !slot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          company,
          piercingId: piercing._id,
          slotId: slot._id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Noget gik galt. Prøv igen.");
        return;
      }
      setDone(true);
    } catch {
      setError("Kunne ikke oprette forbindelse. Prøv igen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-pink-100 bg-white/90 p-10 text-center shadow-lg shadow-pink-100"
      >
        <div className="mb-4 text-5xl">🎉</div>
        <h2 className="font-display text-2xl font-semibold text-pink-700">
          Tak for din booking!
        </h2>
        <p className="mt-3 text-pink-900/70">
          Vi har modtaget din anmodning om <strong>{piercing?.name}</strong>
          <br />
          {formatSlot(slot?.startsAt)}.
        </p>
        <p className="mt-2 text-sm text-pink-900/60">
          Du hører fra os hvis der er spørgsmål. Vi glæder os til at se dig!
        </p>
      </motion.div>
    );
  }

  const steps = ["Piercing", "Tid", "Dine oplysninger"];

  return (
    <div className="rounded-3xl border border-pink-100 bg-white/80 p-6 shadow-lg shadow-pink-100 sm:p-8">
      {/* Trin-indikator */}
      <ol className="mb-8 flex items-center justify-center gap-2 text-sm">
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold transition-colors ${
                i <= step
                  ? "bg-pink-500 text-white"
                  : "bg-pink-100 text-pink-400"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden sm:inline ${
                i <= step ? "text-pink-700" : "text-pink-400"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 h-px w-6 bg-pink-200" />
            )}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        {/* Trin 1: vælg piercing */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="mb-4 font-display text-xl font-semibold text-pink-800">
              Hvilken piercing vil du have?
            </h2>
            {piercings.length === 0 ? (
              <p className="text-pink-900/60">
                Der er ingen piercinger tilgængelige lige nu.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {piercings.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setPiercing(p);
                      setStep(1);
                    }}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      piercing?._id === p._id
                        ? "border-pink-400 bg-pink-50"
                        : "border-pink-100 bg-white"
                    }`}
                  >
                    <span className="font-medium text-pink-800">{p.name}</span>
                    {p.price != null && (
                      <span className="text-sm font-semibold text-pink-600">
                        {p.price} kr.
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Trin 2: vælg tid */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="mb-4 font-display text-xl font-semibold text-pink-800">
              Vælg en ledig tid
            </h2>
            {upcomingSlots.length === 0 ? (
              <p className="text-pink-900/60">
                Der er ingen ledige tider lige nu. Kig forbi igen senere.
              </p>
            ) : (
              <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {upcomingSlots.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => {
                      setSlot(s);
                      setStep(2);
                    }}
                    className={`rounded-2xl border p-3 text-left text-sm capitalize transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      slot?._id === s._id
                        ? "border-pink-400 bg-pink-50"
                        : "border-pink-100 bg-white"
                    }`}
                  >
                    {formatSlot(s.startsAt)}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setStep(0)}
              className="mt-6 text-sm text-pink-600 hover:underline"
            >
              ← Tilbage
            </button>
          </motion.div>
        )}

        {/* Trin 3: oplysninger */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="mb-1 font-display text-xl font-semibold text-pink-800">
              Dine oplysninger
            </h2>
            <p className="mb-5 text-sm text-pink-900/60">
              {piercing?.name} · <span className="capitalize">{formatSlot(slot?.startsAt)}</span>
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-4"
            >
              <Field
                label="Navn"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                required
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                required
              />
              <Field
                label="Telefon"
                type="tel"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                required
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-pink-800">
                  Besked (valgfrit)
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 text-pink-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                />
              </div>

              {/* Honeypot – skjult for mennesker */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-pink-600 hover:underline"
                >
                  ← Tilbage
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-pink-500 px-7 py-3 font-semibold text-white shadow-sm shadow-pink-300 transition-transform hover:scale-105 hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Sender…" : "Bekræft booking"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-pink-800">
        {label} {required && <span className="text-pink-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 text-pink-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
      />
    </div>
  );
}
