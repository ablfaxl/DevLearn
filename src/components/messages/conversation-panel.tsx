"use client";

import {
  formatShortTime,
  messagesToTimeline,
  threadInitials,
  type TimelineItem,
} from "@/components/messages/messenger-format";
import type { ChatThread } from "@/lib/messages/chat-threads";
import type { FieldErrors, Message } from "@/lib/api/types";
import type { ChatWsStatus } from "@/lib/realtime/use-chat-websocket";
import { Button, Label } from "@heroui/react";
import { ArrowLeft, SendHorizontal } from "lucide-react";
import { useMemo, useRef } from "react";

function wsDotClass(status: ChatWsStatus): string {
  if (status === "open") return "bg-emerald-500";
  if (status === "connecting") return "bg-amber-400 animate-pulse";
  if (status === "error") return "bg-red-500";
  return "bg-zinc-500";
}

type Props = {
  thread: ChatThread;
  effectiveMe: number | null;
  composer: string;
  onComposerChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  sendError: string | null;
  fieldErrors: FieldErrors | null;
  scrollEndRef: React.RefObject<HTMLDivElement | null>;
  wsStatus: ChatWsStatus;
  showMobileBack: boolean;
  onMobileBack: () => void;
};

export function ConversationPanel({
  thread,
  effectiveMe,
  composer,
  onComposerChange,
  onSubmit,
  sending,
  sendError,
  fieldErrors,
  scrollEndRef,
  wsStatus,
  showMobileBack,
  onMobileBack,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const bodyFieldErr = fieldErrors?.body?.[0] ?? fieldErrors?.content?.[0];

  const timeline = useMemo(() => messagesToTimeline(thread.messages), [thread.messages]);

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--lms-bg)]">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.08] px-3 py-3">
        {showMobileBack ? (
          <button
            type="button"
            onClick={onMobileBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-zinc-300 hover:bg-white/[0.06] md:hidden"
            aria-label="Back to chats"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : null}
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold text-white">
          {threadInitials(thread.peerLabel)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-white">{thread.peerLabel}</h2>
          <p className="truncate text-xs text-zinc-500">{thread.courseTitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pe-1">
          <span className="relative flex size-2.5" title={`Connection: ${wsStatus}`}>
            <span className={`size-2.5 rounded-full ${wsDotClass(wsStatus)}`} />
          </span>
          <span className="hidden text-[11px] capitalize text-zinc-500 sm:inline">{wsStatus}</span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        {thread.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-sm text-zinc-500">No messages yet.</p>
            <p className="text-xs text-zinc-600">Send a message to start the conversation.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {timeline.map((item) => (
              <TimelineRow key={item.key} item={item} effectiveMe={effectiveMe} />
            ))}
          </ul>
        )}
        <div ref={scrollEndRef} className="h-1 shrink-0" />
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => void onSubmit(e)}
        className="shrink-0 border-t border-white/[0.08] bg-[var(--lms-surface)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <div className="min-w-0 flex-1">
            <Label.Root htmlFor="messenger-composer" className="sr-only">
              Message
            </Label.Root>
            <textarea
              id="messenger-composer"
              value={composer}
              onChange={(e) => onComposerChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              placeholder="Type a message…"
              rows={1}
              className="max-h-32 min-h-[44px] w-full resize-y rounded-2xl border border-white/[0.1] bg-black/30 px-4 py-3 text-sm text-white outline-none ring-[var(--lms-accent)]/30 placeholder:text-zinc-500 focus:border-[var(--lms-accent)]/50 focus:ring-2"
            />
            {bodyFieldErr ? <p className="mt-1 px-1 text-xs text-red-400">{bodyFieldErr}</p> : null}
            {sendError ? (
              <p className="mt-1 px-1 text-xs text-red-400" role="alert">
                {sendError}
              </p>
            ) : null}
            <p className="mt-1 hidden px-1 text-[10px] text-zinc-600 sm:block">Enter to send · Shift+Enter for new line</p>
          </div>
          <Button
            type="submit"
            isDisabled={sending || !composer.trim()}
            className="mb-0.5 size-11 min-w-11 shrink-0 rounded-full bg-[var(--lms-accent)] p-0 text-[#1a0f08]"
            aria-label="Send"
          >
            <SendHorizontal className="size-5" />
          </Button>
        </div>
      </form>
    </section>
  );
}

function TimelineRow({ item, effectiveMe }: { item: TimelineItem; effectiveMe: number | null }) {
  if (item.type === "day") {
    return (
      <li className="my-3 flex justify-center" aria-hidden>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-zinc-400">
          {item.label}
        </span>
      </li>
    );
  }
  return <MessageBubbleRow message={item.message} effectiveMe={effectiveMe} />;
}

function MessageBubbleRow({ message, effectiveMe }: { message: Message; effectiveMe: number | null }) {
  const mine = effectiveMe != null && message.sender === effectiveMe;
  return (
    <li className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2 ${
          mine
            ? "rounded-br-md bg-[var(--lms-accent)] text-[#1a0f08]"
            : "rounded-bl-md bg-zinc-800 text-zinc-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.body || "—"}</p>
        <div
          className={`mt-1 flex flex-wrap items-center justify-end gap-2 text-[10px] ${
            mine ? "text-[#1a0f08]/70" : "text-zinc-500"
          }`}
        >
          <time dateTime={message.created_at}>{formatShortTime(message.created_at)}</time>
          {mine && message.read === true ? <span>Seen</span> : null}
        </div>
      </div>
    </li>
  );
}
