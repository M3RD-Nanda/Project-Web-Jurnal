# Troubleshooting Guide

## 🔧 **Common Issues & Solutions**

This guide provides step-by-step solutions for common issues that may occur in the Website Jurnal project.

---

## 🚨 **BUILD ISSUES**

### **1. Webpack Build Error**
```
HookWebpackError: _webpack.WebpackError is not a constructor
```

**Cause**: Known bug in Next.js 15.3.4 minification plugin

**Solution**:
```typescript
// In next.config.ts
webpack: (config, { isServer, dev }) => {
  if (!dev && !isServer) {
    config.optimization.minimize = false;
    config.optimization.minimizer = [];
  }
}
```

**Verification**:
```bash
npm run build
# Should complete successfully
```

### **2. Syntax Errors**
```
SyntaxError: Invalid left-hand side in assignment
```

**Cause**: Invalid assignment to `process.env` in browser environment

**Solution**:
```typescript
// ❌ WRONG - Cannot assign to process.env in browser
process.env.SOME_VAR = "value";

// ✅ CORRECT - Use window properties
if (typeof window !== "undefined") {
  try {
    (window as any).SOME_VAR = "value";
  } catch (e) {
    // Ignore errors
  }
}
```

**Verification**:
```bash
npm run dev
# Should start without syntax errors
```

### **3. TypeScript Errors**
```
Type errors preventing build
```

**Solution**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix common issues
# - Missing imports
# - Type mismatches
# - Undefined variables
```

---

## 🗄️ **DATABASE ISSUES**

### **1. Connection Timeout**
```
Database connection freezing on first load
```

**Cause**: Network issues or slow connection

**Solution**:
```typescript
// Use retry logic from supabase-connection-fix.ts
import { getSessionWithRetry } from '@/lib/supabase-connection-fix';

const { session } = await getSessionWithRetry();
```

**Verification**:
```typescript
import { checkSupabaseConnection } from '@/lib/supabase-connection-fix';
const isHealthy = await checkSupabaseConnection();
console.log('Connection healthy:', isHealthy);
```

### **2. Authentication Issues**
```
User session not persisting
```

**Solution**:
```typescript
// Check SessionProvider configuration
// Verify Supabase client settings in src/integrations/supabase/client.ts

export const supabase = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
```

### **3. Environment Variables**
```
Supabase connection failing
```

**Check**:
```bash
# Verify .env.local contains:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

**Debug**:
```typescript
// In browser console
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...');
```

---

## 🖥️ **CONSOLE ISSUES**

### **1. Too Many Debug Messages**
```
Console flooded with debug logs
```

**Solution**:
```bash
# Run automated cleanup
node scripts/clean-console-logs.js

# Manual cleanup in specific files
# Remove console.log statements but keep console.error
```

### **2. Lit Dev Mode Warnings**
```
Lit is in dev mode. Not recommended for production!
```

**Solution**:
```bash
# Check .env.local contains:
LIT_DISABLE_DEV_MODE="true"
LIT_DISABLE_BUNDLED_WARNINGS="true"
```

**Verify in browser**:
```javascript
// Should be true
console.log(window.LIT_DISABLE_DEV_MODE);
```

### **3. CSS Preload Warnings**
```
Resource was preloaded but not used within a few seconds
```

**Solution**: Already configured in `next.config.ts` and CSS optimization files.

**Check**:
```typescript
// Verify webpack configuration in next.config.ts
config.optimization.splitChunks.cacheGroups.styles.chunks = "initial";
```

---

## 🔌 **WALLET ISSUES**

### **1. Wallet Connection Failures**
```
Wallet not connecting properly
```

**Debug**:
```typescript
// Check wallet detection
import { useEvmWallets } from '@/hooks/useEvmWallets';
const { wallets } = useEvmWallets();
console.log('Detected wallets:', wallets);
```

**Solution**:
```typescript
// Verify Web3Provider is properly configured
// Check src/components/Web3Provider.tsx
```

### **2. Wallet Icon Issues**
```
Wallet icons not displaying
```

**Check**:
```typescript
// Verify icon configuration in src/lib/wallet-config.ts
// Ensure icons are properly imported
```

---

## 🔄 **DEVELOPMENT WORKFLOW**

### **Daily Development Checklist**
```bash
# 1. Start development server
npm run dev

# 2. Check for console errors
# Open browser console and verify minimal warnings

# 3. Test database connection
# Navigate to pages requiring authentication

# 4. Verify wallet functionality
# Test wallet connection/disconnection
```

### **Before Committing Code**
```bash
# 1. Run build test
npm run build

# 2. Clean console logs
node scripts/clean-console-logs.js

# 3. Check TypeScript
npx tsc --noEmit

# 4. Test critical functionality
# - Authentication flow
# - Wallet connections
# - Database operations
```

### **Weekly Maintenance**
```bash
# 1. Update dependencies (carefully)
npm update

# 2. Run full test suite
npm run build && npm run dev

# 3. Check bundle sizes
npm run build
# Review bundle analysis output

# 4. Clean up console logs
node scripts/clean-console-logs.js
```

---

## 🚨 **EMERGENCY PROCEDURES**

### **If Build Completely Fails**
```bash
# 1. Clean everything
rm -rf .next node_modules
npm install

# 2. Check for syntax errors
npx tsc --noEmit

# 3. Verify configuration files
# - next.config.ts
# - .env.local
# - package.json

# 4. Try minimal build
npm run build:clean
```

### **If Database Stops Working**
```bash
# 1. Check Supabase status
# Visit Supabase dashboard

# 2. Verify environment variables
cat .env.local

# 3. Test connection manually
# Use browser console:
# await supabase.from('profiles').select('id').limit(1)

# 4. Check retry logic
# Verify src/lib/supabase-connection-fix.ts is imported
```

### **If Console is Completely Broken**
```bash
# 1. Revert recent changes
git log --oneline -10
git revert <commit-hash>

# 2. Clean console logs
node scripts/clean-console-logs.js

# 3. Check suppression patterns
# Review src/lib/suppress-warnings.ts

# 4. Restart development server
npm run dev
```

---

## 📞 **GETTING HELP**

### **Documentation Order**
1. **This Guide** - Common issues and quick fixes
2. **Quick Summary** - `docs/quick-fixes-summary.md`
3. **Comprehensive Guide** - `docs/comprehensive-fixes-documentation.md`
4. **Specific Issues** - `docs/webpack-error-fix.md`

### **Debug Information to Collect**
```bash
# System info
node --version
npm --version

# Project info
npm list next
npm list react

# Build info
npm run build 2>&1 | tee build.log

# Console info
# Screenshot of browser console errors
```

### **Common Commands Reference**
```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Test production build
npm run build:clean           # Clean build

# Debugging
node scripts/clean-console-logs.js  # Clean console
npx tsc --noEmit              # Check TypeScript
npm run lint                  # Check linting

# Maintenance
npm update                    # Update dependencies
npm audit                     # Security check
npm run analyze              # Bundle analysis
```

---

## ✅ **VERIFICATION CHECKLIST**

After fixing any issue, verify:

- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] Browser console shows minimal warnings
- [ ] Database connection works on first load
- [ ] Wallet functionality is intact
- [ ] All pages load correctly
- [ ] Authentication flow works
- [ ] No TypeScript errors

**If all checks pass, the issue is resolved!** ✅
