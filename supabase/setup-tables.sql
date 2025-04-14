
-- Table for synchronized nodes
CREATE TABLE IF NOT EXISTS public.sync_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  protocol TEXT NOT NULL DEFAULT 'any-sync',
  status TEXT NOT NULL DEFAULT 'offline',
  capabilities TEXT[] DEFAULT ARRAY['data-sync', 'peer-discovery']::TEXT[],
  use_encryption BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for team member devices
CREATE TABLE IF NOT EXISTS public.team_member_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL UNIQUE,
  device_name TEXT,
  device_type TEXT,
  public_key TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trusted BOOLEAN DEFAULT false
);

-- Table for peer-to-peer connections
CREATE TABLE IF NOT EXISTS public.sync_peer_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL REFERENCES public.sync_nodes(node_id) ON DELETE CASCADE,
  peer_id TEXT NOT NULL REFERENCES public.sync_peers(peer_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'connected',
  auth_status TEXT NOT NULL DEFAULT 'unauthenticated',
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (node_id, peer_id)
);

-- Add auth_status to existing sync_peers table
ALTER TABLE IF EXISTS public.sync_peers 
ADD COLUMN IF NOT EXISTS auth_status TEXT DEFAULT 'unauthenticated';

-- Add user_id to team_members for authentication linkage
ALTER TABLE IF EXISTS public.team_members 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add last_seen column to team_members
ALTER TABLE IF EXISTS public.team_members 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sync_peers_status ON public.sync_peers(status);
CREATE INDEX IF NOT EXISTS idx_sync_peers_last_seen ON public.sync_peers(last_seen);
CREATE INDEX IF NOT EXISTS idx_sync_nodes_status ON public.sync_nodes(status);
CREATE INDEX IF NOT EXISTS idx_team_member_devices_team_member_id ON public.team_member_devices(team_member_id);
CREATE INDEX IF NOT EXISTS idx_sync_peer_connections_node_id ON public.sync_peer_connections(node_id);
CREATE INDEX IF NOT EXISTS idx_sync_peer_connections_peer_id ON public.sync_peer_connections(peer_id);
CREATE INDEX IF NOT EXISTS idx_sync_documents_document_type ON public.sync_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_sync_documents_original_id ON public.sync_documents(original_id);
