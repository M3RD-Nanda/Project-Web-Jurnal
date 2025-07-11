-- Migration: Create wallet_connections table for persistent wallet state
-- Date: 2025-01-10
-- Description: Store wallet connection state and preferences per user

-- Create wallet_connections table
CREATE TABLE IF NOT EXISTS wallet_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  wallet_type TEXT, -- 'metamask', 'walletconnect', etc.
  chain_id INTEGER, -- Current chain ID
  is_active BOOLEAN DEFAULT true,
  last_connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_wallet_address_format 
  CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  
  -- Unique constraint: one active wallet per user
  CONSTRAINT unique_active_wallet_per_user 
  UNIQUE (user_id, is_active) 
  DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id 
ON wallet_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_wallet_connections_wallet_address 
ON wallet_connections(wallet_address);

CREATE INDEX IF NOT EXISTS idx_wallet_connections_active 
ON wallet_connections(user_id, is_active) 
WHERE is_active = true;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_wallet_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_wallet_connections_updated_at
  BEFORE UPDATE ON wallet_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_connections_updated_at();

-- Enable RLS
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own wallet connections
CREATE POLICY "Users can view own wallet connections" 
ON wallet_connections FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own wallet connections
CREATE POLICY "Users can insert own wallet connections" 
ON wallet_connections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own wallet connections
CREATE POLICY "Users can update own wallet connections" 
ON wallet_connections FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own wallet connections
CREATE POLICY "Users can delete own wallet connections" 
ON wallet_connections FOR DELETE 
USING (auth.uid() = user_id);

-- Function to get active wallet for user
CREATE OR REPLACE FUNCTION get_active_wallet(user_uuid UUID)
RETURNS TABLE (
  wallet_address TEXT,
  wallet_type TEXT,
  chain_id INTEGER,
  last_connected_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wc.wallet_address,
    wc.wallet_type,
    wc.chain_id,
    wc.last_connected_at
  FROM wallet_connections wc
  WHERE wc.user_id = user_uuid 
    AND wc.is_active = true
  ORDER BY wc.last_connected_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set active wallet (deactivates others)
CREATE OR REPLACE FUNCTION set_active_wallet(
  user_uuid UUID,
  wallet_addr TEXT,
  wallet_type_param TEXT DEFAULT NULL,
  chain_id_param INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  connection_id UUID;
  existing_connection_id UUID;
BEGIN
  -- Deactivate all existing connections for this user
  UPDATE wallet_connections
  SET is_active = false, updated_at = NOW()
  WHERE user_id = user_uuid AND is_active = true;

  -- Check if this wallet address already exists for this user
  SELECT id INTO existing_connection_id
  FROM wallet_connections
  WHERE user_id = user_uuid AND wallet_address = wallet_addr;

  IF existing_connection_id IS NOT NULL THEN
    -- Update existing connection
    UPDATE wallet_connections
    SET
      is_active = true,
      wallet_type = COALESCE(wallet_type_param, wallet_type),
      chain_id = COALESCE(chain_id_param, chain_id),
      last_connected_at = NOW(),
      updated_at = NOW()
    WHERE id = existing_connection_id
    RETURNING id INTO connection_id;
  ELSE
    -- Insert new connection
    INSERT INTO wallet_connections (
      user_id,
      wallet_address,
      wallet_type,
      chain_id,
      is_active,
      last_connected_at
    ) VALUES (
      user_uuid,
      wallet_addr,
      wallet_type_param,
      chain_id_param,
      true,
      NOW()
    )
    RETURNING id INTO connection_id;
  END IF;

  RETURN connection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to disconnect wallet
CREATE OR REPLACE FUNCTION disconnect_wallet(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE wallet_connections 
  SET is_active = false, updated_at = NOW()
  WHERE user_id = user_uuid AND is_active = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON wallet_connections TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_wallet(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION set_active_wallet(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION disconnect_wallet(UUID) TO authenticated;
