import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prijas — Personalized Natural Skincare",
  description:
    "Handcrafted skincare made specifically for you after a one-on-one consultation. No guesswork — just formulas your skin actually needs.",
  keywords: ["natural skincare", "personalized skincare", "ayurvedic", "consultation", "India"],
  openGraph: {
    title: "Prijas — Personalized Natural Skincare",
    description: "Handcrafted skincare made specifically for you.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
