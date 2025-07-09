import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
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
        {/* Delay ThemeProvider rendering to client-side to avoid hydration issues with system theme */}
        <ClientThemeProviderWrapper>
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

// New Client Component to wrap ThemeProvider
// This ensures ThemeProvider only runs on the client after hydration
function ClientThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render children directly without theme for server to avoid hydration mismatch
    return <>{children}</>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}