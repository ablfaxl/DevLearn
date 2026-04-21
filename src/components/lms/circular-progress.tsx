/** Decorative ring (0–100) for course cards — matches mobile LMS mockups. */
const R = 16;
const C = 2 * Math.PI * R;

export function CircularProgress({ percent, label }: { percent: number; label?: string }) {
  const p = Math.min(100, Math.max(0, percent));
  const dash = `${(p / 100) * C} ${C}`;
  return (
    <div
      className="relative flex size-14 shrink-0 items-center justify-center"
      title={label ?? `${p}%`}
      aria-label={label ?? `${Math.round(p)} percent`}
    >
      <svg className="size-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
        <circle cx="18" cy="18" r={R} fill="none" className="stroke-white/10" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={R}
          fill="none"
          className="stroke-[var(--lms-accent)]"
          strokeWidth="3"
          strokeDasharray={dash}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold tabular-nums text-white">{Math.round(p)}%</span>
    </div>
  );
}
