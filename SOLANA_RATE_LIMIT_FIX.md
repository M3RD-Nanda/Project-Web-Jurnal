# Solana Rate Limit Fix

## Problem

The wallet page was experiencing rate limiting errors (429) when trying to fetch Solana balance data:

```
Error: failed to get balance of account BV3CtcFPsXPYKmKMBuTNToc7VqykqYGq2EqBKT8pHKZb: Error: 429 : {"jsonrpc":"2.0","error":{"code":7429,"message":"Exceeded rate limit on method 'solana-mainnet.getBalance'"},"id":"0fa99ad9-8209-4149-8fbd-b33a1fa9f4ae"}
```

## Root Cause Analysis

1. **Multiple simultaneous requests**: Several components were calling `useSolanaBalance` hook simultaneously:

   - `SolanaWalletBalance` component
   - `SolanaWalletBalanceCompact` component
   - Wallet dashboard page
   - Transaction history page

2. **Inadequate rate limiting handling**: The retry logic was immediately throwing errors on 429 responses instead of implementing proper backoff strategies.

3. **No caching mechanism**: Each component was making independent API calls without sharing cached results.

4. **Rapid successive calls**: No debouncing mechanism to prevent rapid successive API calls.

## Solution Implemented

### 1. Enhanced Rate Limiting Handling (`src/lib/solana-connection.ts`)

**Improved Retry Logic:**

- Increased retry attempts from 2 to 3 for better reliability
- Implemented exponential backoff with base 3 for rate limiting errors
- Added specific handling for 429 errors with longer delays
- Base delay increased to 3000ms for rate limiting scenarios

**Rate Limit Specific Handling:**

```typescript
if (
  error.message?.includes("429") ||
  error.message?.includes("Too Many Requests") ||
  error.message?.includes("rate limit") ||
  error.message?.includes("Exceeded rate limit")
) {
  // For rate limiting, use much longer delays
  if (attempt < maxRetries) {
    const rateLimitDelay = baseDelay * Math.pow(3, attempt + 1);
    console.log(
      `Rate limited, waiting ${rateLimitDelay}ms before retry ${
        attempt + 1
      }/${maxRetries}`
    );
    await new Promise((resolve) => setTimeout(resolve, rateLimitDelay));
    continue;
  } else {
    throw new Error("Rate limit exceeded. Please wait a moment and try again.");
  }
}
```

### 2. Caching System

**Balance Cache Implementation:**

- Added 30-second cache for balance requests
- Prevents duplicate API calls for the same wallet/network combination
- Cache key format: `${publicKey.toString()}-${network}`

**Cache Management:**

```typescript
const balanceCache = new Map<string, { balance: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Check cache first
const cached = balanceCache.get(cacheKey);
if (cached && now - cached.timestamp < CACHE_DURATION) {
  return cached.balance;
}
```

**Cache Clearing Function:**

- `clearBalanceCache()` function for manual cache invalidation
- Used in refetch operations to force fresh data

### 3. Debouncing Mechanism (`src/hooks/useSolanaSafe.ts`)

**Debounced Balance Fetching:**

- Added 500ms debounce to prevent rapid successive calls
- Clears previous timers when new requests come in
- Proper cleanup in useEffect return function

```typescript
useEffect(() => {
  // Clear any existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (publicKey) {
    // Debounce the balance fetch to prevent rapid calls
    const timer = setTimeout(() => {
      fetchBalance();
    }, 500); // 500ms debounce

    setDebounceTimer(timer);
  }
  // ...
}, [publicKey, network, fetchBalance]);
```

### 4. Enhanced Error Handling

**User-Friendly Error Messages:**

- Specific error messages for different rate limiting scenarios
- Better error categorization and handling
- Reduced console spam in production

**Error Message Improvements:**

```typescript
if (
  err.message?.includes("429") ||
  err.message?.includes("Too Many Requests") ||
  err.message?.includes("rate limit") ||
  err.message?.includes("Exceeded rate limit") ||
  err.message?.includes("Rate limit exceeded")
) {
  setError("Rate limit exceeded. Please wait a moment and try again.");
}
```

