import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { SessionProvider } from "@/components/SessionProvider";
import React from "react";
import { Header } from "@/components/layout/Header"; // Import Header
import { Footer } from "@/components/layout/Footer"; // Import Footer
import { Sidebar } from "@/components/layout/Sidebar"; // Import Sidebar
import { SpeedInsights } from "@vercel/speed-insights/next"; // Import SpeedInsights
import { Analytics } from "@vercel/analytics/next"; // Import Analytics

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
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
        </ThemeProvider>
        <Toaster />
        <MadeWithDyad />
        <SpeedInsights />
        <Analytics /> {/* Add Analytics component here */}
      </body>
    </html>
  );
}