// Getting pdfjs to work is tricky.
// https://stackoverflow.com/a/63486898/7699841
import * as pdfjs from "pdfjs-dist";

import type { TextItem as PdfjsTextItem } from "pdfjs-dist/types/src/display/api";
import type { TextItem, TextItems } from "lib/parse-resume-from-pdf/types";
import { normalizePdfText } from "lib/parse-resume-from-pdf/normalize-text";

/** Keep in sync with package.json dependency `pdfjs-dist`. */
const PDFJS_DIST_VERSION = "3.7.107";

let pdfWorkerConfigured = false;

/** Browser: use CDN worker for reliability. Node: file URL. */
function ensurePdfjsWorker(): void {
  if (pdfWorkerConfigured) return;
  pdfWorkerConfigured = true;

  if (typeof window !== "undefined") {
    // 直接使用 CDN worker，更可靠
    const src = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_DIST_VERSION}/build/pdf.worker.min.js`;
    console.log("设置 pdf.js worker:", src);
    pdfjs.GlobalWorkerOptions.workerSrc = src;
  } else {
    // eslint-disable-next-line -- Node-only path bootstrap for eval scripts
    const { join } = require("path") as typeof import("path");
    // eslint-disable-next-line -- Node-only path bootstrap for eval scripts
    const { pathToFileURL } = require("url") as typeof import("url");
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
      join(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.min.js")
    ).href;
  }
}

/**
 * Same-origin assets from `public/pdfjs/` (populated by `npm postinstall` → scripts/copy-pdfjs-assets.mjs).
 * Falls back to CDN when `window` is unavailable (e.g. rare Node contexts).
 */
function getPdfJsAssetBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    const localBase = `${window.location.origin}/pdfjs/`;
    console.log("使用本地 pdfjs assets:", localBase);
    return localBase;
  }
  const cdnBase = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_DIST_VERSION}/`;
  console.log("使用 CDN pdfjs assets:", cdnBase);
  return cdnBase;
}

export type ReadPdfOptions = {
  /** When set (e.g. Node eval script), used for cmaps / standard_fonts instead of window origin or CDN. */
  pdfJsAssetBaseUrl?: string;
};

/**
 * Step 1: Read pdf and output textItems by concatenating results from each page.
 *
 * To make processing easier, it returns a new TextItem type, which removes unused
 * attributes (dir, transform), adds x and y positions, and replaces loaded font
 * name with original font name.
 *
 * @example
 * const onFileChange = async (e) => {
 *     const fileUrl = URL.createObjectURL(e.target.files[0]);
 *     const textItems = await readPdf(fileUrl);
 * }
 */
export const readPdf = async (
  fileUrl: string,
  options?: ReadPdfOptions
): Promise<TextItems> => {
  ensurePdfjsWorker();
  const base = options?.pdfJsAssetBaseUrl ?? getPdfJsAssetBaseUrl();
  console.log("正在加载 PDF...");
  
  try {
    const pdfFile = await pdfjs
      .getDocument({
        url: fileUrl,
        cMapUrl: `${base}cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `${base}standard_fonts/`,
        useSystemFonts: true,
      })
      .promise;
    
    console.log(`PDF 加载成功，共 ${pdfFile.numPages} 页`);
    let textItems: TextItems = [];

    for (let i = 1; i <= pdfFile.numPages; i++) {
      console.log(`正在处理第 ${i} 页...`);
      // Parse each page into text content
      const page = await pdfFile.getPage(i);
      const textContent = await page.getTextContent();
      console.log(`第 ${i} 页原始 items 数量:`, textContent.items.length);

      // Wait for font data to be loaded
      await page.getOperatorList();
      const commonObjs = page.commonObjs;

      // Convert Pdfjs TextItem type to new TextItem type
      const pageTextItems = textContent.items.map((item) => {
        const {
          str: text,
          dir, // Remove text direction
          transform,
          fontName: pdfFontName,
          ...otherProps
        } = item as PdfjsTextItem;

        // Extract x, y position of text item from transform.
        // As a side note, origin (0, 0) is bottom left.
        // Reference: https://github.com/mozilla/pdf.js/issues/5643#issuecomment-496648719
        const x = transform[4];
        const y = transform[5];

        // Use commonObjs to convert font name to original name (e.g. "GVDLYI+Arial-BoldMT")
        // since non system font name by default is a loaded name, e.g. "g_d8_f1"
        // Reference: https://github.com/mozilla/pdf.js/pull/15659
        const fontObj = commonObjs.get(pdfFontName);
        const fontName = fontObj?.name ?? pdfFontName;

        // pdfjs reads a "-" as "-­‐" in the resume example. This is to revert it.
        // Note "-­‐" is "-&#x00AD;‐" with a soft hyphen in between. It is not the same as "--"
        const newText = text.replace(/-­‐/g, "-");

        const newItem = {
          ...otherProps,
          fontName,
          text: newText,
          x,
          y,
        };
        return newItem;
      });

      console.log(`第 ${i} 页处理后 items 数量:`, pageTextItems.length);

      // Some pdf's text items are not in order. This is most likely a result of creating it
      // from design softwares, e.g. canvas. The commented out method can sort pageTextItems
      // by y position to put them back in order. But it is not used since it might be more
      // helpful to let users know that the pdf is not in order.
      // pageTextItems.sort((a, b) => Math.round(b.y) - Math.round(a.y));

      // Add text items of each page to total
      textItems.push(...pageTextItems);
    }

    console.log(`过滤前总 items 数量:`, textItems.length);

    // Filter out empty space textItem noise
    const isEmptySpace = (textItem: TextItem) =>
      !textItem.hasEOL && textItem.text.trim() === "";
    textItems = textItems.filter((textItem) => !isEmptySpace(textItem));
    
    console.log(`过滤后总 items 数量:`, textItems.length);

    for (const item of textItems) {
      item.text = normalizePdfText(item.text);
    }

    return textItems;
  } catch (error) {
    console.error("readPdf 错误:", error);
    throw error;
  }
};
