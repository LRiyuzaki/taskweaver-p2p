
import React, { useEffect } from 'react';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Laptop, Smartphone, Server } from 'lucide-react';
import { format, formatDistance } from 'date-fns';

export const ConnectedPeersList: React.FC = () => {
  const { connectedPeers, fetchPeers } = useSupabaseSync();

  useEffect(() => {
    fetchPeers();
    
    // Refresh the peers list every 30 seconds
    const interval = setInterval(() => {
      fetchPeers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPeers]);

  // Get device icon based on device type
  const getDeviceIcon = (deviceType?: string) => {
    if (!deviceType) return <Server className="h-4 w-4" />;
    
    const type = deviceType.toLowerCase();
    if (type.includes('laptop') || type.includes('desktop')) {
      return <Laptop className="h-4 w-4" />;
    } else if (type.includes('mobile') || type.includes('phone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    
    return <Server className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Connected Peers
        </CardTitle>
        <CardDescription>
          Devices that have connected to the network
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connectedPeers.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">No peers connected</div>
        ) : (
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
            {connectedPeers.map((peer) => (
              <div
                key={peer.id}
                className="border rounded-md p-3 bg-background shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(peer.device_type)}
                    <span className="font-medium">
                      {peer.name || `Peer ${peer.peer_id.substring(0, 8)}...`}
                    </span>
                  </div>
                  <Badge variant={peer.status === 'connected' ? "default" : "outline"}>
                    {peer.status}
                  </Badge>
                </div>
                
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Last seen {formatDistance(new Date(peer.last_seen), new Date(), { addSuffix: true })}</span>
                </div>
                
                <div className="mt-1 text-xs text-muted-foreground truncate" title={peer.peer_id}>
                  ID: {peer.peer_id.substring(0, 16)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
