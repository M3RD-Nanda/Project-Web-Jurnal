// Test script for Syndica API connection
import { Connection } from "@solana/web3.js";

const SYNDICA_ENDPOINT = "https://solana-mainnet.api.syndica.io/api-key/YpXDWwMbnm6aw9m62PW8DT66yqW4bJLwzzqwsJGEmK7wnkH3ZU5BwuL6Qh61yYJFX1G5etrHjAdkEFWCd1MEbxWvVKQ6sZpnwe";

export async function testSyndicaConnection(): Promise<boolean> {
  try {
    console.log("Testing Syndica API connection...");
    
    const connection = new Connection(SYNDICA_ENDPOINT, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 30000,
    });

    // Test basic connectivity
    const version = await connection.getVersion();
    console.log("✅ Syndica API connected successfully!");
    console.log("Solana version:", version);

    // Test getHealth
    const health = await connection.getHealth();
    console.log("✅ Health check passed:", health);

    // Test slot info
    const slot = await connection.getSlot();
    console.log("✅ Current slot:", slot);

    return true;
  } catch (error) {
    console.error("❌ Syndica API connection failed:", error);
    return false;
  }
}

// Test function for balance fetching
export async function testBalanceFetch(publicKeyString: string): Promise<number | null> {
  try {
    const connection = new Connection(SYNDICA_ENDPOINT, {
      commitment: 'confirmed',
    });

    // Convert string to PublicKey
    const { PublicKey } = await import("@solana/web3.js");
    const publicKey = new PublicKey(publicKeyString);

    const balance = await connection.getBalance(publicKey);
    console.log(`✅ Balance fetched successfully: ${balance} lamports`);
    
    return balance;
  } catch (error) {
    console.error("❌ Balance fetch failed:", error);
    return null;
  }
}

// Export the endpoint for use in other modules
export { SYNDICA_ENDPOINT };
