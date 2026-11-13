import type { Metadata, Viewport } from "next";
import { Silkscreen, VT323 } from "next/font/google";
import { Boot } from "@/components/Boot";
import { site } from "@/content/site";
import { sunUp } from "@/lib/theme";
import "./globals.css";

const title = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-title", display: "swap" });
const text = VT323({ subsets: ["latin"], weight: "400", variable: "--font-text", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} · ${site.role}`,
  description: site.description,
  authors: [{ name: site.name, url: site.links.github }],
  openGraph: { type: "website", url: site.url, title: `${site.name} · ${site.role}`, description: site.description, siteName: site.name, images: [{ url: `${site.url}/og.png`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: `${site.name} · ${site.role}`, description: site.description, images: [`${site.url}/og.png`] },
};

export const viewport: Viewport = { themeColor: "#f4f0dc" };

// Runs before the first paint: plays the start-up screen only on the first visit of a
// browser session, and sets day or night (the visitor's own choice for this session if
// they made one, otherwise whether the sun is up in Newark right now) so it never flashes.
const BEFORE_PAINT = `var d=document.documentElement,c=null;try{if(sessionStorage.getItem("ck-boot"))d.dataset.boot="off";else sessionStorage.setItem("ck-boot","1");c=sessionStorage.getItem("ck-theme")}catch(e){}d.dataset.theme=c==="night"||c==="day"?c:(${sunUp.toString()})(Date.now())?"day":"night";`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${title.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BEFORE_PAINT }} />
      </head>
      <body>
        <Boot />
        <a className="skip" href="#work">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
