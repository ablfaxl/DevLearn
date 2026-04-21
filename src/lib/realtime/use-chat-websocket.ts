"use client";

import { getWsChatUrl } from "@/lib/api/config";
import { coerceMessage } from "@/lib/api/messages";
import type { Message } from "@/lib/api/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type ChatWsStatus = "idle" | "connecting" | "open" | "closed" | "error";

type WsPayload = {
  type?: string;
  user_id?: number;
  message?: unknown;
  detail?: unknown;
};

/**
 * Django Channels `ChatConsumer`: `/ws/chat/?token=<access>`.
 * @see docs/frontend-websocket-chat-fa.md
 */
export function useChatWebSocket(opts: {
  accessToken: string | null;
  enabled: boolean;
  onRemoteMessage: (m: Message) => void;
  onServerUserId?: (id: number) => void;
  onServerError?: (message: string) => void;
}): { status: ChatWsStatus; sendLive: (p: { recipient: number; body: string; course: number | null }) => boolean } {
  const { accessToken, enabled, onRemoteMessage, onServerUserId, onServerError } = opts;
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ChatWsStatus>("idle");

  const onRemoteMessageRef = useRef(onRemoteMessage);
  onRemoteMessageRef.current = onRemoteMessage;
  const onServerUserIdRef = useRef(onServerUserId);
  onServerUserIdRef.current = onServerUserId;
  const onServerErrorRef = useRef(onServerError);
  onServerErrorRef.current = onServerError;

  useEffect(() => {
    if (!enabled || !accessToken) {
      wsRef.current = null;
      setStatus("idle");
      return;
    }

    const url = getWsChatUrl(accessToken);
    setStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      wsRef.current = ws;
      setStatus("open");
    };
    ws.onclose = () => {
      if (wsRef.current === ws) wsRef.current = null;
      setStatus((s) => (s === "error" ? s : "closed"));
    };
    ws.onerror = () => {
      setStatus("error");
      onServerErrorRef.current?.("اتصال WebSocket برقرار نشد (آدرس را با NEXT_PUBLIC_WS_URL چک کنید).");
    };

    ws.onmessage = (ev) => {
      if (wsRef.current !== ws) return;
      try {
        const data = JSON.parse(String(ev.data)) as WsPayload;
        if (data.type === "connected" && typeof data.user_id === "number") {
          onServerUserIdRef.current?.(data.user_id);
          return;
        }
        if (data.type === "message" && data.message != null) {
          const m = coerceMessage(data.message);
          if (m) onRemoteMessageRef.current(m);
          return;
        }
        if (data.type === "error") {
          const msg =
            typeof data.detail === "string"
              ? data.detail
              : typeof (data as { message?: unknown }).message === "string"
                ? String((data as { message: string }).message)
                : "خطای سرور";
          onServerErrorRef.current?.(msg);
          return;
        }
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch {
        /* non-JSON frames ignored */
      }
    };

    return () => {
      ws.close();
      if (wsRef.current === ws) wsRef.current = null;
    };
  }, [accessToken, enabled]);

  const sendLive = useCallback((payload: { recipient: number; body: string; course: number | null }) => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(
      JSON.stringify({
        type: "send",
        recipient: payload.recipient,
        body: payload.body,
        course: payload.course,
      })
    );
    return true;
  }, []);

  return { status, sendLive };
}
