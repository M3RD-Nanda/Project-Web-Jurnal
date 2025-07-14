"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface IntersectionObserverProps {
  children: ReactNode;
  onIntersect?: () => void;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  fallback?: ReactNode;
  className?: string;
}

/**
 * Intersection Observer component for lazy loading and performance optimization
 */
export function IntersectionObserver({
  children,
  onIntersect,
  threshold = 0.1,
  rootMargin = "50px",
  triggerOnce = true,
  fallback,
  className,
}: IntersectionObserverProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if Intersection Observer is supported
    if (!("IntersectionObserver" in window)) {
      // Fallback for older browsers
      setIsIntersecting(true);
      onIntersect?.();
      return;
    }

    const observer = new (window as any).IntersectionObserver(
      (entries: any) => {
        const [entry] = entries;
        const isCurrentlyIntersecting = entry.isIntersecting;

        setIsIntersecting(isCurrentlyIntersecting);

        if (isCurrentlyIntersecting && !hasTriggered) {
          onIntersect?.();
          setHasTriggered(true);

          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [onIntersect, threshold, rootMargin, triggerOnce, hasTriggered]);

  return (
    <div ref={elementRef} className={className}>
      {isIntersecting || hasTriggered ? children : fallback}
    </div>
  );
}

/**
 * Lazy loading wrapper for heavy components
 */
interface LazyComponentProps {
  children: ReactNode;
  height?: string | number;
  className?: string;
  placeholder?: ReactNode;
}

export function LazyComponent({
  children,
  height = "auto",
  className,
  placeholder,
}: LazyComponentProps) {
  const [shouldRender, setShouldRender] = useState(false);

  const defaultPlaceholder = (
    <div
      className="bg-muted animate-pulse rounded-lg flex items-center justify-center"
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <div className="text-muted-foreground text-sm">Loading...</div>
    </div>
  );

  return (
    <IntersectionObserver
      onIntersect={() => setShouldRender(true)}
      fallback={placeholder || defaultPlaceholder}
      className={className}
      threshold={0.1}
      rootMargin="100px"
    >
      {shouldRender ? children : placeholder || defaultPlaceholder}
    </IntersectionObserver>
  );
}

/**
 * Prefetch component for preloading resources on hover/focus
 */
interface PrefetchProps {
  href: string;
  children: ReactNode;
  prefetchOn?: "hover" | "focus" | "visible";
  as?: "document" | "script" | "style" | "image";
}

export function Prefetch({
  href,
  children,
  prefetchOn = "hover",
  as = "document",
}: PrefetchProps) {
  const [hasPrefetched, setHasPrefetched] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const prefetchResource = () => {
    if (hasPrefetched) return;

    // Use requestIdleCallback for better performance
    const prefetchFn = () => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      if (as !== "document") {
        link.as = as;
      }
      document.head.appendChild(link);
      setHasPrefetched(true);
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(prefetchFn);
    } else {
      setTimeout(prefetchFn, 0);
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (prefetchOn === "visible") {
      // Use Intersection Observer for visible prefetching
      const observer = new (window as any).IntersectionObserver(
        (entries: any) => {
          if (entries[0].isIntersecting) {
            prefetchResource();
            observer.unobserve(element);
          }
        },
        { rootMargin: "200px" }
      );

      observer.observe(element);
      return () => observer.unobserve(element);
    }

    // Add event listeners for hover/focus
    const events =
      prefetchOn === "hover"
        ? ["mouseenter", "touchstart"]
        : ["focus", "focusin"];

    const handlePrefetch = () => prefetchResource();

    events.forEach((event) => {
      element.addEventListener(event, handlePrefetch, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        element.removeEventListener(event, handlePrefetch);
      });
    };
  }, [href, prefetchOn, hasPrefetched]);

  return <div ref={elementRef}>{children}</div>;
}

/**
 * Progressive image loading with blur placeholder
 */
interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  blurDataURL?: string;
}

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className,
  blurDataURL,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const defaultBlurDataURL =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

  return (
    <IntersectionObserver
      onIntersect={() => setIsInView(true)}
      threshold={0.1}
      rootMargin="50px"
    >
      <div className={`relative overflow-hidden ${className}`}>
        {/* Blur placeholder */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
          style={{
            backgroundImage: `url(${blurDataURL || defaultBlurDataURL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(10px)",
            transform: "scale(1.1)",
          }}
        />

        {/* Actual image */}
        {isInView && (
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
          />
        )}
      </div>
    </IntersectionObserver>
  );
}
