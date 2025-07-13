
// Global warning suppression for production
if (typeof window !== 'undefined') {
  // Suppress Lit dev mode warnings
  window.litDisableBundleWarning = true;
  
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Patterns to suppress in production
  const suppressPatterns = [
    'Lit is in dev mode',
    'lit.dev/msg/dev-mode',
    'Not recommended for production',
    'Missing Description',
    'DescriptionWarning',
    'IndexedDB',
    'reactive-element.js'
  ];
  
  // Safely override console methods for production
  try {
    const warnDescriptor = Object.getOwnPropertyDescriptor(console, 'warn');
    const errorDescriptor = Object.getOwnPropertyDescriptor(console, 'error');

    if (!warnDescriptor || warnDescriptor.writable !== false) {
      console.warn = (...args) => {
        const message = args.join(' ');
        const shouldSuppress = suppressPatterns.some(pattern =>
          message.includes(pattern)
        );

        if (!shouldSuppress) {
          originalWarn.apply(console, args);
        }
      };
    }

    if (!errorDescriptor || errorDescriptor.writable !== false) {
      console.error = (...args) => {
        const message = args.join(' ');
        const shouldSuppress = suppressPatterns.some(pattern =>
          message.includes(pattern)
        );

        if (!shouldSuppress) {
          originalError.apply(console, args);
        }
      };
    }
  } catch (error) {
    // If console override fails, silently continue
  }
}
