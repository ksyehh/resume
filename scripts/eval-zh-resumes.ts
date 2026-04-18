/**
 * Batch-evaluate Chinese resume PDFs from `zh-resume-samples/` (gitignored) or ZH_SAMPLES_DIR.
 * Run after `npm install` (copies pdfjs cmaps to public/pdfjs). Uses tsx to avoid Next/Jest rewriting Node built-ins.
 *
 * Usage: npm run eval:zh-resumes
 *        ZH_SAMPLES_DIR=/path/to/pdfs npm run eval:zh-resumes
 */
import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import {
  readPdf,
  type ReadPdfOptions,
} from "../src/app/lib/parse-resume-from-pdf/read-pdf";
import { groupTextItemsIntoLines } from "../src/app/lib/parse-resume-from-pdf/group-text-items-into-lines";
import { groupLinesIntoSections } from "../src/app/lib/parse-resume-from-pdf/group-lines-into-sections";
import { extractResumeFromSections } from "../src/app/lib/parse-resume-from-pdf/extract-resume-from-sections";

const defaultDir = path.join(process.cwd(), "zh-resume-samples");
const samplesDir = process.env.ZH_SAMPLES_DIR ?? defaultDir;

function getLocalPdfJsReadOptions(): ReadPdfOptions | undefined {
  const localDir = path.join(process.cwd(), "public", "pdfjs");
  if (
    fs.existsSync(path.join(localDir, "cmaps")) &&
    fs.existsSync(path.join(localDir, "standard_fonts"))
  ) {
    const href = pathToFileURL(localDir).href;
    const base = href.endsWith("/") ? href : `${href}/`;
    return { pdfJsAssetBaseUrl: base };
  }
  return undefined;
}

const readPdfOptions = getLocalPdfJsReadOptions();

function listPdfFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .map((f) => path.join(dir, f));
}

async function main() {
  const pdfs = listPdfFiles(samplesDir);
  if (pdfs.length === 0) {
    console.log(
      JSON.stringify(
        {
          samplesDir,
          count: 0,
          message:
            "No PDFs found. Create zh-resume-samples/ or set ZH_SAMPLES_DIR.",
        },
        null,
        2
      )
    );
    process.exit(0);
  }

  const rows: Record<string, unknown>[] = [];
  for (const abs of pdfs) {
    const fileUrl = pathToFileURL(abs).href;
    try {
      const items = await readPdf(fileUrl, readPdfOptions);
      const lines = groupTextItemsIntoLines(items);
      const sections = groupLinesIntoSections(lines);
      const sectionNames = Object.keys(sections).filter((k) => {
        const v = (sections as Record<string, unknown>)[k];
        return Array.isArray(v) && v.length > 0;
      });
      const resume = extractResumeFromSections(sections);
      rows.push({
        file: path.basename(abs),
        textItemCount: items.length,
        lineCount: lines.length,
        sectionNames,
        profile: {
          name: resume.profile.name ?? "",
          phone: resume.profile.phone ?? "",
          email: resume.profile.email ?? "",
        },
        workExperienceCount: resume.workExperiences.length,
        educationCount: resume.educations.length,
        projectCount: resume.projects.length,
      });
    } catch (e) {
      rows.push({
        file: path.basename(abs),
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  console.log(JSON.stringify({ samplesDir, count: rows.length, results: rows }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
