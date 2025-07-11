// Basic Solana configuration without external dependencies
// This will be enhanced once Solana packages are properly installed

// Get reliable RPC endpoints with environment variable support
function getReliableEndpoints(
  network: "mainnet" | "devnet" | "testnet" = "mainnet"
) {
  const envKey = `NEXT_PUBLIC_SOLANA_${network.toUpperCase()}_RPC`;
  const customEndpoint =
    typeof window !== "undefined" ? process.env[envKey] : process.env[envKey];

  if (customEndpoint) {
    return [customEndpoint];
  }

  // Default reliable endpoints for each network
  switch (network) {
    case "mainnet":
      return [
        "https://solana-mainnet.api.syndica.io/api-key/YpXDWwMbnm6aw9m62PW8DT66yqW4bJLwzzqwsJGEmK7wnkH3ZU5BwuL6Qh61yYJFX1G5etrHjAdkEFWCd1MEbxWvVKQ6sZpnwe", // Syndica API with key
        "https://solana-mainnet.g.alchemy.com/v2/demo", // Alchemy free tier
        "https://rpc.ankr.com/solana", // Ankr endpoint
        "https://api.mainnet-beta.solana.com", // Official endpoint
      ];
    case "devnet":
      return [
        "https://api.devnet.solana.com",
        "https://rpc.ankr.com/solana_devnet",
      ];
    case "testnet":
      return [
        "https://api.testnet.solana.com",
        "https://rpc.ankr.com/solana_testnet",
      ];
    default:
      return ["https://api.mainnet-beta.solana.com"];
  }
}

// Solana network configurations
export const solanaNetworks = {
  mainnet: {
    name: "Mainnet Beta",
    endpoint: getReliableEndpoints("mainnet")[0], // Use most reliable endpoint
    fallbackEndpoints: getReliableEndpoints("mainnet"),
    symbol: "SOL",
    icon: "◎",
    color: "#9945FF",
    blockExplorer: "https://explorer.solana.com",
  },
  devnet: {
    name: "Devnet",
    endpoint: getReliableEndpoints("devnet")[0],
    fallbackEndpoints: getReliableEndpoints("devnet"),
    symbol: "SOL",
    icon: "◎",
    color: "#9945FF",
    blockExplorer: "https://explorer.solana.com",
  },
  testnet: {
    name: "Testnet",
    endpoint: getReliableEndpoints("testnet")[0],
    fallbackEndpoints: getReliableEndpoints("testnet"),
    symbol: "SOL",
    icon: "◎",
    color: "#9945FF",
    blockExplorer: "https://explorer.solana.com",
  },
} as const;

export type SolanaNetwork = keyof typeof solanaNetworks;

// Default network for production
export const defaultSolanaNetwork: SolanaNetwork = "mainnet";

// Get Solana connection (placeholder for now)
export function getSolanaConnection(
  network: SolanaNetwork = defaultSolanaNetwork
): any {
  // This will be implemented once @solana/web3.js is properly installed
  return {
    endpoint: solanaNetworks[network].endpoint,
    network: network,
  };
}

// Get network config
export function getSolanaNetworkConfig(network: SolanaNetwork) {
  return solanaNetworks[network];
}

// Format Solana address
export function formatSolanaAddress(address: string, length = 4): string {
  if (!address) return "";
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

// Validate Solana address (basic validation for now)
export function isValidSolanaAddress(address: string): boolean {
  // Basic validation - Solana addresses are base58 encoded and 32-44 characters
  if (!address || typeof address !== "string") return false;
  if (address.length < 32 || address.length > 44) return false;

  // Check if it contains only valid base58 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

// Convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / 1000000000; // 1 SOL = 1,000,000,000 lamports
}

// Convert SOL to lamports
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1000000000);
}

// Format SOL balance
export function formatSolBalance(lamports: number, decimals = 4): string {
  const sol = lamportsToSol(lamports);
  return sol.toFixed(decimals);
}

// Popular Solana wallet adapters
export const solanaWalletAdapters = [
  "phantom",
  "solflare",
  "sollet",
  "ledger",
  "torus",
  "slope",
  "coin98",
  "mathwallet",
] as const;

export type SolanaWalletAdapter = (typeof solanaWalletAdapters)[number];

// Solana wallet configuration for display
export const solanaWalletConfigs = {
  phantom: {
    name: "Phantom",
    icon: "👻",
    url: "https://phantom.app/",
  },
  solflare: {
    name: "Solflare",
    icon: "🔥",
    url: "https://solflare.com/",
  },
  sollet: {
    name: "Sollet",
    icon: "💼",
    url: "https://www.sollet.io/",
  },
  ledger: {
    name: "Ledger",
    icon: "🔒",
    url: "https://www.ledger.com/",
  },
  torus: {
    name: "Torus",
    icon: "🌐",
    url: "https://tor.us/",
  },
  slope: {
    name: "Slope",
    icon: "📈",
    url: "https://slope.finance/",
  },
  coin98: {
    name: "Coin98",
    icon: "🪙",
    url: "https://coin98.com/",
  },
  mathwallet: {
    name: "MathWallet",
    icon: "🧮",
    url: "https://mathwallet.org/",
  },
} as const;

// Get wallet config
export function getSolanaWalletConfig(adapter: SolanaWalletAdapter) {
  return solanaWalletConfigs[adapter];
}
