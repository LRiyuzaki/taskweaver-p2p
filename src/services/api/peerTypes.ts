
import { PeerStatus } from '@/types/p2p';

/**
 * Parameters for registering a peer
 */
export interface PeerRegisterParams {
  peer_id: string;
  name?: string;
  device_type?: string;
  status?: PeerStatus;
}

/**
 * Parameters for discovering peers
 */
export interface DiscoverPeersParams {
  peer_id?: string;
}

/**
 * Generic response type for peer discovery operations
 */
export interface PeerDiscoveryResponse<T = any> {
  data: T | null;
  error: Error | null;
}
