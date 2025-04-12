
import { supabase } from '@/integrations/supabase/client';
import { PeerStatus } from '@/types/p2p';

export interface PeerRegisterParams {
  peer_id: string;
  name?: string;
  device_type?: string;
  status?: PeerStatus;
}

export interface DiscoverPeersParams {
  peer_id?: string;
}

export const peerDiscoveryService = {
  async registerPeer(params: PeerRegisterParams): Promise<any> {
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
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error registering peer:', error);
      throw error;
    }
  },
  
  async discoverPeers(params?: DiscoverPeersParams): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('peer-discovery', {
        body: {
          action: 'discover',
          peer: params
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error discovering peers:', error);
      throw error;
    }
  },
  
  async disconnectPeer(peer_id: string): Promise<any> {
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
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error disconnecting peer:', error);
      throw error;
    }
  }
};
