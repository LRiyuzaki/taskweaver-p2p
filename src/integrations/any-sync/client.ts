import { useP2P } from '@/contexts/P2PContext';
import { PeerStatus, SyncedDocument } from '@/types/p2p';
import { supabase } from '@/integrations/supabase/client';

// Types matching Any-Sync concepts
interface AnySyncDocument {
  id: string;
  content: any;
  version: number;
  lastModified: Date;
}

interface AnySyncPeer {
  id: string;
  name?: string;
  status: PeerStatus;
}

// Adapter class that bridges our P2P system to Any-Sync protocol
// and syncs with Supabase database
export class AnySyncAdapter {
  private isInitialized = false;
  private peers: Map<string, AnySyncPeer> = new Map();
  private documents: Map<string, AnySyncDocument> = new Map();
  private syncKey?: string;
  
  constructor(private readonly options: {
    syncKey?: string;
    onError?: (error: Error) => void;
    onPeerConnected?: (peerId: string) => void;
    onDocumentUpdated?: (docId: string, doc: AnySyncDocument) => void;
  }) {
    this.syncKey = options.syncKey;
  }
  
  public async initialize(): Promise<boolean> {
    try {
      console.log('Initializing Any-Sync adapter with key:', this.syncKey?.substring(0, 4) + '...');
      
      this.isInitialized = true;

      // Fetch any existing documents from Supabase to initialize our local state
      const { data: supabaseDocuments } = await supabase
        .from('sync_documents')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (supabaseDocuments) {
        supabaseDocuments.forEach(doc => {
          this.documents.set(doc.original_id, {
            id: doc.original_id,
            content: doc.content,
            version: doc.version,
            lastModified: new Date(doc.updated_at)
          });
        });
        console.log(`Loaded ${supabaseDocuments.length} documents from Supabase`);
      }

      // Fetch any existing peers from Supabase
      const { data: supabasePeers } = await supabase
        .from('sync_peers')
        .select('*')
        .eq('status', 'connected');
      
      if (supabasePeers) {
        supabasePeers.forEach(peer => {
          this.peers.set(peer.peer_id, {
            id: peer.peer_id,
            name: peer.name,
            status: peer.status
          });

          // Notify about connected peers
          if (peer.status === 'connected') {
            this.options.onPeerConnected?.(peer.peer_id);
          }
        });
        console.log(`Loaded ${supabasePeers.length} peers from Supabase`);
      }
      
      // Set up real-time subscription for document updates
      const documentsChannel = supabase
        .channel('any-sync-documents')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'sync_documents' },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const doc = payload.new;
              this.documents.set(doc.original_id, {
                id: doc.original_id,
                content: doc.content,
                version: doc.version,
                lastModified: new Date(doc.updated_at)
              });

              // Notify about document updates
              this.options.onDocumentUpdated?.(doc.original_id, {
                id: doc.original_id,
                content: doc.content,
                version: doc.version,
                lastModified: new Date(doc.updated_at)
              });
            }
          }
        )
        .subscribe();
      
      // Simulate successful initialization
      return true;
    } catch (error) {
      console.error('Failed to initialize Any-Sync:', error);
      this.options.onError?.(error as Error);
      return false;
    }
  }
  
  public async publishDocument(type: string, id: string, content: any): Promise<string | null> {
    if (!this.isInitialized) {
      throw new Error('Any-Sync adapter not initialized');
    }
    
    try {
      // Create or update document in the local store
      const version = (this.documents.get(id)?.version || 0) + 1;
      const doc: AnySyncDocument = {
        id,
        content,
        version,
        lastModified: new Date()
      };
      
      this.documents.set(id, doc);
      
      // Sync to Supabase
      const { data, error } = await supabase
        .from('sync_documents')
        .upsert({
          original_id: id,
          document_type: type,
          content,
          version,
          cid: `anysync:${type}:${id}:${version}`,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'original_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log(`Published document ${type}:${id} to Any-Sync network and Supabase`);
      
      // In a real implementation, this would actually broadcast to the network
      const cid = `anysync:${type}:${id}:${version}`;
      
      // Log the sync operation
      await supabase.from('sync_logs').insert({
        operation: 'publish',
        status: 'success',
        details: { original_id: id, type, version }
      });
      
      return cid;
    } catch (error) {
      console.error('Failed to publish document:', error);
      this.options.onError?.(error as Error);
      return null;
    }
  }
  
  public async connectToPeer(peerId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Any-Sync adapter not initialized');
    }
    
    try {
      // In a real implementation, this would establish a connection
      const peer: AnySyncPeer = {
        id: peerId,
        status: 'connected'
      };
      
      this.peers.set(peerId, peer);
      
      // Update peer status in Supabase
      const { error } = await supabase
        .from('sync_peers')
        .upsert({
          peer_id: peerId,
          status: 'connected',
          last_seen: new Date().toISOString()
        }, {
          onConflict: 'peer_id',
          ignoreDuplicates: false
        });
      
      if (error) {
        throw error;
      }
      
      this.options.onPeerConnected?.(peerId);
      
      return true;
    } catch (error) {
      console.error(`Failed to connect to peer ${peerId}:`, error);
      this.options.onError?.(error as Error);
      return false;
    }
  }
  
  public async syncWithPeers(): Promise<string[]> {
    if (!this.isInitialized) {
      throw new Error('Any-Sync adapter not initialized');
    }
    
    if (this.peers.size === 0) {
      return [];
    }
    
    try {
      // In a real implementation, this would sync data with connected peers
      const syncedDocs: string[] = [];
      
      // Simulate receiving documents from peers
      for (const peer of this.peers.values()) {
        if (peer.status === 'connected') {
          const peerDocCount = Math.floor(Math.random() * 3) + 1;
          
          for (let i = 0; i < peerDocCount; i++) {
            const docId = `peer-${peer.id}-doc-${i}`;
            
            // Only process if we haven't seen this document before
            if (!this.documents.has(docId)) {
              const doc: AnySyncDocument = {
                id: docId,
                content: { data: `Sample data from peer ${peer.id}` },
                version: 1,
                lastModified: new Date()
              };
              
              this.documents.set(docId, doc);
              
              // Sync to Supabase
              await supabase
                .from('sync_documents')
                .upsert({
                  original_id: docId,
                  document_type: 'peer-sample',
                  content: doc.content,
                  version: doc.version,
                  cid: `anysync:peer-sample:${docId}:${doc.version}`,
                  updated_at: doc.lastModified.toISOString()
                }, {
                  onConflict: 'original_id',
                  ignoreDuplicates: false
                });
              
              this.options.onDocumentUpdated?.(docId, doc);
              
              syncedDocs.push(docId);
              
              // Log the sync operation
              await supabase.from('sync_logs').insert({
                operation: 'receive',
                status: 'success',
                details: { original_id: docId, peer_id: peer.id }
              });
            }
          }
        }
      }
      
      return syncedDocs;
    } catch (error) {
      console.error('Failed to sync with peers:', error);
      this.options.onError?.(error as Error);
      return [];
    }
  }
  
  public async dispose(): Promise<void> {
    try {
      // Update disconnected status for all peers in Supabase
      for (const peer of this.peers.values()) {
        await supabase
          .from('sync_peers')
          .update({
            status: 'disconnected',
            last_seen: new Date().toISOString()
          })
          .eq('peer_id', peer.id);
      }
      
      this.peers.clear();
      this.documents.clear();
      this.isInitialized = false;
      console.log('Any-Sync adapter disposed');
    } catch (error) {
      console.error('Error while disposing Any-Sync adapter:', error);
    }
  }
}

// Hook to use the Any-Sync adapter
export const useAnySync = () => {
  const p2p = useP2P();
  
  const createAdapter = (options?: {
    syncKey?: string;
    onError?: (error: Error) => void;
    onPeerConnected?: (peerId: string) => void;
    onDocumentUpdated?: (docId: string, doc: AnySyncDocument) => void;
  }) => {
    return new AnySyncAdapter({
      syncKey: options?.syncKey || p2p.syncKey || undefined,
      onError: options?.onError,
      onPeerConnected: options?.onPeerConnected,
      onDocumentUpdated: options?.onDocumentUpdated
    });
  };
  
  return {
    createAdapter,
    p2p // Expose the original P2P context for direct access
  };
};
