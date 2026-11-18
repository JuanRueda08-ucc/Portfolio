// Cloudflare Pages "bridge": serves the Vercel site at juano.pages.dev.
// The portfolio is still built and hosted on Vercel (course requirement); this only forwards
// every request (pages, scripts, videos with their Range headers, the CV) and returns the answer.
// Deploy: Cloudflare → Workers & Pages → Create → Pages → Upload assets → project "juano" →
// upload this folder (deploy/cloudflare-pages). Change ORIGIN if the Vercel URL ever changes.
const ORIGIN = "portfolio-five-pi-tko6sn9i9q.vercel.app";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = ORIGIN;
    url.protocol = "https:";
    url.port = "";
    const res = await fetch(new Request(url, request), { redirect: "manual" });

    // Keep redirects on our own domain.
    const location = res.headers.get("location");
    if (location && location.includes(ORIGIN)) {
      const headers = new Headers(res.headers);
      headers.set("location", location.replace(`https://${ORIGIN}`, `https://${new URL(request.url).host}`));
      return new Response(res.body, { status: res.status, headers });
    }
    return res;
  },
};
