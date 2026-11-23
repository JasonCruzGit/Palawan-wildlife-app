import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { POINTS_PER_VERIFIED_REPORT, currentPointsYear } from "@/lib/points";
import type {
  PartnerReport,
  PointsLedgerEntry,
  ReportKind,
  ReportStatus,
} from "@/lib/types";

export const runtime = "nodejs";

const REPORTS_PATH = path.join(process.cwd(), "data", "reports.json");
const POINTS_PATH = path.join(process.cwd(), "data", "partner-points.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "reports");
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

async function readReports(): Promise<PartnerReport[]> {
  try {
    const raw = await fs.readFile(REPORTS_PATH, "utf8");
    const parsed = JSON.parse(raw) as PartnerReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeReports(reports: PartnerReport[]) {
  await fs.writeFile(REPORTS_PATH, JSON.stringify(reports, null, 2) + "\n", "utf8");
}

export async function GET() {
  const reports = await readReports();
  return NextResponse.json(
    {
      reports: reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const kindRaw = String(form.get("kind") ?? "");
  const kind: ReportKind | null =
    kindRaw === "animal" || kindRaw === "plant" ? kindRaw : null;
  const speciesName = String(form.get("speciesName") ?? "").trim();
  const scientificName = String(form.get("scientificName") ?? "").trim();
  const speciesSlug = String(form.get("speciesSlug") ?? "").trim() || null;
  const location = String(form.get("location") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();
  const date = String(form.get("date") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const submittedBy = String(form.get("submittedBy") ?? "").trim();
  const submittedByEmail = String(form.get("submittedByEmail") ?? "").trim();
  const latRaw = String(form.get("lat") ?? "").trim();
  const lngRaw = String(form.get("lng") ?? "").trim();
  const lat = latRaw ? Number(latRaw) : null;
  const lng = lngRaw ? Number(lngRaw) : null;

  if (!kind) {
    return NextResponse.json({ error: "Choose animal or plant." }, { status: 400 });
  }
  if (!speciesName || !location || !notes) {
    return NextResponse.json(
      { error: "Species/plant name, location, and notes are required." },
      { status: 400 }
    );
  }
  if (!submittedBy || !submittedByEmail) {
    return NextResponse.json(
      { error: "Community account required." },
      { status: 401 }
    );
  }

  let image: string | null = null;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
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
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `report-${Date.now()}${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));
    image = `/images/reports/${filename}`;
  }

  const report: PartnerReport = {
    id: `r-${Date.now()}`,
    kind,
    speciesName,
    speciesSlug,
    scientificName,
    location,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    date,
    notes,
    image,
    status: "pending",
    submittedBy,
    submittedByEmail,
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    reviewNote: null,
  };

  try {
    const existing = await readReports();
    existing.unshift(report);
    await writeReports(existing);
    return NextResponse.json({ report }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save report." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id = String(body.id ?? "");
  const status = body.status as ReportStatus;
  const reviewNote = String(body.reviewNote ?? "").trim() || null;

  if (!id || !["verified", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Valid id and status required." }, { status: 400 });
  }

  try {
    const existing = await readReports();
    const idx = existing.findIndex((r) => r.id === id);
    if (idx < 0) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const prior = existing[idx];
    let pointsEntry: PointsLedgerEntry | null = null;

    existing[idx] = {
      ...prior,
      status,
      reviewNote,
      reviewedAt: new Date().toISOString(),
    };

    // Award year-to-date points once per successful verification
    if (status === "verified" && !prior.pointsAwarded) {
      const awarded = POINTS_PER_VERIFIED_REPORT;
      existing[idx].pointsAwarded = awarded;

      try {
        const raw = await fs.readFile(POINTS_PATH, "utf8");
        const ledger = (JSON.parse(raw) as PointsLedgerEntry[]) ?? [];
        const already = ledger.some((e) => e.reportId === prior.id);
        if (!already) {
          const now = new Date();
          pointsEntry = {
            id: `pts-${Date.now()}`,
            email: prior.submittedByEmail,
            partnerName: prior.submittedBy,
            reportId: prior.id,
            speciesName: prior.speciesName,
            points: awarded,
            year: currentPointsYear(now),
            createdAt: now.toISOString(),
            reason: `Verified ${prior.kind} report`,
          };
          ledger.unshift(pointsEntry);
          await fs.writeFile(POINTS_PATH, JSON.stringify(ledger, null, 2) + "\n", "utf8");
        }
      } catch {
        // points write is best-effort alongside report update
      }
    }

    await writeReports(existing);

    // When verified with coordinates, append a map sighting
    if (status === "verified") {
      const report = existing[idx];
      if (report.lat != null && report.lng != null) {
        const sightingsPath = path.join(process.cwd(), "data", "sightings.json");
        try {
          const raw = await fs.readFile(sightingsPath, "utf8");
          const sightings = JSON.parse(raw) as Array<Record<string, unknown>>;
          sightings.push({
            id: `s-${Date.now()}`,
            speciesSlug: report.speciesSlug || report.speciesName.toLowerCase().replace(/\s+/g, "-"),
            speciesName: report.speciesName,
            location: report.location,
            lat: report.lat,
            lng: report.lng,
            date: report.date,
            notes: `Partner report verified. ${report.notes}`,
          });
          await fs.writeFile(sightingsPath, JSON.stringify(sightings, null, 2) + "\n", "utf8");
        } catch {
          // sighting append is best-effort
        }
      }
    }

    return NextResponse.json({ report: existing[idx], pointsEntry });
  } catch {
    return NextResponse.json({ error: "Could not update report." }, { status: 500 });
  }
}
