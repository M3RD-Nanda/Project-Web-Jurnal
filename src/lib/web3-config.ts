import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  polygonAmoy,
} from "wagmi/chains";
import { createConfig, http } from "wagmi";
import {
  metaMask,
  walletConnect,
  coinbaseWallet,
  injected,
} from "wagmi/connectors";

// Define the chains we want to support
export const supportedChains = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  // Testnets for development
  sepolia,
  polygonAmoy,
] as const;

// Get project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Check if we have a valid project ID
const hasValidProjectId =
  projectId && projectId !== "demo-project-id" && projectId.length > 10;

if (!hasValidProjectId) {
  console.warn(
    "⚠️  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set or invalid. " +
      "Some wallet features may not work properly. " +
      "Please get a valid Project ID from https://cloud.walletconnect.com"
  );
}

// Configure wagmi with RainbowKit - only create on client side
let _wagmiConfig: any = null;

// Function to create custom connectors with proper wallet detection
function createCustomConnectors() {
  const connectors = [];

  // Always add MetaMask connector (will be filtered by detection later)
  connectors.push(
    metaMask({
      dappMetadata: {
        name: "JEBAKA - Crypto Wallet",
      },
    })
  );

  // Always add Coinbase Wallet connector (will be filtered by detection later)
  connectors.push(
    coinbaseWallet({
      appName: "JEBAKA - Crypto Wallet",
      appLogoUrl: undefined,
    })
  );

  // Add WalletConnect only if we have a valid project ID
  if (hasValidProjectId) {
    try {
      connectors.push(
        walletConnect({
          projectId: projectId!,
          metadata: {
            name: "JEBAKA - Crypto Wallet",
            description: "Connect your wallet to JEBAKA",
            url:
              typeof window !== "undefined"
                ? window.location.origin
                : "https://localhost:3000",
            icons: [],
          },
          showQrModal: true,
          qrModalOptions: {
            themeMode: "light",
            themeVariables: {
              "--wcm-z-index": "1000",
            },
          },
        })
      );
    } catch (error) {
      console.warn("Failed to initialize WalletConnect:", error);
    }
  }

  // Always add Brave Wallet connector (will be filtered by detection later)
  connectors.push(
    injected({
      target: {
        id: "brave",
        name: "Brave Wallet",
        provider:
          typeof window !== "undefined" ? (window as any).ethereum : undefined,
      },
    })
  );

  // Add generic injected connector for other wallets (Trust, etc.)
  if (typeof window !== "undefined" && (window as any).ethereum) {
    const ethereum = (window as any).ethereum;
    // Only add if it's not MetaMask, Coinbase, or Brave (to avoid duplicates)
    if (
      !ethereum.isMetaMask &&
      !ethereum.isCoinbaseWallet &&
      !ethereum.isBraveWallet
    ) {
      connectors.push(
        injected({
          target: {
            id: "injected",
            name: "Injected Wallet",
            provider: ethereum,
          },
        })
      );
    }
  }

  return connectors;
}

