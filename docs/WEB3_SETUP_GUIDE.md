# Web3 Setup and Testing Guide

## Quick Start

### 1. Environment Setup
Add to your `.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo-project-id
```

For production, get a real project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).

### 2. Database Migration
Run the SQL migration to add wallet support:

```sql
-- Connect to your Supabase database and run:
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Add validation constraint
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS chk_wallet_address_format 
CHECK (
  wallet_address IS NULL OR 
  (wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address 
ON profiles(wallet_address) 
WHERE wallet_address IS NOT NULL;
```

### 3. Install Dependencies
Dependencies are already installed. If you need to reinstall:
```bash
pnpm add wagmi viem @rainbow-me/rainbowkit @tanstack/react-query
```

### 4. Start Development Server
```bash
pnpm dev
```

## Testing the Integration

### Prerequisites
- MetaMask or compatible wallet installed
- Some test ETH on Sepolia testnet (get from faucet)
- User account created on the website

### Test Scenarios

#### 1. Wallet Connection Test
1. Navigate to the website
2. Click "Connect Wallet" in the header
3. Select your wallet (MetaMask)
4. Approve connection
5. Verify wallet address appears in header

#### 2. Profile Integration Test
1. Login to your account
2. Go to Profile page
3. Scroll to "Wallet Integration" section
4. Connect wallet if not already connected
5. Click "Link Wallet to Profile"
6. Verify success message
7. Refresh page and confirm wallet is linked

#### 3. Wallet Dashboard Test
1. Click "CRYPTO WALLET" in sidebar
2. Verify dashboard loads with:
   - Wallet connection status
   - Balance display
   - Profile integration status
   - Quick action cards

#### 4. Send Payment Test
1. Go to wallet dashboard
2. Click "Send Payment" card
3. Enter test recipient address: `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6`
4. Enter small amount (0.001 ETH)
5. Click "Send Payment"
6. Confirm transaction in wallet
7. Verify transaction success

#### 5. Receive Payment Test
1. Go to wallet dashboard
2. Click "Receive Payment" card
3. Verify your wallet address is displayed
4. Test copy address functionality
5. Verify QR code placeholder is shown

### Network Testing

#### Testnet Testing (Recommended)
- **Sepolia**: Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
- **Mumbai**: Get test MATIC from [Mumbai Faucet](https://faucet.polygon.technology/)

#### Mainnet Testing (Use Small Amounts)
- Start with very small amounts (0.001 ETH)
- Test on less expensive networks (Polygon, Base)
- Verify all functionality before larger transactions

## Common Issues and Solutions

### Issue: Wallet Won't Connect
**Solutions:**
- Ensure MetaMask is installed and unlocked
- Try refreshing the page
- Clear browser cache
- Check if wallet is on supported network

### Issue: Transaction Fails
**Solutions:**
- Check sufficient balance for amount + gas fees
- Verify recipient address format
- Ensure correct network is selected
- Try increasing gas limit

### Issue: Profile Linking Fails
**Solutions:**
- Ensure user is logged in
- Verify wallet is connected
- Check database permissions
- Refresh page and try again

### Issue: Balance Not Showing
**Solutions:**
- Wait for network sync (can take 30 seconds)
- Switch networks and switch back
- Refresh the page
- Check if wallet is connected to correct network

## Development Tips

### Debugging Web3 Issues
```typescript
// Add to components for debugging
console.log('Wallet connected:', isConnected);
console.log('Address:', address);
console.log('Chain ID:', chainId);
console.log('Balance:', balance);
```

### Testing with Different Networks
```typescript
// Switch networks programmatically (for testing)
import { useSwitchChain } from 'wagmi';
const { switchChain } = useSwitchChain();

// Switch to Sepolia testnet
switchChain({ chainId: 11155111 });
```

### Mock Data for Development
```typescript
// Use mock data when wallet not connected
const mockAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
const mockBalance = { formatted: '1.234', symbol: 'ETH' };
```

## Security Testing

### Address Validation Test
```javascript
// Test valid addresses
const validAddresses = [
  '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  '0x0000000000000000000000000000000000000000'
];

// Test invalid addresses
const invalidAddresses = [
  '0x123', // too short
  'not-an-address',
  '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG' // invalid characters
];
```

### SQL Injection Test
```sql
-- Test wallet address field with malicious input
-- These should be rejected by validation:
INSERT INTO profiles (wallet_address) VALUES ('0x123; DROP TABLE profiles;');
INSERT INTO profiles (wallet_address) VALUES ('<script>alert("xss")</script>');
```

## Performance Testing

### Bundle Size Analysis
```bash
# Analyze bundle size impact
pnpm build
pnpm analyze # if you have bundle analyzer configured
```

### Load Testing
- Test wallet connection with multiple users
- Monitor memory usage during Web3 operations
- Check for memory leaks in long sessions

## Production Deployment

### Pre-deployment Checklist
- [ ] Set real WalletConnect Project ID
- [ ] Run database migration on production
- [ ] Test with mainnet using small amounts
- [ ] Configure proper error monitoring
- [ ] Set up user documentation
- [ ] Test mobile responsiveness
- [ ] Verify SSL certificate for Web3 security

### Monitoring Setup
```javascript
// Add error tracking for Web3 operations
try {
  await sendTransaction(config);
} catch (error) {
  console.error('Transaction failed:', error);
  // Send to error tracking service
  trackError('web3_transaction_failed', error);
}
```

## User Documentation

### For End Users
Create guides for:
- How to install MetaMask
- How to get testnet tokens
- How to connect wallet to the website
- How to link wallet to profile
- How to send/receive payments
- Troubleshooting common issues

### For Administrators
- How to monitor Web3 transactions
- How to update supported networks
- How to handle user support requests
- How to update publication fees

## Next Steps

### Planned Enhancements
1. **QR Code Generation**: For easier payment receiving
2. **Transaction History**: Display past transactions
3. **USD Price Display**: Show balance in USD
4. **Stable Coin Support**: USDC, USDT payments
5. **Payment Confirmation**: Automatic verification system
6. **Invoice Generation**: PDF receipts for payments

### Integration Opportunities
- Connect with journal submission system
- Automatic payment verification for publication fees
- Bulk payment processing for multiple authors
- Integration with accounting systems
