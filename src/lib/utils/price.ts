/** Normalize Django `Decimal` JSON (string) or number to a finite number. */
export function parseCoursePrice(value: string | number | undefined | null): number {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = parseFloat(String(value).trim());
  return Number.isFinite(n) ? n : 0;
}
