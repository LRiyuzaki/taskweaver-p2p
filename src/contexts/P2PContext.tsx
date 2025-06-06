
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PeerInfo, SyncStatus, SyncOptions, IPFSNode, SyncedDocument } from '@/types/p2p';
import { toast } from '@/hooks/use-toast';
import { AnySyncAdapter } from '@/integrations/any-sync/client';

interface P2PContextType {
  // IPFS Node status
  ipfsNode: IPFSNode | null;
  initializeIPFS: () => Promise<void>;
  disconnectIPFS: () => Promise<void>;
  
  // Peer connections
  peers: PeerInfo[];
  connectToPeer: (peerId: string) => Promise<void>;
  disconnectFromPeer: (peerId: string) => Promise<void>;
  
  // Sync status
  syncStatus: SyncStatus;
  syncOptions: SyncOptions;
  updateSyncOptions: (options: Partial<SyncOptions>) => void;
  
  // Data operations
  syncData: () => Promise<void>;
  publishData: <T extends { id: string }>(type: string, data: T) => Promise<string | null>;
  subscribeToData: <T extends { id: string }>(type: string, callback: (data: T) => void) => () => void;
  
  // Local discovery
  startLocalDiscovery: () => Promise<void>;
  stopLocalDiscovery: () => Promise<void>;
  
  // Connection details
  syncKey: string | null;
  setSyncKey: (key: string | null) => void;
  generateSyncKey: () => string;
  
  // Any-Sync specific
  anySyncAdapter: AnySyncAdapter | null;
  initializeAnySync: () => Promise<boolean>;
  useAnySyncProtocol: boolean;
  setUseAnySyncProtocol: (use: boolean) => void;
}

const P2PContext = createContext<P2PContextType | undefined>(undefined);

export const useP2P = () => {
  const context = useContext(P2PContext);
  if (context === undefined) {
    throw new Error('useP2P must be used within a P2PProvider');
  }
  return context;
};

