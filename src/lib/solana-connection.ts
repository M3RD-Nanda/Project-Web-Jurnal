import { Connection } from "@solana/web3.js";
import { solanaNetworks, SolanaNetwork } from "./solana-config";

// Connection pool for different networks
const connectionPool = new Map<string, Connection>();

// Create a connection with fallback support
export function createSolanaConnection(
  network: SolanaNetwork = "mainnet"
): Connection {
  const networkConfig = solanaNetworks[network];
  const cacheKey = `${network}-${networkConfig.endpoint}`;

  // Return cached connection if available
  if (connectionPool.has(cacheKey)) {
    return connectionPool.get(cacheKey)!;
  }

  // Create new connection
  const connection = new Connection(networkConfig.endpoint, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000, // 60 seconds
    disableRetryOnRateLimit: true, // Disable automatic retries to prevent rate limiting
  });

  // Cache the connection
  connectionPool.set(cacheKey, connection);

  return connection;
}

// Get connection with automatic fallback (optimized to reduce API calls)
export async function getConnectionWithFallback(
  network: SolanaNetwork = "mainnet"
): Promise<Connection> {
  // First try to use cached connection
  const cachedConnection = createSolanaConnection(network);
  if (cachedConnection) {
    return cachedConnection;
  }

  const networkConfig = solanaNetworks[network];
  const endpoints = networkConfig.fallbackEndpoints || [networkConfig.endpoint];

  // Try endpoints without testing them first to reduce API calls
  for (let i = 0; i < endpoints.length; i++) {
    try {
      const endpoint = endpoints[i];
      const cacheKey = `${network}-${endpoint}`;

      // Check if we already have this connection cached
      if (connectionPool.has(cacheKey)) {
        return connectionPool.get(cacheKey)!;
      }

      const connection = new Connection(endpoint, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 30000,
        disableRetryOnRateLimit: true, // Disable automatic retries to prevent rate limiting
      });

      // Cache the connection without testing it first
      connectionPool.set(cacheKey, connection);

      return connection;
    } catch (error) {
      // If this is the last endpoint, throw the error
      if (i === endpoints.length - 1) {
        throw new Error(`Failed to connect to any Solana ${network} endpoint`);
      }
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error(`No valid endpoints found for ${network}`);
}

// Cache for balance requests to prevent duplicate calls
const balanceCache = new Map<string, { balance: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds cache

// Retry function with exponential backoff and improved rate limiting handling
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3, // Increased back to 3 for better reliability
  baseDelay: number = 3000 // Increased to 3000ms for rate limiting
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Handle rate limiting with longer delays
      if (
        error.message?.includes("429") ||
        error.message?.includes("Too Many Requests") ||
        error.message?.includes("rate limit") ||
        error.message?.includes("Exceeded rate limit")
      ) {
        // For rate limiting, use much longer delays
        if (attempt < maxRetries) {
          const rateLimitDelay = baseDelay * Math.pow(3, attempt + 1); // Exponential backoff with base 3
          console.log(
            `Rate limited, waiting ${rateLimitDelay}ms before retry ${
              attempt + 1
            }/${maxRetries}`
          );
          await new Promise((resolve) => setTimeout(resolve, rateLimitDelay));
          continue;
        } else {
          // If we've exhausted retries, throw a user-friendly error
          throw new Error(
            "Rate limit exceeded. Please wait a moment and try again."
          );
        }
      }

      // Don't retry on certain errors
      if (
        error.message?.includes("Invalid") ||
        error.message?.includes("Not found") ||
        error.message?.includes("403") ||
        error.message?.includes("Access forbidden")
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff for other errors
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Enhanced balance fetching with fallback, retry, and caching
export async function fetchBalanceWithFallback(
  publicKey: any,
  network: SolanaNetwork = "mainnet"
): Promise<number> {
  const cacheKey = `${publicKey.toString()}-${network}`;
  const now = Date.now();

  // Check cache first
  const cached = balanceCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.balance;
  }

  // If not cached or expired, fetch new balance
  const balance = await retryWithBackoff(async () => {
    const connection = await getConnectionWithFallback(network);
    return await connection.getBalance(publicKey);
  });

  // Cache the result
  balanceCache.set(cacheKey, { balance, timestamp: now });

  return balance;
}

// Clear balance cache (useful for manual refresh)
export function clearBalanceCache(publicKey?: any, network?: SolanaNetwork) {
  if (publicKey && network) {
    // Clear specific cache entry
    const cacheKey = `${publicKey.toString()}-${network}`;
    balanceCache.delete(cacheKey);
  } else {
    // Clear all cache
    balanceCache.clear();
  }
}
