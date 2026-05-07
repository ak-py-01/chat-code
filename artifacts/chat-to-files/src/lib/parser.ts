export interface ParsedFile {
  path: string;
  content: string;
  language: string;
  confidence?: number;
  source?: string;
}

export interface ParseIssue {
  type: "blocked-path" | "duplicate-path" | "empty-file" | "uncertain-block";
  message: string;
  path?: string;
  rawPath?: string;
  blockIndex?: number;
}

export interface ParseResult {
  files: ParsedFile[];
  issues: ParseIssue[];
  totalBlocks: number;
  uncertainBlocks: number;
}

interface PathMatch {
  path: string;
  rawPath: string;
  source: string;
  confidence: number;
}

const KNOWN_EXTENSIONS = new Set([
  "kt", "kts", "java", "xml", "gradle", "pro",
  "ts", "tsx", "js", "jsx", "mjs", "cjs",
  "py", "rb", "go", "rs", "php", "swift", "dart",
  "c", "cpp", "h", "hpp", "cs",
  "json", "yaml", "yml", "toml", "ini", "env",
  "md", "markdown", "txt", "rst",
  "html", "css", "scss", "sass", "less",
  "sh", "bash", "zsh", "fish", "ps1",
  "sql", "prisma", "proto",
  "vue", "svelte",
  "lock", "config", "properties", "plist", "editorconfig", "prettierrc",
  "gitignore", "dockerignore", "Dockerfile", "Makefile",
  "tf", "hcl", "bicep",
]);

const LANGUAGE_MAP: Record<string, string> = {
  kt: "kotlin", kts: "kotlin",
  java: "java",
  ts: "typescript", tsx: "typescript",
  js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript",
  py: "python", rb: "ruby", go: "go", rs: "rust",
  php: "php", swift: "swift", dart: "dart",
  c: "c", cpp: "cpp", h: "c", hpp: "cpp", cs: "csharp",
  xml: "xml", html: "html",
  json: "json", yaml: "yaml", yml: "yaml", toml: "toml",
  css: "css", scss: "scss", sass: "scss", less: "less",
  sh: "bash", bash: "bash", zsh: "bash", fish: "bash", ps1: "powershell",
  sql: "sql", prisma: "prisma", proto: "protobuf",
  vue: "vue", svelte: "svelte",
  md: "markdown", markdown: "markdown",
  gradle: "groovy", ini: "ini", env: "env",
  tf: "hcl", hcl: "hcl",
};

