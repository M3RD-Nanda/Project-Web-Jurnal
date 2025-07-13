"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error("Wallet Error Boundary caught an error:", error, errorInfo);

    // Check if it's a WalletConnect error
    if (
      error.message?.includes("Connection request reset") ||
      error.message?.includes("walletconnect") ||
      error.message?.includes("WalletConnect")
    ) {
      console.warn("WalletConnect error detected, this is usually recoverable");
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">
              Wallet connection temporarily unavailable.
            </p>
            <button
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Hook for handling wallet connection errors
export function useWalletErrorHandler() {
  const handleWalletError = (error: any, walletName: string) => {
    // Silently handle known WalletConnect errors
    if (error.message?.includes("Connection request reset")) {
      return {
        type: "connection_reset",
        message: "Connection was reset. Please try again.",
        shouldRetry: true,
      };
    }

    if (
      error.message?.includes("walletconnect") ||
      error.message?.includes("WalletConnect")
    ) {
      // Silently handle WalletConnect errors
      return {
        type: "walletconnect_error",
        message: "WalletConnect error occurred. Please try again.",
        shouldRetry: true,
      };
    }

    if (error.name === "UserRejectedRequestError") {
      return {
        type: "user_rejected",
        message: "Connection was cancelled by user.",
        shouldRetry: false,
      };
    }

    if (error.name === "ConnectorNotFoundError") {
      return {
        type: "not_installed",
        message: `${walletName} is not installed.`,
        shouldRetry: false,
      };
    }

    return {
      type: "unknown",
      message: "An unexpected error occurred.",
      shouldRetry: true,
    };
  };

  return { handleWalletError };
}
