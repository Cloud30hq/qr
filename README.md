<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1GMlgjvRbrAhajwHzKO3BJrf1oVdjZhI_

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a local env file:
   `cp .env.example .env.local`
3. Add Redis credentials to `.env.local` (KV naming shown in `.env.example`).
4. Add an `ADMIN_TOKEN` to `.env.local` for dashboard access.
5. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Create an Upstash Redis database (via Vercel Integrations) and connect it to this project.
2. Ensure the following environment variables are set in Vercel:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `ADMIN_TOKEN`
3. Deploy as a standard Vite + Vercel project.
