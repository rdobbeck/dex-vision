import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Fira_Code } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/layout/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DexVision - DEX Analytics & Dark Pool AMM",
  description:
    "Open-source DEX analytics platform with real-time pair tracking, charts, and a privacy-preserving dark pool AMM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${firaCode.variable} antialiased min-h-screen bg-background`}
      >
        <Providers>
          <Header />
          <main className="mx-auto max-w-[1800px] px-4 py-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
