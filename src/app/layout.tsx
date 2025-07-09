import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { SessionProvider } from "@/components/SessionProvider";
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { recordPageVisit } from "@/actions/analytics";
import { headers } from "next/headers";
import { ClientThemeProviderWrapper } from "@/components/ClientThemeProviderWrapper"; // Import the new client wrapper

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi",
  description: "Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) adalah jurnal peer-review dan open-access yang diterbitkan oleh Universitas Percobaan Nanda.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Record page visit on every page load
  const headersList = await headers();
  const path = headersList.get('x-pathname') || '/';
  await recordPageVisit(path);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientThemeProviderWrapper
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <div className="flex flex-1 flex-col md:flex-row">
                <Sidebar />
                <main className="flex-1">
                  {children}
                </main>
              </div>
              <Footer />
            </div>
          </SessionProvider>
        </ClientThemeProviderWrapper>
        <Toaster />
        <MadeWithDyad />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}