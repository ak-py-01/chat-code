import JSZip from "jszip";
import type { ParsedFile } from "./parser";

export interface HelperFile {
  path: string;
  content: string;
}

export async function buildZip(files: ParsedFile[], helperFiles: HelperFile[] = []): Promise<Blob> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.path, file.content);
  }
  for (const file of helperFiles) {
    zip.file(file.path, file.content);
  }
  return zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
