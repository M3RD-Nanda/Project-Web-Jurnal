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
import { SimplePrefetchManager } from "@/components/SimplePrefetchManager";
import { recordPageVisit } from "@/actions/analytics";
import { headers } from "next/headers";
import {
  generateMetadata as generateSEOMetadata,
  SITE_CONFIG,
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
} from "@/lib/metadata";
// Import warning suppression and CSS optimization for development
import "@/lib/suppress-warnings";
import "@/lib/css-optimization";
import "@/lib/preload-prevention";

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

  // For security, we don't fetch session on server-side to avoid warnings
  // The client-side SessionProvider will handle authentication properly
  const initialSession = null;

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
        {/* Preload Prevention Script - Run Early */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === "undefined") return;

                // Early preload prevention
                const originalCreateElement = document.createElement;
                document.createElement = function(tagName, options) {
                  const element = originalCreateElement.call(this, tagName, options);

                  if (tagName.toLowerCase() === 'link') {
                    const originalSetAttribute = element.setAttribute;
                    element.setAttribute = function(name, value) {
                      if (name === 'rel' && value === 'preload') {
                        const href = this.getAttribute('href') || '';
                        if (href.includes('.css') && (
                          href.includes('web3') ||
                          href.includes('wallet') ||
                          href.includes('solana') ||
                          href.includes('rainbow') ||
                          href.includes('rainbowkit') ||
                          href.includes('wagmi') ||
                          href.includes('@rainbow-me') ||
                          href.includes('chunks/') ||
                          href.includes('app/layout')
                        )) {
                          originalSetAttribute.call(this, 'rel', 'stylesheet');
                          originalSetAttribute.call(this, 'media', 'print');
                          this.onload = () => { this.media = 'all'; };
                          return;
                        }
                      }
                      originalSetAttribute.call(this, name, value);
                    };
                  }
                  return element;
                };
              })();
            `,
          }}
        />

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
