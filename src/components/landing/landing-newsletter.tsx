"use client";

import { ApiError, parseFieldErrors } from "@/lib/api/client";
import { subscribeNewsletter } from "@/lib/api/newsletter";
import { Button, Input, Label } from "@heroui/react";
import { Mail } from "lucide-react";
import { useState } from "react";

export function LandingNewsletter() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [emailErrors, setEmailErrors] = useState<string[] | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setEmailErrors(null);
    setPending(true);
    try {
      await subscribeNewsletter(email);
      setMessage("Thanks — you are subscribed.");
      setEmail("");
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = parseFieldErrors(err.body);
        if (fe?.email?.length) {
          setEmailErrors(fe.email);
        } else {
          setMessage(err.message);
        }
      } else {
        setMessage(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="border-t border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-950 sm:py-20"
      aria-labelledby="newsletter-heading"
    >
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/60 dark:text-fuchsia-300">
          <Mail className="size-6" aria-hidden />
        </div>
        <h2
          id="newsletter-heading"
          className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
        >
          Stay in the loop
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
          Occasional updates on new courses and platform tips. No spam.
        </p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:mx-auto sm:max-w-md sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 text-left">
            <Label.Root htmlFor="newsletter-email" className="sr-only">
              Email
            </Label.Root>
            <Input
              id="newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full"
              disabled={pending}
            />
            {emailErrors?.length ? (
              <p className="mt-1.5 text-sm text-red-700">{emailErrors.join(" ")}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full shrink-0 sm:w-auto" isDisabled={pending}>
            {pending ? "Subscribing…" : "Subscribe"}
          </Button>
        </form>
        {message ? (
          <p
            className={`mt-4 text-sm font-medium ${message.startsWith("Thanks") ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
