
/**
 * Types for peer discovery API
 */

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
 * Parameters for updating peer status
 */
export interface UpdatePeerStatusParams {
  peer_id: string;
  status: PeerStatus;
}

/**
 * Parameters for disconnecting a peer
 */
export interface DisconnectPeerParams {
  peer_id: string;
}

/**
 * Peer data returned from the API
 */
export interface PeerData {
  id: string;
  peer_id: string;
  name?: string;
  device_type?: string;
  status: PeerStatus;
  last_seen: string;
}

/**
 * Generic response type for peer discovery operations
 */
export interface PeerDiscoveryResponse<T = any> {
  data: T | null;
  error: Error | null;
  status: 'success' | 'error';
  message?: string;
}
