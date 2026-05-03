import { useState, useCallback, useRef } from "react";
import { parseContent, type ParsedFile } from "@/lib/parser";
import { extractTextFromPdf } from "@/lib/pdfExtractor";
import { buildZip, downloadBlob } from "@/lib/zipBuilder";
import { Upload, FileText, FolderOpen, Download, RotateCcw, ChevronRight, ChevronDown, File } from "lucide-react";

type AppState = "idle" | "parsing" | "results" | "error" | "accumulating";

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
  const [error, setError] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [sourceFileName, setSourceFileName] = useState("project");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processText = useCallback(async (text: string, name?: string, merge = false) => {
    setAppState("parsing");
    if (!merge) {
      setSourceFileName(name ? name.replace(/\.[^.]+$/, "") : "project");
    }
    try {
      const parsed = parseContent(text);
      if (parsed.length === 0) {
        setError("No code files found in the provided content. Make sure the file contains fenced code blocks with file path headers.");
        setAppState("error");
        return;
      }
      
      if (merge) {
        const merged = mergeFiles(accumulatedFiles, parsed);
        setAccumulatedFiles(merged);
        setFiles(merged);
        setAppState("results");
      } else {
        setFiles(parsed);
        setAccumulatedFiles(parsed);
        setAppState("results");
      }
    } catch (e) {
      setError(String(e));
      setAppState("error");
    }
  }, [accumulatedFiles]);

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
      const parsed = parseContent(text);
      if (parsed.length === 0) {
        setError("No code files found in the provided content. Make sure the file contains fenced code blocks with file path headers.");
        setAppState("error");
        return;
      }
      
      if (merge) {
        const merged = mergeFiles(accumulatedFiles, parsed);
        setAccumulatedFiles(merged);
        setFiles(merged);
        setAppState("results");
      } else {
        setFiles(parsed);
        setAccumulatedFiles(parsed);
        setAppState("results");
      }
    } catch (e) {
      setError(String(e));
      setAppState("error");
    }
  }, [accumulatedFiles]);

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
      const blob = await buildZip(files);
      downloadBlob(blob, `${sourceFileName}.zip`);
    } finally {
      setDownloading(false);
    }
  }, [files, sourceFileName]);

  const handleReset = useCallback(() => {
    setAppState("idle");
    setFiles([]);
    setError("");
    setPasteText("");
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
    setShowPaste(false);
  }, []);

  const tree = buildTree(files);

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
                  <textarea
                    data-testid="paste-textarea"
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={"Paste the full chatbot message here...\n\nThe parser will find file paths like:\n  ### `src/app.ts`\n  ```typescript\n  ...\n  ```"}
                    className="w-full h-56 bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  />
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
                  <textarea
                    data-testid="paste-textarea-add"
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste the next chatbot message to merge files..."
                    className="w-full h-56 bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  />
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-white font-semibold text-lg">
                  Found {files.length} file{files.length !== 1 ? "s" : ""}
                </h2>
                <p className="text-neutral-500 text-sm font-mono">{sourceFileName}</p>
              </div>
              <div className="flex items-center gap-3">
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

            {/* Stats row */}
            <div className="flex gap-4">
              {[
                { label: "Files", value: files.length },
                { label: "Languages", value: new Set(files.map((f) => f.language)).size },
                {
                  label: "Total lines",
                  value: files.reduce((acc, f) => acc + f.content.split("\n").length, 0).toLocaleString(),
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-neutral-900 border border-white/5 rounded-lg px-4 py-3 flex-1 text-center">
                  <p className="text-white font-semibold text-lg font-mono">{stat.value}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
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
                <FileCard key={file.path} file={file} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FileCard({ file }: { file: ParsedFile }) {
  const [expanded, setExpanded] = useState(false);
  const lines = file.content.split("\n");

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
        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20 flex-shrink-0">
          {file.language}
        </span>
        <span className="text-neutral-600 text-xs font-mono flex-shrink-0">{lines.length}L</span>
      </button>
      {expanded && (
        <div className="border-t border-white/5">
          <pre className="overflow-x-auto px-4 py-3 text-xs font-mono text-neutral-300 bg-neutral-950/50 max-h-80 overflow-y-auto leading-relaxed">
            <code>{file.content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
