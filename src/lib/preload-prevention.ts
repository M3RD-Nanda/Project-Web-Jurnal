// Preload prevention utilities
// This script prevents unnecessary CSS preloading that causes warnings

export function preventUnnecessaryPreloads() {
  if (typeof window === "undefined") {
    return;
  }

  // Override the native createElement to intercept link elements
  const originalCreateElement = document.createElement;

  document.createElement = function (
    tagName: string,
    options?: ElementCreationOptions
  ) {
    const element = originalCreateElement.call(this, tagName, options);

    if (tagName.toLowerCase() === "link") {
      // Monitor for preload links being added
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function (name: string, value: string) {
        if (name === "rel" && value === "preload") {
          const href = this.getAttribute("href") || "";

          // Check if this is a CSS file that might not be used immediately
          if (
            href.includes(".css") &&
            (href.includes("web3") ||
              href.includes("wallet") ||
              href.includes("solana") ||
              href.includes("rainbow") ||
              href.includes("rainbowkit") ||
              href.includes("wagmi") ||
              href.includes("@rainbow-me") ||
              href.includes("chunks/") ||
              href.includes("app/layout") ||
              href.includes("root-of-the-server") ||
              href.includes("%5Broot-of-the-server%5D") ||
              href.includes("[root-of-the-server]") ||
              href.includes("__cf301ea5") ||
              href.includes("_.css") ||
              href.includes("%5B") ||
              href.includes("%5D"))
          ) {
            // Convert to lazy loading instead of preload
            originalSetAttribute.call(this, "rel", "stylesheet");
            originalSetAttribute.call(this, "media", "print");
            this.onload = () => {
              (this as any).media = "all";
            };
            return;
          }
        }

        originalSetAttribute.call(this, name, value);
      };
    }

    return element;
  };

  // Also monitor existing preload links
  const checkExistingPreloads = () => {
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    preloadLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const as = link.getAttribute("as");

      if (as === "style" || href.includes(".css")) {
        if (
          href.includes("web3") ||
          href.includes("wallet") ||
          href.includes("solana") ||
          href.includes("rainbow") ||
          href.includes("rainbowkit") ||
          href.includes("wagmi") ||
          href.includes("@rainbow-me") ||
          href.includes("chunks/") ||
          href.includes("app/layout") ||
          href.includes("root-of-the-server") ||
          href.includes("%5Broot-of-the-server%5D") ||
          href.includes("[root-of-the-server]") ||
          href.includes("__cf301ea5") ||
          href.includes("_.css") ||
          href.includes("%5B") ||
          href.includes("%5D")
        ) {
          // Convert to lazy loading
          link.setAttribute("rel", "stylesheet");
          link.setAttribute("media", "print");
          link.removeAttribute("as");
          (link as HTMLLinkElement).onload = () => {
            (link as HTMLLinkElement).media = "all";
          };
        }
      }
    });
  };

  // Check immediately and after DOM changes
  checkExistingPreloads();

  // Use MutationObserver to catch dynamically added preload links
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === "LINK") {
              const href = element.getAttribute("href") || "";
              const rel = element.getAttribute("rel");
              const as = element.getAttribute("as");

              if (
                rel === "preload" &&
                (as === "style" || href.includes(".css"))
              ) {
                if (
                  href.includes("web3") ||
                  href.includes("wallet") ||
                  href.includes("solana") ||
                  href.includes("rainbow") ||
                  href.includes("rainbowkit") ||
                  href.includes("wagmi") ||
                  href.includes("@rainbow-me") ||
                  href.includes("chunks/") ||
                  href.includes("app/layout") ||
                  href.includes("root-of-the-server") ||
                  href.includes("%5Broot-of-the-server%5D") ||
                  href.includes("[root-of-the-server]") ||
                  href.includes("__cf301ea5") ||
                  href.includes("_.css") ||
                  href.includes("%5B") ||
                  href.includes("%5D")
                ) {
                  element.setAttribute("rel", "stylesheet");
                  element.setAttribute("media", "print");
                  element.removeAttribute("as");
                  (element as HTMLLinkElement).onload = () => {
                    (element as HTMLLinkElement).media = "all";
                  };
                }
              }
            }
          }
        });
      }
    });
  });

  observer.observe(document.head, {
    childList: true,
    subtree: true,
  });

  // Clean up after 15 seconds
  setTimeout(() => {
    observer.disconnect();
    document.createElement = originalCreateElement;
  }, 15000);
}

// Initialize early
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", preventUnnecessaryPreloads);
  } else {
    preventUnnecessaryPreloads();
  }
}
