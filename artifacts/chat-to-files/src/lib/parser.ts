export interface ParsedFile {
  path: string;
  content: string;
  language: string;
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
  "lock", "config", "properties", "plist",
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

export function getLanguageFromPath(filePath: string): string {
  const basename = filePath.split("/").pop() || "";
  if (basename === "Dockerfile" || basename.startsWith("Dockerfile.")) return "dockerfile";
  if (basename === "Makefile") return "makefile";
  const ext = getExtension(filePath);
  return LANGUAGE_MAP[ext] || ext || "text";
}

function isFilePath(str: string): boolean {
  const cleaned = str.trim();
  if (!cleaned || cleaned.length < 3) return false;
  // Must have a slash or dot
  if (!cleaned.includes("/") && !cleaned.includes(".")) return false;
  const basename = cleaned.split("/").pop() || "";
  const ext = getExtension(basename);
  if (KNOWN_EXTENSIONS.has(ext)) return true;
  // Special filenames
  if (["Dockerfile", "Makefile", ".gitignore", ".dockerignore", ".env"].includes(basename)) return true;
  // Has slash and looks like a path
  if (cleaned.includes("/") && /^[\w./\-@:]+$/.test(cleaned)) return true;
  return false;
}

function extractPathFromText(text: string): string | null {
  // Try backtick-wrapped: `path/to/file` or **`path/to/file`**
  const backtickMatches = text.matchAll(/`([^`\n]+)`/g);
  for (const m of backtickMatches) {
    const candidate = m[1].trim();
    if (isFilePath(candidate)) return candidate;
  }

  // Try markdown heading with numbered prefix: ### 1. `path` or ### `path` or ### path/to/file
  const headingMatch = text.match(/^#{1,6}\s+(?:\d+\.\s+)?(?:`([^`]+)`|(\S+\/\S+))/m);
  if (headingMatch) {
    const candidate = (headingMatch[1] || headingMatch[2] || "").trim();
    if (isFilePath(candidate)) return candidate;
  }

  // Try bold: **path/to/file** or __path/to/file__
  const boldMatch = text.match(/\*\*([^*\n]+)\*\*/);
  if (boldMatch) {
    const candidate = boldMatch[1].trim();
    if (isFilePath(candidate)) return candidate;
  }

  // Try plain path on its own line
  const lines = text.split("\n");
  for (const line of lines.reverse()) {
    const trimmed = line.trim();
    if (isFilePath(trimmed)) return trimmed;
  }

  return null;
}

function extractPathFromCodeFirstLine(code: string): string | null {
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
      if (isFilePath(candidate)) return candidate;
    }
  }
  return null;
}

export function parseContent(text: string): ParsedFile[] {
  const filesMap = new Map<string, ParsedFile>();

  // Match all fenced code blocks: ```lang\n...\n```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const lang = match[1] || "";
    const code = match[2];
    const blockStart = match.index;

    // Get the 5 lines before the code block
    const before = text.slice(0, blockStart);
    const beforeLines = before.split("\n");
    const contextLines = beforeLines.slice(Math.max(0, beforeLines.length - 5)).join("\n");

    let filePath: string | null = extractPathFromText(contextLines);

    // If no path found in context, check first line of code block
    if (!filePath) {
      filePath = extractPathFromCodeFirstLine(code);
    }

    if (filePath) {
      // Clean up the code content (remove path comment from first line if it was used as path)
      let content = code;
      if (!extractPathFromText(contextLines) && extractPathFromCodeFirstLine(code)) {
        // Remove the first line (the path comment) from content
        const lines = code.split("\n");
        content = lines.slice(1).join("\n");
      }
      content = content.trim();

      const language = lang || getLanguageFromPath(filePath);
      filesMap.set(filePath, { path: filePath, content, language: getLanguageFromPath(filePath) || language });
    }
  }

  return Array.from(filesMap.values()).sort((a, b) => a.path.localeCompare(b.path));
}
