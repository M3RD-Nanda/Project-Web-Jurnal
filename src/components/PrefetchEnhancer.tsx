"use client";

import { useEffect } from "react";

/**
 * PrefetchEnhancer Component
 * Enhances existing navigation elements with prefetch capabilities
 * by adding data-href attributes to buttons that navigate
 */
export function PrefetchEnhancer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const enhanceNavigationElements = () => {
      // Find all buttons that are wrapped in Next.js Link components
      const linkWrappedButtons = document.querySelectorAll("a button, a [role='button']");
      
      linkWrappedButtons.forEach((button) => {
        const parentLink = button.closest("a");
        if (parentLink && parentLink.href && !button.getAttribute("data-href")) {
          button.setAttribute("data-href", parentLink.href);
          console.log(`✅ Enhanced button with data-href: ${parentLink.href}`);
        }
      });

      // Find buttons with specific navigation patterns (common in React apps)
      const navigationButtons = document.querySelectorAll("button, [role='button']");
      
      navigationButtons.forEach((button) => {
        const buttonElement = button as HTMLElement;
        
        // Skip if already has data-href
        if (buttonElement.getAttribute("data-href")) return;
        
        // Check for common navigation patterns in text content
        const buttonText = buttonElement.textContent?.toLowerCase() || "";
        const navigationKeywords = [
          "home", "about", "search", "current", "archives", 
          "announcements", "faq", "login", "register", "dashboard",
          "profile", "settings", "articles", "contact"
        ];
        
        const hasNavigationKeyword = navigationKeywords.some(keyword => 
          buttonText.includes(keyword)
        );
        
        if (hasNavigationKeyword) {
          // Try to infer the route from the button text
          let inferredRoute = "";
          
          if (buttonText.includes("home")) inferredRoute = "/";
          else if (buttonText.includes("about")) inferredRoute = "/about";
          else if (buttonText.includes("search")) inferredRoute = "/search";
          else if (buttonText.includes("current")) inferredRoute = "/current";
          else if (buttonText.includes("archives")) inferredRoute = "/archives";
          else if (buttonText.includes("announcements")) inferredRoute = "/announcements";
          else if (buttonText.includes("faq")) inferredRoute = "/faq";
          else if (buttonText.includes("login")) inferredRoute = "/login";
          else if (buttonText.includes("register")) inferredRoute = "/register";
          else if (buttonText.includes("dashboard")) inferredRoute = "/dashboard";
          else if (buttonText.includes("profile")) inferredRoute = "/profile";
          else if (buttonText.includes("settings")) inferredRoute = "/settings";
          else if (buttonText.includes("articles")) inferredRoute = "/articles";
          else if (buttonText.includes("contact")) inferredRoute = "/contact";
          
          if (inferredRoute) {
            buttonElement.setAttribute("data-href", inferredRoute);
            console.log(`✅ Enhanced navigation button with inferred route: ${inferredRoute}`);
          }
        }
        
        // Check for aria-label or title attributes that might indicate navigation
        const ariaLabel = buttonElement.getAttribute("aria-label")?.toLowerCase() || "";
        const title = buttonElement.getAttribute("title")?.toLowerCase() || "";
        
        if (ariaLabel || title) {
          const labelText = ariaLabel || title;
          const hasNavigationInLabel = navigationKeywords.some(keyword => 
            labelText.includes(keyword)
          );
          
          if (hasNavigationInLabel && !buttonElement.getAttribute("data-href")) {
            // Similar inference logic for aria-label/title
            let inferredRoute = "";
            
            if (labelText.includes("home")) inferredRoute = "/";
            else if (labelText.includes("about")) inferredRoute = "/about";
            else if (labelText.includes("search")) inferredRoute = "/search";
            else if (labelText.includes("current")) inferredRoute = "/current";
            else if (labelText.includes("archives")) inferredRoute = "/archives";
            else if (labelText.includes("announcements")) inferredRoute = "/announcements";
            else if (labelText.includes("faq")) inferredRoute = "/faq";
            
            if (inferredRoute) {
              buttonElement.setAttribute("data-href", inferredRoute);
              console.log(`✅ Enhanced button via aria-label/title: ${inferredRoute}`);
            }
          }
        }
      });
    };

    // Initial enhancement
    enhanceNavigationElements();

    // Re-enhance when new content is added
    const observer = new MutationObserver((mutations) => {
      let shouldReEnhance = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const hasButtons = element.querySelectorAll("button, [role='button']").length > 0;
            const hasLinks = element.querySelectorAll("a").length > 0;
            
            if (hasButtons || hasLinks) {
              shouldReEnhance = true;
            }
          }
        });
      });
      
      if (shouldReEnhance) {
        // Debounce re-enhancement to avoid excessive calls
        setTimeout(enhanceNavigationElements, 100);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
