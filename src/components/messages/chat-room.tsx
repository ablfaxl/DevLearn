"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { useNotificationsOptional } from "@/features/notifications";
import { coursesListMineParam } from "@/lib/auth/access";
import { getUserIdFromAccessToken } from "@/lib/auth/jwt-payload";
import { ApiError, errMessage, formatDrfErrors, parseFieldErrors } from "@/lib/api/client";
import { getCourse, listCourseStudents, listCourses, listPublicCourses } from "@/lib/api/courses";
import { listMyEnrollments } from "@/lib/api/enrollments";
import { listMessages, sendMessage } from "@/lib/api/messages";
import type { Course, CourseStudentRow, Enrollment, FieldErrors, Message } from "@/lib/api/types";
import { useChatWebSocket } from "@/lib/realtime/use-chat-websocket";
import {
  makeThreadKey,
  mergeDraftThreads,
  messagesToThreads,
  type ThreadDraft,
} from "@/lib/messages/chat-threads";
import { ConversationPanel } from "@/components/messages/conversation-panel";
import { ThreadSidebarPanel } from "@/components/messages/thread-sidebar-panel";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function unwrapResults<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

function sortByCreatedDesc(a: Message, b: Message): number {
  const ta = Date.parse(a.created_at);
  const tb = Date.parse(b.created_at);
  if (Number.isFinite(ta) && Number.isFinite(tb)) return tb - ta;
  return b.id - a.id;
}

function courseStudentUserId(row: CourseStudentRow): number {
  if (typeof row.user === "number") return row.user;
  return row.user.id;
}

function courseStudentLabel(row: CourseStudentRow): string {
  if (typeof row.user === "object") return `@${row.user.username}`;
  return `کاربر #${row.user}`;
}

