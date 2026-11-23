import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Category, Color, Habitat, Size, Species, Status } from "@/lib/types";
import { categories, colors, habitats, sizes, statuses } from "@/lib/species";
import { slugifyName } from "@/lib/catalogue-extra";

export const runtime = "nodejs";

const SPECIES_PATH = path.join(process.cwd(), "data", "species.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "species");
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

async function readSpeciesFile(): Promise<Species[]> {
  const raw = await fs.readFile(SPECIES_PATH, "utf8");
  return JSON.parse(raw) as Species[];
}

function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (categories as string[]).includes(v);
}
function isStatus(v: unknown): v is Status {
  return typeof v === "string" && (statuses as string[]).includes(v);
}
function isSize(v: unknown): v is Size {
  return typeof v === "string" && (sizes as string[]).includes(v);
}

function parseList(raw: FormDataEntryValue | null, splitOn: RegExp | string): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(splitOn)
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseJsonArray(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const data = await readSpeciesFile();
    return NextResponse.json({ entries: data });
  } catch {
    return NextResponse.json({ error: "Could not read catalogue." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const scientificName = String(form.get("scientificName") ?? "").trim();
  const localName = String(form.get("localName") ?? "").trim() || name;
  const description = String(form.get("description") ?? "").trim();
  const habitat = String(form.get("habitat") ?? "").trim();
  const categoryRaw = form.get("category");
  const statusRaw = form.get("status");
  const sizeRaw = form.get("size");
  const diet =
    String(form.get("diet") ?? "").trim() ||
    (categoryRaw === "Plants" ? "Photosynthesis / nutrients from soil" : "Unknown");

  if (!name || !scientificName || !description || !habitat) {
    return NextResponse.json(
      { error: "Name, scientific name, description, and habitat are required." },
      { status: 400 }
    );
  }
  if (!isCategory(categoryRaw) || !isStatus(statusRaw) || !isSize(sizeRaw)) {
    return NextResponse.json({ error: "Invalid category, status, or size." }, { status: 400 });
  }

  const slug = slugifyName(String(form.get("slug") ?? name));
  if (!slug) {
    return NextResponse.json({ error: "Could not build a slug from the name." }, { status: 400 });
  }

  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Cover image is required." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP, or GIF image." },
      { status: 400 }
    );
  }

  const colorList = parseJsonArray(form.get("colors")).filter((c): c is Color =>
    (colors as string[]).includes(c)
  );
  const habitatList = parseJsonArray(form.get("habitats")).filter((h): h is Habitat =>
    (habitats as string[]).includes(h)
  );
  const threats = parseList(form.get("threats"), ",");
  const facts = parseList(form.get("facts"), /\n/);

  try {
    const existing = await readSpeciesFile();
    if (existing.some((s) => s.slug === slug)) {
      return NextResponse.json({ error: "An entry with this slug already exists." }, { status: 409 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${slug}-${Date.now()}${ext}`;
    const diskPath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(diskPath, buffer);
    const image = `/images/species/${filename}`;

    const entry: Species = {
      id: String(Date.now()),
      slug,
      name,
      localName,
      scientificName,
      category: categoryRaw,
      status: statusRaw,
      image,
      description,
      habitat,
      diet,
      threats: threats.length ? threats : ["Habitat pressure"],
      facts: facts.length ? facts : [`Added to the Palawan Wildlife catalogue.`],
      size: sizeRaw,
      colors: colorList.length ? colorList : ["green"],
      habitats: habitatList.length ? habitatList : ["forest"],
    };

    existing.push(entry);
    await fs.writeFile(SPECIES_PATH, JSON.stringify(existing, null, 2) + "\n", "utf8");

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save catalogue entry." }, { status: 500 });
  }
}
