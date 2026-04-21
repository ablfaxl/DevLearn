"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { ApiError, errMessage } from "@/lib/api/client";
import { createContentJson, createContentMultipart, deleteContent } from "@/lib/api/contents";
import { deleteCourse, getCourse, updateCourse } from "@/lib/api/courses";
import { createLesson, deleteLesson, updateLesson } from "@/lib/api/lessons";
import { createModule, deleteModule, updateModule } from "@/lib/api/modules";
import type {
  Content,
  CourseDetail,
  LessonContentType,
  LessonDetail,
  ModuleDetail,
} from "@/lib/api/types";
import { isAdminRole } from "@/lib/auth/roles";
import { Button, Input, Label } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const CONTENT_TYPES: LessonContentType[] = ["text", "video", "audio", "document"];

function sortedContents(contents: Content[]) {
  return [...contents].sort((a, b) => a.order - b.order);
}

type CourseEditorProps = {
  courseId: number;
};

export function CourseEditor({ courseId }: CourseEditorProps) {
  const router = useRouter();
  const { profile, role } = useAdminAuth();
  const access = profile?.access;
  const metaLocked = Boolean(access && !access.can_write_courses);
  const learningLocked = Boolean(access && !access.can_write_learning_content);
  const showInstructorField = access ? access.can_manage_users : isAdminRole(role);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseInstructor, setCourseInstructor] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    const c = await getCourse(courseId);
    setCourse(c);
    setCourseTitle(c.title);
    setCourseDescription(c.description);
    setCourseInstructor(String(c.instructor));
  }, [courseId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const c = await getCourse(courseId);
        if (cancelled) return;
        setCourse(c);
        setCourseTitle(c.title);
        setCourseDescription(c.description);
        setCourseInstructor(String(c.instructor));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Failed to load course");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const modules = useMemo(() => course?.modules ?? [], [course]);

  async function saveCourse() {
    if (!course || metaLocked) return;
    setSavingCourse(true);
    setError(null);
    setInfo(null);
    try {
      const payload: { title: string; description: string; instructor?: number } = {
        title: courseTitle.trim(),
        description: courseDescription.trim(),
      };
      const ins = courseInstructor.trim();
      if (ins && Number(ins) !== course.instructor) {
        const n = Number(ins);
        if (Number.isInteger(n) && n > 0) payload.instructor = n;
      }
      await updateCourse(course.id, payload, "PATCH");
      setInfo("Course saved.");
      await refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : errMessage(e));
    } finally {
      setSavingCourse(false);
    }
  }

  async function onDeleteCourse() {
    if (!course || metaLocked) return;
    if (!window.confirm(`Delete course “${course.title}”? This cannot be undone.`)) return;
    try {
      await deleteCourse(course.id);
      router.replace(ROUTES.ADMIN_COURSES);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : errMessage(e));
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-600">Loading course…</p>;
  }
  if (error && !course) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <Link
          href={ROUTES.ADMIN_COURSES}
          className="text-sm font-medium text-fuchsia-700 hover:underline"
        >
          ← Back to courses
        </Link>
      </div>
    );
  }
  if (!course) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={ROUTES.ADMIN_COURSES}
            className="text-sm font-medium text-fuchsia-700 hover:underline"
          >
            ← Courses
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit: {course.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Instructor: {course.instructor_detail?.username ?? `#${course.instructor}`} · ID{" "}
            {course.id}
          </p>
        </div>
        <Button variant="danger" onPress={onDeleteCourse} isDisabled={metaLocked}>
          Delete course
        </Button>
      </div>

      {metaLocked ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          You can view this course, but your role is not allowed to change course details or delete it.
        </div>
      ) : null}
      {learningLocked ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          You can view modules and lessons, but your role is not allowed to edit learning content here.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      {info ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {info}
        </div>
      ) : null}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Course details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label.Root htmlFor="edit-title">Title</Label.Root>
            <Input
              id="edit-title"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              readOnly={metaLocked}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label.Root htmlFor="edit-description">Description</Label.Root>
            <textarea
              id="edit-description"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              readOnly={metaLocked}
              className="min-h-28 w-full rounded-lg border border-gray-200 p-3 text-sm outline-none ring-fuchsia-500 focus-visible:ring-2"
            />
          </div>
          {showInstructorField ? (
            <div className="space-y-1.5">
              <Label.Root htmlFor="edit-instructor">Instructor user id</Label.Root>
              <Input
                id="edit-instructor"
                inputMode="numeric"
                value={courseInstructor}
                onChange={(e) => setCourseInstructor(e.target.value)}
                readOnly={metaLocked}
              />
              <p className="text-xs text-gray-500">
                Admins can reassign. Instructors typically cannot change this.
              </p>
            </div>
          ) : null}
        </div>
        <div className="mt-4">
          <Button onPress={() => void saveCourse()} isDisabled={metaLocked || savingCourse}>
            {savingCourse ? "Saving…" : "Save course"}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Modules & lessons</h2>
        </div>
        <NewModuleForm
          courseId={course.id}
          lockLearning={learningLocked}
          onCreated={() => void refresh()}
          onError={setError}
        />
        <div className="space-y-6">
          {modules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              lockLearning={learningLocked}
              onRefresh={() => void refresh()}
              onError={setError}
              onInfo={setInfo}
            />
          ))}
          {modules.length === 0 ? (
            <p className="text-sm text-gray-500">No modules yet. Add one above.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function NewModuleForm({
  courseId,
  lockLearning,
  onCreated,
  onError,
}: {
  courseId: number;
  lockLearning: boolean;
  onCreated: () => void;
  onError: (s: string | null) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);

  if (lockLearning) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setPending(true);
    try {
      await createModule({
        course: courseId,
        title: title.trim(),
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      onCreated();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : errMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-4"
    >
      <p className="text-sm font-medium text-gray-800">Add module</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Input
          placeholder="Module title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="mt-3" size="sm" isDisabled={pending}>
        {pending ? "Adding…" : "Add module"}
      </Button>
    </form>
  );
}

function ModuleCard({
  module,
  lockLearning,
  onRefresh,
  onError,
  onInfo,
}: {
  module: ModuleDetail;
  lockLearning: boolean;
  onRefresh: () => void;
  onError: (s: string | null) => void;
  onInfo: (s: string | null) => void;
}) {
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(module.title);
    setDescription(module.description);
  }, [module.title, module.description]);

  async function saveModule() {
    if (lockLearning) return;
    onError(null);
    setSaving(true);
    try {
      await updateModule(
        module.id,
        { title: title.trim(), description: description.trim() },
        "PATCH"
      );
      onInfo("Module saved.");
      onRefresh();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : errMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function removeModule() {
    if (lockLearning) return;
    if (!window.confirm(`Delete module “${module.title}”?`)) return;
    onError(null);
    try {
      await deleteModule(module.id);
      onRefresh();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : errMessage(e));
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">Module {module.id}</h3>
        <Button size="sm" variant="danger" isDisabled={lockLearning} onPress={() => void removeModule()}>
          Delete module
        </Button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label.Root>Title</Label.Root>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            readOnly={lockLearning}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label.Root>Description</Label.Root>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            readOnly={lockLearning}
            className="min-h-20 w-full rounded-lg border border-gray-200 p-2 text-sm outline-none ring-fuchsia-500 focus-visible:ring-2"
          />
        </div>
      </div>
      <Button
        className="mt-2"
        size="sm"
        variant="outline"
        isDisabled={lockLearning || saving}
        onPress={() => void saveModule()}
      >
        {saving ? "Saving…" : "Save module"}
      </Button>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <h4 className="text-sm font-semibold text-gray-800">Lessons</h4>
        <NewLessonForm
          moduleId={module.id}
          lockLearning={lockLearning}
          onCreated={onRefresh}
          onError={onError}
        />
        <ul className="mt-4 space-y-4">
          {(module.lessons ?? []).map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              lockLearning={lockLearning}
              onRefresh={onRefresh}
              onError={onError}
              onInfo={onInfo}
            />
          ))}
          {(module.lessons ?? []).length === 0 ? (
            <li className="text-sm text-gray-500">No lessons in this module.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

function NewLessonForm({
  moduleId,
  lockLearning,
  onCreated,
  onError,
}: {
  moduleId: number;
  lockLearning: boolean;
  onCreated: () => void;
  onError: (s: string | null) => void;
}) {
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<LessonContentType>("text");
  const [pending, setPending] = useState(false);

  if (lockLearning) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setPending(true);
    try {
      await createLesson({ module: moduleId, title: title.trim(), content_type: contentType });
      setTitle("");
      setContentType("text");
      onCreated();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : errMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-3 flex flex-wrap items-end gap-2">
      <Input
        className="min-w-[12rem] flex-1"
        placeholder="Lesson title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <select
        className="h-10 rounded-lg border border-gray-200 bg-white px-2 text-sm"
        value={contentType}
        onChange={(e) => setContentType(e.target.value as LessonContentType)}
        aria-label="Lesson content type"
      >
        {CONTENT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" isDisabled={pending}>
        {pending ? "Adding…" : "Add lesson"}
      </Button>
    </form>
  );
}

function LessonCard({
  lesson,
  lockLearning,
  onRefresh,
  onError,
  onInfo,
}: {
  lesson: LessonDetail;
  lockLearning: boolean;
  onRefresh: () => void;
  onError: (s: string | null) => void;
  onInfo: (s: string | null) => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [contentType, setContentType] = useState<LessonContentType>(lesson.content_type);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(lesson.title);
    setContentType(lesson.content_type);
  }, [lesson.title, lesson.content_type]);

  async function saveLesson() {
    if (lockLearning) return;
    onError(null);
    setSaving(true);
    try {
      await updateLesson(lesson.id, { title: title.trim(), content_type: contentType }, "PATCH");
      onInfo("Lesson saved.");
      onRefresh();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : errMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function removeLesson() {
    if (lockLearning) return;
    if (!window.confirm(`Delete lesson “${lesson.title}”?`)) return;
    onError(null);
    try {
      await deleteLesson(lesson.id);
      onRefresh();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : errMessage(e));
    }
  }

  const contents = sortedContents(lesson.contents ?? []);

  return (
    <li className="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-xs font-medium text-gray-500">Lesson {lesson.id}</span>
        <Button size="sm" variant="danger" isDisabled={lockLearning} onPress={() => void removeLesson()}>
          Delete
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <Input
          className="min-w-[10rem] flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={lockLearning}
        />
        <select
          className="h-10 rounded-lg border border-gray-200 bg-white px-2 text-sm disabled:opacity-60"
          value={contentType}
          onChange={(e) => setContentType(e.target.value as LessonContentType)}
          disabled={lockLearning}
          aria-label="Content type"
        >
          {CONTENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant="outline"
          isDisabled={lockLearning || saving}
          onPress={() => void saveLesson()}
        >
          Save
        </Button>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contents</p>
        <ul className="mt-2 space-y-2">
          {contents.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-gray-900">{c.title}</span>
                <span className="ml-2 text-xs text-gray-500">
                  {c.content_type} · order {c.order}
                </span>
                {c.file_url ? (
                  <a
                    href={c.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-xs text-fuchsia-700 underline"
                  >
                    file
                  </a>
                ) : null}
                {c.content ? (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">{c.content}</p>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="ghost"
                isDisabled={lockLearning}
                onPress={async () => {
                  if (lockLearning) return;
                  if (!window.confirm(`Delete content “${c.title}”?`)) return;
                  onError(null);
                  try {
                    await deleteContent(c.id);
                    onRefresh();
                  } catch (e) {
                    onError(e instanceof ApiError ? e.message : errMessage(e));
                  }
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <NewContentForm
          lessonId={lesson.id}
          lockLearning={lockLearning}
          existingOrders={contents.map((c) => c.order)}
          onCreated={onRefresh}
          onError={onError}
        />
      </div>
    </li>
  );
}

function NewContentForm({
  lessonId,
  lockLearning,
  existingOrders,
  onCreated,
  onError,
}: {
  lessonId: number;
  lockLearning: boolean;
  existingOrders: number[];
  onCreated: () => void;
  onError: (s: string | null) => void;
}) {
  const nextOrder = useMemo(() => {
    if (!existingOrders.length) return 1;
    return Math.max(...existingOrders) + 1;
  }, [existingOrders]);

  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<LessonContentType>("text");
  const [order, setOrder] = useState(String(nextOrder));
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setOrder(String(nextOrder));
  }, [nextOrder]);

  if (lockLearning) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);

    const orderNum = Number(order);
    if (!Number.isInteger(orderNum) || orderNum < 0) {
      onError("Order must be a non-negative integer.");
      return;
    }

    const trimmed = content.trim();
    if (contentType === "text" && !trimmed) {
      onError("Text content requires a non-empty body.");
      return;
    }
    if (contentType !== "text" && !trimmed && !file) {
      onError("For video/audio/document, provide a URL and/or a file.");
      return;
    }

    setPending(true);
    try {
      if (file) {
        const fd = new FormData();
        fd.set("lesson", String(lessonId));
        fd.set("title", title.trim());
        fd.set("content_type", contentType);
        fd.set("order", String(orderNum));
        if (trimmed) fd.set("content", trimmed);
        fd.set("file", file);
        await createContentMultipart(fd);
      } else {
        await createContentJson({
          lesson: lessonId,
          title: title.trim(),
          content_type: contentType,
          content: trimmed,
          order: orderNum,
        });
      }
      setTitle("");
      setContent("");
      setFile(null);
      setContentType("text");
      onCreated();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : errMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="mt-3 space-y-2 rounded-lg border border-dashed border-gray-200 p-3"
    >
      <p className="text-xs font-medium text-gray-700">Add content block</p>
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select
          className="h-10 rounded-lg border border-gray-200 bg-white px-2 text-sm"
          value={contentType}
          onChange={(e) => setContentType(e.target.value as LessonContentType)}
          aria-label="Block type"
        >
          {CONTENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Input
          className="w-24"
          inputMode="numeric"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          aria-label="Order"
        />
      </div>
      <textarea
        placeholder={
          contentType === "text"
            ? "HTML or plain text body"
            : "URL / embed (optional if uploading file)"
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-20 w-full rounded-lg border border-gray-200 p-2 text-sm outline-none ring-fuchsia-500 focus-visible:ring-2"
      />
      {contentType !== "text" ? (
        <div>
          <Label.Root className="text-xs">File (optional if URL set)</Label.Root>
          <input
            type="file"
            className="mt-1 block w-full text-sm text-gray-600"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      ) : null}
      <Button type="submit" size="sm" isDisabled={pending}>
        {pending ? "Creating…" : "Add content"}
      </Button>
    </form>
  );
}
