# Web3 Integration Testing Checklist

## Pre-Testing Setup

### Environment Preparation
- [ ] Development server running (`pnpm dev`)
- [ ] MetaMask or compatible wallet installed
- [ ] Test accounts with testnet tokens (Sepolia ETH, Mumbai MATIC)
- [ ] User account created on the website
- [ ] Database migration applied (wallet_address column)

### Test Data
- **Test Wallet Address**: `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6`
- **Test Networks**: Sepolia (11155111), Mumbai (80001)
- **Test Amounts**: 0.001 ETH, 1 MATIC

## Functional Testing

### 1. Wallet Connection Tests

#### 1.1 Initial Connection
- [ ] Navigate to website homepage
- [ ] Verify "Connect Wallet" button visible in header
- [ ] Click "Connect Wallet"
- [ ] Select MetaMask from wallet options
- [ ] Approve connection in MetaMask
- [ ] Verify wallet address appears in header
- [ ] Verify wallet status shows "Connected"

#### 1.2 Network Switching
- [ ] Connect wallet on Ethereum mainnet
- [ ] Switch to Sepolia testnet in MetaMask
- [ ] Verify website detects network change
- [ ] Verify chain indicator updates correctly
- [ ] Test with unsupported network
- [ ] Verify "Wrong network" warning appears

#### 1.3 Disconnection
- [ ] Click wallet address in header
- [ ] Select "Disconnect" option
- [ ] Verify wallet disconnects properly
- [ ] Verify UI returns to "Connect Wallet" state
- [ ] Verify no wallet data persists

### 2. Profile Integration Tests

#### 2.1 Wallet Linking
- [ ] Login to user account
- [ ] Navigate to Profile page
- [ ] Scroll to "Wallet Integration" section
- [ ] Connect wallet if not connected
- [ ] Click "Link Wallet to Profile"
- [ ] Verify success toast message
- [ ] Refresh page and verify wallet remains linked
- [ ] Check database for wallet_address entry

#### 2.2 Wallet Unlinking
- [ ] With wallet linked to profile
- [ ] Click "Unlink Wallet" button
- [ ] Confirm unlinking action
- [ ] Verify success message
- [ ] Verify wallet disconnects
- [ ] Verify database wallet_address set to null

#### 2.3 Multiple Wallet Handling
- [ ] Link wallet A to profile
- [ ] Disconnect and connect wallet B
- [ ] Verify warning about different wallet
- [ ] Test linking wallet B (should replace wallet A)
- [ ] Verify only one wallet linked per profile

### 3. Dashboard Tests

#### 3.1 Wallet Dashboard Access
- [ ] Click "CRYPTO WALLET" in sidebar
- [ ] Verify dashboard loads without errors
- [ ] Verify all sections render correctly:
  - [ ] Wallet connection status
  - [ ] Balance display
  - [ ] Profile integration status
  - [ ] Quick action cards

#### 3.2 Balance Display
- [ ] Connect wallet with test tokens
- [ ] Verify balance shows correctly
- [ ] Test balance hiding/showing toggle
- [ ] Switch networks and verify balance updates
- [ ] Test with zero balance wallet

#### 3.3 Quick Actions
- [ ] Verify "Send Payment" card is clickable
- [ ] Verify "Receive Payment" card is clickable
- [ ] Verify "Transaction History" card displays
- [ ] Test navigation to send/receive pages

### 4. Payment Tests

#### 4.1 Send Payment
- [ ] Navigate to wallet/send page
- [ ] Verify form loads correctly
- [ ] Enter valid recipient address
- [ ] Enter valid amount (0.001 ETH)
- [ ] Verify transaction summary appears
- [ ] Click "Send Payment"
- [ ] Confirm transaction in MetaMask
- [ ] Verify success message
- [ ] Check transaction on block explorer

#### 4.2 Send Payment Validation
- [ ] Test with invalid recipient address
- [ ] Verify error message appears
- [ ] Test with amount exceeding balance
- [ ] Verify insufficient funds warning
- [ ] Test with zero or negative amount
- [ ] Verify validation prevents submission

#### 4.3 Receive Payment
- [ ] Navigate to wallet/receive page
- [ ] Verify wallet address displays correctly
- [ ] Test "Copy Address" functionality
- [ ] Verify copy success message
- [ ] Verify QR code placeholder shows
- [ ] Test address format is correct

