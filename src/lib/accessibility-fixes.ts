/**
 * Accessibility fixes for form elements
 * This utility helps fix common accessibility issues like mismatched label for attributes
 */

/**
 * Fix label accessibility issues by ensuring all labels have corresponding form elements
 * @param container - The container element to search within (defaults to document)
 */
export function fixLabelAccessibility(
  container: Element | Document = document
) {
  // Find all labels with for attributes
  const labels = container.querySelectorAll("label[for]");

  labels.forEach((label) => {
    const forAttr = label.getAttribute("for");
    if (!forAttr) return;

    // Check if there's a corresponding input with this id
    const correspondingInput = container.querySelector(`#${forAttr}`);

    if (!correspondingInput) {
      // Try to find the input by other means
      let targetInput: Element | null = null;

      // Method 1: Check next sibling
      const nextSibling = label.nextElementSibling;
      if (nextSibling && isFormElement(nextSibling)) {
        targetInput = nextSibling;
      }

      // Method 2: Check within the same parent container
      if (!targetInput) {
        const parentContainer = label.closest("div, fieldset, form");
        if (parentContainer) {
          const inputInContainer = parentContainer.querySelector(
            'input, select, textarea, button[type="submit"]'
          );
          if (inputInContainer && inputInContainer !== label) {
            targetInput = inputInContainer;
          }
        }
      }

      // Method 3: Check previous sibling (sometimes input comes before label)
      if (!targetInput) {
        const prevSibling = label.previousElementSibling;
        if (prevSibling && isFormElement(prevSibling)) {
          targetInput = prevSibling;
        }
      }

      // Method 4: Check for inputs within the label itself (wrapped inputs)
      if (!targetInput) {
        const wrappedInput = label.querySelector("input, select, textarea");
        if (wrappedInput && isFormElement(wrappedInput)) {
          targetInput = wrappedInput;
        }
      }

      // If we found a target input, ensure it has an id and update the label
      if (targetInput) {
        if (!targetInput.id) {
          const uniqueId = generateUniqueId("form-element");
          targetInput.id = uniqueId;
        }
        label.setAttribute("for", targetInput.id);
      } else {
        // If no input found, remove the for attribute to avoid accessibility warnings
        console.warn(
          `Label with for="${forAttr}" has no matching form element. Removing for attribute.`
        );
        label.removeAttribute("for");
      }
    }
  });

  // Also ensure form elements without labels get proper accessibility attributes
  const formElements = container.querySelectorAll("input, select, textarea");
  formElements.forEach((element) => {
    if (!element.id) {
      element.id = generateUniqueId("form-element");
    }

    // Add aria-label if no associated label is found and no aria-label exists
    const associatedLabel = container.querySelector(
      `label[for="${element.id}"]`
    );
    if (
      !associatedLabel &&
      !element.getAttribute("aria-label") &&
      !element.getAttribute("aria-labelledby")
    ) {
      const placeholder = element.getAttribute("placeholder");
      const type = element.getAttribute("type");
      const name = element.getAttribute("name");

      if (placeholder) {
        element.setAttribute("aria-label", placeholder);
      } else if (type && type !== "hidden") {
        element.setAttribute("aria-label", formatTypeAsLabel(type));
      } else if (name) {
        element.setAttribute("aria-label", formatNameAsLabel(name));
      }
    }
  });
}

/**
 * Check if an element is a form element
 */
function isFormElement(element: Element): boolean {
  const formTags = ["INPUT", "SELECT", "TEXTAREA", "BUTTON"];
  return formTags.includes(element.tagName);
}

/**
 * Generate a unique ID for form elements
 */
function generateUniqueId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
}

/**
 * Format input type as a readable label
 */
function formatTypeAsLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    email: "Email Address",
    password: "Password",
    text: "Text Input",
    number: "Number Input",
    tel: "Phone Number",
    url: "Website URL",
    search: "Search",
    date: "Date",
    time: "Time",
    "datetime-local": "Date and Time",
    month: "Month",
    week: "Week",
    color: "Color Picker",
    range: "Range Slider",
    file: "File Upload",
    checkbox: "Checkbox",
    radio: "Radio Button",
    submit: "Submit Button",
    button: "Button",
    reset: "Reset Button",
  };

  return typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Format name attribute as a readable label
 */
