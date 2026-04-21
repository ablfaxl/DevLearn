"use client";

import { Button, Input } from "@heroui/react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = useCallback(() => {
    const trimmed = q.trim();
    const url = trimmed ? `/courses?q=${encodeURIComponent(trimmed)}` : "/courses";
    router.push(url);
  }, [q, router]);

  return (
    <form
      className="flex w-full max-w-md gap-2"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Input
        type="search"
        placeholder="Search courses…"
        className="min-w-0 flex-1"
        aria-label="Search courses"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Button type="submit" variant="primary" className="shrink-0 gap-1.5 px-3" aria-label="Search">
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
