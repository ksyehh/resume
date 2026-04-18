import type en from "messages/en.json";

export type Messages = typeof en;

/** Replace {{name}} placeholders in ICU-like simple templates */
export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`
  );
}

export function getMessage(messages: Messages, path: string): string {
  const parts = path.split(".");
  let current: unknown = messages;
  for (const p of parts) {
    if (current && typeof current === "object" && p in current) {
      current = (current as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}
