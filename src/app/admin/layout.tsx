import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100dvh-4.5rem)] bg-linear-to-b from-(--lms-surface)/90 via-(--lms-surface) to-(--lms-surface)/80 dark:from-(--lms-surface)/950 dark:via-(--lms-surface)/950 dark:to-(--lms-surface)/900">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
