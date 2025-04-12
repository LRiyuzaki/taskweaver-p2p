import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PeerStatus } from '@/types/p2p';
import { useP2P } from '@/contexts/P2PContext';
import { toast } from '@/hooks/use-toast';

export interface SupabaseSyncDocument {
  id: string;
  original_id: string;
  document_type: string;
  cid: string;
  content: any;
  version: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface SupabaseSyncPeer {
  id: string;
  peer_id: string;
  name?: string;
  last_seen: string;
  device_type?: string;
  status: PeerStatus;
}

export const useSupabaseSync = () => {
  const { ipfsNode, peers } = useP2P();
  const [loading, setLoading] = useState(false);
  const [syncedDocuments, setSyncedDocuments] = useState<SupabaseSyncDocument[]>([]);
  const [connectedPeers, setConnectedPeers] = useState<SupabaseSyncPeer[]>([]);

  // Fetch documents from Supabase
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sync_documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSyncedDocuments(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching synced documents:', error);
      toast({
        variant: "destructive",
        title: "Failed to fetch documents",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Publish a document to Supabase
  const publishDocumentToSupabase = useCallback(async <T extends { id: string }>(
    type: string,
    document: T,
    cid: string
  ): Promise<SupabaseSyncDocument | null> => {
    try {
      const documentData = {
        original_id: document.id,
        document_type: type,
        cid,
        content: document,
        version: 1,
        is_deleted: false
      };

      const { data, error } = await supabase
        .from('sync_documents')
        .insert(documentData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log the sync operation
      await supabase.from('sync_logs').insert({
        operation: 'publish',
        document_id: data.id,
        status: 'success',
        details: { original_id: document.id, type }
      });

      return data;
    } catch (error) {
      console.error('Error publishing document to Supabase:', error);
      toast({
        variant: "destructive",
        title: "Failed to publish document",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      return null;
    }
  }, []);

  // Update peer status in Supabase
  const updatePeerStatus = useCallback(async (peer_id: string, status: PeerStatus, name?: string, device_type?: string) => {
    try {
      // Check if peer exists
      const { data: existingPeer } = await supabase
        .from('sync_peers')
        .select('id, name, device_type')
        .eq('peer_id', peer_id)
        .maybeSingle();

      if (existingPeer) {
        // Update existing peer
        const { error } = await supabase
          .from('sync_peers')
          .update({
            status,
            last_seen: new Date().toISOString(),
            name: name || existingPeer.name,
            device_type: device_type || existingPeer.device_type
          })
          .eq('peer_id', peer_id);

        if (error) throw error;
      } else {
        // Insert new peer
        const { error } = await supabase
          .from('sync_peers')
          .insert({
            peer_id,
            status,
            name,
            device_type
          });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating peer status:', error);
      return false;
    }
  }, []);

  // Fetch peers from Supabase
  const fetchPeers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sync_peers')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) {
        throw error;
      }

      // Convert status string to PeerStatus type to ensure type safety
      const typedPeers = data?.map(peer => ({
        ...peer,
        status: (peer.status === 'connected' || peer.status === 'disconnected' || peer.status === 'connecting') 
          ? peer.status as PeerStatus 
          : 'disconnected' as PeerStatus
      })) || [];

      setConnectedPeers(typedPeers);
      return data;
    } catch (error) {
      console.error('Error fetching peers:', error);
      return [];
    }
  }, []);

  // Initialize real-time subscriptions
  useEffect(() => {
    // Initial fetch
    fetchDocuments();
    fetchPeers();

    // Set up real-time subscriptions
    const documentsChannel = supabase
      .channel('sync-documents-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sync_documents' },
        (payload) => {
          console.log('Real-time documents update:', payload);
          fetchDocuments();
        }
      )
      .subscribe();

    const peersChannel = supabase
      .channel('sync-peers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sync_peers' },
        (payload) => {
          console.log('Real-time peers update:', payload);
          fetchPeers();
        }
      )
      .subscribe();

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(documentsChannel);
      supabase.removeChannel(peersChannel);
    };
  }, [fetchDocuments, fetchPeers]);

  // Sync P2P peers to Supabase when they change
  useEffect(() => {
    peers.forEach((peer) => {
      if (peer.id) {
        updatePeerStatus(
          peer.id,
          peer.status as PeerStatus,
          peer.name,
          peer.deviceType
        );
      }
    });
  }, [peers, updatePeerStatus]);

  return {
    loading,
    syncedDocuments,
    connectedPeers,
    fetchDocuments,
    publishDocumentToSupabase,
    updatePeerStatus,
    fetchPeers
  };
};
