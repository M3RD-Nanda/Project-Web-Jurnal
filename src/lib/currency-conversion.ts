"use client";

/**
 * Currency conversion utilities for crypto to IDR
 */

// Mock SOL to IDR rate - in production, this should come from a real API
const MOCK_SOL_TO_IDR_RATE = 3200000; // ~$200 USD * 16000 IDR/USD

/**
 * Convert SOL amount to Indonesian Rupiah
 * @param solAmount - Amount in SOL
 * @param rate - Optional custom rate (defaults to mock rate)
 * @returns Amount in IDR
 */
export function solToIDR(solAmount: number, rate?: number): number {
  const conversionRate = rate || MOCK_SOL_TO_IDR_RATE;
  return solAmount * conversionRate;
}

/**
 * Format IDR amount with proper Indonesian currency formatting
 * @param amount - Amount in IDR
 * @returns Formatted string with Rp prefix
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format IDR amount with compact notation for large numbers
 * @param amount - Amount in IDR
 * @returns Formatted string with compact notation (e.g., Rp 1,2 jt)
 */
export function formatIDRCompact(amount: number): string {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)} M`;
  } else if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)} jt`;
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(1)} rb`;
  } else {
    return formatIDR(amount);
  }
}

/**
 * Get current SOL to IDR rate (mock implementation)
 * In production, this should fetch from a real API like CoinGecko
 */
export async function getCurrentSOLRate(): Promise<number> {
  // Mock implementation - replace with real API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API delay and slight rate variation
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const rate = MOCK_SOL_TO_IDR_RATE * (1 + variation);
      resolve(Math.round(rate));
    }, 500);
  });
}

/**
 * Convert lamports to SOL and then to IDR
 * @param lamports - Amount in lamports
 * @param rate - Optional custom rate
 * @returns Amount in IDR
 */
export function lamportsToIDR(lamports: number, rate?: number): number {
  const solAmount = lamports / 1000000000; // 1 SOL = 1,000,000,000 lamports
  return solToIDR(solAmount, rate);
}

/**
 * Format SOL amount with IDR equivalent
 * @param solAmount - Amount in SOL
 * @param rate - Optional custom rate
 * @returns Object with SOL and IDR formatted strings
 */
export function formatSOLWithIDR(solAmount: number, rate?: number) {
  const idrAmount = solToIDR(solAmount, rate);
  
  return {
    sol: `${solAmount.toFixed(4)} SOL`,
    idr: formatIDR(idrAmount),
    idrCompact: formatIDRCompact(idrAmount),
  };
}

/**
 * Hook for real-time SOL to IDR conversion
 * In production, this should use a real-time price feed
 */
export function useSOLToIDRRate() {
  // This is a simplified version - in production, use React Query or SWR
  // for real-time price updates
  return {
    rate: MOCK_SOL_TO_IDR_RATE,
    isLoading: false,
    error: null,
    lastUpdated: new Date(),
  };
}
