import { readPdf, type ReadPdfOptions } from "lib/parse-resume-from-pdf/read-pdf";

export type { ReadPdfOptions };
import { groupTextItemsIntoLines } from "lib/parse-resume-from-pdf/group-text-items-into-lines";
import { groupLinesIntoSections } from "lib/parse-resume-from-pdf/group-lines-into-sections";
import { extractResumeFromSections } from "lib/parse-resume-from-pdf/extract-resume-from-sections";

/**
 * Resume parser util that parses a resume from a resume pdf file
 *
 * Note: The parser targets single-column layouts; Chinese PDFs need cmaps (see read-pdf).
 * Section heuristics include common Chinese headings; field extraction is still stronger for English.
 */
export const parseResumeFromPdf = async (
  fileUrl: string,
  readPdfOptions?: ReadPdfOptions
) => {
  // Step 1. Read a pdf resume file into text items to prepare for processing
  const textItems = await readPdf(fileUrl, readPdfOptions);

  // Step 2. Group text items into lines
  const lines = groupTextItemsIntoLines(textItems);

  // Step 3. Group lines into sections
  const sections = groupLinesIntoSections(lines);

  // Step 4. Extract resume from sections
  const resume = extractResumeFromSections(sections);

  return resume;
};
