import { useState, useCallback, useRef } from "react";
import { getLanguageFromPath, normalizeFilePath, parseContentDetailed, type ParsedFile, type ParseIssue, type ParseResult } from "@/lib/parser";
import { extractTextFromPdf } from "@/lib/pdfExtractor";
import { buildZip, downloadBlob, type HelperFile } from "@/lib/zipBuilder";
import { Upload, FileText, FolderOpen, Download, RotateCcw, ChevronRight, ChevronDown, File, ClipboardCopy, Wrench, ShieldCheck, FileJson, TerminalSquare, AlertTriangle } from "lucide-react";

type AppState = "idle" | "parsing" | "results" | "error" | "accumulating";

const SAMPLE_INPUT = `### \`package.json\`
\`\`\`json
{
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {}
}
\`\`\`

\`\`\`tsx filename="src/App.tsx"
export default function App() {
  return <h1>Hello from chat-to-files</h1>;
}
\`\`\`

// src/styles.css
\`\`\`css
body {
  font-family: system-ui, sans-serif;
}
\`\`\``;

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
  file?: ParsedFile;
}

function buildTree(files: ParsedFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      let existing = currentLevel.find((n) => n.name === part);
      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          isFolder: !isLast,
          children: [],
          file: isLast ? file : undefined,
        };
        currentLevel.push(existing);
      }
      currentLevel = existing.children;
    }
  }

  return root;
}

function countLines(content: string) {
  return content.split("\n").length;
}

function getTopFolders(files: ParsedFile[]) {
  const folders = new Set<string>();
  for (const file of files) {
    const top = file.path.split("/")[0];
    if (top && top !== file.path) folders.add(top);
  }
  return Array.from(folders).sort();
}

function buildTreeText(files: ParsedFile[]) {
  return files.map((file) => file.path).sort().join("\n");
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function buildTerminalCommands(files: ParsedFile[]) {
  return files
    .map((file, index) => {
      const dir = file.path.split("/").slice(0, -1).join("/");
      const delimiter = `CHAT_TO_FILES_${index}`;
      return [
        dir ? `mkdir -p ${shellQuote(dir)}` : "",
        `cat > ${shellQuote(file.path)} <<'${delimiter}'`,
        file.content,
        delimiter,
      ].filter(Boolean).join("\n");
    })
    .join("\n\n");
}

function buildManifest(files: ParsedFile[], issues: ParseIssue[] = []) {
  const languages = files.reduce<Record<string, number>>((acc, file) => {
    acc[file.language] = (acc[file.language] || 0) + 1;
    return acc;
  }, {});

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    fileCount: files.length,
    totalLines: files.reduce((acc, file) => acc + countLines(file.content), 0),
    languages,
    topFolders: getTopFolders(files),
    issues: issues.map((issue) => ({
      type: issue.type,
      path: issue.path,
      rawPath: issue.rawPath,
      message: issue.message,
    })),
    files: files.map((file) => ({
      path: file.path,
      language: file.language,
      lines: countLines(file.content),
      bytes: new Blob([file.content]).size,
      confidence: file.confidence,
      source: file.source,
    })),
  }, null, 2);
}

function buildRestoreCommands(files: ParsedFile[]) {
  const directories = Array.from(
    new Set(files.map((file) => file.path.split("/").slice(0, -1).join("/")).filter(Boolean))
  ).sort();

  const mkdirs = directories.length
    ? directories.map((dir) => `mkdir -p ${JSON.stringify(dir)}`).join("\n")
    : "# No nested directories detected";

  return [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "",
    "# Run this from the extracted zip root to make sure all folders exist.",
    mkdirs,
    "",
    "echo \"Project scaffold is ready.\"",
  ].join("\n");
}

