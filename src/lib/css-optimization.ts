// CSS optimization utilities to prevent unnecessary preloading
// This helps reduce preload warnings by optimizing CSS loading

export function optimizeCSSLoading() {
  if (typeof window === "undefined") {
    return;
  }

  // Prevent automatic CSS preloading for conditional components
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;

          // Check for preload links
          if (
            element.tagName === "LINK" &&
            element.getAttribute("rel") === "preload"
          ) {
            const href = element.getAttribute("href");

            // Remove preload for Web3/wallet related CSS that might not be used immediately
            if (
              href &&
              (href.includes("web3") ||
                href.includes("wallet") ||
                href.includes("solana") ||
                href.includes("rainbow") ||
                href.includes("rainbowkit") ||
                href.includes("wagmi") ||
                href.includes("@rainbow-me") ||
                href.includes("chunks/") ||
                href.includes("root-of-the-server") ||
                href.includes("%5Broot-of-the-server%5D") ||
                href.includes("[root-of-the-server]") ||
                href.includes("__cf301ea5") ||
                href.includes("_.css") ||
                href.includes("%5B") ||
                href.includes("%5D"))
            ) {
              // Convert preload to regular stylesheet loading
              element.setAttribute("rel", "stylesheet");
              element.removeAttribute("as");
              element.setAttribute("media", "print");
              element.setAttribute("onload", "this.media='all'");
            }
          }

          // Also check child elements
          const preloadLinks = element.querySelectorAll('link[rel="preload"]');
          preloadLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (
              href &&
              (href.includes("web3") ||
                href.includes("wallet") ||
                href.includes("solana") ||
                href.includes("rainbow") ||
                href.includes("rainbowkit") ||
                href.includes("wagmi") ||
                href.includes("@rainbow-me") ||
                href.includes("chunks/") ||
                href.includes("root-of-the-server") ||
                href.includes("%5Broot-of-the-server%5D") ||
                href.includes("[root-of-the-server]") ||
                href.includes("__cf301ea5") ||
                href.includes("_.css") ||
                href.includes("%5B") ||
                href.includes("%5D"))
            ) {
              link.setAttribute("rel", "stylesheet");
              link.removeAttribute("as");
              link.setAttribute("media", "print");
              link.setAttribute("onload", "this.media='all'");
            }
          });
        }
      });
    });
  });

  // Start observing
  observer.observe(document.head, {
    childList: true,
    subtree: true,
  });

  // Clean up after 10 seconds
  setTimeout(() => {
    observer.disconnect();
  }, 10000);
}

// Auto-initialize in all environments for better performance
if (typeof window !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", optimizeCSSLoading);
  } else {
    optimizeCSSLoading();
  }
}

// Additional CSS purging for unused styles
export function purgeUnusedCSS() {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  const walletPages = ["/wallet", "/wallet/send", "/wallet/receive"];
  const statsPages = ["/statistics", "/admin"];

  // Remove wallet-specific styles if not on wallet pages
  if (!walletPages.includes(currentPath)) {
    const walletStyles = document.querySelectorAll(
      'link[href*="rainbowkit"], link[href*="web3"], link[href*="wallet"]'
    );
    walletStyles.forEach((link) => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
  }

  // Remove chart-specific styles if not on stats pages
  if (!statsPages.includes(currentPath)) {
    const chartStyles = document.querySelectorAll(
      'link[href*="recharts"], link[href*="chart"]'
    );
    chartStyles.forEach((link) => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
  }
}

// Initialize CSS purging
if (typeof window !== "undefined") {
  // Run CSS purging after DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", purgeUnusedCSS);
  } else {
    purgeUnusedCSS();
  }
}