function formatNameAsLabel(name: string): string {
  return name
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Fix ARIA attributes for dialog components
 */
export function fixDialogAccessibility() {
  // Find all dialog triggers that might be missing proper ARIA attributes
  const dialogTriggers = document.querySelectorAll(
    '[data-radix-collection-item], [role="button"]'
  );

  dialogTriggers.forEach((trigger) => {
    // Remove problematic aria-haspopup if it's set to "dialog" but element is not a menu
    const hasPopup = trigger.getAttribute("aria-haspopup");
    if (hasPopup === "dialog" && trigger.getAttribute("type") === "button") {
      trigger.removeAttribute("aria-haspopup");
    }

    // Fix aria-expanded for non-menu buttons
    const expanded = trigger.getAttribute("aria-expanded");
    if (
      expanded &&
      !trigger.closest('[role="menu"]') &&
      !trigger.closest('[role="menubar"]')
    ) {
      trigger.removeAttribute("aria-expanded");
    }

    // Fix aria-controls for buttons that don't actually control anything
    const controls = trigger.getAttribute("aria-controls");
    if (controls && !document.getElementById(controls)) {
      trigger.removeAttribute("aria-controls");
    }
  });

  // Fix DialogContent components that might be missing aria-describedby
  const dialogContents = document.querySelectorAll(
    "[data-radix-dialog-content]"
  );

  dialogContents.forEach((content) => {
    const ariaDescribedBy = content.getAttribute("aria-describedby");
    const hasDescription = content.querySelector(
      "[data-radix-dialog-description]"
    );

    // If no aria-describedby and no description element, remove the attribute entirely
    if (!ariaDescribedBy && !hasDescription) {
      content.removeAttribute("aria-describedby");
    }

    // If aria-describedby is empty or undefined, remove it
    if (ariaDescribedBy === "" || ariaDescribedBy === "undefined") {
      content.removeAttribute("aria-describedby");
    }
  });
}

/**
 * Fix missing labels and descriptions for interactive elements
 */
export function fixMissingLabels() {
  // Find buttons without accessible names
  const buttons = document.querySelectorAll(
    "button:not([aria-label]):not([aria-labelledby])"
  );

  buttons.forEach((button) => {
    const textContent = button.textContent?.trim();
    const hasIcon = button.querySelector("svg, .icon");

    // If button has only icon and no text, add aria-label
    if (hasIcon && !textContent) {
      const iconClass =
        button.querySelector("svg")?.getAttribute("class") || "";

      if (iconClass.includes("refresh") || iconClass.includes("reload")) {
        button.setAttribute("aria-label", "Refresh data");
      } else if (iconClass.includes("close") || iconClass.includes("x")) {
        button.setAttribute("aria-label", "Close");
      } else if (iconClass.includes("menu")) {
        button.setAttribute("aria-label", "Open menu");
      }
    }
  });
}

/**
 * Initialize accessibility fixes for the entire document
 * This should be called after the DOM is loaded
 */
export function initializeAccessibilityFixes() {
  // Run initial fixes
  fixLabelAccessibility();
  fixDialogAccessibility();
  fixMissingLabels();

  // Set up observer for dynamic content
  const observer = new MutationObserver((mutations) => {
    let shouldRunFix = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if the added node contains form elements, labels, or interactive elements
            if (
              element.matches(
                'label, input, select, textarea, form, button, [role="button"]'
              ) ||
              element.querySelector(
                'label, input, select, textarea, button, [role="button"]'
              )
            ) {
              shouldRunFix = true;
            }
          }
        });
      }
    });

    if (shouldRunFix) {
      // Debounce the fix to avoid running too frequently
      setTimeout(() => {
        fixLabelAccessibility();
        fixDialogAccessibility();
        fixMissingLabels();
      }, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}

/**
 * Fix accessibility issues for a specific third-party component
 * @param selector - CSS selector for the component container
 * @param retryCount - Number of times to retry if component is not found
 */
export function fixThirdPartyComponentAccessibility(
  selector: string,
  retryCount: number = 5
) {
  const attemptFix = (attempts: number) => {
    const container = document.querySelector(selector);
    if (container) {
      fixLabelAccessibility(container);
    } else if (attempts > 0) {
      setTimeout(() => attemptFix(attempts - 1), 200);
    }
  };

  attemptFix(retryCount);
}