export const P2PProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for IPFS node
  const [ipfsNode, setIpfsNode] = useState<IPFSNode | null>(null);
  
  // State for peers
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  
  // State for sync status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    syncing: false,
    peersConnected: 0,
  });
  
  // State for sync options
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    autoSync: true,
    syncInterval: 30000, // 30 seconds
    syncOnlyOnWifi: false,
    syncOnlyOnLocalNetwork: false,
    syncEncryption: true,
  });
  
  // Sync key for secure connections
  const [syncKey, setSyncKey] = useState<string | null>(() => {
    return localStorage.getItem('p2p_sync_key');
  });

  // Any-Sync related state
  const [anySyncAdapter, setAnySyncAdapter] = useState<AnySyncAdapter | null>(null);
  const [useAnySyncProtocol, setUseAnySyncProtocol] = useState<boolean>(() => {
    return localStorage.getItem('use_any_sync') === 'true';
  });
  
  // Store sync key in localStorage when it changes
  useEffect(() => {
    if (syncKey) {
      localStorage.setItem('p2p_sync_key', syncKey);
    } else {
      localStorage.removeItem('p2p_sync_key');
    }
  }, [syncKey]);
  
  // Store Any-Sync protocol preference
  useEffect(() => {
    localStorage.setItem('use_any_sync', useAnySyncProtocol ? 'true' : 'false');
  }, [useAnySyncProtocol]);
  
  // Initialize Any-Sync adapter
  const initializeAnySync = async (): Promise<boolean> => {
    try {
      if (anySyncAdapter) {
        // Already initialized
        return true;
      }
      
      const adapter = new AnySyncAdapter({
        syncKey,
        onError: (error) => {
          console.error('Any-Sync error:', error);
          toast({
            variant: "destructive",
            title: "Sync Error",
            description: `Any-Sync error: ${error.message}`,
          });
        },
        onPeerConnected: (peerId) => {
          // Update our peers list when Any-Sync connects to peers
          const newPeer: PeerInfo = {
            id: peerId,
            name: `Any-Sync Peer ${peerId.substring(0, 6)}`,
            status: 'connected',
            lastSeen: new Date(),
            deviceType: 'Any-Sync Node',
          };
          
          setPeers(prev => {
            // Don't add duplicate peers
            if (prev.some(p => p.id === peerId)) {
              return prev.map(p => 
                p.id === peerId ? { ...p, status: 'connected', lastSeen: new Date() } : p
              );
            }
            return [...prev, newPeer];
          });
          
          setSyncStatus(prev => ({ ...prev, peersConnected: prev.peersConnected + 1 }));
        },
        onDocumentUpdated: (docId, doc) => {
          // Handle document updates from the network
          console.log(`Document updated: ${docId}`, doc);
        }
      });
      
      const success = await adapter.initialize();
      
      if (success) {
        setAnySyncAdapter(adapter);
        
        toast({
          title: "Any-Sync Initialized",
          description: "Local-first peer-to-peer sync is now enabled.",
        });
        
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Any-Sync Error",
          description: "Failed to initialize Any-Sync adapter.",
        });
        
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Any-Sync:', error);
      
      toast({
        variant: "destructive",
        title: "Any-Sync Error",
        description: "Failed to initialize the Any-Sync adapter.",
      });
      
      return false;
    }
  };
  
  // Initialize IPFS node
  const initializeIPFS = async (): Promise<void> => {
    try {
      // In a real implementation, this would initialize an IPFS node
      // For now, we'll simulate this with a timeout
      setIpfsNode({ id: 'simulated-ipfs-node', status: 'starting' });
      
      // Simulate startup time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIpfsNode({ id: 'simulated-ipfs-node', status: 'online', addresses: ['/ip4/127.0.0.1/tcp/5001'] });
      
      // If we're using Any-Sync, initialize it too
      if (useAnySyncProtocol) {
        await initializeAnySync();
      }
      
      toast({
        title: "IPFS Node Started",
        description: "P2P synchronization is now enabled.",
      });
    } catch (error) {
      console.error('Failed to initialize IPFS node:', error);
      setIpfsNode({ id: 'simulated-ipfs-node', status: 'offline' });
      
      toast({
        variant: "destructive",
        title: "IPFS Error",
        description: "Failed to start the P2P node.",
      });
    }
  };
  
  // Disconnect IPFS node
  const disconnectIPFS = async (): Promise<void> => {
    try {
      // In a real implementation, this would properly shutdown the IPFS node
      setIpfsNode(prev => prev ? { ...prev, status: 'offline' } : null);
      setPeers([]);
      setSyncStatus(prev => ({ ...prev, peersConnected: 0 }));
      
      // Clean up Any-Sync adapter
      if (anySyncAdapter) {
        anySyncAdapter.dispose();
        setAnySyncAdapter(null);
      }
      
      toast({
        title: "IPFS Node Stopped",
        description: "P2P synchronization is now disabled.",
      });
    } catch (error) {
      console.error('Failed to disconnect IPFS node:', error);
      
      toast({
        variant: "destructive",
        title: "IPFS Error",
        description: "Failed to stop the P2P node.",
      });
    }
  };
  
  // Connect to a peer
  const connectToPeer = async (peerId: string): Promise<void> => {
    if (!ipfsNode || ipfsNode.status !== 'online') {
      await initializeIPFS();
    }
    
    try {
      // Try connecting with Any-Sync if enabled
      if (useAnySyncProtocol && anySyncAdapter) {
        const success = await anySyncAdapter.connectToPeer(peerId);
        
        if (!success) {
          throw new Error(`Any-Sync couldn't connect to peer ${peerId}`);
        }
      }
      
      // Also connect with IPFS (fallback or dual connection)
      // In a real implementation, this would connect to an actual peer
      // For now, we'll simulate adding a new peer
      const newPeer: PeerInfo = {
        id: peerId,
        status: 'connected',
        lastSeen: new Date(),
        deviceType: 'Unknown',
      };
      
      setPeers(prev => [...prev.filter(p => p.id !== peerId), newPeer]);
      setSyncStatus(prev => ({ ...prev, peersConnected: prev.peersConnected + 1 }));
      
      toast({
        title: "Peer Connected",
        description: `Successfully connected to peer ${peerId.substring(0, 8)}...`,
      });
    } catch (error) {
      console.error(`Failed to connect to peer ${peerId}:`, error);
      
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: `Could not connect to peer ${peerId.substring(0, 8)}...`,
      });
    }
  };
  
  // Disconnect from a peer
  const disconnectFromPeer = async (peerId: string): Promise<void> => {
    try {
      // In a real implementation, this would disconnect from an actual peer
      setPeers(prev => prev.map(p => 
        p.id === peerId ? { ...p, status: 'disconnected' } : p
      ));
      setSyncStatus(prev => ({ ...prev, peersConnected: Math.max(0, prev.peersConnected - 1) }));
    } catch (error) {
      console.error(`Failed to disconnect from peer ${peerId}:`, error);
    }
  };
  
  // Update sync options
  const updateSyncOptions = (options: Partial<SyncOptions>) => {
    setSyncOptions(prev => ({ ...prev, ...options }));
    localStorage.setItem('p2p_sync_options', JSON.stringify({ ...syncOptions, ...options }));
  };
  
  // Synchronize data with peers
  const syncData = async (): Promise<void> => {
    if (!ipfsNode || ipfsNode.status !== 'online' || peers.filter(p => p.status === 'connected').length === 0) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "No active peers to synchronize with.",
      });
      return;
    }
    
    try {
      setSyncStatus(prev => ({ ...prev, syncing: true }));
      
      // If using Any-Sync, use its sync mechanism
      if (useAnySyncProtocol && anySyncAdapter) {
        const syncedDocs = await anySyncAdapter.syncWithPeers();
        console.log(`Synced ${syncedDocs.length} documents with Any-Sync`);
      } else {
        // In a real implementation, this would actually sync data with peers
        // For now, we'll simulate syncing with a timeout
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setSyncStatus({
        syncing: false,
        lastSynced: new Date(),
        peersConnected: peers.filter(p => p.status === 'connected').length,
      });
      
      toast({
        title: "Sync Complete",
        description: "All data synchronized with connected peers.",
      });
    } catch (error) {
      console.error('Failed to sync data:', error);
      
      setSyncStatus(prev => ({ 
        ...prev, 
        syncing: false, 
        error: error instanceof Error ? error.message : 'Unknown error during sync'
      }));
      
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Could not synchronize data with peers.",
      });
    }
  };
  
  // Publish data to the network
  const publishData = async <T extends { id: string }>(type: string, data: T) => {
    if (!ipfsNode || ipfsNode.status !== 'online') {
      console.error('Cannot publish data: IPFS node is not online');
      return null;
    }
    
    try {
      let cid: string | null = null;
      
      // If using Any-Sync, publish through that
      if (useAnySyncProtocol && anySyncAdapter) {
        cid = await anySyncAdapter.publishDocument(type, data.id, data);
      } else {
        // In a real implementation, this would publish data to IPFS
        // For now, we'll simulate it by generating a fake CID
        cid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      }
      
      console.log(`Published ${type} data with ID ${data.id} to ${useAnySyncProtocol ? 'Any-Sync' : 'IPFS'} with CID: ${cid}`);
      return cid;
    } catch (error) {
      console.error(`Failed to publish ${type} data:`, error);
      return null;
    }
  };
  
  // Subscribe to data updates of a specific type
  const subscribeToData = <T extends { id: string }>(type: string, callback: (data: T) => void) => {
    // In a real implementation, this would set up a subscription to IPFS pubsub or Any-Sync
    console.log(`Subscribed to ${type} data updates`);
    
    // Return an unsubscribe function
    return () => {
      console.log(`Unsubscribed from ${type} data updates`);
    };
  };
  
  // Start local network discovery for peers
  const startLocalDiscovery = async (): Promise<void> => {
    if (!ipfsNode || ipfsNode.status !== 'online') {
      await initializeIPFS();
    }
    
    try {
      // In a real implementation, this would start local peer discovery
      console.log('Starting local peer discovery...');
      
      // Simulate finding some peers
      setTimeout(() => {
        const localPeers: PeerInfo[] = [
          {
            id: `peer-${Math.random().toString(36).substring(2, 10)}`,
            name: 'John\'s Laptop',
            status: 'connected',
            lastSeen: new Date(),
            deviceType: 'Laptop',
          },
          {
            id: `peer-${Math.random().toString(36).substring(2, 10)}`,
            name: 'Priya\'s Desktop',
            status: 'connected',
            lastSeen: new Date(),
            deviceType: 'Desktop',
          }
        ];
        
        setPeers(prev => [...prev, ...localPeers]);
        setSyncStatus(prev => ({ ...prev, peersConnected: prev.peersConnected + localPeers.length }));
        
        toast({
          title: "Peers Found",
          description: `Found ${localPeers.length} peers on your local network.`,
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to start local discovery:', error);
    }
  };
  
  // Stop local network discovery for peers
  const stopLocalDiscovery = async (): Promise<void> => {
    try {
      // In a real implementation, this would stop local peer discovery
      console.log('Stopping local peer discovery...');
    } catch (error) {
      console.error('Failed to stop local discovery:', error);
    }
  };
  
  // Generate a new sync key
  const generateSyncKey = () => {
    const newKey = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    setSyncKey(newKey);
    return newKey;
  };
  
  return (
    <P2PContext.Provider
      value={{
        ipfsNode,
        initializeIPFS,
        disconnectIPFS,
        peers,
        connectToPeer,
        disconnectFromPeer,
        syncStatus,
        syncOptions,
        updateSyncOptions,
        syncData,
        publishData,
        subscribeToData,
        startLocalDiscovery,
        stopLocalDiscovery,
        syncKey,
        setSyncKey,
        generateSyncKey,
        anySyncAdapter,
        initializeAnySync,
        useAnySyncProtocol,
        setUseAnySyncProtocol,
      }}
    >
      {children}
    </P2PContext.Provider>
  );
};
