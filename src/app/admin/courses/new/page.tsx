"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { errMessage } from "@/lib/api/client";
import { createCourse } from "@/lib/api/courses";
import { canAccessContentStudio, isAdminRole, isStudentRole } from "@/lib/auth/roles";
import { Button, Input, Label } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminNewCoursePage() {
  const router = useRouter();
  const { bootstrapped, profile, profileLoading, role } = useAdminAuth();
  const showInstructorField = profile?.access?.can_manage_users ?? isAdminRole(role);
  const canCreate = profile?.access?.can_write_courses ?? canAccessContentStudio(role);

  useEffect(() => {
    if (!bootstrapped || profileLoading) return;
    if (isStudentRole(role)) router.replace(ROUTES.LEARN);
    if (profile?.access && !profile.access.can_write_courses) router.replace(ROUTES.ADMIN_COURSES);
  }, [bootstrapped, profile, profileLoading, role, router]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const body: { title: string; description: string; instructor?: number } = {
        title: title.trim(),
        description: description.trim(),
      };
      if (showInstructorField) {
        const ins = instructor.trim();
        if (ins) {
          const n = Number(ins);
          if (!Number.isInteger(n) || n < 1) {
            setError("Instructor must be a positive integer user id.");
            setPending(false);
            return;
          }
          body.instructor = n;
        }
      }
      const created = await createCourse(body);
      router.replace(ROUTES.adminCourse(created.id));
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href={ROUTES.ADMIN_COURSES} className="text-sm font-medium text-fuchsia-700 hover:underline">
        ← Back to courses
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New course</h1>
        <p className="mt-1 text-sm text-gray-600">
          {showInstructorField ? (
            <>
              As <strong>admin</strong>, you may set <strong>Instructor user id</strong> to assign another teacher;
              leave it blank to use defaults on the server.
            </>
          ) : (
            <>
              As <strong>instructor</strong>, the course is created for you — do not set another instructor here.
            </>
          )}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-1.5">
          <Label.Root htmlFor="course-title">Title</Label.Root>
          <Input
            id="course-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label.Root htmlFor="course-description">Description</Label.Root>
          <textarea
            id="course-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-32 w-full rounded-lg border border-gray-200 p-3 text-sm outline-none ring-fuchsia-500 focus-visible:ring-2"
            required
          />
        </div>
        {showInstructorField ? (
          <div className="space-y-1.5">
            <Label.Root htmlFor="course-instructor">Instructor user id (admin)</Label.Root>
            <Input
              id="course-instructor"
              inputMode="numeric"
              placeholder="Optional — another teacher’s user id"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
            />
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" isDisabled={pending}>
            {pending ? "Creating…" : "Create course"}
          </Button>
          <Button type="button" variant="outline" onPress={() => router.push(ROUTES.ADMIN_COURSES)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
