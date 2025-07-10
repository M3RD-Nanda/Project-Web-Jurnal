-- Migration: Add wallet_address column to profiles table
-- Date: 2025-01-10
-- Description: Add support for storing crypto wallet addresses in user profiles

-- Add wallet_address column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Add comment to the column
COMMENT ON COLUMN profiles.wallet_address IS 'Ethereum-compatible wallet address for crypto payments';

-- Create index for wallet_address for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address 
ON profiles(wallet_address) 
WHERE wallet_address IS NOT NULL;

-- Add constraint to ensure wallet address format (optional - basic validation)
-- This ensures the wallet address starts with 0x and is 42 characters long
-- Note: PostgreSQL doesn't support IF NOT EXISTS for constraints in older versions
-- Use a different constraint name to avoid conflicts
ALTER TABLE profiles
ADD CONSTRAINT chk_profiles_wallet_address_format
CHECK (
  wallet_address IS NULL OR
  (wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Grant necessary permissions (adjust as needed based on your RLS policies)
-- This assumes you have RLS enabled and users can update their own profiles
-- No additional grants needed if using existing RLS policies
