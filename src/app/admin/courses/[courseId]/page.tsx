import { CourseEditor } from "@/components/admin/course-editor";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function AdminCourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  const id = Number(courseId);
  if (!Number.isInteger(id) || id < 1) notFound();
  return <CourseEditor courseId={id} />;
}
