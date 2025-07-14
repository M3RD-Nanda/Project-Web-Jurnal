// Type definitions for Solana wallet integration

interface SolanaWalletProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  signTransaction?(transaction: any): Promise<any>;
  signAllTransactions?(transactions: any[]): Promise<any[]>;
  signMessage?(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
}

declare global {
  interface Window {
    solana?: SolanaWalletProvider;
    phantom?: {
      solana?: SolanaWalletProvider;
    };
    solflare?: SolanaWalletProvider;
  }
}

export {};
