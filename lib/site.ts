/**
 * Public base URL. On Vercel, VERCEL_PROJECT_PRODUCTION_URL is set automatically
 * (e.g. "juano.vercel.app"); locally we fall back to localhost.
 */
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
