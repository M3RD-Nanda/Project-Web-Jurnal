/**
 * Aggressive Service Worker for Offline Caching
 * Implements comprehensive caching strategies for better performance
 */

const CACHE_NAME = 'jurnal-jebaka-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/articles',
  '/announcements',
  '/about',
  '/author-guidelines',
  '/submission-guidelines',
  '/editorial-team',
  '/publication-ethics',
  '/manifest.json',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/articles',
  '/api/announcements',
  '/api/analytics/stats',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Static assets - cache first
  static: 'cache-first',
  // API responses - network first with fallback
  api: 'network-first',
  // Pages - stale while revalidate
  pages: 'stale-while-revalidate',
  // Images - cache first with network fallback
  images: 'cache-first',
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache API endpoints
      caches.open(API_CACHE).then((cache) => {
        console.log('📡 Caching API endpoints...');
        return Promise.all(
          API_ENDPOINTS.map(async (endpoint) => {
            try {
              const response = await fetch(endpoint);
              if (response.ok) {
                return cache.put(endpoint, response);
              }
            } catch (error) {
              console.warn(`Failed to cache API endpoint ${endpoint}:`, error);
            }
          })
        );
      }),
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      // Force activation
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim(),
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(handleRequest(request));
});

/**
 * Handle different types of requests with appropriate caching strategies
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Static assets (JS, CSS, fonts, etc.)
    if (
      pathname.startsWith('/_next/static/') ||
      pathname.includes('.js') ||
      pathname.includes('.css') ||
      pathname.includes('.woff') ||
      pathname.includes('.woff2') ||
      pathname.includes('.ttf') ||
      pathname.includes('.otf')
    ) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Images
    else if (
      pathname.includes('.jpg') ||
      pathname.includes('.jpeg') ||
      pathname.includes('.png') ||
      pathname.includes('.webp') ||
      pathname.includes('.avif') ||
      pathname.includes('.svg') ||
      pathname.includes('.ico')
    ) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // API endpoints
    else if (pathname.startsWith('/api/')) {
      return await networkFirst(request, API_CACHE);
    }
    
    // Pages
    else {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
  } catch (error) {
    console.warn('Error handling request:', error);
    return fetch(request);
  }
}

/**
 * Cache First Strategy - for static assets
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('Network request failed:', error);
    throw error;
  }
}

/**
 * Network First Strategy - for API endpoints
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('Network request failed, trying cache:', error);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy - for pages
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch from network in background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.warn('Background network request failed:', error);
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cached response, wait for network
  return networkPromise;
}

/**
 * Background sync for failed requests
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 Performing background sync...');
  
  try {
    // Retry failed API requests
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
        }
      } catch (error) {
        console.warn('Background sync failed for:', request.url);
      }
    }
    
    console.log('✅ Background sync completed');
  } catch (error) {
    console.warn('Background sync error:', error);
  }
}

/**
 * Handle push notifications (if needed in future)
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      data: data.url,
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

/**
 * Periodic cache cleanup
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(cleanupCaches());
  }
});

async function cleanupCaches() {
  console.log('🧹 Cleaning up caches...');
  
  const cacheNames = await caches.keys();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = Date.now();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (now - responseDate > maxAge) {
            await cache.delete(request);
          }
        }
      }
    }
  }
  
  console.log('✅ Cache cleanup completed');
}
