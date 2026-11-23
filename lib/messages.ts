import type { CommunityMessage } from "@/lib/types";

export const MESSAGE_READ_KEY = "pw_message_reads";
export const MESSAGE_STAR_KEY = "pw_message_stars";
export const MESSAGE_CHANGE_EVENT = "pw-messages-change";

function readIdSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeIdSet(key: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  window.dispatchEvent(new Event(MESSAGE_CHANGE_EVENT));
}

export function readReadIds() {
  return readIdSet(MESSAGE_READ_KEY);
}

export function readStarredIds() {
  return readIdSet(MESSAGE_STAR_KEY);
}

export function markMessageRead(id: string) {
  const next = readReadIds();
  next.add(id);
  writeIdSet(MESSAGE_READ_KEY, next);
}

export function toggleMessageStar(id: string) {
  const next = readStarredIds();
  if (next.has(id)) next.delete(id);
  else next.add(id);
  writeIdSet(MESSAGE_STAR_KEY, next);
}

export function formatInboxDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

export function sortMessages(messages: CommunityMessage[]) {
  return [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
