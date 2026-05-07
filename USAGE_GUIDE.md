# Usage Guide - chat-to-files

**chat-to-files** turns AI coding-assistant output into real project files. It parses fenced code blocks, detects filenames in several common styles, lets you review and correct the project tree, then exports a ZIP or terminal commands.

## What It Accepts

| Format | Extension | Notes |
| --- | --- | --- |
| PDF | `.pdf` | Text is extracted page by page in the browser |
| Plain text | `.txt` | Raw chatbot copy-paste |
| Markdown | `.md`, `.markdown` | Best format for AI assistant output |
| Pasted text | none | Paste directly into the app |

## Quick Start

1. Open the app.
2. Drop a `.md`, `.txt`, or `.pdf` file, or click **Paste chatbot output**.
3. Use **Use sample** if you want to see the expected format immediately.
4. Click **Parse text**.
5. Review the live project tree, parser confidence, and warnings.
6. Correct any wrong filenames in the file cards.
7. Download the ZIP, copy the file tree, download the report, or copy terminal commands.

## Recommended Chatbot Format

Ask your AI assistant to label every file with a project-relative path before the code block:

````markdown
### `src/app.ts`
```typescript
export function run() {
  console.log("hello");
}
```
````

The app is forgiving. It also detects paths in fence metadata and first-line comments:

````markdown
```tsx filename="src/App.tsx"
export default function App() {
  return <h1>Hello</h1>;
}
```

// src/styles.css
```css
body {
  font-family: system-ui, sans-serif;
}
```
````

## Review Before Download

After parsing, the results screen shows:

- A live project tree such as `src/`, `components/`, `package.json`, and `README.md`
- File count, language count, line count, folder count, and parser confidence
- Parser warnings for suspicious paths, duplicates, empty files, and uncertain blocks
- Editable filename fields inside each expanded file card
- Safe code previews rendered as text, not executable HTML

## Warnings

The parser blocks or warns about risky output, including:

- Path traversal such as `../secret.txt` or `../../some-file`
- Absolute Unix paths such as `/etc/passwd`
- Windows drive paths such as `C:\Users\name\file.txt`
- Invalid Windows filename characters such as `< > : " | ? *`
- Duplicate filenames where a later block replaces an earlier one
- Empty files
- Code blocks where no confident filename was found

If a filename is wrong, expand the file card, edit **Correct filename before download**, and click **Apply**.

## Export Options

| Action | What it does |
| --- | --- |
| **Download ZIP** | Exports the recovered files with their folder structure |
| **Copy tree** | Copies the detected project file list |
| **Copy commands** | Copies shell commands that recreate every file with `mkdir -p` and `cat` |
| **Report** | Downloads a Markdown extraction report |
| **Include in zip** | Adds helper files to the ZIP |

When **Include in zip** is enabled, the ZIP also includes:

- `README.extracted.md`
- `CHAT_TO_FILES_REPORT.md`
- `chat-to-files.manifest.json`
- `restore-folders.sh`
- `create-files.sh`

## Privacy

All parsing, PDF text extraction, previewing, and ZIP creation happen locally in your browser. Your pasted code, uploaded files, and generated ZIP contents are not uploaded by this static app.

## Security Notes

The app treats pasted Markdown and code as untrusted input.

- File previews are rendered through React text output, so code is displayed as text instead of inserted with unsafe HTML.
- The app does not use `innerHTML` for user-provided code previews.
- ZIP entry paths are normalized and must be project-relative.
- Suspicious archive paths such as `../../some-file`, `/root/.ssh/id_rsa`, and `C:\Windows\System32\file` are blocked before export.

If future versions add rendered Markdown or HTML preview, sanitize that HTML with a maintained sanitizer such as DOMPurify and keep using safe DOM sinks such as `textContent` wherever possible.

## Tips

- Prefer Markdown or text over PDF when possible; PDFs can scramble line breaks.
- Ask the AI to include dependency files such as `package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, or `go.mod`.
- Use **Add more files** when the assistant sends a project across multiple messages.
- Review duplicate warnings carefully; the latest version of a duplicate file wins.

## Deployment

For hosting instructions, see [Cloudflare Pages Deployment Guide](./CLOUDFLARE_DEPLOYMENT.md).
