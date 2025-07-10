import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { SessionProvider } from "@/components/SessionProvider";
import { Web3Provider } from "@/components/Web3Provider";
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { recordPageVisit } from "@/actions/analytics";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/integrations/supabase/server-actions"; // Import server client
import {
  generateMetadata as generateSEOMetadata,
  SITE_CONFIG,
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
} from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = generateSEOMetadata({
  title: SITE_CONFIG.shortName,
  description: SITE_CONFIG.description,
  canonical: SITE_CONFIG.url,
  openGraph: {
    type: "website",
    image: `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(
      SITE_CONFIG.name
    )}&subtitle=${encodeURIComponent(
      "Peer-review dan Open Access"
    )}&type=website`,
  },
  twitter: {
    card: "summary_large_image",
  },
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Record page visit on every page load
  const headersList = await headers();
  const path = headersList.get("x-pathname") || "/";
  await recordPageVisit(path);

  // Fetch initial session on the server
  const supabase = await createSupabaseServerClient();
  const {
    data: { session: initialSession },
  } = await supabase.auth.getSession();

  // Add polyfill for indexedDB on server-side
  if (typeof globalThis.indexedDB === "undefined") {
    globalThis.indexedDB = {
      open: () =>
        Promise.reject(new Error("IndexedDB not available on server")),
      deleteDatabase: () =>
        Promise.reject(new Error("IndexedDB not available on server")),
      databases: () =>
        Promise.reject(new Error("IndexedDB not available on server")),
    } as any;
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationStructuredData()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteStructuredData()),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            {/* Pass initialSession to SessionProvider */}
            <SessionProvider initialSession={initialSession}>
              <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex flex-1 flex-col md:flex-row">
                  <Sidebar />
                  <main className="flex-1">{children}</main>
                </div>
                <Footer />
              </div>
            </SessionProvider>
          </Web3Provider>
        </ThemeProvider>
        <Toaster />
        <MadeWithDyad />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
