// Simple warning fixes for common development warnings
// This file addresses specific warnings without complex console overriding

// Fix for Lit dev mode warnings
if (typeof window !== "undefined") {
  // Set environment flags to disable Lit dev mode
  (window as any).litDisableBundleWarning = true;
  (window as any).LIT_DISABLE_DEV_MODE = true;
  (window as any).LIT_DISABLE_BUNDLED_WARNINGS = true;
  
  // Set process environment variables if available
  if (typeof process !== "undefined" && process.env) {
    process.env.LIT_DISABLE_DEV_MODE = "true";
    process.env.LIT_DISABLE_BUNDLED_WARNINGS = "true";
  }
}

// Fix for CSS preload warnings by improving resource loading
if (typeof window !== "undefined") {
  // Add event listener to handle resource loading
  window.addEventListener('load', () => {
    // Mark CSS resources as used to prevent preload warnings
    const preloadedLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
    preloadedLinks.forEach((link) => {
      const href = (link as HTMLLinkElement).href;
      if (href && href.includes('styles.css')) {
        // Create a style element to mark the CSS as used
        const style = document.createElement('style');
        style.textContent = `/* CSS preload marker for ${href} */`;
        document.head.appendChild(style);
      }
    });
  });
}

// Export empty object to make this a valid module
export {};
