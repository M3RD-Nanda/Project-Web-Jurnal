/**
 * Centralized wallet icon configuration
 * This file contains all wallet icons and metadata in one place
 */

export interface WalletIconConfig {
  name: string;
  icon: string;
  displayName: string;
}

// High-quality base64 encoded wallet icons
export const WALLET_ICONS: Record<string, WalletIconConfig> = {
  metamask: {
    name: "MetaMask",
    displayName: "MetaMask",
    // IMPORTED from reference URL - exact MetaMask fox icon
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png",
  },
  brave: {
    name: "Brave Wallet",
    displayName: "Brave Wallet",
    // Official Brave Wallet icon from their CDN
    icon: "https://brave.com/static-assets/images/brave-logo-sans-text.svg",
  },
  coinbase: {
    name: "Coinbase Wallet",
    displayName: "Coinbase Wallet",
    // EXACT Coinbase icon from your reference - base64 data
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAATlBMVEVHcEz///////////////////////////////////////////////////8ARv8AUv+Sqv8APv8AT//G0/8gX/+9zP81av/X4P+svv+wwf/nROS8AAAADXRSTlMAGYUYYTLC60Ddh4YXY3rd4gAAAOZJREFUKJGNU9cCwyAINHu0gMas/v+PFkjMaBPbe0IOGScaE1A8ygqgKtPCfCJnIqDKT1TSqNcPw6RGk+1cLY55dMhw4yyn+sh5wo4UHZLf2YxN61ZKaWfZlSjZCEcnCNton5zTrQkZSwbHmaVnnoHUg7313vaoccQT8ezcJ4ZUAKEEcs+FSQFGuYg2aGAlthsBWlMCSGjX7wr1Oi9AySUnPF0EGKxg4qJsK+nhG3EymjbaUHs/SnorwktEuJaPFvkOwpPUopPw0SczyfVjP3+vSXzBttWcttVM/l1q/Q7p8h0e+3d4A9SUIzTJE1fEAAAAAElFTkSuQmCC",
  },
  walletconnect: {
    name: "WalletConnect",
    displayName: "WalletConnect",
    // Official WalletConnect icon from their CDN
    icon: "https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg",
  },
  rainbow: {
    name: "Rainbow",
    displayName: "Rainbow",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwIiB4Mj0iMzIiIHkxPSIwIiB5Mj0iMzIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjZmY0MDAwIi8+PHN0b3Agb2Zmc2V0PSIuMTciIHN0b3AtY29sb3I9IiNmZjgwMDAiLz48c3RvcCBvZmZzZXQ9Ii4zMyIgc3RvcC1jb2xvcj0iI2ZmZmYwMCIvPjxzdG9wIG9mZnNldD0iLjUiIHN0b3AtY29sb3I9IiMwMGZmMDAiLz48c3RvcCBvZmZzZXQ9Ii42NyIgc3RvcC1jb2xvcj0iIzAwZmZmZiIvPjxzdG9wIG9mZnNldD0iLjgzIiBzdG9wLWNvbG9yPSIjODAwMGZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmYwMGZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTE2IDMyYzguODM3IDAgMTYtNy4xNjMgMTYtMTZTMjQuODM3IDAgMTYgMCAwIDcuMTYzIDAgMTZzNy4xNjMgMTYgMTYgMTZaIiBmaWxsPSJ1cmwoI2EpIi8+PHBhdGggZD0iTTE2IDI0YzQuNDE4IDAgOC0zLjU4MiA4LThzLTMuNTgyLTgtOC04LTggMy41ODItOCA4IDMuNTgyIDggOCA4WiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  },
};

// Default fallback icon
export const DEFAULT_WALLET_ICON =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMzJjOC44MzcgMCAxNi03LjE2MyAxNi0xNlMyNC44MzcgMCAxNiAwIDAgNy4xNjMgMCAxNnM3LjE2MyAxNiAxNiAxNloiIGZpbGw9IiM2MzY2RjEiLz48cGF0aCBkPSJNMTYgMjRjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDhaIiBmaWxsPSIjZmZmIi8+PC9zdmc+";

/**
 * Get wallet icon and display name by wallet name
 */
export function getWalletConfig(walletName: string): WalletIconConfig {
  const name = walletName.toLowerCase();

  // Direct matches
  for (const [key, config] of Object.entries(WALLET_ICONS)) {
    if (name.includes(key)) {
      return config;
    }
  }

  // Special cases for common variations
  if (name.includes("metamask")) {
    return WALLET_ICONS.metamask;
  }

  if (name.includes("brave")) {
    return WALLET_ICONS.brave;
  }

  if (name.includes("coinbase")) {
    return WALLET_ICONS.coinbase;
  }

  if (name.includes("walletconnect") || name.includes("wallet connect")) {
    return WALLET_ICONS.walletconnect;
  }

  if (name.includes("rainbow")) {
    return WALLET_ICONS.rainbow;
  }

  // Fallback
  return {
    name: walletName,
    displayName: walletName,
    icon: DEFAULT_WALLET_ICON,
  };
}

/**
 * Get just the icon URL for a wallet
 */
export function getWalletIcon(walletName: string): string {
  return getWalletConfig(walletName).icon;
}

/**
 * Get just the display name for a wallet
 */
export function getWalletDisplayName(walletName: string): string {
  return getWalletConfig(walletName).displayName;
}
