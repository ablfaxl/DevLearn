"use client";

import { ROUTES } from "@/constants";
import { registerUser } from "@/lib/api/auth";
import { errMessage } from "@/lib/api/client";
import { Button, Input, Label } from "@heroui/react";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RegisterRole = "student" | "instructor";

type RegisterFormProps = {
  role: RegisterRole;
  heading: string;
  subtitle: string;
};

export function RegisterForm({ role, heading, subtitle }: RegisterFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await registerUser({ username: username.trim(), email: email.trim(), password, role });
      router.push(`${ROUTES.ADMIN_LOGIN}?registered=1`);
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-5rem)] items-center justify-center px-4 py-16 dark:bg-zinc-950/50">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(243, 142, 67, 0.35), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200/80 bg-white/95 p-8 shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-950/5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95 dark:ring-zinc-800">
          <div className="text-center">
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {heading}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 w-full space-y-5">
            <div className="space-y-1.5 w-full">
              <Label.Root htmlFor="reg-user" className="text-zinc-700">
                Username
              </Label.Root>
              <div className="relative w-full mt-2">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="reg-user"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="secondary"
                  disabled={pending}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5 w-full">
              <Label.Root htmlFor="reg-email" className="text-zinc-700">
                Email
              </Label.Root>
              <div className="relative w-full mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="secondary"
                  disabled={pending}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5 w-full">
              <Label.Root htmlFor="reg-pass" className="text-zinc-700">
                Password
              </Label.Root>
              <div className="relative w-full mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="reg-pass"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="secondary"
                  disabled={pending}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-sm text-amber-100/90">
              Registering as <strong>{role}</strong>.
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <Button
              variant="secondary"
              type="submit"
              className="mt-2 h-11 w-full font-semibold bg-(--lms-accent) text-white hover:bg-(--lms-accent-hover)"
              isDisabled={pending}
            >
              {pending ? "Creating…" : "Register"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href={ROUTES.ADMIN_LOGIN}
              className="font-semibold text-nowrap text-(--lms-accent) hover:underline"
            >
              Sign in
            </Link>
          </p>

          {role === "student" ? (
            <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Want to teach?{" "}
              <Link href={ROUTES.REGISTER_INSTRUCTOR} className="font-semibold text-(--lms-accent) hover:underline">
                Create instructor account
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
