
import { supabase } from '@/integrations/supabase/client';
import { AnySyncNode, SyncProtocol } from '@/types/p2p';
import { PeerAuthStatus } from '@/types/p2p-auth';
import { toast } from '@/hooks/use-toast-extensions';

interface NodeConfig {
  syncProtocol: SyncProtocol;
  deviceId: string;
  deviceName?: string;
  useEncryption: boolean;
  syncIntervalMs: number;
}

interface SyncResult {
  success: boolean;
  documentsChanged: number;
  error?: string;
}

/**
 * Service for managing AnySyncNode operations
 */
export const anySyncNodeService = {
  /**
   * Initialize a new AnySyncNode
   * @param config Node configuration
   * @returns The initialized node or null if failed
   */
  async initializeNode(config: NodeConfig): Promise<AnySyncNode | null> {
    try {
      console.log(`Initializing AnySyncNode with protocol ${config.syncProtocol}`);
      
      // Register the node with the backend
      const { data, error } = await supabase.functions.invoke('any-sync-node', {
        body: {
          action: 'initialize',
          deviceId: config.deviceId,
          deviceName: config.deviceName,
          syncProtocol: config.syncProtocol,
          useEncryption: config.useEncryption
        }
      });
      
      if (error) throw new Error(`Failed to initialize node: ${error.message}`);
      
      // Log the node creation
      await supabase.from('sync_logs').insert({
        operation: 'node_initialize',
        status: 'success',
        details: {
          deviceId: config.deviceId,
          protocol: config.syncProtocol
        }
      });
      
      const node: AnySyncNode = {
        id: data.nodeId,
        status: 'online',
        deviceId: config.deviceId,
        capabilities: data.capabilities
      };
      
      toast.success(`AnySyncNode initialized successfully`);
      
      return node;
    } catch (error) {
      console.error('Error initializing AnySyncNode:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initialize AnySyncNode');
      return null;
    }
  },
  
  /**
   * Connect to another AnySyncNode
   * @param nodeId Local node ID
   * @param remotePeerId Remote peer ID to connect to
   * @param authStatus Authentication status for the connection
   * @returns Success status
   */
  async connectToNode(
    nodeId: string, 
    remotePeerId: string, 
    authStatus: PeerAuthStatus = PeerAuthStatus.UNAUTHENTICATED
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('any-sync-node', {
        body: {
          action: 'connect',
          nodeId,
          remotePeerId,
          authStatus
        }
      });
      
      if (error) throw new Error(`Failed to connect to node: ${error.message}`);
      
      if (data.success) {
        // Update the peer status in Supabase
        await supabase
          .from('sync_peers')
          .upsert({
            peer_id: remotePeerId,
            status: 'connected',
            last_seen: new Date().toISOString(),
            auth_status: authStatus
          }, {
            onConflict: 'peer_id'
          });
        
        toast.peerConnected(data.peerName || remotePeerId);
      }
      
      return data.success;
    } catch (error) {
      console.error(`Error connecting to node ${remotePeerId}:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to connect to peer ${remotePeerId}`);
      return false;
    }
  },
  
  /**
   * Synchronize documents with connected nodes
   * @param nodeId Local node ID
   * @returns Sync result
   */
  async syncDocuments(nodeId: string): Promise<SyncResult> {
    try {
      const { data, error } = await supabase.functions.invoke('any-sync-node', {
        body: {
          action: 'synchronize',
          nodeId
        }
      });
      
      if (error) throw new Error(`Failed to synchronize documents: ${error.message}`);
      
      if (data.success && data.documentsChanged > 0) {
        toast.syncComplete(data.documentsChanged);
      }
      
      return {
        success: data.success,
        documentsChanged: data.documentsChanged
      };
    } catch (error) {
      console.error('Error synchronizing documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to synchronize documents';
      
      toast.syncFailed(errorMessage);
      
      return {
        success: false,
        documentsChanged: 0,
        error: errorMessage
      };
    }
  },
  
  /**
   * Get the status of an AnySyncNode
   * @param nodeId Node ID
   * @returns Node status or null if not found
   */
  async getNodeStatus(nodeId: string): Promise<AnySyncNode | null> {
    try {
      const { data, error } = await supabase.functions.invoke('any-sync-node', {
        body: {
          action: 'status',
          nodeId
        }
      });
      
      if (error) throw new Error(`Failed to get node status: ${error.message}`);
      
      return data.node;
    } catch (error) {
      console.error('Error getting node status:', error);
      return null;
    }
  },
  
  /**
   * Shutdown an AnySyncNode
   * @param nodeId Node ID to shut down
   * @returns Success status
   */
  async shutdownNode(nodeId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('any-sync-node', {
        body: {
          action: 'shutdown',
          nodeId
        }
      });
      
      if (error) throw new Error(`Failed to shutdown node: ${error.message}`);
      
      // Log the shutdown
      await supabase.from('sync_logs').insert({
        operation: 'node_shutdown',
        status: 'success',
        details: { nodeId }
      });
      
      return data.success;
    } catch (error) {
      console.error('Error shutting down node:', error);
      
      // Log the failure
      await supabase.from('sync_logs').insert({
        operation: 'node_shutdown',
        status: 'error',
        details: { nodeId, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return false;
    }
  }
};
