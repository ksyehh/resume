/**
 * Copy pdfjs-dist cmaps + standard_fonts into public/pdfjs/ for same-origin loading
 * (Chinese PDF CID fonts). Run via npm postinstall.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dist = path.join(root, "node_modules", "pdfjs-dist");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn("[copy-pdfjs-assets] skip (missing):", src);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log("[copy-pdfjs-assets] ->", dest);
}

copyDir(path.join(dist, "cmaps"), path.join(root, "public", "pdfjs", "cmaps"));
copyDir(
  path.join(dist, "standard_fonts"),
  path.join(root, "public", "pdfjs", "standard_fonts")
);
