"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readSession } from "@/lib/auth";
import { upsertLocalReport } from "@/lib/reports";
import { species } from "@/lib/species";
import type { PartnerReport, ReportKind, Species } from "@/lib/types";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export default function PartnerReportForm() {
  const [kind, setKind] = useState<ReportKind>("animal");
  const [speciesSlug, setSpeciesSlug] = useState("");
  const [customName, setCustomName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<PartnerReport | null>(null);

  const catalogue = useMemo(() => {
    const list =
      kind === "plant"
        ? species.filter((s) => s.category === "Plants")
        : species.filter((s) => s.category !== "Plants");
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [kind]);

  const selected: Species | undefined = catalogue.find((s) => s.slug === speciesSlug);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    setSpeciesSlug("");
    setCustomName("");
    setScientificName("");
  }, [kind]);

  useEffect(() => {
    if (selected) {
      setScientificName(selected.scientificName);
      setCustomName("");
    }
  }, [selected]);

  const onPickImage = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Use a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be under 8 MB.");
      return;
    }
    setError(null);
    setImageFile(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const user = readSession();
    if (!user || user.role !== "partner") {
      setError("Community account required. Sign in as a student, visitor, or member.");
      return;
    }

    const speciesName = selected?.name || customName.trim();
    if (!speciesName) {
      setError("Pick a catalogue entry or enter a name.");
      return;
    }

    setSaving(true);
    const form = new FormData();
    form.set("kind", kind);
    form.set("speciesName", speciesName);
    form.set("scientificName", scientificName || selected?.scientificName || "");
    form.set("speciesSlug", selected?.slug || "");
    form.set("location", location);
    form.set("lat", lat);
    form.set("lng", lng);
    form.set("date", date);
    form.set("notes", notes);
    form.set("submittedBy", user.name);
    form.set("submittedByEmail", user.email);
    if (imageFile) form.set("image", imageFile);

    try {
      const res = await fetch("/api/reports", { method: "POST", body: form });
      const data = (await res.json()) as { report?: PartnerReport; error?: string };
      if (!res.ok || !data.report) throw new Error(data.error || "Submit failed.");
      upsertLocalReport(data.report);
      setDone(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit report.");
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="border border-line bg-mist/30 px-5 py-10 text-center sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-lagoon">
          Sent to admin
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold text-ink">Report submitted</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          <span className="text-ink">{done.speciesName}</span> at {done.location} is in the admin
          review queue. You earn points when it is verified.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setDone(null);
              setSaving(false);
              setNotes("");
              setLocation("");
              setLat("");
              setLng("");
              setImageFile(null);
              setSpeciesSlug("");
              setCustomName("");
              setScientificName("");
            }}
            className="bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:bg-mangrove"
          >
            Submit another
          </button>
          <Link
            href="/partner"
            className="border border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:border-ink"
          >
            Community dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8" noValidate>
      <fieldset>
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          What are you reporting?
        </legend>
        <div className="mt-3 grid grid-cols-2 border border-line" role="group">
          {(
            [
              { id: "animal" as const, label: "Animal", hint: "Species" },
              { id: "plant" as const, label: "Plant", hint: "Flora" },
            ]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={kind === opt.id}
              onClick={() => setKind(opt.id)}
              className={`px-4 py-3 text-left transition ${
                kind === opt.id ? "bg-ink text-paper" : "bg-paper text-ink-soft hover:text-ink"
              } ${opt.id === "plant" ? "border-l border-line" : ""}`}
            >
              <span className="block font-display text-base font-bold tracking-tight">
                {opt.label}
              </span>
              <span
                className={`mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] ${
                  kind === opt.id ? "text-paper/65" : "text-ink-soft"
                }`}
              >
                {opt.hint}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Catalogue match
        </span>
        <select
          className="select-field w-full"
          value={speciesSlug}
          onChange={(e) => setSpeciesSlug(e.target.value)}
        >
          <option value="">Not in catalogue / other…</option>
          {catalogue.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      {!selected && (
        <div className="grid gap-4 @sm:grid-cols-2 @sm:gap-5">
          <label className="block space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              {kind === "plant" ? "Plant name" : "Species name"} *
            </span>
            <input
              className="input-field"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              required={!selected}
              placeholder="Common name"
            />
          </label>
          <label className="block space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              Scientific name
            </span>
            <input
              className="input-field"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>
      )}

      {selected && (
        <p className="border border-line bg-mist/40 px-4 py-3 text-sm text-ink-soft">
          Reporting <span className="font-medium text-ink">{selected.name}</span>
          <span className="italic"> ({selected.scientificName})</span>
        </p>
      )}

      <div className="grid gap-4 @sm:grid-cols-2 @sm:gap-5">
        <label className="block space-y-1 @sm:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Location *
          </span>
          <input
            className="input-field"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="e.g. Puerto Princesa Subterranean River NP"
          />
        </label>
        <label className="block space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Latitude
          </span>
          <input
            className="input-field"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="10.192"
          />
        </label>
        <label className="block space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Longitude
          </span>
          <input
            className="input-field"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="118.926"
          />
        </label>
        <label className="block space-y-1 @sm:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Date seen
          </span>
          <input
            className="input-field"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Field notes *
        </span>
        <textarea
          className="input-field min-h-[100px] resize-y"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
          placeholder="Behavior, habitat, count, confidence…"
        />
      </label>

      <div className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Photo (optional)
        </span>
        <label className="flex cursor-pointer flex-col overflow-hidden border border-dashed border-line bg-mist/20 transition hover:border-ink">
          {previewUrl ? (
            <div className="relative aspect-[16/9] w-full bg-mist">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Report preview" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-ink/70 px-4 py-3">
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-paper">
                  {imageFile?.name} · Change
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <span className="font-display text-base font-bold text-ink">Attach photo</span>
              <span className="text-sm text-ink-soft">JPG, PNG, WebP, or GIF · up to 8 MB</span>
            </div>
          )}
          <input
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
          />
        </label>
        {imageFile && (
          <button
            type="button"
            onClick={() => setImageFile(null)}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal hover:underline"
          >
            Remove photo
          </button>
        )}
      </div>

      {error && <p className="text-sm text-signal">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-signal py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-signal-dark disabled:opacity-60"
      >
        {saving ? "Sending…" : "Send to admin"}
      </button>
    </form>
  );
}
