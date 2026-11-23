"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MESSAGE_CHANGE_EVENT,
  formatInboxDate,
  markMessageRead,
  readReadIds,
  readStarredIds,
  toggleMessageStar,
} from "@/lib/messages";
import type { CommunityMessage } from "@/lib/types";

type Filter = "all" | "unread" | "starred";

export default function MessagesInbox() {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const syncLocal = useCallback(() => {
    setReadIds(readReadIds());
    setStarredIds(readStarredIds());
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/messages");
        const data = (await res.json()) as { messages?: CommunityMessage[] };
        setMessages(data.messages ?? []);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
        syncLocal();
      }
    };
    load();
    window.addEventListener(MESSAGE_CHANGE_EVENT, syncLocal);
    return () => window.removeEventListener(MESSAGE_CHANGE_EVENT, syncLocal);
  }, [syncLocal]);

  const unreadCount = useMemo(
    () => messages.filter((m) => !readIds.has(m.id)).length,
    [messages, readIds]
  );

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filter === "unread") return !readIds.has(m.id);
      if (filter === "starred") return starredIds.has(m.id);
      return true;
    });
  }, [messages, filter, readIds, starredIds]);

  const openMessage = messages.find((m) => m.id === openId) ?? null;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openRow = (id: string) => {
    markMessageRead(id);
    setReadIds(readReadIds());
    setOpenId(id);
  };

  const onStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleMessageStar(id);
    setStarredIds(readStarredIds());
  };

  if (loading) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        Loading inbox…
      </p>
    );
  }

  if (openMessage) {
    const unread = !readIds.has(openMessage.id);
    return (
      <div className="border border-line bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2.5 @sm:px-4">
          <button
            type="button"
            onClick={() => setOpenId(null)}
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
          >
            ← Back to inbox
          </button>
          <button
            type="button"
            onClick={(e) => onStar(e, openMessage.id)}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft hover:text-signal"
            aria-label={starredIds.has(openMessage.id) ? "Unstar" : "Star"}
          >
            {starredIds.has(openMessage.id) ? "★ Starred" : "☆ Star"}
          </button>
        </div>
        <div className="px-4 py-6 sm:px-6">
          <h2
            className={`font-display text-2xl tracking-tight text-ink sm:text-3xl ${
              unread ? "font-bold" : "font-semibold"
            }`}
          >
            {openMessage.subject}
          </h2>
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
            <p className="text-ink">
              <span className="font-medium">{openMessage.from}</span>
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                {openMessage.fromRole}
              </span>
            </p>
            <p className="font-mono text-[11px] text-ink-soft">
              {new Date(openMessage.createdAt).toLocaleString("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink">
            {openMessage.body.split("\n").map((line, i) =>
              line.trim() === "" ? <br key={i} /> : <p key={i}>{line}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(
          [
            { id: "all" as const, label: `All ${messages.length}` },
            { id: "unread" as const, label: `Unread ${unreadCount}` },
            { id: "starred" as const, label: `Starred ${starredIds.size}` },
          ]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
              filter === tab.id
                ? "bg-ink text-paper"
                : "border border-line text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden border border-line bg-paper">
        {filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink-soft">No messages in this view.</p>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((m) => {
              const unread = !readIds.has(m.id);
              const starred = starredIds.has(m.id);
              const checked = selected.has(m.id);
              return (
                <li key={m.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openRow(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openRow(m.id);
                      }
                    }}
                    className={`group cursor-pointer px-3 py-3 transition @sm:px-4 ${
                      checked ? "bg-mist/70" : "bg-paper hover:bg-mist/50"
                    }`}
                  >
                    <div className="flex items-start gap-2 @sm:items-center @sm:gap-3">
                      <button
                        type="button"
                        aria-label={checked ? "Deselect" : "Select"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(m.id);
                        }}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border @sm:mt-0 ${
                          checked
                            ? "border-ink bg-ink text-paper"
                            : "border-line text-transparent"
                        }`}
                      >
                        <span className="text-[10px] leading-none">✓</span>
                      </button>

                      <button
                        type="button"
                        aria-label={starred ? "Unstar" : "Star"}
                        onClick={(e) => onStar(e, m.id)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-base leading-none @sm:mt-0 ${
                          starred ? "text-signal" : "text-line group-hover:text-ink-soft"
                        }`}
                      >
                        {starred ? "★" : "☆"}
                      </button>

                      <div className="min-w-0 flex-1 @md:grid @md:grid-cols-[7.5rem_minmax(0,1fr)_auto] @md:items-center @md:gap-3">
                        <p
                          className={`truncate font-display text-sm tracking-tight text-ink ${
                            unread ? "font-bold" : "font-normal text-ink-soft"
                          }`}
                        >
                          {m.from}
                        </p>

                        <p className="mt-0.5 min-w-0 truncate text-sm @md:mt-0">
                          <span
                            className={`text-ink ${
                              unread ? "font-bold" : "font-normal text-ink-soft"
                            }`}
                          >
                            {m.subject}
                          </span>
                          <span className="hidden text-ink-soft @md:inline"> — {m.preview}</span>
                        </p>

                        <p
                          className={`mt-1 shrink-0 whitespace-nowrap font-mono text-[10px] @md:mt-0 @md:pl-2 @md:text-right ${
                            unread ? "font-bold text-ink" : "text-ink-soft"
                          }`}
                        >
                          {formatInboxDate(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
