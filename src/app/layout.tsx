import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/site";

// Display: Fraunces — a soft, old-style serif that suits a hand-mixed apothecary.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
});

// Body: Instrument Sans — clean and legible, slightly warmer than Inter.
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Utility: Plex Mono — for labels, formulation slips and small data.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Prijas — Personalized Natural Skincare", template: "%s · Prijas" },
  description:
    "Handcrafted skincare made specifically for you after a one-on-one consultation. No guesswork — just formulas your skin actually needs.",
  keywords: ["natural skincare", "personalized skincare", "ayurvedic", "consultation", "India"],
  openGraph: {
    title: "Prijas — Personalized Natural Skincare",
    description: "Organic skin and scalp care, mixed by hand by Harsheen Kaur after a one-on-one consultation.",
    type: "website",
    locale: "en_IN",
    siteName: "Prijas",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Prijas — organic skincare, mixed by hand" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = { themeColor: "#F4EEE4" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrument.variable} ${plexMono.variable}`}>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
