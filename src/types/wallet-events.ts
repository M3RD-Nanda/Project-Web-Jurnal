/**
 * Standardized wallet event types for consistent communication
 * between header, dashboard, and other wallet components
 */

export interface WalletEventDetail {
  evmConnected: boolean;
  solanaConnected: boolean;
  evmAddress?: string | null;
  solanaPublicKey?: string | null;
  timestamp: number;
  walletType: "evm" | "solana" | "both" | "none";
  connected: boolean;
}

export interface WalletConnectedEvent extends CustomEvent {
  detail: WalletEventDetail;
}

/**
 * Helper function to create standardized wallet events
 */
export function createWalletEvent(detail: WalletEventDetail): WalletConnectedEvent {
  return new CustomEvent("walletConnected", {
    detail,
  }) as WalletConnectedEvent;
}

/**
 * Helper function to dispatch wallet events
 */
export function dispatchWalletEvent(detail: WalletEventDetail): void {
  window.dispatchEvent(createWalletEvent(detail));
}

/**
 * Helper function to calculate wallet type from connection states
 */
export function calculateWalletType(
  evmConnected: boolean,
  solanaConnected: boolean
): "evm" | "solana" | "both" | "none" {
  if (evmConnected && solanaConnected) return "both";
  if (evmConnected) return "evm";
  if (solanaConnected) return "solana";
  return "none";
}

/**
 * Helper function to create wallet event detail from current states
 */
export function createWalletEventDetail(
  evmConnected: boolean,
  solanaConnected: boolean,
  evmAddress?: string | null,
  solanaPublicKey?: string | null
): WalletEventDetail {
  const walletType = calculateWalletType(evmConnected, solanaConnected);
  const connected = evmConnected || solanaConnected;

  return {
    evmConnected,
    solanaConnected,
    evmAddress: evmAddress || null,
    solanaPublicKey: solanaPublicKey || null,
    timestamp: Date.now(),
    walletType,
    connected,
  };
}