### 5. Error Handling Tests

#### 5.1 Network Errors
- [ ] Disconnect internet during wallet operation
- [ ] Verify appropriate error messages
- [ ] Test recovery when connection restored
- [ ] Test with very slow network

#### 5.2 Wallet Errors
- [ ] Lock MetaMask during operation
- [ ] Verify error handling
- [ ] Test with insufficient gas
- [ ] Test transaction rejection by user
- [ ] Test with wallet on wrong network

#### 5.3 Server Errors
- [ ] Test with database connection issues
- [ ] Test with invalid session
- [ ] Verify graceful error handling
- [ ] Test error message clarity

## Security Testing

### 6.1 Address Validation
- [ ] Test with valid Ethereum addresses
- [ ] Test with invalid address formats:
  - [ ] Too short: `0x123`
  - [ ] Invalid characters: `0xGGGG...`
  - [ ] Wrong format: `not-an-address`
- [ ] Verify all invalid addresses rejected

### 6.2 SQL Injection Prevention
- [ ] Test wallet address field with SQL injection attempts:
  - [ ] `0x123'; DROP TABLE profiles; --`
  - [ ] `<script>alert('xss')</script>`
- [ ] Verify all malicious inputs rejected
- [ ] Verify database remains intact

### 6.3 Authentication Tests
- [ ] Test wallet operations without login
- [ ] Verify authentication required messages
- [ ] Test session expiration during wallet operations
- [ ] Test with invalid session tokens

## Performance Testing

### 7.1 Load Testing
- [ ] Test wallet connection with multiple browser tabs
- [ ] Monitor memory usage during extended use
- [ ] Test rapid connect/disconnect cycles
- [ ] Monitor for memory leaks

### 7.2 Network Performance
- [ ] Test on slow network connections
- [ ] Measure wallet connection time
- [ ] Test balance loading performance
- [ ] Monitor API response times

## Mobile Testing

### 8.1 Mobile Wallet Integration
- [ ] Test with MetaMask mobile app
- [ ] Test WalletConnect on mobile
- [ ] Verify mobile-responsive design
- [ ] Test touch interactions

### 8.2 Mobile UI/UX
- [ ] Test wallet button sizing on mobile
- [ ] Verify forms are mobile-friendly
- [ ] Test navigation on small screens
- [ ] Verify text readability

## Browser Compatibility

### 9.1 Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 9.2 Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Firefox Mobile
- [ ] Samsung Internet

## Integration Testing

### 10.1 Supabase Integration
- [ ] Test profile updates with wallet address
- [ ] Verify RLS policies work correctly
- [ ] Test database constraints
- [ ] Verify data consistency

### 10.2 Authentication Integration
- [ ] Test wallet operations with different user roles
- [ ] Test admin vs regular user permissions
- [ ] Verify session management

## Regression Testing

### 11.1 Existing Functionality
- [ ] Verify login/logout still works
- [ ] Test profile editing (non-wallet fields)
- [ ] Verify navigation remains functional
- [ ] Test other website features

### 11.2 Performance Impact
- [ ] Measure page load times
- [ ] Check bundle size increase
- [ ] Monitor JavaScript errors
- [ ] Verify no conflicts with existing code

## Production Testing

### 12.1 Mainnet Testing (Use Small Amounts!)
- [ ] Test with real ETH (0.001 ETH max)
- [ ] Test on Polygon mainnet
- [ ] Verify gas fee calculations
- [ ] Test with real wallet addresses

### 12.2 Production Environment
- [ ] Test with production database
- [ ] Verify HTTPS connections
- [ ] Test with real WalletConnect Project ID
- [ ] Monitor error logs

## Test Results Documentation

### Pass/Fail Criteria
- All functional tests must pass
- No security vulnerabilities found
- Performance within acceptable limits
- Mobile compatibility verified
- No regression in existing features

### Bug Reporting Template
```
**Bug Title**: [Brief description]
**Severity**: Critical/High/Medium/Low
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**: 
**Actual Result**: 
**Browser/Wallet**: 
**Network**: 
**Screenshots**: [If applicable]
```

### Test Completion Sign-off
- [ ] All tests completed
- [ ] Critical bugs resolved
- [ ] Performance acceptable
- [ ] Security review passed
- [ ] Documentation updated
- [ ] Ready for production deployment

**Tester**: ________________
**Date**: ________________
**Version**: ________________
