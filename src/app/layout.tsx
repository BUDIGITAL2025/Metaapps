import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Metaapps — Unified Ads Manager",
  description: "Manage Meta and Google Ads campaigns from a single dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${jakarta.variable} ${playfair.variable}`}>
      <body className={`${jakarta.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
