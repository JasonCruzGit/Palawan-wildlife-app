import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { currentPointsYear, yearTotal } from "@/lib/points";
import type { PointsLedgerEntry } from "@/lib/types";

export const runtime = "nodejs";

const POINTS_PATH = path.join(process.cwd(), "data", "partner-points.json");

async function readLedger(): Promise<PointsLedgerEntry[]> {
  try {
    const raw = await fs.readFile(POINTS_PATH, "utf8");
    const parsed = JSON.parse(raw) as PointsLedgerEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  const yearParam = searchParams.get("year");
  const year = yearParam ? Number(yearParam) : currentPointsYear();

  const ledger = await readLedger();
  const filtered = email
    ? ledger.filter((e) => e.email.toLowerCase() === email && e.year === year)
    : ledger.filter((e) => e.year === year);

  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(
    {
      year,
      total: email ? yearTotal(ledger, email, year) : filtered.reduce((s, e) => s + e.points, 0),
      entries: filtered,
      allTime: email
        ? ledger
            .filter((e) => e.email.toLowerCase() === email)
            .reduce((s, e) => s + e.points, 0)
        : undefined,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
