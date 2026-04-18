import type { TextItem, FeatureSet } from "lib/parse-resume-from-pdf/types";

const isTextItemBold = (fontName: string) =>
  fontName.toLowerCase().includes("bold");
export const isBold = (item: TextItem) => isTextItemBold(item.fontName);
/** Any Unicode letter (Latin, CJK, etc.) — used to distinguish text from pure numbers/symbols. */
export const hasLetter = (item: TextItem) => /\p{L}/u.test(item.text);

/** Latin letters only — used for “ALL CAPS” section titles (not meaningful for CJK). */
const hasLatinLetter = (item: TextItem) => /[a-zA-Z]/.test(item.text);
export const hasNumber = (item: TextItem) => /[0-9]/.test(item.text);
export const hasComma = (item: TextItem) => item.text.includes(",");
export const getHasText = (text: string) => (item: TextItem) =>
  item.text.includes(text);
export const hasOnlyLettersSpacesAmpersands = (item: TextItem) =>
  /^[A-Za-z\s&]+$/.test(item.text);
export const hasLetterAndIsAllUpperCase = (item: TextItem) =>
  hasLatinLetter(item) && item.text.toUpperCase() === item.text;

// Date Features
const hasYear = (item: TextItem) => /(?:19|20)\d{2}/.test(item.text);
// prettier-ignore
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const hasMonth = (item: TextItem) =>
  MONTHS.some(
    (month) =>
      item.text.includes(month) || item.text.includes(month.slice(0, 4))
  );
const SEASONS = ["Summer", "Fall", "Spring", "Winter"];
const hasSeason = (item: TextItem) =>
  SEASONS.some((season) => item.text.includes(season));
const hasPresent = (item: TextItem) =>
  /\bPresent\b/i.test(item.text) ||
  item.text.includes("至今") ||
  item.text.includes("现在");

/** e.g. 2020年3月, 2020.01, 2020-03 */
const hasChineseStyleDate = (item: TextItem) =>
  /(?:19|20)\d{2}\s*年|(?:19|20)\d{2}\s*[./年-]\s*\d{1,2}\s*月?/.test(item.text) ||
  /\d{1,2}\s*月\s*\d{1,2}\s*日?/.test(item.text);

/** Range connectors common on CN resumes */
const hasZhDateRangeMark = (item: TextItem) =>
  /[~～至到]|—{1,2}|–|\s*-\s*\d{4}/.test(item.text);

export const DATE_FEATURE_SETS: FeatureSet[] = [
  [hasYear, 1],
  [hasMonth, 1],
  [hasSeason, 1],
  [hasPresent, 1],
  [hasChineseStyleDate, 1],
  [hasZhDateRangeMark, 1],
  [hasComma, -1],
];
