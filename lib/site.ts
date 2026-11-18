/**
 * Public base URL (metadata, Open Graph image, sitemap, robots).
 * Production is served at juano.pages.dev: a Cloudflare Pages bridge in front of
 * Vercel (see deploy/cloudflare-pages). Previews use their own Vercel URL; locally,
 * localhost.
 */
export const PUBLIC_URL = "https://juano.pages.dev";

export const siteUrl =
  process.env.VERCEL_ENV === "production"
    ? PUBLIC_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
