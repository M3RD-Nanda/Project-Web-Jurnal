import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { SessionProvider } from "@/components/SessionProvider";
import { Web3Provider } from "@/components/Web3Provider";
import { SolanaProvider } from "@/components/SolanaProvider";
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { recordPageVisit } from "@/actions/analytics";
import { headers } from "next/headers";
import { createClient } from "@/integrations/supabase/server"; // Import server client
import {
  generateMetadata as generateSEOMetadata,
  SITE_CONFIG,
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
} from "@/lib/metadata";
// Import warning suppression for development
import "@/lib/suppress-warnings";

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

  // Fetch initial session on the server with proper security verification
  // First verify the user is authenticated, then get session if needed
  const supabase = await createClient();
  let initialSession = null;

  try {
    // Verify user authentication first for security
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Only get session if user is properly authenticated
    if (!userError && user) {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!sessionError) {
        initialSession = session;
      }
    }
  } catch (error) {
    console.error("Error fetching initial session:", error);
    // Continue with null session - client will handle authentication
  }

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
            <SolanaProvider>
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
            </SolanaProvider>
          </Web3Provider>
        </ThemeProvider>
        <Toaster />
        <MadeWithDyad />
        <PerformanceMonitor />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
