# PDF 简历解析（无 OCR）

## 版式建议

- **单栏**布局识别效果最好；多栏、复杂表格或大量文本框叠放时，文本绘制顺序可能与视觉顺序不一致，解析会不稳定。
- 从 Word / WPS 导出 PDF 时尽量使用**嵌入字体**的导出选项，避免扫描版（无文本层则本管线无法抽取）。

## 中文与资源

- `readPdf` 依赖 **pdfjs-dist** 的 CMap / standard fonts。安装依赖后会通过 `postinstall` 将资源复制到 `public/pdfjs/`（该目录已 `.gitignore`）；部署时需包含该目录或重新执行 `npm install`。
- 抽取前会对字符串做 **NFKC** 归一化，减轻全角标点、兼容字形差异。

## 本地样本回归

1. 在仓库根目录创建 `zh-resume-samples/`（已在 `.gitignore`），放入脱敏后的 `.pdf`。
2. 运行：`npm run eval:zh-resumes`（使用 `tsx` 执行 `scripts/eval-zh-resumes.ts`）。若存在 `public/pdfjs/`，脚本会通过 `readPdf` 的 `pdfJsAssetBaseUrl` 传入本地 `file://` 基址，避免 Node 环境依赖外网拉取 standard_fonts。  
   或指定目录：`ZH_SAMPLES_DIR=/path/to/pdfs npm run eval:zh-resumes`  
   若无 PDF，脚本会输出 JSON 提示并退出码 0。

仓库内 **Jest** 字段级回归见 `extract-resume-from-sections/extract-resume-from-sections.test.ts`（不依赖本地 PDF 二进制）。
