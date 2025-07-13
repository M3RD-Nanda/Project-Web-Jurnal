import { NextResponse, type NextRequest } from "next/server";

// Cache configuration for different resource types
const CACHE_CONFIGS = {
  // Static assets - very long cache
  static: "public, max-age=31536000, immutable", // 1 year
  // Images - long cache with revalidation
  images: "public, max-age=2592000, stale-while-revalidate=86400", // 30 days
  // API responses - medium cache
  api: "public, max-age=300, stale-while-revalidate=60", // 5 minutes
  // Pages - short cache with revalidation
  pages: "public, max-age=60, stale-while-revalidate=300", // 1 minute
  // Dynamic content - very short cache
  dynamic: "public, max-age=10, stale-while-revalidate=60", // 10 seconds
  // No cache for sensitive routes
  noCache: "no-cache, no-store, must-revalidate, max-age=0",
} as const;

export async function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Add pathname to headers for analytics
  const pathname = request.nextUrl.pathname;
  response.headers.set("x-pathname", pathname);

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Add aggressive caching headers based on route type
  const url = request.nextUrl;

  // Static assets (JS, CSS, fonts, etc.)
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.includes(".js") ||
    pathname.includes(".css") ||
    pathname.includes(".woff") ||
    pathname.includes(".woff2") ||
    pathname.includes(".ttf") ||
    pathname.includes(".otf")
  ) {
    response.headers.set("Cache-Control", CACHE_CONFIGS.static);
    response.headers.set("Vary", "Accept-Encoding");
  }

  // Images
  else if (
    pathname.includes(".jpg") ||
    pathname.includes(".jpeg") ||
    pathname.includes(".png") ||
    pathname.includes(".webp") ||
    pathname.includes(".avif") ||
    pathname.includes(".svg") ||
    pathname.includes(".ico")
  ) {
    response.headers.set("Cache-Control", CACHE_CONFIGS.images);
    response.headers.set("Vary", "Accept-Encoding");
  }

  // API routes
  else if (pathname.startsWith("/api/")) {
    // Different caching for different API endpoints
    if (pathname.includes("/analytics") || pathname.includes("/statistics")) {
      // Analytics data - shorter cache
      response.headers.set(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=300"
      );
    } else if (
      pathname.includes("/articles") ||
      pathname.includes("/announcements")
    ) {
      // Content data - longer cache
      response.headers.set(
        "Cache-Control",
        "public, max-age=1800, stale-while-revalidate=3600"
      );
    } else if (pathname.includes("/admin") || pathname.includes("/auth")) {
      // Sensitive routes - no cache
      response.headers.set("Cache-Control", CACHE_CONFIGS.noCache);
    } else {
      // Default API cache
      response.headers.set("Cache-Control", CACHE_CONFIGS.api);
    }
    response.headers.set("Vary", "Accept-Encoding, Authorization");
  }

  // Admin routes - no cache
  else if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    response.headers.set("Cache-Control", CACHE_CONFIGS.noCache);
  }

  // Dynamic user content
  else if (pathname.startsWith("/profile") || pathname.startsWith("/wallet")) {
    response.headers.set("Cache-Control", CACHE_CONFIGS.dynamic);
    response.headers.set("Vary", "Cookie, Authorization");
  }

  // Static content pages
  else if (
    pathname.startsWith("/about") ||
    pathname.startsWith("/author-guidelines") ||
    pathname.startsWith("/editorial-team") ||
    pathname.startsWith("/publication-ethics") ||
    pathname.startsWith("/terms-of-service") ||
    pathname.startsWith("/privacy-policy")
  ) {
    // Static pages - longer cache
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=86400"
    );
    response.headers.set("Vary", "Accept-Encoding");
  }

  // Article and content pages
  else if (
    pathname.startsWith("/articles/") ||
    pathname.startsWith("/announcements/") ||
    pathname.startsWith("/archives/")
  ) {
    // Content pages - medium cache
    response.headers.set(
      "Cache-Control",
      "public, max-age=1800, stale-while-revalidate=3600"
    );
    response.headers.set("Vary", "Accept-Encoding");
  }

  // Homepage and listing pages
  else if (
    pathname === "/" ||
    pathname.startsWith("/articles") ||
    pathname.startsWith("/announcements") ||
    pathname.startsWith("/search")
  ) {
    // Dynamic listing pages - short cache
    response.headers.set("Cache-Control", CACHE_CONFIGS.pages);
    response.headers.set("Vary", "Accept-Encoding");
  }

  // Default for other pages
  else {
    response.headers.set("Cache-Control", CACHE_CONFIGS.pages);
    response.headers.set("Vary", "Accept-Encoding");
  }

  // Add performance headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Prefetch", "on");

  // Add compression hint
  response.headers.set("Accept-CH", "Viewport-Width, Width");

  // Simple session handling without Supabase SSR to avoid Edge Runtime issues
  // Session refresh will be handled by SessionProvider on client-side

  return response;
}

export const config = {
  matcher: [
    // Enable middleware for specific routes that need analytics and security
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
