/**
 * UUID validation utilities
 * Centralized UUID validation to prevent database errors with invalid IDs
 */

/**
 * Validate if a string is a valid UUID v4
 */
export function isValidUUID(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Sanitize and validate UUID, return null if invalid
 */
export function sanitizeUUID(id: string | null | undefined): string | null {
  if (!id) return null;
  
  const cleanId = id.trim();
  return isValidUUID(cleanId) ? cleanId : null;
}

/**
 * Check if an ID looks like a slug (non-UUID string)
 */
export function isSlugLikeId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  // Check if it contains only URL-safe characters (letters, numbers, hyphens, underscores)
  const slugRegex = /^[a-zA-Z0-9\-_]+$/;
  return slugRegex.test(id) && !isValidUUID(id);
}

/**
 * Log warning for invalid UUID attempts
 */
export function logInvalidUUIDAttempt(id: string, context: string): void {
  if (process.env.NODE_ENV === 'development') {
    
    if (isSlugLikeId(id)) {
    }
  }
}

/**
 * Validate UUID with context logging
 */
export function validateUUIDWithLogging(id: string, context: string): boolean {
  const isValid = isValidUUID(id);
  
  if (!isValid) {
    logInvalidUUIDAttempt(id, context);
  }
  
  return isValid;
}
