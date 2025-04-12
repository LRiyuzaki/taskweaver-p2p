
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PeerInfo {
  peer_id: string;
  name?: string;
  device_type?: string;
  ip_address?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with Deno runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, peer } = await req.json();

    // Get requester's IP address for logging
    const ip_address = req.headers.get('x-forwarded-for') || 'unknown';

    switch (action) {
      case 'register':
        if (!peer || !peer.peer_id) {
          return new Response(
            JSON.stringify({ error: 'Missing peer_id' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }

        // Register the peer
        const { data: registerData, error: registerError } = await supabase
          .from('sync_peers')
          .upsert({
            peer_id: peer.peer_id,
            name: peer.name,
            device_type: peer.device_type,
            status: 'connected',
            last_seen: new Date().toISOString()
          }, {
            onConflict: 'peer_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (registerError) {
          throw registerError;
        }

        // Log the connection
        await supabase.from('sync_logs').insert({
          operation: 'register',
          status: 'success',
          details: { peer_id: peer.peer_id, ip_address }
        });

        return new Response(
          JSON.stringify({ success: true, peer: registerData }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );

      case 'discover':
        // Get active peers except the requester's peer
        const { data: peers, error: discoverError } = await supabase
          .from('sync_peers')
          .select('*')
          .eq('status', 'connected')
          .neq('peer_id', peer?.peer_id || '');

        if (discoverError) {
          throw discoverError;
        }

        return new Response(
          JSON.stringify({ success: true, peers }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );

      case 'disconnect':
        if (!peer || !peer.peer_id) {
          return new Response(
            JSON.stringify({ error: 'Missing peer_id' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }

        // Update peer status to disconnected
        const { data: disconnectData, error: disconnectError } = await supabase
          .from('sync_peers')
          .update({
            status: 'disconnected',
            last_seen: new Date().toISOString()
          })
          .eq('peer_id', peer.peer_id);

        if (disconnectError) {
          throw disconnectError;
        }

        // Log the disconnection
        await supabase.from('sync_logs').insert({
          operation: 'disconnect',
          status: 'success',
          details: { peer_id: peer.peer_id, ip_address }
        });

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
    }
  } catch (error) {
    console.error('Error in peer-discovery function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
