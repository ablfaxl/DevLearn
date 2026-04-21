import Link from "next/link";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/" className="text-sm font-medium text-fuchsia-700 dark:text-fuchsia-400">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-zinc-900 dark:text-white">Terms of use</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        Replace this placeholder with your terms of service and refund rules once your legal team is ready.
      </p>
    </div>
  );
}