export function ChatRoom() {
  const { accessToken, bootstrapped, profile } = useAdminAuth();
  const notifications = useNotificationsOptional();
  /** Ref avoids putting `notifications` in `load` deps — its identity changes every refresh → infinite `useEffect([load])`. */
  const notificationsRef = useRef<typeof notifications>(null);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const me = useMemo(() => getUserIdFromAccessToken(accessToken), [accessToken]);
  const [serverUserId, setServerUserId] = useState<number | null>(null);
  const effectiveMe = serverUserId ?? me;

  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [courseById, setCourseById] = useState<Map<number, Course>>(new Map());
  const [enrollmentRows, setEnrollmentRows] = useState<
    { enrollment: Enrollment; course: Course; instructorId: number }[]
  >([]);
  const [teachingCourses, setTeachingCourses] = useState<Course[]>([]);

  const [drafts, setDrafts] = useState<ThreadDraft[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [mobileList, setMobileList] = useState(true);
  const [threadQuery, setThreadQuery] = useState("");

  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [composer, setComposer] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null);
  const [sending, setSending] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [studentPickerCourseId, setStudentPickerCourseId] = useState<number | null>(null);
  const [pickerStudents, setPickerStudents] = useState<CourseStudentRow[]>([]);
  const [pickerStudentsLoading, setPickerStudentsLoading] = useState(false);

  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setServerUserId(null);
  }, [accessToken]);

  const mergeRemoteMessage = useCallback((m: Message) => {
    setAllMessages((prev) => [m, ...prev.filter((x) => x.id !== m.id)].sort(sortByCreatedDesc));
    queueMicrotask(() => void notificationsRef.current?.refresh());
  }, []);

  const { status: wsStatus, sendLive } = useChatWebSocket({
    accessToken,
    enabled: bootstrapped && Boolean(accessToken),
    onRemoteMessage: mergeRemoteMessage,
    onServerUserId: setServerUserId,
    onServerError: (msg) => setWsError(msg),
  });

  useEffect(() => {
    if (wsStatus === "open") setWsError(null);
  }, [wsStatus]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listMessages({ limit: 200 });
      const sorted = [...(res.results ?? [])].sort(sortByCreatedDesc);
      setAllMessages(sorted);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setLoadError("برای دیدن پیام‌ها وارد شوید.");
      } else if (e instanceof ApiError && e.status === 404) {
        setAllMessages([]);
        setLoadError(
          "مسیر پیام‌ها روی سرور پیدا نشد (۴۰۴). بعد از فعال‌سازی API، دوباره تلاش کنید."
        );
      } else {
        setLoadError(errMessage(e));
      }
      setAllMessages([]);
    }

    const map = new Map<number, Course>();
    try {
      const pub = await listPublicCourses({ limit: 200 });
      for (const c of unwrapResults<Course>(pub)) {
        map.set(c.id, c);
      }
    } catch {
      /* catalog optional */
    }

    if (accessToken) {
      try {
        const en = await listMyEnrollments({ limit: 100 });
        const enrollments = unwrapResults<Enrollment>(en);
        const courseIds = [...new Set(enrollments.map((e) => e.course))];
        await Promise.all(
          courseIds.map(async (id) => {
            try {
              const detail = await getCourse(id);
              map.set(id, detail);
            } catch {
              /* keep public stub if any */
            }
          })
        );

        const uid = getUserIdFromAccessToken(accessToken);
        const rows: { enrollment: Enrollment; course: Course; instructorId: number }[] = [];
        for (const e of enrollments) {
          const course = map.get(e.course);
          if (!course) continue;
          const instructorId = course.instructor;
          if (!Number.isFinite(instructorId) || instructorId <= 0) continue;
          if (uid != null && instructorId === uid) continue;
          rows.push({ enrollment: e, course, instructorId });
        }
        setEnrollmentRows(rows);

        let teaching: Course[] = [];
        if (uid != null) {
          try {
            const mine = coursesListMineParam(profile?.access);
            const lc = await listCourses({ limit: 200, mine });
            teaching = unwrapResults<Course>(lc).filter((c) => c.instructor === uid);
          } catch {
            /* not instructor or forbidden */
          }
        }
        setTeachingCourses(teaching);
      } catch {
        setEnrollmentRows([]);
        setTeachingCourses([]);
      }
    } else {
      setEnrollmentRows([]);
      setTeachingCourses([]);
    }

    setCourseById(map);
    setLoading(false);
    queueMicrotask(() => void notificationsRef.current?.refresh());
  }, [accessToken, profile]);

  useEffect(() => {
    if (!bootstrapped) return;
    void load();
  }, [bootstrapped, load]);

  const messageThreads = useMemo(
    () => messagesToThreads(allMessages, effectiveMe, courseById),
    [allMessages, effectiveMe, courseById]
  );

  const sidebarThreads = useMemo(
    () => mergeDraftThreads(messageThreads, drafts, courseById),
    [messageThreads, drafts, courseById]
  );

  const filteredSidebarThreads = useMemo(() => {
    const q = threadQuery.trim().toLowerCase();
    if (!q) return sidebarThreads;
    return sidebarThreads.filter(
      (t) =>
        t.courseTitle.toLowerCase().includes(q) ||
        t.peerLabel.toLowerCase().includes(q) ||
        t.lastPreview.toLowerCase().includes(q)
    );
  }, [sidebarThreads, threadQuery]);

  const sidebarThreadsWithUnread = useMemo(
    () =>
      filteredSidebarThreads.map((t) => ({
        ...t,
        unread:
          effectiveMe == null
            ? 0
            : t.messages.filter((m) => m.recipient === effectiveMe && m.read !== true).length,
      })),
    [filteredSidebarThreads, effectiveMe]
  );

  const activeThread = useMemo(
    () => sidebarThreads.find((t) => t.key === activeKey) ?? null,
    [sidebarThreads, activeKey]
  );

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeKey, activeThread?.messages.length]);

  function startThread(courseId: number, peerUserId: number) {
    const key = makeThreadKey(courseId, peerUserId);
    setDrafts((d) => (d.some((x) => x.key === key) ? d : [...d, { key, courseId, peerUserId }]));
    setActiveKey(key);
    setShowNewModal(false);
    setMobileList(false);
  }

  const openNewChatModal = useCallback(() => {
    setShowNewModal(true);
    setStudentPickerCourseId(teachingCourses[0]?.id ?? null);
  }, [teachingCourses]);

  useEffect(() => {
    if (showNewModal && teachingCourses.length > 0) {
      setStudentPickerCourseId((prev) =>
        prev != null && teachingCourses.some((c) => c.id === prev) ? prev : teachingCourses[0].id
      );
    }
  }, [showNewModal, teachingCourses]);

  useEffect(() => {
    if (!showNewModal || studentPickerCourseId == null) {
      setPickerStudents([]);
      return;
    }
    let cancelled = false;
    setPickerStudentsLoading(true);
    void listCourseStudents(studentPickerCourseId, { limit: 200 })
      .then((res) => {
        if (!cancelled) setPickerStudents(res.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setPickerStudents([]);
      })
      .finally(() => {
        if (!cancelled) setPickerStudentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showNewModal, studentPickerCourseId]);

  function openThread(key: string) {
    setActiveKey(key);
    setMobileList(false);
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setSendError(null);
    setFieldErrors(null);
    if (!activeThread) return;
    const trimmed = composer.trim();
    if (!trimmed) {
      setSendError("Type a message to send.");
      return;
    }

    setSending(true);
    try {
      const live = sendLive({
        recipient: activeThread.peerUserId,
        body: trimmed,
        course: activeThread.courseId ?? null,
      });
      if (live) {
        setComposer("");
        setDrafts((d) => d.filter((x) => x.key !== activeThread.key));
        setSending(false);
        return;
      }

      const created = await sendMessage({
        recipient: activeThread.peerUserId,
        body: trimmed,
        ...(activeThread.courseId != null ? { course: activeThread.courseId } : {}),
      });
      setComposer("");
      setDrafts((d) => d.filter((x) => x.key !== activeThread.key));
      if (created) {
        setAllMessages((prev) => [created, ...prev.filter((m) => m.id !== created.id)].sort(sortByCreatedDesc));
      } else {
        await load();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setSendError(formatDrfErrors(err.body));
        setFieldErrors(parseFieldErrors(err.body));
      } else {
        setSendError(errMessage(err));
      }
    } finally {
      setSending(false);
      queueMicrotask(() => void notificationsRef.current?.refresh());
    }
  }

  if (!bootstrapped) {
    return (
      <div className="flex min-h-[40vh] flex-1 items-center justify-center text-sm text-zinc-500">
        Loading messenger…
      </div>
    );
  }

  const newChatDisabled =
    !accessToken || (enrollmentRows.length === 0 && teachingCourses.length === 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--lms-bg)]">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-3 py-2 sm:px-4">
        <div>
          <h1 className="text-lg font-bold text-white">Messenger</h1>
          <p className="text-[11px] text-zinc-500">
            Live when WebSocket is connected; otherwise messages use{" "}
            <code className="rounded bg-black/30 px-1 text-[10px] text-zinc-400">POST /messages/</code>
          </p>
        </div>
        <Button size="sm" variant="outline" onPress={() => void load()} isDisabled={loading} className="border-white/15">
          Refresh
        </Button>
      </div>

      {!accessToken ? (
        <div className="mx-3 mt-2 rounded-xl border border-amber-900/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
          Sign in to use chat.{" "}
          <Link href={ROUTES.ADMIN_LOGIN} className="font-semibold text-[var(--lms-accent)] underline">
            Log in
          </Link>
        </div>
      ) : null}

      {wsError ? (
        <div className="mx-3 mt-2 rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {wsError}
        </div>
      ) : null}

      {effectiveMe == null && accessToken ? (
        <div className="mx-3 mt-2 rounded-xl border border-white/[0.08] bg-[var(--lms-surface)] px-3 py-2 text-xs text-zinc-400">
          Your user id will appear after JWT parsing or the WebSocket{" "}
          <code className="text-[10px]">connected</code> message. See{" "}
          <code className="text-[10px]">docs/frontend-websocket-chat-fa.md</code>
        </div>
      ) : null}

      {loadError ? (
        <div className="mx-3 mt-2 rounded-xl border border-amber-900/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
          {loadError}{" "}
          <Link href={ROUTES.ADMIN_LOGIN} className="font-semibold text-[var(--lms-accent)] underline">
            Log in
          </Link>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-white/[0.08] md:mx-auto md:my-2 md:max-h-[calc(100dvh-9.5rem)] md:max-w-6xl md:rounded-2xl md:border md:border-white/[0.08] md:shadow-xl">
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className={`${mobileList ? "flex" : "hidden"} min-h-0 w-full flex-col md:flex md:max-w-[320px]`}>
            <ThreadSidebarPanel
              threads={sidebarThreadsWithUnread}
              activeKey={activeKey}
              loading={loading}
              query={threadQuery}
              onQueryChange={setThreadQuery}
              onSelect={openThread}
              onNewChat={openNewChatModal}
              newChatDisabled={newChatDisabled}
            />
          </div>

          <div
            className={`${
              activeThread && !mobileList ? "flex" : "hidden"
            } min-h-0 flex-1 flex-col md:flex`}
          >
            {activeThread ? (
              <ConversationPanel
                thread={activeThread}
                effectiveMe={effectiveMe}
                composer={composer}
                onComposerChange={setComposer}
                onSubmit={onSend}
                sending={sending}
                sendError={sendError}
                fieldErrors={fieldErrors}
                scrollEndRef={scrollEndRef}
                wsStatus={wsStatus}
                showMobileBack
                onMobileBack={() => setMobileList(true)}
              />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 bg-[var(--lms-bg)] p-8 text-center md:min-h-[320px]">
                <p className="max-w-sm text-sm text-zinc-500">
                  Select a conversation or start a new chat with someone from your courses.
                </p>
                <Button variant="outline" className="border-white/15 md:hidden" onPress={() => setMobileList(true)}>
                  Show chats
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewModal ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="new-chat-title"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.1] bg-[var(--lms-surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <h2 id="new-chat-title" className="font-semibold text-white">
                New chat
              </h2>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.06]"
                onClick={() => setShowNewModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto">
              <p className="border-b border-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Message your instructor
              </p>
              <p className="border-b border-white/[0.06] px-4 py-2 text-xs text-zinc-500">
                Pick a course you are enrolled in. The thread is scoped to that course.
              </p>
              <ul className="divide-y divide-white/[0.06]">
                {enrollmentRows.length === 0 ? (
                  <li className="px-4 py-4 text-sm text-zinc-500">No enrollments found.</li>
                ) : (
                  enrollmentRows.map(({ enrollment, course, instructorId }) => (
                    <li key={enrollment.id}>
                      <button
                        type="button"
                        className="flex w-full flex-col items-start gap-1 px-4 py-3 text-start text-sm text-white hover:bg-white/[0.04]"
                        onClick={() => startThread(course.id, instructorId)}
                      >
                        <span className="font-medium">{course.title}</span>
                        <span className="text-xs text-zinc-500">
                          Instructor
                          {course.instructor_detail?.username
                            ? ` · @${course.instructor_detail.username}`
                            : ` · id ${instructorId}`}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>

              {teachingCourses.length > 0 ? (
                <>
                  <p className="border-b border-t border-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Message a student (you teach)
                  </p>
                  <div className="space-y-2 border-b border-white/[0.06] px-4 py-3">
                    <label className="block text-xs text-zinc-500" htmlFor="pick-teach-course">
                      Course
                    </label>
                    <select
                      id="pick-teach-course"
                      className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white"
                      value={studentPickerCourseId ?? ""}
                      onChange={(e) => setStudentPickerCourseId(Number(e.target.value) || null)}
                    >
                      {teachingCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ul className="divide-y divide-white/[0.06]">
                    {pickerStudentsLoading ? (
                      <li className="px-4 py-4 text-sm text-zinc-500">Loading students…</li>
                    ) : pickerStudents.length === 0 ? (
                      <li className="px-4 py-4 text-sm text-zinc-500">No students returned for this course.</li>
                    ) : (
                      pickerStudents
                        .filter((row) => effectiveMe == null || courseStudentUserId(row) !== effectiveMe)
                        .map((row) => {
                          const sid = courseStudentUserId(row);
                          const cid = studentPickerCourseId ?? teachingCourses[0]?.id;
                          if (cid == null) return null;
                          return (
                            <li key={`${cid}-${sid}`}>
                              <button
                                type="button"
                                className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-start text-sm text-white hover:bg-white/[0.04]"
                                onClick={() => startThread(cid, sid)}
                              >
                                <span className="font-medium">{courseStudentLabel(row)}</span>
                                {row.enrolled_at ? (
                                  <span className="text-xs text-zinc-500">
                                    Joined {new Date(row.enrolled_at).toLocaleDateString()}
                                  </span>
                                ) : null}
                              </button>
                            </li>
                          );
                        })
                    )}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <p className="shrink-0 py-3 text-center text-sm">
        <Link href="/learn" className="text-[var(--lms-accent)] hover:underline">
          ← Back to learning
        </Link>
      </p>
    </div>
  );
}
