import { readPdf, type ReadPdfOptions } from "lib/parse-resume-from-pdf/read-pdf";
import { groupTextItemsIntoLines } from "lib/parse-resume-from-pdf/group-text-items-into-lines";

export type { ReadPdfOptions };

export const extractTextOnlyFromPdf = async (
  fileUrl: string, readPdfOptions?: ReadPdfOptions): Promise<string> => {
  console.log("调用 readPdf...");
  const textItems = await readPdf(fileUrl, readPdfOptions);
  console.log("textItems 数量:", textItems.length);

  const lines = groupTextItemsIntoLines(textItems);
  console.log("lines 数量:", lines.length);

  const textContent = lines
    .map((line) => line.map((item) => item.text).join(""))
    .filter((line) => line.trim().length > 0)
    .join("\n");

  console.log("最终提取的 textContent:", textContent);
  return textContent;
};
