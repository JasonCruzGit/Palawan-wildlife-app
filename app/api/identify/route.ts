import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCachedIdentify, setCachedIdentify } from "@/lib/identify-cache";
import { species } from "@/lib/species";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  buildIdentifyPrompt,
  catalogueBrief,
  isIdentifyMode,
  parseIdentifyResult,
} from "@/lib/identify";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it to .env.local and restart the server." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const modeRaw = form.get("mode");
  if (!isIdentifyMode(modeRaw)) {
    return NextResponse.json(
      { error: "Select plant or species (animal) first." },
      { status: 400 }
    );
  }
  const mode = modeRaw;

  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return NextResponse.json(
      { error: "Use JPEG, PNG, WebP, or GIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image must be under 4 MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const cached = await getCachedIdentify(buffer, mode);
    if (cached) {
      return NextResponse.json({
        result: cached,
        cached: true,
      });
    }
  } catch (err) {
    console.error("Identify cache read error:", err);
  }

  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
  const openai = new OpenAI({ apiKey });
  const catalogue = catalogueBrief(species);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildIdentifyPrompt(catalogue, mode) },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "Empty response from OpenAI." }, { status: 502 });
    }

    const result = parseIdentifyResult(raw);

    if (result.matchedSlug && !species.some((s) => s.slug === result.matchedSlug)) {
      result.matchedSlug = null;
    }

    try {
      await setCachedIdentify(buffer, mode, result);
    } catch (err) {
      console.error("Identify cache write error:", err);
    }

    return NextResponse.json({ result, cached: false });
  } catch (err) {
    console.error("Identify API error:", err);
    const message =
      err instanceof Error ? err.message : "Identification failed. Try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
