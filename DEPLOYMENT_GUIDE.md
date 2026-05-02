# Deployment Guide — chat-to-files

chat-to-files is a fully static React + Vite app. No server, no database, no backend. This means it can be deployed for **free** on any static hosting platform.

---

## Build the app

From the project root, run:

```bash
pnpm --filter @workspace/chat-to-files run build
```

The output is in `artifacts/chat-to-files/dist/`. That folder is everything you need to deploy.

---

## Free hosting options

### Option 1 — Replit (already here, zero config)

Replit hosts this app natively. Just click **Publish** in the top-right corner of this workspace.

- Free `.replit.app` subdomain
- HTTPS included
- No build step needed — Replit serves the dev server publicly
- Upgrade to a paid plan for always-on (free tier sleeps after inactivity)

---

### Option 2 — Vercel (recommended for production)

**Free tier:** Unlimited personal projects, 100 GB bandwidth/month, custom domains.

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **Add New Project** → import your repository
4. Set these build settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `artifacts/chat-to-files`
   - **Build Command:** `pnpm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**

Vercel auto-deploys on every push to `main`.

---

### Option 3 — Netlify

**Free tier:** 100 GB bandwidth/month, 300 build minutes/month, custom domains.

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
3. Set build settings:
   - **Base directory:** `artifacts/chat-to-files`
   - **Build command:** `pnpm run build`
   - **Publish directory:** `artifacts/chat-to-files/dist`
4. Click **Deploy site**

Or deploy via drag-and-drop:
1. Run the build locally
2. Drag the `artifacts/chat-to-files/dist` folder onto [app.netlify.com/drop](https://app.netlify.com/drop)

---

### Option 4 — GitHub Pages

**Free tier:** Completely free for public repositories.

1. Push your code to a public GitHub repository
2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm --filter @workspace/chat-to-files run build

      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: artifacts/chat-to-files/dist
```

3. In your repo settings, go to **Pages** → set source to `gh-pages` branch
4. Your app will be live at `https://<username>.github.io/<repo>/`

> **Note:** If deploying to a subdirectory (e.g. `/repo/`), set `base` in `artifacts/chat-to-files/vite.config.ts` to match.

---

### Option 5 — Cloudflare Pages

**Free tier:** Unlimited requests, unlimited bandwidth, 500 builds/month.

1. Push to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project** → **Connect to Git**
3. Set build settings:
   - **Framework preset:** None (or Vite)
   - **Build command:** `pnpm --filter @workspace/chat-to-files run build`
   - **Build output directory:** `artifacts/chat-to-files/dist`
4. Click **Save and Deploy**

Cloudflare Pages is generally the fastest globally distributed option on the free tier.

---

## Comparison

| Platform | Free bandwidth | Custom domain | Auto-deploy | Global CDN |
|----------|---------------|---------------|-------------|------------|
| Replit | Limited (sleeps) | No (paid) | Yes | No |
| Vercel | 100 GB/mo | Yes | Yes | Yes |
| Netlify | 100 GB/mo | Yes | Yes | Yes |
| GitHub Pages | Unlimited* | Yes | Via Actions | Partial |
| Cloudflare Pages | Unlimited | Yes | Yes | Yes |

*GitHub Pages has a soft limit of 1 GB repo size and 100 GB/month bandwidth guideline.

---

## Environment variables

This app has no required environment variables — all processing is client-side. No API keys, no secrets.

---

## Custom domain (all platforms)

All platforms above support custom domains on the free tier. Add a `CNAME` DNS record pointing to the platform's domain:

| Platform | CNAME target |
|----------|-------------|
| Vercel | `cname.vercel-dns.com` |
| Netlify | `<your-site>.netlify.app` |
| GitHub Pages | `<username>.github.io` |
| Cloudflare Pages | `<your-site>.pages.dev` |
