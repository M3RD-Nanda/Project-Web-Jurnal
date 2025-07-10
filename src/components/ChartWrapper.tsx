"use client";

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ChartWrapperProps {
  children: React.ReactNode;
  minHeight?: string; // Optional prop for minimum height
}

export function ChartWrapper({ children, minHeight = "300px" }: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true only after the component has mounted on the client side.
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder during SSR and initial client-side render before mounting
    return (
      <div style={{ height: minHeight }} className="flex items-center justify-center w-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="ml-2 text-sm text-muted-foreground">Memuat grafik...</p>
      </div>
    );
  }

  return <>{children}</>;
}