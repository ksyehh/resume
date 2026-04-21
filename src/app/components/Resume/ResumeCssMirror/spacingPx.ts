import { PX_PER_PT } from "lib/constants";
import { spacing } from "components/Resume/ResumePDF/styles";

/** Convert react-pdf spacing token to CSS pixels (same basis as iframe preview). */
export function spacingPx(key: keyof typeof spacing): number {
  const s = spacing[key];
  if (s === "0" || s === "100%") return 0;
  const pt = parseFloat(String(s).replace("pt", ""));
  return pt * PX_PER_PT;
}
