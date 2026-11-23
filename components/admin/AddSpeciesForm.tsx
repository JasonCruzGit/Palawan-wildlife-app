"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  categories,
  colors,
  habitats,
  sizes,
  statuses,
} from "@/lib/species";
import { saveCatalogueExtra, slugifyName } from "@/lib/catalogue-extra";
import type { Category, Color, Habitat, Size, Species, Status } from "@/lib/types";

type Kind = "animal" | "plant";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export default function AddSpeciesForm() {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("animal");
  const [name, setName] = useState("");
  const [localName, setLocalName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [category, setCategory] = useState<Category>("Mammals");
  const [status, setStatus] = useState<Status>("Least Concern");
  const [size, setSize] = useState<Size>("medium");
  const [description, setDescription] = useState("");
  const [habitat, setHabitat] = useState("");
  const [diet, setDiet] = useState("");
  const [threats, setThreats] = useState("");
  const [facts, setFacts] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<Color[]>(["brown"]);
  const [selectedHabitats, setSelectedHabitats] = useState<Habitat[]>(["forest"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const slug = useMemo(() => slugifyName(name), [name]);

  const chooseKind = (next: Kind) => {
    setKind(next);
    if (next === "plant") {
      setCategory("Plants");
      setDiet("Photosynthesis / soil nutrients");
      setSelectedColors(["green"]);
    } else if (category === "Plants") {
      setCategory("Mammals");
      setDiet("");
    }
  };

  const toggleColor = (c: Color) => {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const toggleHabitat = (h: Habitat) => {
    setSelectedHabitats((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  };

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

    if (!imageFile) {
      setError("Upload a cover image.");
      return;
    }

    setSaving(true);

    const form = new FormData();
    form.set("name", name);
    form.set("localName", localName || name);
    form.set("scientificName", scientificName);
    form.set("slug", slug);
    form.set("category", kind === "plant" ? "Plants" : category);
    form.set("status", status);
    form.set("size", size);
    form.set("description", description);
    form.set("habitat", habitat);
    form.set(
      "diet",
      diet || (kind === "plant" ? "Photosynthesis / soil nutrients" : "Unknown")
    );
    form.set("threats", threats);
    form.set("facts", facts);
    form.set("colors", JSON.stringify(selectedColors));
    form.set("habitats", JSON.stringify(selectedHabitats));
    form.set("image", imageFile);

    try {
      const res = await fetch("/api/catalogue", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { entry?: Species; error?: string };
      if (!res.ok || !data.entry) {
        throw new Error(data.error || "Save failed.");
      }
      saveCatalogueExtra(data.entry);
      router.push("/admin/catalogue");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save entry.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8" noValidate>
      <fieldset>
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Entry type
        </legend>
        <div className="mt-3 grid grid-cols-2 border border-line" role="group">
          {(
            [
              { id: "animal", label: "Animal", hint: "Species" },
              { id: "plant", label: "Plant", hint: "Flora" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={kind === opt.id}
              onClick={() => chooseKind(opt.id)}
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

      <div className="grid gap-4 @sm:grid-cols-2 @sm:gap-5">
        <label className="block space-y-1 @sm:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Common name *
          </span>
          <input
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Palawan Flowerpecker"
          />
          {slug && (
            <p className="pt-1 font-mono text-[10px] text-ink-soft">Slug: {slug}</p>
          )}
        </label>

        <label className="block space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Local name
          </span>
          <input
            className="input-field"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="Optional"
          />
        </label>

        <label className="block space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Scientific name *
          </span>
          <input
            className="input-field"
            value={scientificName}
            onChange={(e) => setScientificName(e.target.value)}
            required
            placeholder="Genus species"
          />
        </label>

        {kind === "animal" && (
          <label className="block space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              Category
            </span>
            <select
              className="select-field w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {categories
                .filter((c) => c !== "Plants")
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </label>
        )}

        <label className="block space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Conservation status
          </span>
          <select
            className="select-field w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Size
          </span>
          <select
            className="select-field w-full"
            value={size}
            onChange={(e) => setSize(e.target.value as Size)}
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2 @sm:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Cover image *
          </span>
          <label className="flex cursor-pointer flex-col overflow-hidden border border-dashed border-line bg-mist/20 transition hover:border-ink">
            {previewUrl ? (
              <div className="relative aspect-[16/9] w-full bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-ink/70 px-4 py-3">
                  <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-paper">
                    {imageFile?.name}
                  </p>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-paper/80">
                    Change
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <span className="font-display text-lg font-bold text-ink">Upload photo</span>
                <span className="max-w-xs text-sm text-ink-soft">
                  JPG, PNG, WebP, or GIF · up to 8 MB
                </span>
                <span className="mt-2 border border-line bg-paper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
                  Choose file
                </span>
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
              Remove image
            </button>
          )}
        </div>
      </div>

      <label className="block space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Description *
        </span>
        <textarea
          className="input-field min-h-[100px] resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Short field-guide summary"
        />
      </label>

      <div className="grid gap-4 @sm:grid-cols-2 @sm:gap-5">
        <label className="block space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Habitat summary *
          </span>
          <textarea
            className="input-field min-h-[72px] resize-y"
            value={habitat}
            onChange={(e) => setHabitat(e.target.value)}
            required
            placeholder="Where it is typically found"
          />
        </label>
        <label className="block space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Diet / ecology
          </span>
          <textarea
            className="input-field min-h-[72px] resize-y"
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            placeholder={kind === "plant" ? "Photosynthesis / soil nutrients" : "What it eats"}
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Threats
        </span>
        <input
          className="input-field"
          value={threats}
          onChange={(e) => setThreats(e.target.value)}
          placeholder="Comma-separated, e.g. Habitat loss, Hunting"
        />
      </label>

      <label className="block space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Facts
        </span>
        <textarea
          className="input-field min-h-[72px] resize-y"
          value={facts}
          onChange={(e) => setFacts(e.target.value)}
          placeholder="One fact per line"
        />
      </label>

      <fieldset>
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Colors
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {colors.map((c) => {
            const on = selectedColors.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleColor(c)}
                className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                  on ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Habitat tags
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {habitats.map((h) => {
            const on = selectedHabitats.includes(h);
            return (
              <button
                key={h}
                type="button"
                onClick={() => toggleHabitat(h)}
                className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                  on ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink"
                }`}
              >
                {h}
              </button>
            );
          })}
        </div>
      </fieldset>

      {error && <p className="text-sm text-signal">{error}</p>}

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <button
          type="submit"
          disabled={saving}
          className="bg-signal px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper hover:bg-signal-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : kind === "plant" ? "Add plant" : "Add species"}
        </button>
        <Link
          href="/admin/catalogue"
          className="border border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:border-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
