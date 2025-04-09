
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useP2P } from '@/contexts/P2PContext';
import { useIPFSSync } from '@/hooks/useIPFSSync';
import { useTaskContext } from '@/contexts/TaskContext';
import { useClientContext } from '@/contexts/ClientContext';
import { RefreshCw, Shield, AlertCircle, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const P2PSyncPanel: React.FC = () => {
  const { 
    ipfsNode, 
    syncStatus, 
    peers, 
    useAnySyncProtocol, 
    setUseAnySyncProtocol, 
    initializeAnySync,
    anySyncAdapter 
  } = useP2P();
  const { syncClient, syncTask, syncMultiple } = useIPFSSync();
  const { tasks } = useTaskContext();
  const { clients } = useClientContext ? useClientContext() : { clients: [] };
  
  const handleSyncAll = async () => {
    if (!ipfsNode || ipfsNode.status !== 'online') {
      toast({
        variant: "destructive",
        title: "Cannot Sync",
        description: "IPFS node is not online. Please start the node first."
      });
      return;
    }
    
    toast({
      title: "Syncing Data",
      description: "Synchronizing all data with connected peers..."
    });
    
    // Sync clients
    if (clients && clients.length > 0) {
      const clientResults = await syncMultiple('client', clients);
      console.log(`Synced ${clientResults.length} of ${clients.length} clients`);
    }
    
    // Sync tasks
    if (tasks && tasks.length > 0) {
      const taskResults = await syncMultiple('task', tasks);
      console.log(`Synced ${taskResults.length} of ${tasks.length} tasks`);
    }
    
    toast({
      title: "Sync Complete",
      description: "All data has been synchronized with the P2P network."
    });
  };

  const handleToggleAnySync = async (checked: boolean) => {
    setUseAnySyncProtocol(checked);
    
    if (checked && !anySyncAdapter && ipfsNode?.status === 'online') {
      await initializeAnySync();
    }
  };
  
  const connectedPeers = peers.filter(p => p.status === 'connected');
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">P2P Network Status</CardTitle>
        <CardDescription>
          Synchronize your data with connected peers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${
              ipfsNode?.status === 'online' ? 'bg-green-500' : 
              ipfsNode?.status === 'starting' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <span>IPFS Node: {ipfsNode?.status || 'Offline'}</span>
          </div>
          <Badge variant="outline">{connectedPeers.length} Peers</Badge>
        </div>
        
        {/* Any-Sync Protocol Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">Use Any-Sync Protocol</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline">
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Any-Sync is a local-first protocol for real-time data synchronization 
                    that works offline and supports CRDTs for conflict resolution.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            checked={useAnySyncProtocol}
            onCheckedChange={handleToggleAnySync}
            disabled={!ipfsNode || ipfsNode.status !== 'online'}
          />
        </div>
        
        {useAnySyncProtocol && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-2 rounded flex items-center text-sm">
            <Shield className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
            <span>Any-Sync enabled: {anySyncAdapter ? 'Active' : 'Initializing...'}</span>
          </div>
        )}
        
        {ipfsNode?.status === 'online' ? (
          <div className="text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Last Synced:</span>
              <span>{syncStatus.lastSynced?.toLocaleTimeString() || 'Never'}</span>
            </div>
            <div className="flex justify-between text-muted-foreground mt-1">
              <span>Clients:</span>
              <span>{clients?.length || 0}</span>
            </div>
            <div className="flex justify-between text-muted-foreground mt-1">
              <span>Tasks:</span>
              <span>{tasks?.length || 0}</span>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-2 rounded flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
            <span>IPFS node is not running. Enable P2P sync in Advanced Settings.</span>
          </div>
        )}
        
        {ipfsNode?.status === 'online' && connectedPeers.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-2 rounded flex items-center text-sm">
            <Shield className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
            <span>No peers connected. Find peers in Advanced Settings.</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSyncAll} 
          disabled={!ipfsNode || ipfsNode.status !== 'online' || connectedPeers.length === 0}
          className="w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync All Data
        </Button>
      </CardFooter>
    </Card>
  );
};
