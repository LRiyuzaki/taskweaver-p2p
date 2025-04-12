
import { supabase } from '@/integrations/supabase/client';

export interface PeerRegisterParams {
  peer_id: string;
  name?: string;
  device_type?: string;
}

export interface DiscoverPeersParams {
  peer_id?: string;
}

export const peerDiscoveryService = {
  async registerPeer(params: PeerRegisterParams): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('peer-discovery', {
        body: {
          action: 'register',
          peer: params
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
          peer: { peer_id }
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
