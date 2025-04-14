
import React, { useEffect } from 'react';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { PeerCard } from '@/components/peers/PeerCard';
import { PeersSkeleton } from '@/components/peers/PeersSkeleton';
import { EmptyPeersList } from '@/components/peers/EmptyPeersList';

export const ConnectedPeersList: React.FC = () => {
  const { connectedPeers, fetchPeers, loading } = useSupabaseSync();

  useEffect(() => {
    // Fetch peers on component mount
    fetchPeers();
    
    // Refresh the peers list every 30 seconds
    const interval = setInterval(() => {
      fetchPeers();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [fetchPeers]);

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
        {loading ? (
          <PeersSkeleton />
        ) : connectedPeers.length === 0 ? (
          <EmptyPeersList />
        ) : (
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
            {connectedPeers.map((peer) => (
              <PeerCard 
                key={peer.id} 
                id={peer.peer_id}
                name={peer.name}
                deviceType={peer.device_type}
                lastSeen={peer.last_seen}
                status={peer.status}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
