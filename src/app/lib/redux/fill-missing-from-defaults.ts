type PlainObject = { [key: string]: unknown };

const isPlainObject = (v: unknown): v is PlainObject =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/**
 * For each key present on `defaults`, if `merged[key]` is `undefined`, assign a deep clone
 * of the default. Recurse into nested plain objects (not arrays).
 */
export function fillMissingFromDefaults<T extends PlainObject>(
  merged: T,
  defaults: T
): void {
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const d = defaults[key];
    const c = merged[key];
    if (c === undefined) {
      (merged as PlainObject)[key as string] = structuredClone(d) as unknown;
      continue;
    }
    if (isPlainObject(d) && isPlainObject(c)) {
      fillMissingFromDefaults(c as PlainObject, d as PlainObject);
    }
  }
}