### 5. Enhanced Refetch Function

**Smart Cache Clearing:**

- Refetch function now clears cache before fetching new data
- Ensures fresh data when user manually refreshes
- Maintains cache benefits for automatic updates

```typescript
const refetch = useCallback(() => {
  if (publicKey) {
    // Clear cache for this specific key to force fresh data
    clearBalanceCache(publicKey, network);
    fetchBalance();
  }
}, [publicKey, network, fetchBalance]);
```

## Configuration Details

### RPC Endpoint Configuration

The system is already configured to use the Syndica API with the user's preferred key:

```typescript
"https://solana-mainnet.api.syndica.io/api-key/YpXDWwMbnm6aw9m62PW8DT66yqW4bJLwzzqwsJGEmK7wnkH3ZU5BwuL6Qh61yYJFX1G5etrHjAdkEFWCd1MEbxWvVKQ6sZpnwe";
```

### Fallback Endpoints

Multiple fallback endpoints are configured:

1. Syndica API (primary)
2. Alchemy free tier
3. Ankr endpoint
4. Official Solana endpoint

## Testing Results

✅ **No more 429 rate limiting errors**
✅ **Transactions tab loads without errors**
✅ **Proper error handling and user feedback**
✅ **Reduced API calls through caching**
✅ **Improved user experience with debouncing**

## Benefits

1. **Reliability**: Better handling of rate limits with exponential backoff
2. **Performance**: Caching reduces unnecessary API calls
3. **User Experience**: Debouncing prevents UI lag and excessive requests
4. **Error Handling**: Clear, actionable error messages for users
5. **Resource Efficiency**: Reduced load on RPC endpoints

## Additional Fix: Infinite Re-render Issue

### Problem

After implementing the rate limiting fix, a new "Maximum update depth exceeded" error occurred due to infinite re-renders in the `useSolanaBalance` hook.

### Root Cause

The issue was caused by:

1. **Unstable dependencies**: `fetchBalance` function was included in useEffect dependencies
2. **State updates in useEffect**: `setDebounceTimer()` calls were causing re-renders
3. **Circular dependency**: useEffect → fetchBalance → re-render → useEffect (infinite loop)

### Solution Applied

**1. Replaced State with Ref for Timer:**

```typescript
// Before (problematic)
const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

// After (fixed)
const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
```

**2. Removed Unstable Dependencies:**

```typescript
// Before (caused infinite loop)
useEffect(() => {
  // ... timer logic
}, [publicKey, network, fetchBalance]); // fetchBalance caused re-renders

// After (stable)
useEffect(() => {
  // ... timer logic
}, [publicKey, network]); // Removed fetchBalance dependency
```

**3. Enhanced fetchBalance Function:**

```typescript
const fetchBalance = useCallback(
  async (forceRefresh = false) => {
    // ... existing logic
    if (forceRefresh) {
      clearBalanceCache(publicKey, network);
    }
    // ... rest of function
  },
  [publicKey, network]
);
```

**4. Improved Refetch Function:**

```typescript
const refetch = useCallback(() => {
  if (publicKey) {
    // Clear timer first
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Use forceRefresh parameter
    fetchBalance(true);
  }
}, [publicKey, fetchBalance]);
```

### Testing Results

✅ **No more "Maximum update depth exceeded" errors**
✅ **Stable useEffect dependencies**
✅ **Proper timer cleanup with refs**
✅ **Maintained rate limiting protection**
✅ **Preserved caching functionality**

## Future Considerations

1. **Cache Persistence**: Consider localStorage for cross-session caching
2. **Request Queuing**: Implement request queue for high-traffic scenarios
3. **Monitoring**: Add metrics for rate limiting and cache hit rates
4. **Dynamic Cache Duration**: Adjust cache duration based on network conditions
5. **Hook Optimization**: Consider further optimization of React hooks for better performance
