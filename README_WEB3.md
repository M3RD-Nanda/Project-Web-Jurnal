# 🚀 Web3 Crypto Wallet Integration

## 📋 Overview

This project now includes a complete Web3 cryptocurrency wallet integration, allowing users to:
- Connect their crypto wallets (MetaMask, WalletConnect, etc.)
- Link wallet addresses to their user profiles
- Send and receive cryptocurrency payments
- Pay publication fees with crypto
- View wallet balances and transaction history

## ✨ Features Implemented

### 🔗 Wallet Connection
- **Multi-wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Multi-chain Support**: Ethereum, Polygon, Optimism, Arbitrum, Base
- **Network Switching**: Automatic detection and switching between networks
- **Responsive UI**: Beautiful wallet connection interface with RainbowKit

### 👤 Profile Integration
- **Wallet Linking**: Connect wallet addresses to user profiles
- **Secure Storage**: Wallet addresses stored securely in Supabase
- **Easy Management**: Link/unlink wallets with one click
- **Validation**: Ethereum address format validation

### 💰 Payment System
- **Send Payments**: Transfer cryptocurrency to any wallet address
- **Receive Payments**: Share wallet address for receiving payments
- **Balance Display**: Real-time wallet balance viewing
- **Publication Fees**: Pay journal fees with cryptocurrency

### 🛡️ Security Features
- **No Private Keys**: Never stores or requests private keys
- **Address Validation**: Comprehensive input validation
- **Transaction Confirmation**: All transactions require user approval
- **Network Verification**: Ensures correct network before transactions

## 🛠️ Technical Stack

- **Wagmi v2**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum
- **RainbowKit**: Beautiful wallet connection UI
- **TanStack Query**: State management for Web3 data
- **Next.js 15**: Full-stack React framework
- **Supabase**: Database and authentication

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Add to .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. Database Migration
```sql
-- Run in Supabase SQL editor
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS chk_wallet_address_format 
CHECK (
  wallet_address IS NULL OR 
  (wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);
```

### 3. Start Development
```bash
pnpm dev
```

### 4. Test the Integration
1. Navigate to the website
2. Click "Connect Wallet" in the header
3. Connect your MetaMask wallet
4. Go to Profile page and link your wallet
5. Visit the Crypto Wallet dashboard

## 📱 User Guide

### For End Users

#### Connecting Your Wallet
1. Click "Connect Wallet" in the website header
2. Choose your wallet (MetaMask recommended)
3. Approve the connection in your wallet
4. Your wallet address will appear in the header

#### Linking to Your Profile
1. Login to your account
2. Go to the Profile page
3. Scroll to "Wallet Integration" section
4. Click "Link Wallet to Profile"
5. Your wallet is now connected to your account

#### Sending Payments
1. Go to "CRYPTO WALLET" in the sidebar
2. Click "Send Payment"
3. Enter recipient address and amount
4. Confirm the transaction in your wallet

#### Receiving Payments
1. Go to "CRYPTO WALLET" in the sidebar
2. Click "Receive Payment"
3. Copy your wallet address or share QR code

### For Developers

#### Using Web3 Hooks
```typescript
import { useAccount, useBalance } from 'wagmi';

function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  
  return (
    <div>
      {isConnected ? (
        <p>Balance: {balance?.formatted} {balance?.symbol}</p>
      ) : (
        <p>Please connect wallet</p>
      )}
    </div>
  );
}
```

#### Custom Wallet Components
```typescript
import { WalletButton } from '@/components/wallet/WalletButton';
import { WalletBalance } from '@/components/wallet/WalletBalance';

function MyPage() {
  return (
    <div>
      <WalletButton variant="outline" />
      <WalletBalance />
    </div>
  );
}
```

## 🔧 Configuration

### Supported Networks
- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **Optimism** (Chain ID: 10)
- **Arbitrum** (Chain ID: 42161)
- **Base** (Chain ID: 8453)
- **Sepolia Testnet** (Chain ID: 11155111)
- **Mumbai Testnet** (Chain ID: 80001)

### Publication Fees
- **Ethereum**: 0.01 ETH
- **Polygon**: 25 MATIC
- **Testnets**: Reduced amounts for testing

## 📁 File Structure

```
src/
├── lib/
│   └── web3-config.ts              # Web3 configuration
├── components/
│   ├── Web3Provider.tsx            # Main Web3 provider
│   └── wallet/
│       ├── WalletButton.tsx        # Connection button
│       ├── WalletBalance.tsx       # Balance display
│       ├── WalletProfileIntegration.tsx  # Profile linking
│       └── PaymentForm.tsx         # Payment forms
├── app/
│   └── wallet/
│       ├── page.tsx               # Dashboard
│       ├── send/page.tsx          # Send payments
│       └── receive/page.tsx       # Receive payments
└── docs/
    ├── WEB3_INTEGRATION.md        # Detailed documentation
    ├── WEB3_SETUP_GUIDE.md        # Setup instructions
    ├── SECURITY_REVIEW.md         # Security analysis
    └── TESTING_CHECKLIST.md       # Testing guide
```

## 🧪 Testing

### Manual Testing
```bash
# Start development server
pnpm dev

# Test with MetaMask on Sepolia testnet
# Get test ETH from: https://sepoliafaucet.com/
```

### Automated Testing
```bash
# Run tests (when implemented)
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 🛡️ Security

### Security Measures
- ✅ No private key storage
- ✅ Address format validation
- ✅ Transaction confirmation required
- ✅ Network verification
- ✅ SQL injection prevention
- ✅ Input sanitization

### Security Best Practices
- Never share private keys or seed phrases
- Always verify transaction details
- Use HTTPS in production
- Keep wallet software updated
- Use hardware wallets for large amounts

## 🚨 Troubleshooting

### Common Issues

#### Wallet Won't Connect
- Ensure MetaMask is installed and unlocked
- Try refreshing the page
- Check if wallet is on supported network

#### Transaction Fails
- Check sufficient balance for amount + gas fees
- Verify recipient address format
- Ensure correct network is selected

#### Balance Not Showing
- Wait for network sync (up to 30 seconds)
- Switch networks and switch back
- Refresh the page

## 📚 Documentation

- **[Web3 Integration Guide](docs/WEB3_INTEGRATION.md)**: Comprehensive technical documentation
- **[Setup Guide](docs/WEB3_SETUP_GUIDE.md)**: Step-by-step setup instructions
- **[Security Review](docs/SECURITY_REVIEW.md)**: Security analysis and best practices
- **[Testing Checklist](docs/TESTING_CHECKLIST.md)**: Complete testing procedures

## 🔮 Future Enhancements

### Planned Features
- **QR Code Generation**: For easier payment receiving
- **Transaction History**: Display past transactions
- **USD Price Display**: Show balance in USD
- **Stable Coin Support**: USDC, USDT payments
- **Payment Confirmation**: Automatic verification system
- **Invoice Generation**: PDF receipts for payments

### Integration Opportunities
- Journal submission payment integration
- Automatic publication fee verification
- Bulk payment processing
- Accounting system integration

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Run database migrations
5. Start development server: `pnpm dev`

### Code Standards
- Use TypeScript for all new code
- Follow existing code style
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help
- Check the documentation in the `docs/` folder
- Review the troubleshooting section
- Open an issue on GitHub
- Contact the development team

### Reporting Issues
Please include:
- Browser and wallet versions
- Network being used
- Steps to reproduce
- Error messages or screenshots

---

**🎉 Congratulations! Your website now supports Web3 cryptocurrency payments!**

Start by connecting your wallet and exploring the new crypto features. For technical details, see the documentation in the `docs/` folder.
