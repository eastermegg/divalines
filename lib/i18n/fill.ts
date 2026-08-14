/**
 * Fill `{token}` placeholders in a dictionary string. Framework-neutral
 * (no "use client") so it can run in both Server and Client Components —
 * keep it out of context.tsx, which is client-only.
 */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}