function buildExtractionReport(files: ParsedFile[], issues: ParseIssue[] = []) {
  const emptyFiles = files.filter((file) => file.content.trim().length === 0);
  const largeFiles = files.filter((file) => countLines(file.content) > 500);
  const missingLikelyEntrypoints = !files.some((file) =>
    /(^|\/)(package\.json|pyproject\.toml|requirements\.txt|Cargo\.toml|go\.mod|pom\.xml|build\.gradle|vite\.config\.)/.test(file.path)
  );

  const checks = [
    `Files extracted: ${files.length}`,
    `Languages detected: ${new Set(files.map((file) => file.language)).size}`,
    `Total lines: ${files.reduce((acc, file) => acc + countLines(file.content), 0).toLocaleString()}`,
    emptyFiles.length ? `Empty files to inspect: ${emptyFiles.map((file) => file.path).join(", ")}` : "No empty files detected.",
    largeFiles.length ? `Large files to review manually: ${largeFiles.map((file) => file.path).join(", ")}` : "No unusually large files detected.",
    missingLikelyEntrypoints ? "No common dependency manifest was detected. If this is a runnable app, ask the AI assistant for the missing package/config files." : "A common dependency or build manifest was detected.",
  ];

  return [
    "# Chat to Files Extraction Report",
    "",
    "## Checks",
    "",
    ...checks.map((check) => `- ${check}`),
    "",
    "## Parser Warnings",
    "",
    ...(issues.length ? issues.map((issue) => `- ${issue.message}`) : ["- No parser warnings."]),
    "",
    "## File Tree",
    "",
    "```text",
    buildTreeText(files),
    "```",
    "",
    "## Next Steps",
    "",
    "- Open the extracted folder in your editor.",
    "- Review overwritten or regenerated files before running install commands.",
    "- Run the project-specific package manager once dependency files are present.",
  ].join("\n");
}

function buildReadme(files: ParsedFile[]) {
  return [
    "# Extracted Project",
    "",
    "This folder was generated by chat-to-files from AI chat output.",
    "",
    "## Contents",
    "",
    `- ${files.length} files`,
    `- ${new Set(files.map((file) => file.language)).size} detected languages`,
    `- ${files.reduce((acc, file) => acc + countLines(file.content), 0).toLocaleString()} total lines`,
    "",
    "See `CHAT_TO_FILES_REPORT.md` and `chat-to-files.manifest.json` for extraction details.",
  ].join("\n");
}

function buildHelperFiles(files: ParsedFile[], issues: ParseIssue[] = []): HelperFile[] {
  return [
    { path: "README.extracted.md", content: buildReadme(files) },
    { path: "CHAT_TO_FILES_REPORT.md", content: buildExtractionReport(files, issues) },
    { path: "chat-to-files.manifest.json", content: buildManifest(files, issues) },
    { path: "restore-folders.sh", content: buildRestoreCommands(files) },
    { path: "create-files.sh", content: buildTerminalCommands(files) },
  ];
}

function mergeFiles(existing: ParsedFile[], newFiles: ParsedFile[]): ParsedFile[] {
  const map = new Map<string, ParsedFile>();
  for (const file of existing) {
    map.set(file.path, file);
  }
  for (const file of newFiles) {
    map.set(file.path, file);
  }
  return Array.from(map.values()).sort((a, b) => a.path.localeCompare(b.path));
}

function buildCurrentWarnings(files: ParsedFile[], parseIssues: ParseIssue[]) {
  const warnings = [...parseIssues];
  const seen = new Set<string>();

  for (const file of files) {
    if (seen.has(file.path)) {
      warnings.push({
        type: "duplicate-path",
        path: file.path,
        message: `Duplicate path "${file.path}" exists in the current file list.`,
      });
    }
    seen.add(file.path);

    if (!file.content.trim()) {
      warnings.push({
        type: "empty-file",
        path: file.path,
        message: `"${file.path}" is empty.`,
      });
    }
  }

  return warnings;
}

