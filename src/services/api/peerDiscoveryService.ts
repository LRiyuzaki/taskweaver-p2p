
import { supabase } from '@/integrations/supabase/client';
import { PeerStatus } from '@/types/p2p';
import { PeerRegisterParams, DiscoverPeersParams, PeerDiscoveryResponse } from './peerTypes';

/**
 * Service for peer discovery operations
 * Handles communication with the Supabase functions API
 */
export const peerDiscoveryService = {
  /**
   * Register a new peer in the network
   * @param params Peer registration parameters
   * @returns Promise with the registration response
   */
  async registerPeer(params: PeerRegisterParams): Promise<PeerDiscoveryResponse> {
    try {
      // Default to connected status if not provided
      const peerData = {
        ...params,
        status: params.status || 'connected'
      };

      const { data, error } = await supabase.functions.invoke('peer-discovery', {
        body: {
          action: 'register',
          peer: peerData
        }
      });
      
      if (error) return { data: null, error: new Error(error.message) };
      return { data, error: null };
    } catch (error) {
      console.error('Error registering peer:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error during peer registration') 
      };
    }
  },
  
  /**
   * Discover peers in the network
   * @param params Optional discovery parameters
   * @returns Promise with discovered peers
   */
  async discoverPeers(params?: DiscoverPeersParams): Promise<PeerDiscoveryResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('peer-discovery', {
        body: {
          action: 'discover',
          peer: params
        }
      });
      
      if (error) return { data: null, error: new Error(error.message) };
      return { data, error: null };
    } catch (error) {
      console.error('Error discovering peers:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error during peer discovery')
      };
    }
  },
  
  /**
   * Disconnect a peer from the network
   * @param peer_id ID of the peer to disconnect
   * @returns Promise with the disconnection response
   */
  async disconnectPeer(peer_id: string): Promise<PeerDiscoveryResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('peer-discovery', {
        body: {
          action: 'disconnect',
          peer: { 
            peer_id,
            status: 'disconnected' as PeerStatus
          }
        }
      });
      
      if (error) return { data: null, error: new Error(error.message) };
      return { data, error: null };
    } catch (error) {
      console.error('Error disconnecting peer:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error during peer disconnection')
      };
    }
  }
};
