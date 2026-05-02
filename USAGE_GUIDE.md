# Usage Guide — chat-to-files

**chat-to-files** reads AI/chatbot coding assistant output and extracts every code file into a downloadable zip archive, preserving the full project directory structure.

---

## What it accepts

| Format | Extension | Notes |
|--------|-----------|-------|
| PDF | `.pdf` | Text is extracted page by page |
| Plain text | `.txt` | Raw chatbot copy-paste |
| Markdown | `.md`, `.markdown` | Most AI assistants output markdown |
| Pasted text | — | No file needed; paste directly |

---

## Step-by-step usage

### 1. Get the chatbot output

Ask your AI assistant (ChatGPT, Claude, Gemini, etc.) to generate a coding project. The response must include **fenced code blocks** with file path labels. Example:

```
### `src/app.ts`
```typescript
import express from 'express';
const app = express();
...
```
```

### 2. Save or copy the output

- **File route:** Save the AI response as a `.md` or `.txt` file
- **PDF route:** Use your browser's Print → Save as PDF on the chat page
- **Paste route:** Copy the entire message text

### 3. Upload or paste

Open the app and either:
- **Drag and drop** your file onto the drop zone
- **Click the drop zone** to open a file picker
- **Click "Paste chatbot output"** to reveal a text area, paste, then click "Parse text"

### 4. Review the file tree

After parsing, the app shows:
- Total file count, language count, and total line count
- A collapsible folder/file tree — click any folder to collapse/expand
- Each file row shows its language tag and line count on hover
- Click any file card at the bottom to expand and preview its contents

### 5. Download

Click **Download `<name>.zip`**. The zip preserves the full directory structure so you can unzip directly into your project root or IDE.

---

## Supported file path formats

The parser recognises all common ways AI assistants label files:

| Pattern | Example |
|---------|---------|
| Markdown heading with backtick path | `### \`app/build.gradle.kts\`` |
| Numbered heading | `### 1. \`src/index.ts\`` |
| Bold backtick | `**\`path/to/file.py\`**` |
| Inline backtick before a code block | `` `config/settings.json` `` |
| Comment on first line of block | `// src/utils/helper.ts` |
| Hash comment | `# scripts/deploy.sh` |

---

## Supported languages / extensions

`.kt` `.kts` `.java` `.xml` `.gradle` `.ts` `.tsx` `.js` `.jsx` `.py` `.rb` `.go` `.rs` `.php` `.swift` `.dart` `.c` `.cpp` `.cs` `.json` `.yaml` `.yml` `.toml` `.ini` `.env` `.md` `.html` `.css` `.scss` `.sh` `.sql` `.prisma` `.proto` `.vue` `.svelte` `.tf` `.hcl` `Dockerfile` `Makefile` `.gitignore` and more.

---

## Tips for better results

- **Ask the AI to use consistent file headers.** Prompt: *"Label every file with its path as a markdown heading before the code block."*
- **One conversation = one zip.** If the AI splits the project across multiple messages, save each message to a separate file and run the tool once per file.
- **Duplicate paths:** If the same file path appears more than once (e.g. the AI corrects itself), the last occurrence wins.
- **PDF quality:** PDFs generated from browser printing work best. Exported PDFs from some apps may scramble code formatting — use `.txt` or `.md` when possible.

---

## Privacy

All processing happens entirely in your browser. No files, no code, and no text are ever sent to any server.
