
import { supabase } from '@/integrations/supabase/client';
import { 
  PeerRegisterParams, 
  DiscoverPeersParams, 
  PeerDiscoveryResponse,
  UpdatePeerStatusParams,
  DisconnectPeerParams,
  PeerData
} from './peerTypes';
import { toast } from '@/hooks/use-toast';

/**
 * Base URL for the peer discovery edge function
 */
const PEER_DISCOVERY_URL = 'https://wweihgiklnxetpqcpyyf.supabase.co/functions/v1/peer-discovery';

/**
 * Service for peer discovery operations
 */
export const peerDiscoveryService = {
  /**
   * Register a new peer with the network
   * @param params Peer registration parameters
   * @returns Response with registered peer data or error
   */
  async registerPeer(params: PeerRegisterParams): Promise<PeerDiscoveryResponse<PeerData>> {
    try {
      const response = await supabase.functions.invoke('peer-discovery', {
        body: {
          action: 'register',
          peer: params
        }
      });
      
      if (response.error) {
        throw new Error(`Registration failed: ${response.error.message}`);
      }
      
      return {
        data: response.data.peer,
        error: null,
        status: 'success'
      };
    } catch (error) {
      console.error('Error registering peer:', error);
      toast({
        variant: "destructive",
        title: "Peer Registration Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        status: 'error',
        message: 'Failed to register peer with the network'
      };
    }
  },

  /**
   * Discover peers in the network
   * @param params Parameters for peer discovery
   * @returns Response with list of discovered peers or error
   */
  async discoverPeers(params?: DiscoverPeersParams): Promise<PeerDiscoveryResponse<PeerData[]>> {
    try {
      const response = await supabase.functions.invoke('peer-discovery', {
        body: {
          action: 'discover',
          peer: params
        }
      });
      
      if (response.error) {
        throw new Error(`Discovery failed: ${response.error.message}`);
      }
      
      return {
        data: response.data.peers,
        error: null,
        status: 'success'
      };
    } catch (error) {
      console.error('Error discovering peers:', error);
      
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        status: 'error',
        message: 'Failed to discover peers in the network'
      };
    }
  },

  /**
   * Update the status of a peer
   * @param params Parameters for updating peer status
   * @returns Response with updated peer data or error
   */
  async updatePeerStatus(params: UpdatePeerStatusParams): Promise<PeerDiscoveryResponse<PeerData>> {
    try {
      const response = await supabase.functions.invoke('peer-discovery', {
        body: {
          action: 'update_status',
          peer: params
        }
      });
      
      if (response.error) {
        throw new Error(`Status update failed: ${response.error.message}`);
      }
      
      return {
        data: response.data.peer,
        error: null,
        status: 'success'
      };
    } catch (error) {
      console.error('Error updating peer status:', error);
      
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        status: 'error',
        message: 'Failed to update peer status'
      };
    }
  },

  /**
   * Disconnect a peer from the network
   * @param params Parameters for disconnecting a peer
   * @returns Response with operation result or error
   */
  async disconnectPeer(params: DisconnectPeerParams): Promise<PeerDiscoveryResponse<boolean>> {
    try {
      const response = await supabase.functions.invoke('peer-discovery', {
        body: {
          action: 'disconnect',
          peer: params
        }
      });
      
      if (response.error) {
        throw new Error(`Disconnect failed: ${response.error.message}`);
      }
      
      return {
        data: true,
        error: null,
        status: 'success'
      };
    } catch (error) {
      console.error('Error disconnecting peer:', error);
      
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        status: 'error',
        message: 'Failed to disconnect peer from the network'
      };
    }
  }
};
