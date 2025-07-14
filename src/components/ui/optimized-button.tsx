"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";

interface OptimizedButtonProps extends ButtonProps {
  onClick?: () => void;
  debounceMs?: number;
}

// Optimized button component with debouncing to improve FID
export const OptimizedButton = memo(function OptimizedButton({
  onClick,
  debounceMs = 300,
  className,
  children,
  disabled,
  ...props
}: OptimizedButtonProps) {
  // Use useCallback to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    if (disabled || !onClick) return;
    
    // Simple debouncing to prevent rapid clicks
    const button = document.activeElement as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      setTimeout(() => {
        button.disabled = false;
      }, debounceMs);
    }
    
    // Use requestIdleCallback for better performance if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => onClick());
    } else {
      // Fallback to setTimeout
      setTimeout(() => onClick(), 0);
    }
  }, [onClick, disabled, debounceMs]);

  return (
    <Button
      {...props}
      className={cn(className)}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
});

// Optimized link button for navigation
export const OptimizedLinkButton = memo(function OptimizedLinkButton({
  href,
  children,
  className,
  ...props
}: ButtonProps & { href: string }) {
  return (
    <Button
      {...props}
      asChild
      className={cn(
        "transition-colors duration-200 hover:bg-primary/90",
        className
      )}
    >
      <a href={href} rel="noopener noreferrer">
        {children}
      </a>
    </Button>
  );
});
