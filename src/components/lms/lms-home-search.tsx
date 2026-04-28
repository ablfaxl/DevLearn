"use client";

import { Button, Input } from "@heroui/react";
import { Filter, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function LmsHomeSearch() {
  const pathname = usePathname();

  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = useCallback(() => {
    const trimmed = q.trim();
    router.push(trimmed ? `/courses?q=${encodeURIComponent(trimmed)}` : "/courses");
  }, [q, router]);
  if (pathname !== "/") return null;

  return (
    <div className="bg-[var(--lms-bg)] px-4 pb-6 pt-2 sm:px-6 md:hidden">
      <div className="mx-auto max-w-7xl">
        <form
          className="flex gap-2"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
            <Input
              type="search"
              placeholder="Search courses, skills, topics…"
              className="w-full rounded-2xl border-white/[0.08] bg-[var(--lms-surface)] ps-11 text-white placeholder:text-zinc-500"
              aria-label="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-2xl border-white/[0.12] bg-[var(--lms-surface)] text-zinc-300"
            aria-label="Filters"
            onPress={() => router.push("/courses")}
          >
            <Filter className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