function TreeNodeComponent({
  node,
  depth = 0,
}: {
  node: TreeNode;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);

  if (node.isFolder) {
    return (
      <div>
        <button
          data-testid={`folder-${node.path}`}
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-white/5 transition-colors group"
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <span className="text-neutral-500 w-4 flex-shrink-0">
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
          <FolderOpen size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-neutral-300 text-sm font-medium">{node.name}</span>
        </button>
        {expanded && (
          <div>
            {node.children.map((child) => (
              <TreeNodeComponent key={child.path} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid={`file-${node.path}`}
      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors group cursor-default"
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      <span className="w-4 flex-shrink-0" />
      <File size={13} className="text-neutral-500 flex-shrink-0" />
      <span className="text-neutral-200 text-sm font-mono flex-1 truncate">{node.name}</span>
      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {node.file && (
          <>
            <span className="text-xs text-neutral-500 font-mono">
              {countLines(node.file.content)}L
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
              {node.file.language}
            </span>
          </>
        )}
      </div>
      {node.file && (
        <div className="flex items-center gap-2 flex-shrink-0 group-hover:hidden">
          <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
            {node.file.language}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [accumulatedFiles, setAccumulatedFiles] = useState<ParsedFile[]>([]);
  const [parseIssues, setParseIssues] = useState<ParseIssue[]>([]);
  const [parseStats, setParseStats] = useState({ totalBlocks: 0, uncertainBlocks: 0 });
  const [error, setError] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [includeToolkit, setIncludeToolkit] = useState(true);
  const [copyStatus, setCopyStatus] = useState("");
  const [commandStatus, setCommandStatus] = useState("");
  const [sourceFileName, setSourceFileName] = useState("project");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyParseResult = useCallback((result: ParseResult, merge: boolean) => {
    if (result.files.length === 0) {
      setError("No safe project files found. Make sure the content has fenced code blocks and project-relative file paths.");
      setParseIssues(result.issues);
      setParseStats({ totalBlocks: result.totalBlocks, uncertainBlocks: result.uncertainBlocks });
      setAppState("error");
      return;
    }

    if (merge) {
      const overwritten = result.files
        .filter((file) => accumulatedFiles.some((existing) => existing.path === file.path))
        .map<ParseIssue>((file) => ({
          type: "duplicate-path",
          path: file.path,
          message: `Merged content replaced existing "${file.path}".`,
        }));
      const merged = mergeFiles(accumulatedFiles, result.files);
      setAccumulatedFiles(merged);
      setFiles(merged);
      setParseIssues((existing) => [...existing, ...result.issues, ...overwritten]);
      setParseStats((existing) => ({
        totalBlocks: existing.totalBlocks + result.totalBlocks,
        uncertainBlocks: existing.uncertainBlocks + result.uncertainBlocks,
      }));
    } else {
      setFiles(result.files);
      setAccumulatedFiles(result.files);
      setParseIssues(result.issues);
      setParseStats({ totalBlocks: result.totalBlocks, uncertainBlocks: result.uncertainBlocks });
    }
    setError("");
    setAppState("results");
  }, [accumulatedFiles]);

  const processText = useCallback(async (text: string, name?: string, merge = false) => {
    setAppState("parsing");
    if (!merge) {
      setSourceFileName(name ? name.replace(/\.[^.]+$/, "") : "project");
    }
    try {
      applyParseResult(parseContentDetailed(text), merge);
    } catch (e) {
      setError(String(e));
      setAppState("error");
    }
  }, [applyParseResult]);

  const processFile = useCallback(async (file: File, merge = false) => {
    setAppState("parsing");
    if (!merge) {
      setSourceFileName(file.name.replace(/\.[^.]+$/, ""));
    }
    try {
      let text: string;
      if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
        const buffer = await file.arrayBuffer();
        text = await extractTextFromPdf(buffer);
      } else {
        text = await file.text();
      }
      applyParseResult(parseContentDetailed(text), merge);
    } catch (e) {
      setError(String(e));
      setAppState("error");
    }
  }, [applyParseResult]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file, appState === "accumulating");
    },
    [processFile, appState]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file, appState === "accumulating");
      e.target.value = "";
    },
    [processFile, appState]
  );

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await buildZip(files, includeToolkit ? buildHelperFiles(files, buildCurrentWarnings(files, parseIssues)) : []);
      downloadBlob(blob, `${sourceFileName}.zip`);
    } finally {
      setDownloading(false);
    }
  }, [files, includeToolkit, parseIssues, sourceFileName]);

  const handleDownloadReport = useCallback(() => {
    downloadBlob(
      new Blob([buildExtractionReport(files, buildCurrentWarnings(files, parseIssues))], { type: "text/markdown;charset=utf-8" }),
      `${sourceFileName}-extraction-report.md`
    );
  }, [files, parseIssues, sourceFileName]);

  const handleCopyTree = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildTreeText(files));
      setCopyStatus("Copied file tree");
      window.setTimeout(() => setCopyStatus(""), 1800);
    } catch {
      setCopyStatus("Clipboard unavailable");
      window.setTimeout(() => setCopyStatus(""), 1800);
    }
  }, [files]);

  const handleCopyCommands = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildTerminalCommands(files));
      setCommandStatus("Copied commands");
      window.setTimeout(() => setCommandStatus(""), 1800);
    } catch {
      setCommandStatus("Clipboard unavailable");
      window.setTimeout(() => setCommandStatus(""), 1800);
    }
  }, [files]);

  const handleRenameFile = useCallback((oldPath: string, rawPath: string) => {
    const nextPath = normalizeFilePath(rawPath);
    if (!nextPath) {
      setError(`"${rawPath}" is not a safe project-relative path.`);
      return;
    }

    if (nextPath !== oldPath && files.some((file) => file.path === nextPath)) {
      setError(`"${nextPath}" already exists. Rename one of the duplicate files first.`);
      return;
    }

    setError("");
    const renamed = files
      .map((file) => file.path === oldPath
        ? { ...file, path: nextPath, language: getLanguageFromPath(nextPath), confidence: 100, source: "manual correction" }
        : file
      )
      .sort((a, b) => a.path.localeCompare(b.path));
    setFiles(renamed);
    setAccumulatedFiles(renamed);
  }, [files]);

  const handleReset = useCallback(() => {
    setAppState("idle");
    setFiles([]);
    setError("");
    setPasteText("");
    setCopyStatus("");
    setCommandStatus("");
    setParseIssues([]);
    setParseStats({ totalBlocks: 0, uncertainBlocks: 0 });
    setShowPaste(false);
  }, []);

  const handleAddMore = useCallback(() => {
    setAppState("accumulating");
    setPasteText("");
    setShowPaste(false);
  }, []);

  const handleStartFresh = useCallback(() => {
    setAppState("idle");
    setFiles([]);
    setAccumulatedFiles([]);
    setError("");
    setPasteText("");
    setCopyStatus("");
    setCommandStatus("");
    setParseIssues([]);
    setParseStats({ totalBlocks: 0, uncertainBlocks: 0 });
    setShowPaste(false);
  }, []);

  const tree = buildTree(files);
  const warnings = buildCurrentWarnings(files, parseIssues);
  const helperFiles = buildHelperFiles(files, warnings);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <FileText size={14} className="text-cyan-400" />
            </div>
            <span className="font-mono font-semibold text-white tracking-tight">chat-to-files</span>
            <span className="text-xs text-neutral-500 font-mono border border-white/10 px-2 py-0.5 rounded">v1.0</span>
          </div>
          <p className="text-neutral-500 text-sm hidden sm:block">
            Extract project files from AI chat outputs
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        {/* IDLE STATE */}
        {appState === "idle" && (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl font-semibold text-white">
                Turn chatbot output into real project files
              </h1>
              <p className="text-neutral-400 text-sm max-w-lg mx-auto">
                Upload a PDF, text, or markdown file from any AI coding assistant. The app extracts all code blocks with their file paths and packages them as a downloadable zip.
              </p>
            </div>

            {/* Drop zone */}
            <div
              data-testid="drop-zone"
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
                ${dragging
                  ? "border-cyan-400 bg-cyan-500/5 scale-[1.01]"
                  : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.markdown"
                onChange={handleFileChange}
                className="hidden"
                data-testid="file-input"
              />
              <div className="flex flex-col items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-colors
                  ${dragging ? "bg-cyan-500/20 border-cyan-500/40" : "bg-white/5 border-white/10"}`}>
                  <Upload size={24} className={dragging ? "text-cyan-400" : "text-neutral-400"} />
                </div>
                <div>
                  <p className="text-white font-medium">Drop your file here</p>
                  <p className="text-neutral-500 text-sm mt-1">or click to browse</p>
                  <p className="text-neutral-600 text-xs mt-2 font-mono">PDF &middot; TXT &middot; MD &middot; MARKDOWN</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-neutral-600 text-xs font-mono">or paste text</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Paste area */}
            <div className="space-y-3">
              {!showPaste ? (
                <button
                  data-testid="btn-show-paste"
                  onClick={() => setShowPaste(true)}
                  className="w-full py-3 rounded-lg border border-white/10 text-neutral-400 text-sm font-mono hover:border-white/20 hover:text-neutral-200 transition-colors"
                >
                  Paste chatbot output
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-white/10 bg-neutral-900 overflow-hidden">
                    <textarea
                      data-testid="paste-textarea"
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder={"Paste the full chatbot message here...\n\nThe parser will find file paths like:\n  ### `src/app.ts`\n  ```typescript\n  ...\n  ```"}
                      className="w-full h-56 bg-transparent px-4 py-3 text-sm font-mono text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none"
                    />
                    <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between gap-3 text-xs text-neutral-500">
                      <span>Your pasted code is processed locally in your browser and is not uploaded.</span>
                      <button
                        data-testid="btn-sample-input"
                        onClick={() => setPasteText(SAMPLE_INPUT)}
                        className="text-cyan-400 hover:text-cyan-300 font-mono flex-shrink-0"
                      >
                        Use sample
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      data-testid="btn-parse-paste"
                      disabled={!pasteText.trim()}
                      onClick={() => processText(pasteText, "pasted-output")}
                      className="flex-1 py-2.5 rounded-lg bg-cyan-500 text-neutral-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Parse text
                    </button>
                    <button
                      data-testid="btn-cancel-paste"
                      onClick={() => setShowPaste(false)}
                      className="px-4 py-2.5 rounded-lg border border-white/10 text-neutral-400 text-sm hover:border-white/20 hover:text-neutral-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { step: "01", label: "Upload file", desc: "Any PDF, TXT or Markdown from an AI assistant" },
                { step: "02", label: "Auto-parse", desc: "Detects all fenced code blocks with file path headers" },
                { step: "03", label: "Download zip", desc: "Get a ready-to-use project folder instantly" },
              ].map((item) => (
                <div key={item.step} className="bg-neutral-900/50 border border-white/5 rounded-lg p-4 space-y-1.5">
                  <span className="text-cyan-500 font-mono text-xs">{item.step}</span>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-neutral-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARSING STATE */}
        {appState === "parsing" && (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Parsing file...</p>
              <p className="text-neutral-500 text-sm mt-1">Extracting code blocks and file paths</p>
            </div>
          </div>
        )}

        {/* ACCUMULATING STATE */}
        {appState === "accumulating" && (
          <div className="space-y-6">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6 space-y-3">
              <p className="text-cyan-400 font-medium">Add more files to merge</p>
              <p className="text-neutral-400 text-sm">
                Upload another chat or paste text to add/edit files in your project. Duplicate file paths will be updated with the new content.
              </p>
            </div>

            {/* Drop zone for adding more */}
            <div
              data-testid="drop-zone-add"
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
                ${dragging
                  ? "border-cyan-400 bg-cyan-500/5 scale-[1.01]"
                  : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.markdown"
                onChange={handleFileChange}
                className="hidden"
                data-testid="file-input-add"
              />
              <div className="flex flex-col items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-colors
                  ${dragging ? "bg-cyan-500/20 border-cyan-500/40" : "bg-white/5 border-white/10"}`}>
                  <Upload size={24} className={dragging ? "text-cyan-400" : "text-neutral-400"} />
                </div>
                <div>
                  <p className="text-white font-medium">Drop another file or click to browse</p>
                  <p className="text-neutral-500 text-xs mt-2 font-mono">PDF &middot; TXT &middot; MD &middot; MARKDOWN</p>
                </div>
              </div>
            </div>

            {/* Paste area */}
            <div className="space-y-3">
              {!showPaste ? (
                <button
                  data-testid="btn-show-paste-add"
                  onClick={() => setShowPaste(true)}
                  className="w-full py-3 rounded-lg border border-white/10 text-neutral-400 text-sm font-mono hover:border-white/20 hover:text-neutral-200 transition-colors"
                >
                  Or paste text to add more files
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-white/10 bg-neutral-900 overflow-hidden">
                    <textarea
                      data-testid="paste-textarea-add"
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="Paste the next chatbot message to merge files..."
                      className="w-full h-56 bg-transparent px-4 py-3 text-sm font-mono text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none"
                    />
                    <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between gap-3 text-xs text-neutral-500">
                      <span>Your pasted code is processed locally in your browser and is not uploaded.</span>
                      <button
                        data-testid="btn-sample-input-add"
                        onClick={() => setPasteText(SAMPLE_INPUT)}
                        className="text-cyan-400 hover:text-cyan-300 font-mono flex-shrink-0"
                      >
                        Use sample
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      data-testid="btn-merge-paste"
                      disabled={!pasteText.trim()}
                      onClick={() => processText(pasteText, undefined, true)}
                      className="flex-1 py-2.5 rounded-lg bg-cyan-500 text-neutral-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Merge files
                    </button>
                    <button
                      data-testid="btn-cancel-paste-add"
                      onClick={() => setShowPaste(false)}
                      className="px-4 py-2.5 rounded-lg border border-white/10 text-neutral-400 text-sm hover:border-white/20 hover:text-neutral-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Back button */}
            <button
              data-testid="btn-back-results"
              onClick={() => setAppState("results")}
              className="w-full py-2.5 rounded-lg border border-white/10 text-neutral-400 text-sm hover:border-white/20 hover:text-neutral-200 transition-colors"
            >
              Back to results
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {appState === "error" && (
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 space-y-3">
              <p className="text-red-400 font-medium">Could not extract files</p>
              <p className="text-neutral-400 text-sm">{error}</p>
            </div>
            <button
              data-testid="btn-try-again"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-neutral-300 text-sm hover:border-white/20 hover:text-white transition-colors"
            >
              <RotateCcw size={14} />
              Try another file
            </button>
          </div>
        )}

        {/* RESULTS STATE */}
        {appState === "results" && (
          <div className="space-y-6">
            {/* Summary bar */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-0.5">
                <h2 className="text-white font-semibold text-lg">
                  Found {files.length} file{files.length !== 1 ? "s" : ""}
                </h2>
                <p className="text-neutral-500 text-sm font-mono">{sourceFileName}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  data-testid="btn-add-more"
                  onClick={handleAddMore}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-neutral-400 text-sm hover:border-white/20 hover:text-neutral-200 transition-colors"
                >
                  <Upload size={13} />
                  Add more files
                </button>
                <button
                  data-testid="btn-start-fresh"
                  onClick={handleStartFresh}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-neutral-400 text-sm hover:border-white/20 hover:text-neutral-200 transition-colors"
                >
                  <RotateCcw size={13} />
                  Start over
                </button>
                <button
                  data-testid="btn-copy-tree"
                  onClick={handleCopyTree}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-neutral-400 text-sm hover:border-white/20 hover:text-neutral-200 transition-colors"
                >
                  <ClipboardCopy size={13} />
                  {copyStatus || "Copy tree"}
                </button>
                <button
                  data-testid="btn-copy-commands"
                  onClick={handleCopyCommands}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-neutral-400 text-sm hover:border-white/20 hover:text-neutral-200 transition-colors"
                >
                  <TerminalSquare size={13} />
                  {commandStatus || "Copy commands"}
                </button>
                <button
                  data-testid="btn-download-report"
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-neutral-400 text-sm hover:border-white/20 hover:text-neutral-200 transition-colors"
                >
                  <FileJson size={13} />
                  Report
                </button>
                <button
                  data-testid="btn-download"
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`
                    flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all
                    ${downloading
                      ? "bg-cyan-500/50 text-neutral-950/60 cursor-not-allowed"
                      : "bg-cyan-500 text-neutral-950 hover:bg-cyan-400 active:scale-95"
                    }
                  `}
                >
                  <Download size={14} />
                  {downloading ? "Building zip..." : `Download ${sourceFileName}.zip`}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "Files", value: files.length },
                { label: "Languages", value: new Set(files.map((f) => f.language)).size },
                {
                  label: "Total lines",
                  value: files.reduce((acc, f) => acc + f.content.split("\n").length, 0).toLocaleString(),
                },
                { label: "Top folders", value: getTopFolders(files).length || "root" },
                { label: "Confidence", value: `${Math.max(0, parseStats.totalBlocks - parseStats.uncertainBlocks)}/${parseStats.totalBlocks || files.length}` },
              ].map((stat) => (
                <div key={stat.label} className="bg-neutral-900 border border-white/5 rounded-lg px-4 py-3 text-center">
                  <p className="text-white font-semibold text-lg font-mono">{stat.value}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-neutral-900 border border-white/5 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className={warnings.length ? "text-amber-400" : "text-emerald-400"} />
                  <span className="text-neutral-300 text-sm font-mono">
                    Parser confidence
                  </span>
                </div>
                <span className="text-xs text-neutral-500 font-mono">
                  Detected {files.length} file{files.length !== 1 ? "s" : ""}, {parseStats.uncertainBlocks} uncertain block{parseStats.uncertainBlocks !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="p-4 space-y-2">
                {warnings.length === 0 ? (
                  <p className="text-sm text-neutral-400">No suspicious paths, duplicates, or empty files detected.</p>
                ) : (
                  warnings.map((issue, index) => (
                    <div key={`${issue.type}-${issue.path || issue.rawPath || index}`} className="flex gap-2 text-sm text-amber-200">
                      <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{issue.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Toolbelt */}
            <div className="bg-neutral-900 border border-white/5 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Wrench size={14} className="text-cyan-400" />
                  <span className="text-neutral-300 text-sm font-mono">Generated project tools</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                  <input
                    data-testid="include-toolkit"
                    type="checkbox"
                    checked={includeToolkit}
                    onChange={(e) => setIncludeToolkit(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  Include in zip
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                {[
                  {
                    icon: <ShieldCheck size={15} className="text-emerald-400" />,
                    title: "Extraction report",
                    desc: "Flags empty files, very large files, missing dependency manifests, and next steps.",
                  },
                  {
                    icon: <FileJson size={15} className="text-sky-400" />,
                    title: "JSON manifest",
                    desc: "Machine-readable inventory with paths, languages, line counts, folders, and byte sizes.",
                  },
                  {
                    icon: <TerminalSquare size={15} className="text-violet-400" />,
                    title: "Restore script",
                    desc: "Creates the recovered folder structure from a terminal after extraction.",
                  },
                  {
                    icon: <FileText size={15} className="text-amber-400" />,
                    title: "Extracted README",
                    desc: "Documents what was generated so the zip is understandable later.",
                  },
                ].map((tool) => (
                  <div key={tool.title} className="p-4 flex gap-3">
                    <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      {tool.icon}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tool.title}</p>
                      <p className="text-neutral-500 text-xs leading-relaxed mt-1">{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-white/5 text-xs text-neutral-500 font-mono">
                {helperFiles.map((file) => file.path).join(" · ")}
              </div>
            </div>

            {/* File tree */}
            <div className="bg-neutral-900 border border-white/5 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <FolderOpen size={14} className="text-amber-400" />
                <span className="text-neutral-300 text-sm font-mono">{sourceFileName}/</span>
              </div>
              <div className="p-2 max-h-[480px] overflow-y-auto scrollbar-thin">
                {tree.map((node) => (
                  <TreeNodeComponent key={node.path} node={node} depth={0} />
                ))}
              </div>
            </div>

            {/* File list with content preview */}
            <div className="space-y-3">
              <h3 className="text-neutral-400 text-sm font-mono uppercase tracking-wider">File contents</h3>
              {files.map((file) => (
                <FileCard key={file.path} file={file} onRename={handleRenameFile} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FileCard({ file, onRename }: { file: ParsedFile; onRename: (oldPath: string, nextPath: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [draftPath, setDraftPath] = useState(file.path);
  const lines = file.content.split("\n");
  const confidence = file.confidence ?? 100;

  return (
    <div
      data-testid={`file-card-${file.path}`}
      className="bg-neutral-900 border border-white/5 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <span className="text-neutral-500">
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
        <span className="text-neutral-200 text-sm font-mono flex-1 truncate">{file.path}</span>
        <span className={`text-xs px-2 py-0.5 rounded font-mono border flex-shrink-0 ${
          confidence >= 90
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        }`}>
          {confidence}%
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20 flex-shrink-0">
          {file.language}
        </span>
        <span className="text-neutral-600 text-xs font-mono flex-shrink-0">{lines.length}L</span>
      </button>
      {expanded && (
        <div className="border-t border-white/5">
          <div className="px-4 py-3 border-b border-white/5 bg-neutral-950/30 space-y-2">
            <label className="text-xs text-neutral-500 font-mono block">Correct filename before download</label>
            <div className="flex gap-2">
              <input
                data-testid={`path-input-${file.path}`}
                value={draftPath}
                onChange={(e) => setDraftPath(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onRename(file.path, draftPath);
                }}
                className="flex-1 bg-neutral-950 border border-white/10 rounded px-3 py-2 text-sm text-neutral-200 font-mono focus:outline-none focus:border-cyan-500/50"
              />
              <button
                data-testid={`btn-rename-${file.path}`}
                onClick={() => onRename(file.path, draftPath)}
                className="px-3 py-2 rounded border border-white/10 text-neutral-300 text-sm hover:border-white/20 hover:text-white transition-colors"
              >
                Apply
              </button>
            </div>
            <p className="text-xs text-neutral-600">
              Source: {file.source || "detected"}.
            </p>
          </div>
          <pre className="overflow-x-auto px-4 py-3 text-xs font-mono text-neutral-300 bg-neutral-950/50 max-h-80 overflow-y-auto leading-relaxed">
            <code>{file.content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
