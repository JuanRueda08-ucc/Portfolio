import type { Metadata, Viewport } from "next";
import { Figtree, Geist_Mono, Newsreader, Outfit } from "next/font/google";
import Cursor from "@/components/Cursor";
import Loader from "@/components/Loader";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { profile } from "@/data/profile";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Main text uses the system "Helvetica Neue" → Arial stack (see globals.css).
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], weight: ["400", "600"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], weight: ["600"] });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description = `${profile.displayName} — ${profile.role} from ${profile.city}, Colombia. ${profile.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.displayName} — ${profile.role}`,
    template: `%s — ${profile.displayName}`,
  },
  description,
  authors: [{ name: profile.displayName }],
  keywords: ["portfolio", "software engineering", "frontend", "Next.js", "TypeScript", profile.displayName],
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.displayName,
    title: `${profile.displayName} — ${profile.role}`,
    description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: profile.displayName, description },
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${figtree.variable} ${newsreader.variable} ${geistMono.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen">
        {/* Keyboard users can jump straight past the navbar */}
        <a
          href="#main-content"
          className="btn-text fixed top-3 left-3 z-[110] -translate-y-20 rounded-full bg-violet-bright px-4 py-2 text-ink transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <Loader />
          <Cursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
