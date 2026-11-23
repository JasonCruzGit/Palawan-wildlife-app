"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { IdentifyMode, IdentifyResult } from "@/lib/identify";

type State =
  | { status: "idle" }
  | { status: "preview"; file: File; previewUrl: string }
  | { status: "loading"; file: File; previewUrl: string }
  | {
      status: "done";
      file: File;
      previewUrl: string;
      result: IdentifyResult;
      cached?: boolean;
    }
  | { status: "error"; file?: File; previewUrl?: string; message: string };

export default function PhotoIdentifier() {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<IdentifyMode | null>(null);
  const [state, setState] = useState<State>({ status: "idle" });

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!mode) {
      setState({ status: "error", message: "Select plant or species first." });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setState({ status: "error", message: "Please choose an image file." });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setState({ status: "error", message: "Image must be under 4 MB." });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (state.status !== "idle" && "previewUrl" in state && state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ status: "preview", file, previewUrl });
  };

  const chooseMode = (next: IdentifyMode) => {
    setMode(next);
    if (state.status === "error" && !state.previewUrl) {
      setState({ status: "idle" });
    }
  };

  const reset = () => {
    if (state.status !== "idle" && "previewUrl" in state && state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ status: "idle" });
    setMode(null);
    if (cameraRef.current) cameraRef.current.value = "";
    if (uploadRef.current) uploadRef.current.value = "";
  };

  const identify = async () => {
    if (state.status !== "preview" && state.status !== "error") return;
    if (!state.file || !state.previewUrl || !mode) return;

    const { file, previewUrl } = state;
    setState({ status: "loading", file, previewUrl });

    try {
      const body = new FormData();
      body.append("image", file);
      body.append("mode", mode);

      const res = await fetch("/api/identify", { method: "POST", body });
      const data = (await res.json()) as {
        result?: IdentifyResult;
        cached?: boolean;
        error?: string;
      };

      if (!res.ok || !data.result) {
        setState({
          status: "error",
          file,
          previewUrl,
          message: data.error ?? "Identification failed.",
        });
        return;
      }

      setState({
        status: "done",
        file,
        previewUrl,
        result: data.result,
        cached: Boolean(data.cached),
      });
    } catch {
      setState({
        status: "error",
        file,
        previewUrl,
        message: "Network error. Check your connection and try again.",
      });
    }
  };

  const hasPreview =
    state.status === "preview" ||
    state.status === "loading" ||
    state.status === "done" ||
    (state.status === "error" && !!state.previewUrl);

  const showCapture = mode !== null && !hasPreview;

  return (
    <div className="border border-line bg-mist/30">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          Camera ID
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
          Species & plant identifier
        </h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Choose plant or species first, then take or upload a photo. Palawan Wildlife AI is tuned
          for Palawan field use.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="border-b border-line p-5 sm:p-6 lg:border-b-0 lg:border-r">
          {/* Step 1 — mode */}
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              1 · What are you identifying?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ModeButton
                active={mode === "animal"}
                disabled={state.status === "loading"}
                onClick={() => chooseMode("animal")}
                label="Species"
                hint="Animals"
              />
              <ModeButton
                active={mode === "plant"}
                disabled={state.status === "loading"}
                onClick={() => chooseMode("plant")}
                label="Plant"
                hint="Flora"
              />
            </div>
          </div>

          {/* Step 2 — photo */}
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            2 · Photo
          </p>

          {!mode ? (
            <div className="flex aspect-[4/3] flex-col items-center justify-center border border-dashed border-line bg-paper px-4 text-center">
              <p className="max-w-xs text-sm text-ink-soft">
                Select <strong className="font-medium text-ink">Species</strong> or{" "}
                <strong className="font-medium text-ink">Plant</strong> above to continue.
              </p>
            </div>
          ) : showCapture ? (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 border border-dashed border-line bg-paper px-4 text-center">
              <p className="max-w-xs text-sm text-ink-soft">
                {mode === "plant"
                  ? "Photograph the plant — leaf, flower, bark, or whole form."
                  : "Photograph the animal — clear, close shots work best."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:bg-mangrove"
                >
                  Take photo
                </button>
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="border border-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:bg-ink hover:text-paper"
                >
                  Upload image
                </button>
              </div>
              {state.status === "error" && (
                <p className="text-sm text-signal">{state.message}</p>
              )}
            </div>
          ) : hasPreview ? (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={"previewUrl" in state ? state.previewUrl! : ""}
                  alt="Selected for identification"
                  className="h-full w-full object-contain"
                />
                {state.status === "loading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/55">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper">
                      Identifying {mode}…
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {(state.status === "preview" || state.status === "error") && (
                  <button
                    type="button"
                    onClick={identify}
                    className="bg-signal px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:bg-signal-dark"
                  >
                    Identify {mode === "plant" ? "plant" : "species"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="border border-line px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft hover:border-ink hover:text-ink"
                >
                  Retake
                </button>
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="border border-line px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft hover:border-ink hover:text-ink"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="border border-line px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft hover:border-ink hover:text-ink"
                >
                  Clear
                </button>
              </div>
              {state.status === "error" && (
                <p className="text-sm text-signal">{state.message}</p>
              )}
            </div>
          ) : null}

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <input
            ref={uploadRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>

        <div className="p-5 sm:p-6">
          {state.status === "done" ? (
            <ResultPanel result={state.result} cached={state.cached} onAgain={reset} />
          ) : state.status === "loading" ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Reading {mode === "plant" ? "plant" : "species"} with Palawan Wildlife AI…
            </p>
          ) : (
            <div className="space-y-3 text-sm text-ink-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]">Tips</p>
              <ul className="space-y-2">
                <li>Pick Species for animals, Plant for flora — before you shoot.</li>
                <li>Fill the frame with the subject when you can.</li>
                <li>
                  {mode === "plant"
                    ? "Leaves, flowers, and bark details help plant ID."
                    : mode === "animal"
                      ? "Side views and distinctive markings help animal ID."
                      : "Species matches can link straight to the catalogue."}
                </li>
                <li>
                  Same photo + mode is reused from cache (no new tokens). A new photo still calls
                  Palawan Wildlife AI.
                </li>
                <li>AI can be wrong — treat results as a field suggestion, not a final ID.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  disabled,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`border px-4 py-4 text-left transition disabled:opacity-50 ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-paper text-ink hover:border-ink"
      }`}
    >
      <span className="block font-display text-lg font-bold tracking-tight">{label}</span>
      <span
        className={`mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] ${
          active ? "text-paper/70" : "text-ink-soft"
        }`}
      >
        {hint}
      </span>
    </button>
  );
}

function ResultPanel({
  result,
  cached,
  onAgain,
}: {
  result: IdentifyResult;
  cached?: boolean;
  onAgain: () => void;
}) {
  const pct = Math.round(result.confidence * 100);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          {result.kind} · {pct}% confidence
          {cached ? " · cached (no new tokens)" : ""}
        </p>
        <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          {result.commonName}
        </h3>
        {result.localName && <p className="mt-1 text-ink-soft">{result.localName}</p>}
        {result.scientificName && (
          <p className="mt-1 font-mono text-sm italic text-ink-soft/80">
            {result.scientificName}
          </p>
        )}
      </div>

      {result.summary && <p className="leading-relaxed text-ink">{result.summary}</p>}

      {result.habitat && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Habitat
          </p>
          <p className="mt-1 text-sm text-ink">{result.habitat}</p>
        </div>
      )}

      {result.notes && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Notes
          </p>
          <p className="mt-1 text-sm text-ink-soft">{result.notes}</p>
        </div>
      )}

      {result.matchedSlug && (
        <Link
          href={`/species/${result.matchedSlug}`}
          className="inline-block border-b border-signal pb-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-signal hover:text-signal-dark"
        >
          Open catalogue entry →
        </Link>
      )}

      {result.alternatives.length > 0 && (
        <div className="border-t border-line pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Also possible
          </p>
          <ul className="mt-3 space-y-2">
            {result.alternatives.map((a) => (
              <li key={`${a.commonName}-${a.scientificName}`} className="text-sm text-ink">
                {a.commonName}
                {a.scientificName ? (
                  <span className="text-ink-soft">
                    {" "}
                    · <em>{a.scientificName}</em>
                  </span>
                ) : null}
                <span className="font-mono text-[10px] text-ink-soft">
                  {" "}
                  ({Math.round(a.confidence * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/species"
          className="bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:bg-mangrove"
        >
          Browse catalogue
        </Link>
        <button
          type="button"
          onClick={onAgain}
          className="border border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft hover:border-ink hover:text-ink"
        >
          Identify another
        </button>
      </div>
    </div>
  );
}
