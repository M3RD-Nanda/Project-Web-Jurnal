/**
 * Advanced Service Worker for Caching
 * Implements stale-while-revalidate and cache-first strategies
 */

const CACHE_NAME = "jurnal-cache-v2";
const STATIC_CACHE = "jurnal-static-v2";
const API_CACHE = "jurnal-api-v2";
const IMAGE_CACHE = "jurnal-images-v2";
const FONT_CACHE = "jurnal-fonts-v2";

// Resources to cache immediately (critical path)
const STATIC_RESOURCES = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/jimeka-logo.png",
];

// API endpoints to cache with different strategies
const API_ENDPOINTS = [
  "/api/articles",
  "/api/announcements",
  "/api/statistics",
];

// Cache strategies configuration
const CACHE_STRATEGIES = {
  // Static assets - cache first with long TTL
  static: {
    cacheName: STATIC_CACHE,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 100,
  },
  // API responses - network first with fallback
  api: {
    cacheName: API_CACHE,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50,
  },
  // Images - cache first with stale-while-revalidate
  images: {
    cacheName: IMAGE_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 200,
  },
  // Fonts - cache first with long TTL
  fonts: {
    cacheName: FONT_CACHE,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 30,
  },
};

// Install event - cache static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(
          STATIC_RESOURCES.filter((url) => !url.endsWith("/"))
        );
      }),
      caches.open(API_CACHE),
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== API_CACHE &&
              cacheName !== IMAGE_CACHE &&
              cacheName !== FONT_CACHE
            ) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        self.clients.claim();
      })
  );
});

// Helper function to determine cache strategy
function getCacheStrategy(url) {
  if (url.pathname.startsWith("/api/")) {
    return CACHE_STRATEGIES.api;
  }
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|avif|ico|svg)$/)) {
    return CACHE_STRATEGIES.images;
  }
  if (url.pathname.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
    return CACHE_STRATEGIES.fonts;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    return CACHE_STRATEGIES.static;
  }
  return null;
}

// Cache-first strategy with expiration
async function cacheFirst(request, strategy) {
  const cache = await caches.open(strategy.cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get("date"));
    const now = new Date();

    // Check if cache is still valid
    if (now - cachedDate < strategy.maxAge) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return stale cache if network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network-first strategy with cache fallback
async function networkFirst(request, strategy) {
  const cache = await caches.open(strategy.cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, strategy) {
  const cache = await caches.open(strategy.cacheName);
  const cachedResponse = await cache.match(request);

  // Start network request in background
  const networkResponsePromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Otherwise wait for network
  return networkResponsePromise;
}

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle API requests with stale-while-revalidate
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // Handle static assets with cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.includes(".css") ||
    url.pathname.includes(".js") ||
    url.pathname.includes(".png") ||
    url.pathname.includes(".jpg") ||
    url.pathname.includes(".svg")
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Handle navigation requests with network-first
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // Default to network-first for other requests
  event.respondWith(networkFirst(request, CACHE_NAME));
});

/**
 * Cache-first strategy for static assets
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn("Cache-first fetch failed:", error);
    return new Response("Network error", { status: 408 });
  }
}

/**
 * Network-first strategy for navigation
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return new Response("Offline", { status: 503 });
  }
}

/**
 * Stale-while-revalidate strategy for API calls
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Always try to fetch fresh data in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      // Silently fail background fetch
      return null;
    });

  // Return cached version immediately if available
  if (cached) {
    // Don't await the fetch promise to return cached data immediately
    fetchPromise;
    return cached;
  }

  // If no cached version, wait for network
  try {
    return await fetchPromise;
  } catch (error) {
    return new Response("API unavailable", { status: 503 });
  }
}

/**
 * Background sync for offline actions
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log("Background sync triggered");
}

/**
 * Push notification handler
 */
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: data.url,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

/**
 * Notification click handler
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});

/**
 * Message handler for cache management
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Periodic cache cleanup
setInterval(() => {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      if (cacheName.includes("temp-")) {
        caches.delete(cacheName);
      }
    });
  });
}, 24 * 60 * 60 * 1000); // Daily cleanup
