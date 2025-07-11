# Web3 Crypto Wallet Integration

## Overview
This document describes the Web3 cryptocurrency wallet integration implemented in the Jurnal Website project. The integration allows users to connect their crypto wallets, manage balances, and make payments for journal services.

## Features Implemented

### ✅ Core Features
- **Wallet Connection**: Support for multiple wallet providers (MetaMask, WalletConnect, etc.)
- **Multi-chain Support**: Ethereum, Polygon, Optimism, Arbitrum, Base
- **User Profile Integration**: Link wallet addresses to user profiles
- **Balance Display**: Real-time wallet balance viewing
- **Payment System**: Send and receive cryptocurrency payments
- **Responsive UI**: Mobile-friendly wallet interface

### 🔧 Technical Stack
- **Wagmi v2**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum
- **RainbowKit**: Wallet connection UI
- **TanStack Query**: State management for Web3 data

## File Structure

```
src/
├── lib/
│   └── web3-config.ts          # Web3 configuration and utilities
├── components/
│   ├── Web3Provider.tsx        # Main Web3 provider wrapper
│   └── wallet/
│       ├── WalletButton.tsx    # Wallet connection button
│       ├── WalletBalance.tsx   # Balance display component
│       ├── WalletProfileIntegration.tsx  # Profile linking
│       └── PaymentForm.tsx     # Payment and receive forms
├── app/
│   └── wallet/
│       ├── page.tsx           # Main wallet dashboard
│       ├── send/page.tsx      # Send payment page
│       └── receive/page.tsx   # Receive payment page
└── migrations/
    └── add_wallet_address.sql  # Database migration
```

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Supported Networks
- **Ethereum Mainnet**: ETH payments
- **Polygon**: MATIC payments (lower fees)
- **Optimism**: ETH on L2
- **Arbitrum**: ETH on L2
- **Base**: ETH on Coinbase L2
- **Testnets**: Sepolia, Mumbai (for development)

## Database Schema

### Profiles Table Addition
```sql
ALTER TABLE profiles 
ADD COLUMN wallet_address TEXT;

-- Add constraint for wallet address format validation
ALTER TABLE profiles 
ADD CONSTRAINT chk_wallet_address_format 
CHECK (
  wallet_address IS NULL OR 
  (wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);
```

## Usage Guide

### For Users
1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Link to Profile**: Go to Profile page and link wallet address
3. **View Dashboard**: Access wallet features via "CRYPTO WALLET" in sidebar
4. **Send Payments**: Use the send payment form with recipient address
5. **Receive Payments**: Share your wallet address or QR code

### For Developers
```typescript
// Use wallet connection status
import { useAccount } from 'wagmi';
const { address, isConnected } = useAccount();

// Get wallet balance
import { useBalance } from 'wagmi';
const { data: balance } = useBalance({ address });

// Send transaction
import { useSendTransaction } from 'wagmi';
const { sendTransaction } = useSendTransaction();
```

## Security Considerations

### ✅ Implemented Security Measures
- **No Private Key Storage**: Only wallet addresses are stored
- **Address Validation**: Ethereum address format validation
- **User Consent**: Explicit wallet linking by user action
- **Transaction Confirmation**: Users must confirm all transactions
- **Network Validation**: Ensure correct network before transactions

### 🔒 Security Best Practices
- Never store private keys or seed phrases
- Always validate transaction details before sending
- Use HTTPS in production
- Implement rate limiting for API calls
- Regular security audits of smart contract interactions

### ⚠️ Known Limitations
- QR code generation not yet implemented
- Transaction history not yet implemented
- No automatic price conversion to USD
- Limited to basic ERC-20 token support

## Publication Fee Integration

### Supported Payment Methods
- **Ethereum**: 0.01 ETH
- **Polygon**: 25 MATIC
- **Testnets**: Reduced amounts for testing

### Future Enhancements
- Stable coin payments (USDC, USDT)
- Automatic fee calculation based on USD rates
- Payment confirmation system
- Invoice generation

## Troubleshooting

### Common Issues
1. **Wallet Not Connecting**: Ensure MetaMask or compatible wallet is installed
2. **Wrong Network**: Switch to supported network in wallet
3. **Transaction Fails**: Check sufficient balance and gas fees
4. **Profile Not Linking**: Ensure wallet is connected and user is logged in

### Development Issues
- **Build Warnings**: Some peer dependency warnings are expected with React 19
- **SSR Issues**: Web3 components are client-side only
- **IndexedDB Errors**: Normal in server-side rendering, resolved on client

## Testing Checklist

### Manual Testing
- [ ] Wallet connection/disconnection
- [ ] Network switching
- [ ] Balance display accuracy
- [ ] Profile wallet linking/unlinking
- [ ] Send payment functionality
- [ ] Receive payment address display
- [ ] Responsive design on mobile
- [ ] Error handling for invalid addresses

### Security Testing
- [ ] Address validation
- [ ] Transaction confirmation flow
- [ ] Network mismatch handling
- [ ] Insufficient balance handling
- [ ] SQL injection prevention (wallet address field)

## Deployment Notes

### Production Checklist
- [ ] Set proper WalletConnect Project ID
- [ ] Run database migration for wallet_address column
- [ ] Test on mainnet with small amounts
- [ ] Configure proper RLS policies in Supabase
- [ ] Set up monitoring for Web3 errors
- [ ] Document user guide for wallet connection

### Performance Considerations
- Web3 provider adds ~500KB to bundle size
- RainbowKit styles are loaded separately
- Consider lazy loading for wallet components
- Cache balance queries appropriately

## Support and Maintenance

### Regular Tasks
- Monitor Web3 library updates
- Check for security vulnerabilities
- Update supported networks as needed
- Review transaction fees and adjust publication fees

### User Support
- Provide clear wallet connection instructions
- Document supported wallets and networks
- Create troubleshooting guides
- Monitor user feedback for improvements
