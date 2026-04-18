/**
 * Unicode normalize PDF-extracted strings (full-width punctuation, compatibility chars).
 * Call once after readPdf, before line grouping.
 */
export function normalizePdfText(text: string): string {
  try {
    return text.normalize("NFKC");
  } catch {
    return text;
  }
}
