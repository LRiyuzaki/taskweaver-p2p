
import { useCallback } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { Client } from '@/types/client';
import { Task } from '@/types/task';
import { SyncedDocument } from '@/types/p2p';
import { toast } from '@/hooks/use-toast';
import { useSupabaseSync } from './useSupabaseSync';

type EntityType = 'client' | 'task' | 'document' | 'service' | 'project';

/**
 * Hook for synchronizing data entities with P2P networks (IPFS or Any-Sync)
 * and Supabase database
 */
export const useIPFSSync = () => {
  const { publishData, ipfsNode, useAnySyncProtocol, anySyncAdapter } = useP2P();
  const { publishDocumentToSupabase } = useSupabaseSync();
  
  /**
   * Sync an entity to the P2P network (IPFS or Any-Sync)
   * and to Supabase database
   */
  const syncToIPFS = useCallback(async <T extends { id: string }>(
    entityType: EntityType,
    data: T
  ): Promise<SyncedDocument | null> => {
    if (!ipfsNode || ipfsNode.status !== 'online') {
      console.error('Cannot sync to P2P network: node is not online');
      return null;
    }
    
    try {
      // Use the appropriate sync protocol based on settings
      const protocol = useAnySyncProtocol ? 'Any-Sync' : 'IPFS';
      
      // Publish to the network
      const cid = await publishData(entityType, data);
      
      if (!cid) {
        throw new Error(`Failed to publish to ${protocol}`);
      }
      
      // Create sync record
      const syncedDoc: SyncedDocument = {
        id: data.id,
        cid,
        type: entityType,
        lastModified: new Date(),
        version: 1,
      };
      
      // Also sync to Supabase database
      await publishDocumentToSupabase(entityType, data, cid);
      
      console.log(`Entity ${entityType}:${data.id} synced with ${protocol} and Supabase, CID: ${cid}`);
      
      return syncedDoc;
    } catch (error) {
      console.error('Error syncing to P2P network:', error);
      
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: `Could not sync ${entityType} to the network.`
      });
      
      return null;
    }
  }, [ipfsNode, publishData, useAnySyncProtocol, publishDocumentToSupabase]);
  
  /**
   * Sync a client to the P2P network and Supabase
   */
  const syncClient = useCallback((client: Client): Promise<SyncedDocument | null> => {
    return syncToIPFS('client', client);
  }, [syncToIPFS]);
  
  /**
   * Sync a task to the P2P network and Supabase
   */
  const syncTask = useCallback((task: Task): Promise<SyncedDocument | null> => {
    return syncToIPFS('task', task);
  }, [syncToIPFS]);
  
  /**
   * Sync multiple entities to the P2P network and Supabase
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
