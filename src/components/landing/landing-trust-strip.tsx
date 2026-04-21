export function LandingTrustStrip() {
  const items = ["Structured curriculum", "Dark-first UI", "JWT + refresh flow", "Newsletter ready"];
  return (
    <section className="border-y border-[var(--lms-border)] bg-[var(--lms-surface)] py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4 text-center text-xs font-medium uppercase tracking-wider text-[var(--lms-text-subtle)] sm:text-sm">
        {items.map((t) => (
          <span key={t} className="text-[var(--lms-text-muted)]">
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}
