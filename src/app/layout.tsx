import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { SessionProvider } from "@/components/SessionProvider";
import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { createClient } from "@/integrations/supabase/server"; // Import server client
import dynamic from "next/dynamic";
import { ClientProviders } from "@/components/ClientProviders";

// Server-side dynamic imports for layout components
const Header = dynamic(
  () =>
    import("@/components/layout/Header").then((mod) => ({
      default: mod.Header,
    })),
  {
    ssr: true,
    loading: () => <div className="h-16 bg-primary" />, // Prevent layout shift
  }
);

const Footer = dynamic(
  () =>
    import("@/components/layout/Footer").then((mod) => ({
      default: mod.Footer,
    })),
  {
    ssr: true,
    loading: () => <div className="h-32 bg-muted" />, // Prevent layout shift
  }
);

const Sidebar = dynamic(
  () =>
    import("@/components/layout/Sidebar").then((mod) => ({
      default: mod.Sidebar,
    })),
  {
    ssr: true,
    loading: () => <div className="w-64 bg-muted hidden md:block" />, // Prevent layout shift
  }
);
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
import { AccessibilityFixer } from "@/components/AccessibilityFixer";
import { DisclaimerPopup } from "@/components/DisclaimerPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Improve font loading performance
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Improve font loading performance
  preload: false, // Only preload primary font
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
  // Analytics tracking moved to client-side to prevent dynamic server usage errors

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
        {/* Critical CSS for LCP optimization */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical CSS for above-the-fold content */
              .hero-section {
                background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--jimeka-blue)));
                color: hsl(var(--primary-foreground));
                padding: 2rem;
                border-radius: 0.5rem;
                box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                position: relative;
                overflow: hidden;
              }
              .hero-content {
                max-width: 48rem;
                margin: 0 auto;
                text-align: center;
                position: relative;
                z-index: 10;
              }
              .hero-title {
                font-size: 2.25rem;
                font-weight: 800;
                margin-bottom: 1rem;
                line-height: 1.1;
              }
              @media (min-width: 768px) {
                .hero-title {
                  font-size: 3rem;
                }
              }
            `,
          }}
        />

        {/* Preload critical resources for LCP */}
        {/* Logo preloading is handled by Next.js Image component with priority prop */}
        {/* CSS is automatically handled by Next.js - no manual preload needed */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

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
          <ClientProviders>
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
          </ClientProviders>
        </ThemeProvider>
        <Toaster />
        <DisclaimerPopup />
        <MadeWithDyad />
        <AccessibilityFixer />
        {/* Load analytics asynchronously to reduce main thread work */}
        <SpeedInsights />
        {/* Only load Analytics in production to prevent 404 errors in development */}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
