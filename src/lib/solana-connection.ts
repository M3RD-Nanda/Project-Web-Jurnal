import { Connection } from "@solana/web3.js";
import { solanaNetworks, SolanaNetwork } from "./solana-config";

// Connection pool for different networks
const connectionPool = new Map<string, Connection>();

// Create a connection with fallback support
export function createSolanaConnection(network: SolanaNetwork = 'mainnet'): Connection {
  const networkConfig = solanaNetworks[network];
  const cacheKey = `${network}-${networkConfig.endpoint}`;
  
  // Return cached connection if available
  if (connectionPool.has(cacheKey)) {
    return connectionPool.get(cacheKey)!;
  }

  // Create new connection
  const connection = new Connection(networkConfig.endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000, // 60 seconds
    disableRetryOnRateLimit: false,
  });

  // Cache the connection
  connectionPool.set(cacheKey, connection);
  
  return connection;
}

// Get connection with automatic fallback
export async function getConnectionWithFallback(network: SolanaNetwork = 'mainnet'): Promise<Connection> {
  const networkConfig = solanaNetworks[network];
  const endpoints = networkConfig.fallbackEndpoints || [networkConfig.endpoint];

  for (let i = 0; i < endpoints.length; i++) {
    try {
      const endpoint = endpoints[i];
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 30000,
        disableRetryOnRateLimit: false,
      });

      // Test the connection
      await connection.getVersion();
      
      console.log(`Successfully connected to Solana ${network} via ${endpoint}`);
      return connection;
    } catch (error) {
      console.warn(`Failed to connect to endpoint ${endpoints[i]}:`, error);
      
      // If this is the last endpoint, throw the error
      if (i === endpoints.length - 1) {
        throw new Error(`Failed to connect to any Solana ${network} endpoint`);
      }
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error(`No valid endpoints found for ${network}`);
}

// Retry function with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message?.includes('Invalid') || error.message?.includes('Not found')) {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Enhanced balance fetching with fallback and retry
export async function fetchBalanceWithFallback(
  publicKey: any,
  network: SolanaNetwork = 'mainnet'
): Promise<number> {
  return retryWithBackoff(async () => {
    const connection = await getConnectionWithFallback(network);
    return await connection.getBalance(publicKey);
  });
}
