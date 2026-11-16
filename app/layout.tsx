import type { Metadata } from "next";
import { Figtree, Geist_Mono, Newsreader, Outfit } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { profile } from "@/data/profile";
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

export const metadata: Metadata = {
  title: `${profile.displayName} — ${profile.role}`,
  description: profile.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${figtree.variable} ${newsreader.variable} ${geistMono.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