function getExtension(filePath: string): string {
  const parts = filePath.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function stripPathLabel(str: string): string {
  let cleaned = str
    .trim()
    .replace(/^["'`]+|["'`,:]+$/g, "")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");

  cleaned = cleaned.replace(/^\s*(?:file|path|filename|title)\s*[:=]\s*/i, "").trim();
  cleaned = cleaned.replace(/\s+\((?:new|updated|replace|create|created)\)$/i, "");
  return cleaned;
}

export function normalizeFilePath(str: string): string | null {
  const cleaned = stripPathLabel(str);

  if (!cleaned || cleaned.length < 3) return null;
  if (cleaned.startsWith("/") || /^[a-z]:\//i.test(cleaned)) return null;
  if (/[\0<>:"|?*`#\s]/.test(cleaned)) return null;

  const parts = cleaned.split("/").filter(Boolean);
  if (parts.some((part) => part === "." || part === "..")) return null;
  if (parts.length === 0) return null;

  return parts.join("/");
}

function describePathProblem(str: string): string | null {
  const cleaned = stripPathLabel(str);
  if (!cleaned) return "Empty path";
  if (cleaned.startsWith("/") || /^[a-z]:\//i.test(cleaned)) return "Absolute paths are blocked";
  if (/[\0<>:"|?*]/.test(cleaned)) return "Invalid Windows filename character";
  if (/[`#\s]/.test(cleaned)) return "Path contains spaces or markdown syntax";
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.some((part) => part === "." || part === "..")) return "Path traversal is blocked";
  return null;
}

export function getLanguageFromPath(filePath: string): string {
  const basename = filePath.split("/").pop() || "";
  if (basename === "Dockerfile" || basename.startsWith("Dockerfile.")) return "dockerfile";
  if (basename === "Makefile") return "makefile";
  const ext = getExtension(filePath);
  return LANGUAGE_MAP[ext] || ext || "text";
}

function isFilePath(str: string): boolean {
  const cleaned = normalizeFilePath(str);
  if (!cleaned || cleaned.length < 3) return false;
  // Must have a slash or dot
  if (!cleaned.includes("/") && !cleaned.includes(".")) return false;
  const basename = cleaned.split("/").pop() || "";
  const ext = getExtension(basename);
  if (KNOWN_EXTENSIONS.has(ext)) return true;
  // Special filenames
  if (["Dockerfile", "Makefile", ".gitignore", ".dockerignore", ".env"].includes(basename)) return true;
  // Has slash and looks like a path
  if (cleaned.includes("/") && /^[\w./\-@]+$/.test(cleaned)) return true;
  return false;
}

function pickFilePath(str: string): string | null {
  const normalized = normalizeFilePath(str);
  return normalized && isFilePath(normalized) ? normalized : null;
}

function toPathMatch(str: string, source: string, confidence: number): PathMatch | null {
  const path = pickFilePath(str);
  return path ? { path, rawPath: str.trim(), source, confidence } : null;
}

function extractPathFromFenceInfo(info: string): PathMatch | null {
  const trimmed = info.trim();
  if (!trimmed) return null;

  const quoted = trimmed.match(/(?:file|path|filename|title)=["']([^"']+)["']/i);
  if (quoted) return toPathMatch(quoted[1], "fence metadata", 98);

  const assignment = trimmed.match(/(?:file|path|filename|title)=([^\s]+)/i);
  if (assignment) return toPathMatch(assignment[1], "fence metadata", 95);

  const tokens = trimmed.split(/\s+/);
  for (const token of tokens) {
    const filePath = toPathMatch(token, "fence info", 90);
    if (filePath) return filePath;
  }

  return null;
}

function extractPathFromText(text: string): PathMatch | null {
  // Try backtick-wrapped: `path/to/file` or **`path/to/file`**
  const backtickMatches = text.matchAll(/`([^`\n]+)`/g);
  for (const m of backtickMatches) {
    const candidate = m[1].trim();
    const filePath = toPathMatch(candidate, "nearby backtick path", 92);
    if (filePath) return filePath;
  }

  // Try markdown heading with numbered prefix: ### 1. `path` or ### `path` or ### path/to/file
  const headingMatch = text.match(/^#{1,6}\s+(?:\d+\.\s+)?(?:`([^`]+)`|(\S+\/\S+))/m);
  if (headingMatch) {
    const candidate = (headingMatch[1] || headingMatch[2] || "").trim();
    const filePath = toPathMatch(candidate, "markdown heading", 88);
    if (filePath) return filePath;
  }

  // Try bold: **path/to/file** or __path/to/file__
  const boldMatch = text.match(/\*\*([^*\n]+)\*\*/);
  if (boldMatch) {
    const candidate = boldMatch[1].trim();
    const filePath = toPathMatch(candidate, "bold path", 82);
    if (filePath) return filePath;
  }

  // Try plain path on its own line
  const lines = text.split("\n");
  for (const line of lines.reverse()) {
    const trimmed = line.trim();
    const filePath = toPathMatch(trimmed, "nearby plain path", 72);
    if (filePath) return filePath;
  }

  return null;
}

function extractPathFromCodeFirstLine(code: string): PathMatch | null {
  const firstLine = code.split("\n")[0].trim();
  // e.g. // path/to/file.ts or # path/to/file.py or <!-- path -->
  const patterns = [
    /^\/\/\s*(.+)$/,
    /^#\s*(.+)$/,
    /^<!--\s*(.+?)\s*-->$/,
    /^\/\*\s*(.+?)\s*\*\/$/,
    /^--\s*(.+)$/,
  ];
  for (const pattern of patterns) {
    const m = firstLine.match(pattern);
    if (m) {
      const candidate = m[1].trim();
      const filePath = toPathMatch(candidate, "first code comment", 78);
      if (filePath) return filePath;
    }
  }
  return null;
}

function findRejectedPath(context: string): string | null {
  const candidates = [
    ...Array.from(context.matchAll(/`([^`\n]+)`/g)).map((m) => m[1]),
    ...Array.from(context.matchAll(/(?:file|path|filename|title)\s*[:=]\s*["']?([^\s"'`]+)/gi)).map((m) => m[1]),
    ...context.split("\n").map((line) => line.trim()),
  ];

  for (const candidate of candidates) {
    if (!candidate || !/[./\\]/.test(candidate)) continue;
    if (/[();{}]/.test(candidate)) continue;
    if (describePathProblem(candidate)) return candidate.trim();
  }

  return null;
}

export function parseContentDetailed(text: string): ParseResult {
  const filesMap = new Map<string, ParsedFile>();
  const issues: ParseIssue[] = [];
  let totalBlocks = 0;
  let uncertainBlocks = 0;

  // Match all fenced code blocks, including info strings like
  // ```tsx filename="src/App.tsx" or ```src/App.tsx
  const codeBlockRegex = /```([^\n`]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    totalBlocks += 1;
    const blockIndex = totalBlocks;
    const fenceInfo = match[1] || "";
    const lang = fenceInfo.trim().split(/\s+/)[0] || "";
    const code = match[2];
    const blockStart = match.index;

    // Get the 5 lines before the code block
    const before = text.slice(0, blockStart);
    const beforeLines = before.split("\n");
    const contextLines = beforeLines.slice(Math.max(0, beforeLines.length - 5)).join("\n");

    let pathMatch: PathMatch | null = extractPathFromFenceInfo(fenceInfo) || extractPathFromText(contextLines);

    // If no path found in context, check first line of code block
    if (!pathMatch) {
      pathMatch = extractPathFromCodeFirstLine(code);
    }

    if (pathMatch) {
      const filePath = pathMatch.path;
      // Clean up the code content (remove path comment from first line if it was used as path)
      let content = code;
      if (pathMatch.source === "first code comment") {
        // Remove the first line (the path comment) from content
        const lines = code.split("\n");
        content = lines.slice(1).join("\n");
      }
      content = content.trim();

      const language = getLanguageFromPath(filePath) || lang || "text";
      if (filesMap.has(filePath)) {
        issues.push({
          type: "duplicate-path",
          path: filePath,
          blockIndex,
          message: `Duplicate path "${filePath}" was found. The later block replaced the earlier one.`,
        });
      }

      if (!content) {
        issues.push({
          type: "empty-file",
          path: filePath,
          blockIndex,
          message: `"${filePath}" is empty after parsing.`,
        });
      }

      if (pathMatch.confidence < 85) uncertainBlocks += 1;
      filesMap.set(filePath, {
        path: filePath,
        content,
        language,
        confidence: pathMatch.confidence,
        source: pathMatch.source,
      });
    } else {
      const rejectedPath = findRejectedPath(`${fenceInfo}\n${contextLines}\n${code.split("\n")[0] || ""}`);
      if (rejectedPath) {
        issues.push({
          type: "blocked-path",
          rawPath: rejectedPath,
          blockIndex,
          message: `Blocked suspicious path "${rejectedPath}": ${describePathProblem(rejectedPath) || "not a safe project-relative path"}.`,
        });
      } else {
        issues.push({
          type: "uncertain-block",
          blockIndex,
          message: `Code block ${blockIndex} has no confident filename. Add or edit a file path before downloading.`,
        });
      }
      uncertainBlocks += 1;
    }
  }

  return {
    files: Array.from(filesMap.values()).sort((a, b) => a.path.localeCompare(b.path)),
    issues,
    totalBlocks,
    uncertainBlocks,
  };
}

export function parseContent(text: string): ParsedFile[] {
  return parseContentDetailed(text).files;
}
