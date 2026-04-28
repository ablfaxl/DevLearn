"use client";

import { useAdminAuth } from "@/features/auth";
import { ROUTES } from "@/constants";
import { Button, Input, Label } from "@heroui/react";
import { Lock, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AdminLoginForm({ showRegistered }: { showRegistered?: boolean }) {
  const { login, accessToken, bootstrapped } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!bootstrapped || !accessToken) return;
    window.location.assign(ROUTES.HOME);
  }, [accessToken, bootstrapped]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(username.trim(), password);
      window.location.assign(ROUTES.HOME);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-5rem)] items-center justify-center px-4 py-16 dark:bg-zinc-950/50">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(192, 38, 211, 0.35), transparent 60%)`,
        }}
        aria-hidden
      />
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200/80 bg-white/95 p-8 shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-950/5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95 dark:ring-zinc-800">
          <div className="text-center">
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back
            </h1>
          </div>

          <form onSubmit={onSubmit} className="mt-8 w-full space-y-5">
            <div className="space-y-1.5 w-full">
              <Label.Root htmlFor="admin-username" className="text-zinc-700">
                Username
              </Label.Root>
              <div className="relative w-full mt-2">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="admin-username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  autoFocus
                  disabled={pending}
                  autoComplete="username"
                  onChange={(e) => setUsername(e.target.value)}
                  variant="secondary"
                  required
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <div className="space-y-1.5 w-full">
              <Label.Root htmlFor="admin-password" className="text-zinc-700">
                Password
              </Label.Root>
              <div className="relative w-full mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="admin-password"
                  name="password"
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  variant="secondary"
                  disabled={pending}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            {showRegistered ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
                Account created. Sign in with your new credentials.
              </div>
            ) : null}
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            ) : null}
            <Button
              variant="secondary"
              type="submit"
              className="mt-2 h-11 w-full font-semibold bg-(--lms-accent) text-white hover:bg-(--lms-accent-hover)  "
              isDisabled={pending}
            >
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            New here?{" "}
            <Link
              href="/register"
              className="font-semibold text-nowrap text-(--lms-accent) hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
