"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Specific skeleton components for better CLS prevention
export function ArticleCardSkeleton() {
  return (
    <div className="space-y-3 p-6 border rounded-lg">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function AnnouncementCardSkeleton() {
  return (
    <div className="space-y-3 p-6 border rounded-lg">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="h-64 bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
        <Skeleton className="h-10 w-32 mx-auto" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-64 bg-muted hidden md:block p-4 space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

export function FooterSkeleton() {
  return (
    <div className="h-16 bg-muted border-t flex items-center justify-center">
      <Skeleton className="h-4 w-48" />
    </div>
  );
}