export function getWagmiConfig() {
  if (!_wagmiConfig) {
    try {
      // Suppress Lit dev mode warnings globally
      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "development"
      ) {
        // Set global flag to disable Lit dev mode
        (window as any).litDisableBundleWarning = true;

        // Suppress specific console warnings for Lit
        const originalWarn = console.warn;
        console.warn = (...args: any[]) => {
          const message = args.join(" ");
          if (
            message.includes("Lit is in dev mode") ||
            message.includes("lit.dev/msg/dev-mode") ||
            message.includes("Not recommended for production")
          ) {
            return; // Suppress Lit dev mode warnings
          }
          originalWarn.apply(console, args);
        };

        // Restore console.warn after initialization
        setTimeout(() => {
          console.warn = originalWarn;
        }, 2000);
      }

      // Create custom config with only relevant wallets
      const customConnectors = createCustomConnectors();

      if (customConnectors.length > 0) {
        // Create config with custom connectors
        _wagmiConfig = createConfig({
          chains: supportedChains,
          connectors: customConnectors,
          transports: {
            [mainnet.id]: http(),
            [polygon.id]: http(),
            [optimism.id]: http(),
            [arbitrum.id]: http(),
            [base.id]: http(),
            [sepolia.id]: http(),
            [polygonAmoy.id]: http(),
          },
          ssr: true,
          // Add error handling for connection issues
          multiInjectedProviderDiscovery: true,
        });
      } else {
        // Fallback to default config if no wallets detected

        _wagmiConfig = getDefaultConfig({
          appName: "JEBAKA - Crypto Wallet",
          projectId: hasValidProjectId
            ? projectId!
            : "00000000-0000-0000-0000-000000000000",
          chains: supportedChains,
          ssr: true,
        });
      }
    } catch (error) {
      console.error("Failed to create Wagmi config:", error);
      // Return null if config creation fails
      return null;
    }
  }

  return _wagmiConfig;
}

// Export the config for backward compatibility
export const wagmiConfig =
  typeof window !== "undefined" ? getWagmiConfig() : null;

// Chain configurations for display
export const chainConfigs = {
  [mainnet.id]: {
    name: "Ethereum",
    symbol: "ETH",
    icon: "⟠",
    color: "#627EEA",
    blockExplorer: "https://etherscan.io",
  },
  [polygon.id]: {
    name: "Polygon",
    symbol: "MATIC",
    icon: "⬟",
    color: "#8247E5",
    blockExplorer: "https://polygonscan.com",
  },
  [optimism.id]: {
    name: "Optimism",
    symbol: "ETH",
    icon: "🔴",
    color: "#FF0420",
    blockExplorer: "https://optimistic.etherscan.io",
  },
  [arbitrum.id]: {
    name: "Arbitrum",
    symbol: "ETH",
    icon: "🔵",
    color: "#28A0F0",
    blockExplorer: "https://arbiscan.io",
  },
  [base.id]: {
    name: "Base",
    symbol: "ETH",
    icon: "🔷",
    color: "#0052FF",
    blockExplorer: "https://basescan.org",
  },
  [sepolia.id]: {
    name: "Sepolia",
    symbol: "ETH",
    icon: "⚡",
    color: "#627EEA",
    blockExplorer: "https://sepolia.etherscan.io",
  },
  [polygonAmoy.id]: {
    name: "Amoy",
    symbol: "MATIC",
    icon: "🧪",
    color: "#8247E5",
    blockExplorer: "https://amoy.polygonscan.com",
  },
} as const;

// Utility function to get chain config
export function getChainConfig(chainId: number) {
  return chainConfigs[chainId as keyof typeof chainConfigs];
}

// Utility function to format address
export function formatAddress(address: string, length = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + length)}...${address.slice(-length)}`;
}

// Utility function to format balance
export function formatBalance(balance: string | number, decimals = 4): string {
  const num = typeof balance === "string" ? parseFloat(balance) : balance;
  if (isNaN(num)) return "0";

  if (num === 0) return "0";
  if (num < 0.0001) return "< 0.0001";

  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

// Contract addresses for common tokens (you can expand this)
export const tokenAddresses = {
  [mainnet.id]: {
    USDC: "0xA0b86a33E6441b8C4505B8C4505B8C4505B8C4505",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  [polygon.id]: {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  },
} as const;

// Publication fee configuration
export const publicationFees = {
  [mainnet.id]: {
    amount: "0.01", // 0.01 ETH
    token: "ETH",
  },
  [polygon.id]: {
    amount: "25", // 25 MATIC
    token: "MATIC",
  },
  [sepolia.id]: {
    amount: "0.001", // 0.001 ETH for testing
    token: "ETH",
  },
  [polygonAmoy.id]: {
    amount: "1", // 1 MATIC for testing
    token: "MATIC",
  },
} as const;
