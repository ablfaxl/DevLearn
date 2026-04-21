"use client";

import { ROUTES } from "@/constants";
import { registerUser } from "@/lib/api/auth";
import { errMessage } from "@/lib/api/client";
import { Button, Input, Label } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
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
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Create account</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        PRD: registration. Expects <code className="text-xs">POST /api/v1/auth/register/</code> on your backend.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label.Root htmlFor="reg-user">Username</Label.Root>
          <Input
            id="reg-user"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label.Root htmlFor="reg-email">Email</Label.Root>
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label.Root htmlFor="reg-pass">Password</Label.Root>
          <Input
            id="reg-pass"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label.Root htmlFor="reg-role">Role</Label.Root>
          <select
            id="reg-role"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={role}
            onChange={(e) => setRole(e.target.value as "student" | "instructor")}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <Button type="submit" className="w-full" isDisabled={pending}>
          {pending ? "Creating…" : "Register"}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href={ROUTES.ADMIN_LOGIN} className="font-semibold text-fuchsia-700 dark:text-fuchsia-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
