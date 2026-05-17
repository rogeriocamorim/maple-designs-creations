import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { getSettings } from "@/actions/settings";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maple Designs Creations",
  description: "3D print business cost calculator",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let currency = "USD";
  try {
    const settings = await getSettings();
    currency = settings.currency;
  } catch {
    // DB unavailable during build — use default
  }
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <CurrencyProvider currency={currency}>
          <AppShell>{children}</AppShell>
        </CurrencyProvider>
      </body>
    </html>
  );
}
