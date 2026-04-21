import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100dvh-4.5rem)] bg-linear-to-b from-zinc-100/90 via-white to-zinc-50/80 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
