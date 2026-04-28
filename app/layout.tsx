import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "../styles/tokens.css";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-sans"
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "English KES Trainer",
  description: "A structured speech and translation trainer for English practice."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7fbf6"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${display.variable} ${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
