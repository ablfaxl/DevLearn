"use client";

import type { ChatThread } from "@/lib/messages/chat-threads";

export type ThreadListItem = ChatThread & { unread: number };
import { formatThreadListTime, threadInitials } from "@/components/messages/messenger-format";
import { Input } from "@heroui/react";
import { MessageCirclePlus, Search } from "lucide-react";

type Props = {
  threads: ThreadListItem[];
  activeKey: string | null;
  loading: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (key: string) => void;
  onNewChat: () => void;
  newChatDisabled: boolean;
};

export function ThreadSidebarPanel({
  threads,
  activeKey,
  loading,
  query,
  onQueryChange,
  onSelect,
  onNewChat,
  newChatDisabled,
}: Props) {
  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col border-e border-white/[0.08] bg-[var(--lms-surface)] md:w-[320px]">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] px-3 py-3">
        <h2 className="text-lg font-bold tracking-tight text-white">Chats</h2>
        <button
          type="button"
          onClick={onNewChat}
          disabled={newChatDisabled}
          className="flex size-10 items-center justify-center rounded-full bg-[var(--lms-accent)]/15 text-[var(--lms-accent)] transition hover:bg-[var(--lms-accent)]/25 disabled:opacity-40"
          aria-label="New chat"
          title="New chat"
        >
          <MessageCirclePlus className="size-5" />
        </button>
      </div>
      <div className="border-b border-white/[0.08] px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="search"
            placeholder="Search conversations"
            aria-label="Search conversations"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full rounded-xl border-white/[0.08] bg-black/25 ps-10 text-sm text-white placeholder:text-zinc-500"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <p className="p-4 text-sm text-zinc-500">Loading conversations…</p>
        ) : threads.length === 0 ? (
          <p className="p-4 text-sm leading-relaxed text-zinc-500">
            {query.trim()
              ? "No conversations match your search."
              : "No conversations yet. Use + to message your instructor or a student from a course you teach."}
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {threads.map((t) => {
              const active = activeKey === t.key;
              const initials = threadInitials(t.peerLabel);
              return (
                <li key={t.key}>
                  <button
                    type="button"
                    onClick={() => onSelect(t.key)}
                    className={`flex w-full gap-3 px-3 py-3 text-start transition ${
                      active ? "bg-[var(--lms-accent)]/12" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className={`flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        active ? "bg-[var(--lms-accent)] text-[#1a0f08]" : "bg-zinc-700 text-zinc-100"
                      }`}
                    >
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-semibold text-white">{t.peerLabel}</span>
                          {t.unread > 0 ? (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--lms-accent)] text-[10px] font-bold text-[#1a0f08]">
                              {t.unread > 9 ? "9+" : t.unread}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-[11px] text-zinc-500">{formatThreadListTime(t.lastAt)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-zinc-500">{t.courseTitle}</span>
                      <span className="mt-0.5 line-clamp-2 text-xs text-zinc-400">{t.lastPreview}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
