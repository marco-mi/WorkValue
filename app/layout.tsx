import type { Metadata } from "next";
import { Bebas_Neue, Space_Mono } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display"
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "WORK VALUE CALCULATOR",
  description: "A provocative concept tool for real vs perceived market value."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="font-mono text-[15px]">
        <div className="min-h-screen px-6 py-10">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
