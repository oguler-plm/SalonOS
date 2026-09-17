import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SalonOS",
  description: "Berber ve kuaförler için günlük randevu ve müşteri yönetimi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#171310",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`h-full antialiased ${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-full flex-col bg-[var(--color-bg)] font-sans text-[var(--color-ink)]">
        {children}
      </body>
    </html>
  );
}
