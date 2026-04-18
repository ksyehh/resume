"use client";

import { useCallback, useState } from "react";
import { readPdf } from "lib/parse-resume-from-pdf/read-pdf";
import type { TextItems } from "lib/parse-resume-from-pdf/types";

/**
 * Debug-only: upload a PDF and dump everything `readPdf` returns (no line/section parsing).
 * Open at /pdf-raw-debug
 */
export default function PdfRawDebugPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [textItems, setTextItems] = useState<TextItems>([]);
  const [fileName, setFileName] = useState<string>("");

  const onFile = useCallback(async (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      setErrorMessage("请选择 PDF 文件");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setTextItems([]);
    setFileName(file.name);

    const objectUrl = URL.createObjectURL(file);
    try {
      const items = await readPdf(objectUrl);
      setTextItems(items);
      setStatus("done");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
      setStatus("error");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }, []);

  const plainConcat = textItems.map((i) => i.text).join("");
  const jsonDump = JSON.stringify(textItems, null, 2);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 pb-24">
      <h1 className="text-xl font-semibold text-gray-900">
        PDF 原始读取调试（仅 readPdf）
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        上传 PDF 后展示 pdf.js 抽取的全部 TextItem，不做分行、分章节与字段解析。
      </p>

      <div className="mt-6">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50">
          <span>选择 PDF</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              void onFile(f);
              e.target.value = "";
            }}
          />
        </label>
        {fileName ? (
          <span className="ml-3 text-sm text-gray-600">当前：{fileName}</span>
        ) : null}
      </div>

      {status === "loading" ? (
        <p className="mt-4 text-sm text-gray-600">读取中…</p>
      ) : null}

      {status === "error" ? (
        <pre className="mt-4 whitespace-pre-wrap break-words rounded bg-red-50 p-3 text-sm text-red-900">
          {errorMessage}
        </pre>
      ) : null}

      {status === "done" && textItems.length > 0 ? (
        <div className="mt-6 space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-gray-800">统计</h2>
            <ul className="mt-2 list-inside list-disc text-sm text-gray-700">
              <li>TextItem 条数：{textItems.length}</li>
              <li>
                所有 <code className="text-xs">text</code> 拼接字符数（UTF-16
                码元）：{plainConcat.length}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-800">
              按 PDF 内顺序拼接全部 <code>text</code>（无分隔）
            </h2>
            <pre className="mt-2 max-h-[40vh] overflow-auto whitespace-pre-wrap break-words rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900">
              {plainConcat}
            </pre>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-800">
              完整 <code>TextItem[]</code> JSON（含 x/y/width/height/fontName/hasEOL 等）
            </h2>
            <pre className="mt-2 max-h-[50vh] overflow-auto whitespace-pre-wrap break-words rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900">
              {jsonDump}
            </pre>
          </section>
        </div>
      ) : status === "done" ? (
        <p className="mt-4 text-sm text-amber-800">
          读取完成但未得到任何 TextItem（可能无文本层或内容为空）。
        </p>
      ) : null}
    </main>
  );
}
