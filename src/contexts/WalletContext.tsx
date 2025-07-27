"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Interface for wallet state
export interface WalletState {
  evmConnected: boolean;
  solanaConnected: boolean;
  evmAddress?: string;
  solanaPublicKey?: string;
  portfolioValue: number;
  priceChange24h: number;
  lastUpdated: Date;
  isLoading: boolean;
}

// Interface for wallet context
interface WalletContextType {
  walletState: WalletState;
  updateWalletState: (updates: Partial<WalletState>) => void;
  refreshPortfolio: () => void;
  isAnyWalletConnected: boolean;
}

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    evmConnected: false,
    solanaConnected: false,
    portfolioValue: 0,
    priceChange24h: 0,
    lastUpdated: new Date(),
    isLoading: false,
  });

  // Update wallet state function
  const updateWalletState = (updates: Partial<WalletState>) => {
    setWalletState(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date(),
    }));
  };

  // Refresh portfolio data
  const refreshPortfolio = async () => {
    setWalletState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call delay
    setTimeout(() => {
      const mockPortfolioValue = Math.random() * 10000 + 1000;
      const mockPriceChange = (Math.random() - 0.5) * 20;
      
      setWalletState(prev => ({
        ...prev,
        portfolioValue: mockPortfolioValue,
        priceChange24h: mockPriceChange,
        lastUpdated: new Date(),
        isLoading: false,
      }));
    }, 1000);
  };

  // Listen for wallet connection events
  useEffect(() => {
    const handleWalletEvent = (event: CustomEvent) => {
      const { detail } = event;
      console.log('Global wallet event received:', detail);
      
      updateWalletState({
        evmConnected: detail.evmConnected,
        solanaConnected: detail.solanaConnected,
        evmAddress: detail.evmAddress,
        solanaPublicKey: detail.solanaPublicKey,
      });

      // Refresh portfolio if wallet connected
      if (detail.connected) {
        refreshPortfolio();
      } else {
        updateWalletState({
          portfolioValue: 0,
          priceChange24h: 0,
        });
      }
    };

    window.addEventListener('walletConnected', handleWalletEvent as EventListener);
    
    return () => {
      window.removeEventListener('walletConnected', handleWalletEvent as EventListener);
    };
  }, []);

  // Auto-refresh portfolio every 30 seconds when wallets are connected
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (walletState.evmConnected || walletState.solanaConnected) {
      interval = setInterval(() => {
        refreshPortfolio();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [walletState.evmConnected, walletState.solanaConnected]);

  const isAnyWalletConnected = walletState.evmConnected || walletState.solanaConnected;

  const value: WalletContextType = {
    walletState,
    updateWalletState,
    refreshPortfolio,
    isAnyWalletConnected,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook to use wallet context
export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}

// Export types
export type { WalletContextType };
