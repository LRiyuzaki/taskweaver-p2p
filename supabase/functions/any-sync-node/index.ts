
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NodeRequest {
  action: string;
  nodeId?: string;
  deviceId?: string;
  deviceName?: string;
  syncProtocol?: string;
  useEncryption?: boolean;
  remotePeerId?: string;
  authStatus?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with Deno runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, nodeId, deviceId, deviceName, syncProtocol, useEncryption, remotePeerId, authStatus } = await req.json() as NodeRequest;

    // Get requester's IP address for logging
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';

    // Log the operation
    async function logOperation(operation: string, status: string, details: any) {
      try {
        await supabase.from('sync_logs').insert({
          operation,
          status,
          details: { ...details, ip_address: ipAddress }
        });
      } catch (error) {
        console.error('Error logging operation:', error);
      }
    }

    switch (action) {
      case 'initialize':
        if (!deviceId) {
          return new Response(
            JSON.stringify({ error: 'Missing deviceId' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Generate a unique node ID
        const nodeId = crypto.randomUUID();
        
        // Default capabilities based on protocol
        const capabilities = [
          'data-sync',
          'peer-discovery',
          useEncryption ? 'encryption' : null
        ].filter(Boolean);

        // Register the node
        const { data: nodeData, error: nodeError } = await supabase
          .from('sync_nodes')
          .insert({
            node_id: nodeId,
            device_id: deviceId,
            device_name: deviceName || `Device-${deviceId.substring(0, 6)}`,
            protocol: syncProtocol || 'any-sync',
            status: 'online',
            capabilities,
            use_encryption: useEncryption || false
          })
          .select()
          .single();

        if (nodeError) {
          throw nodeError;
        }

        // Log the operation
        await logOperation('node_initialize', 'success', { node_id: nodeId, device_id: deviceId });

        return new Response(
          JSON.stringify({ 
            success: true, 
            nodeId: nodeData.node_id,
            capabilities: nodeData.capabilities
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'connect':
        if (!nodeId || !remotePeerId) {
          return new Response(
            JSON.stringify({ error: 'Missing nodeId or remotePeerId' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Check if the node exists
        const { data: existingNode } = await supabase
          .from('sync_nodes')
          .select('node_id, device_name')
          .eq('node_id', nodeId)
          .single();

        if (!existingNode) {
          return new Response(
            JSON.stringify({ error: 'Node not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }

        // Check if the peer exists
        const { data: peerData } = await supabase
          .from('sync_peers')
          .select('peer_id, name')
          .eq('peer_id', remotePeerId)
          .single();

        let peerName = peerData?.name || `Peer-${remotePeerId.substring(0, 6)}`;

        // Register the connection
        const { data: connectionData, error: connectionError } = await supabase
          .from('sync_peer_connections')
          .insert({
            node_id: nodeId,
            peer_id: remotePeerId,
            auth_status: authStatus || 'unauthenticated',
            connected_at: new Date().toISOString()
          })
          .select()
          .single();

        if (connectionError) {
          throw connectionError;
        }

        // Update the peer's status
        await supabase
          .from('sync_peers')
          .upsert({
            peer_id: remotePeerId,
            status: 'connected',
            last_seen: new Date().toISOString(),
            auth_status: authStatus || 'unauthenticated'
          }, {
            onConflict: 'peer_id'
          });

        // Log the operation
        await logOperation('peer_connect', 'success', { 
          node_id: nodeId, 
          peer_id: remotePeerId,
          auth_status: authStatus 
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            connectionId: connectionData.id,
            peerName
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'synchronize':
        if (!nodeId) {
          return new Response(
            JSON.stringify({ error: 'Missing nodeId' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Get connected peers for this node
        const { data: connectedPeers } = await supabase
          .from('sync_peer_connections')
          .select('peer_id')
          .eq('node_id', nodeId)
          .eq('status', 'connected');

        // Get latest documents from each peer (simplified for simulation)
        // In a real implementation, this would involve complex document merging and conflict resolution
        const documentChanges = Math.floor(Math.random() * 5); // Simulate 0-4 document changes
        
        // Log the sync operation
        await logOperation('documents_sync', 'success', {
          node_id: nodeId,
          peers_count: connectedPeers?.length || 0,
          documents_changed: documentChanges
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            peersConnected: connectedPeers?.length || 0,
            documentsChanged: documentChanges
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'status':
        if (!nodeId) {
          return new Response(
            JSON.stringify({ error: 'Missing nodeId' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Get the node status
        const { data: nodeStatus, error: statusError } = await supabase
          .from('sync_nodes')
          .select('*')
          .eq('node_id', nodeId)
          .single();

        if (statusError) {
          throw statusError;
        }

        // Get connected peers count
        const { data: connectedPeersCount } = await supabase
          .from('sync_peer_connections')
          .select('id', { count: 'exact', head: true })
          .eq('node_id', nodeId)
          .eq('status', 'connected');

        return new Response(
          JSON.stringify({
            success: true,
            node: {
              id: nodeStatus.node_id,
              status: nodeStatus.status,
              deviceId: nodeStatus.device_id,
              capabilities: nodeStatus.capabilities,
              connectedPeers: connectedPeersCount || 0
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'shutdown':
        if (!nodeId) {
          return new Response(
            JSON.stringify({ error: 'Missing nodeId' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Update node status to offline
        const { error: shutdownError } = await supabase
          .from('sync_nodes')
          .update({
            status: 'offline',
            last_seen: new Date().toISOString()
          })
          .eq('node_id', nodeId);

        if (shutdownError) {
          throw shutdownError;
        }

        // Disconnect all peers
        await supabase
          .from('sync_peer_connections')
          .update({
            status: 'disconnected',
            disconnected_at: new Date().toISOString()
          })
          .eq('node_id', nodeId)
          .eq('status', 'connected');

        // Log the operation
        await logOperation('node_shutdown', 'success', { node_id: nodeId });

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in any-sync-node function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
