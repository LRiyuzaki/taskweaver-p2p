
import { useCallback } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { Client } from '@/types/client';
import { Task } from '@/types/task';
import { SyncedDocument } from '@/types/p2p';
import { toast } from '@/hooks/use-toast';

type EntityType = 'client' | 'task' | 'document' | 'service' | 'project';

/**
 * Hook for synchronizing data entities with IPFS
 */
export const useIPFSSync = () => {
  const { publishData, ipfsNode } = useP2P();
  
  /**
   * Sync an entity to IPFS
   */
  const syncToIPFS = useCallback(async <T extends { id: string }>(
    entityType: EntityType,
    data: T
  ): Promise<SyncedDocument | null> => {
    if (!ipfsNode || ipfsNode.status !== 'online') {
      console.error('Cannot sync to IPFS: node is not online');
      return null;
    }
    
    try {
      // Publish to IPFS
      const cid = await publishData(entityType, data);
      
      if (!cid) {
        throw new Error('Failed to publish to IPFS');
      }
      
      // Create sync record
      const syncedDoc: SyncedDocument = {
        id: data.id,
        cid,
        type: entityType,
        lastModified: new Date(),
        version: 1,
      };
      
      // For a real implementation, we would store this sync record in a local database
      console.log(`Entity ${entityType}:${data.id} synced with CID ${cid}`);
      
      return syncedDoc;
    } catch (error) {
      console.error('Error syncing to IPFS:', error);
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: `Could not sync ${entityType} to the network.`
      });
      return null;
    }
  }, [ipfsNode, publishData]);
  
  /**
   * Sync a client to IPFS
   */
  const syncClient = useCallback((client: Client): Promise<SyncedDocument | null> => {
    return syncToIPFS('client', client);
  }, [syncToIPFS]);
  
  /**
   * Sync a task to IPFS
   */
  const syncTask = useCallback((task: Task): Promise<SyncedDocument | null> => {
    return syncToIPFS('task', task);
  }, [syncToIPFS]);
  
  /**
   * Sync multiple entities to IPFS
   */
  const syncMultiple = useCallback(async <T extends { id: string }>(
    entityType: EntityType,
    entities: T[]
  ): Promise<SyncedDocument[]> => {
    const results = await Promise.all(
      entities.map(entity => syncToIPFS(entityType, entity))
    );
    
    return results.filter((doc): doc is SyncedDocument => doc !== null);
  }, [syncToIPFS]);
  
  return {
    syncToIPFS,
    syncClient,
    syncTask,
    syncMultiple
  };
};
