"use client";

import { useState } from "react";
import type { Species } from "@/lib/types";

type FormState = {
  speciesSlug: string;
  location: string;
  lat: string;
  lng: string;
  date: string;
  notes: string;
  contact: string;
  photoName: string;
};

const empty: FormState = {
  speciesSlug: "",
  location: "",
  lat: "",
  lng: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
  contact: "",
  photoName: "",
};

export default function ReportForm({ speciesList }: { speciesList: Species[] }) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [done, setDone] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const useGps = () => {
    if (!navigator.geolocation) {
      setErrors((e) => ({ ...e, lat: "Geolocation not supported on this device" }));
      return;
    }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("lat", pos.coords.latitude.toFixed(5));
        set("lng", pos.coords.longitude.toFixed(5));
        setGpsBusy(false);
      },
      () => {
        setErrors((e) => ({ ...e, lat: "Could not get location — enter manually" }));
        setGpsBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!form.speciesSlug) next.speciesSlug = "Select a species";
    if (!form.location.trim()) next.location = "Location is required";
    if (!form.date) next.date = "Date is required";
    if (!form.contact.trim()) next.contact = "Contact is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    console.log("Sighting report", form);
    setDone(true);
  };

  if (done) {
    return (
      <div className="border border-line bg-mist/50 px-6 py-12 text-center">
        <p className="font-display text-2xl font-bold tracking-tight text-ink">
          Sighting logged
        </p>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">
          In a live system this would go to staff for review. Thank you for paying attention
          out there.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(empty);
            setDone(false);
          }}
          className="mt-8 bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:bg-mangrove"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-7" noValidate>
      <Field label="Species" error={errors.speciesSlug}>
        <select
          value={form.speciesSlug}
          onChange={(e) => set("speciesSlug", e.target.value)}
          className="select-field w-full"
          required
        >
          <option value="">Select…</option>
          {speciesList.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name} ({s.localName})
            </option>
          ))}
        </select>
      </Field>

      <Field label="Photo" hint="Camera or gallery — optional">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => set("photoName", e.target.files?.[0]?.name ?? "")}
          className="mt-1 block w-full font-mono text-xs text-ink-soft file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:font-mono file:text-[10px] file:uppercase file:tracking-wider file:text-paper"
        />
        {form.photoName && (
          <p className="mt-1 font-mono text-[10px] text-ink-soft">{form.photoName}</p>
        )}
      </Field>

      <Field label="Location" error={errors.location}>
        <input
          type="text"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="e.g. El Nido — Nacpan Beach"
          className="input-field"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Latitude" error={errors.lat}>
          <input
            type="text"
            inputMode="decimal"
            value={form.lat}
            onChange={(e) => set("lat", e.target.value)}
            placeholder="Optional"
            className="input-field"
          />
        </Field>
        <Field label="Longitude">
          <input
            type="text"
            inputMode="decimal"
            value={form.lng}
            onChange={(e) => set("lng", e.target.value)}
            placeholder="Optional"
            className="input-field"
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={useGps}
        disabled={gpsBusy}
        className="border border-lagoon px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-lagoon hover:bg-lagoon hover:text-paper disabled:opacity-50"
      >
        {gpsBusy ? "Reading GPS…" : "Use GPS"}
      </button>

      <Field label="Date" error={errors.date}>
        <input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className="input-field"
        />
      </Field>

      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Behavior, count, habitat…"
          className="input-field resize-y"
        />
      </Field>

      <Field label="Contact" error={errors.contact}>
        <input
          type="text"
          value={form.contact}
          onChange={(e) => set("contact", e.target.value)}
          placeholder="+63 … or email"
          className="input-field"
        />
      </Field>

      <button
        type="submit"
        className="w-full bg-signal py-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-signal-dark sm:w-auto sm:px-10"
      >
        Submit sighting
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
        {label}
      </span>
      {hint && <span className="block text-xs text-ink-soft/80">{hint}</span>}
      {children}
      {error && <span className="block text-xs text-signal">{error}</span>}
    </label>
  );
}
