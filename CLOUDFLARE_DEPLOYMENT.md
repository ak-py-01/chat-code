# Deploying chat-to-files to Cloudflare Pages

This guide explains how to deploy the `chat-to-files` application to Cloudflare Pages for free.

## Prerequisites

1. A GitHub account with the `chat-code` repository.
2. A Cloudflare account.

## Deployment Steps

### 1. Connect Repository

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your GitHub account and the `chat-code` repository.

### 2. Configure Build Settings

Set the following build configuration:

- **Project name:** `chat-to-files` (or your preferred name)
- **Production branch:** `main` (or your primary branch)
- **Framework preset:** `None`
- **Build command:** `pnpm install && pnpm --filter @workspace/chat-to-files run build`
- **Build output directory:** `artifacts/chat-to-files/dist/public`

### 3. Environment Variables

While the application is primarily client-side, the build process in this monorepo might expect certain environment variables. Based on the project configuration, you should add:

- `NODE_VERSION`: `20` (or later)
- `PNPM_VERSION`: `9` (matching your local environment)

*(Note: The build process has been updated to use sensible defaults if `PORT` or `BASE_PATH` are missing, so you don't strictly need to set them for the build to succeed.)*

### 4. Deploy

1. Click **Save and Deploy**.
2. Cloudflare will clone your repository, install dependencies using `pnpm`, and run the build command.
3. Once the build is complete, your site will be live at a `*.pages.dev` subdomain.

## Handling Monorepo Structure

Cloudflare Pages supports monorepos. By setting the **Build output directory** to `artifacts/chat-to-files/dist/public` and running the build from the root, Cloudflare will correctly find the production assets.

## Troubleshooting

- **Build Failures:** Ensure the `pnpm-lock.yaml` is up to date in your repository.
- **Missing Assets:** Verify that the **Build output directory** matches the `outDir` in `artifacts/chat-to-files/vite.config.ts`. In this project, it is set to `dist/public`.
