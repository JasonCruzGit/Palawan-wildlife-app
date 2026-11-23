import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { sortMessages } from "@/lib/messages";
import type { CommunityMessage } from "@/lib/types";

export const runtime = "nodejs";

const MESSAGES_PATH = path.join(process.cwd(), "data", "messages.json");

export async function GET() {
  try {
    const raw = await fs.readFile(MESSAGES_PATH, "utf8");
    const parsed = JSON.parse(raw) as CommunityMessage[];
    const messages = sortMessages(Array.isArray(parsed) ? parsed : []);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
