
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Laptop, Smartphone, Server } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { PeerStatus } from '@/types/p2p';

// Component for displaying the appropriate device icon based on device type
export const DeviceIcon: React.FC<{ deviceType?: string }> = ({ deviceType }) => {
  if (!deviceType) return <Server className="h-4 w-4" />;
  
  const type = deviceType.toLowerCase();
  if (type.includes('laptop') || type.includes('desktop')) {
    return <Laptop className="h-4 w-4" />;
  } else if (type.includes('mobile') || type.includes('phone')) {
    return <Smartphone className="h-4 w-4" />;
  }
  
  return <Server className="h-4 w-4" />;
};

// Interface for the peer data structure
export interface PeerCardProps {
  peer: { 
    id: string;
    peer_id: string;
    name?: string;
    device_type?: string;
    status: PeerStatus;
    last_seen: string;
  }
}

// Component for displaying a single peer's information
export const PeerCard: React.FC<PeerCardProps> = ({ peer }) => {
  const getBadgeVariant = (status: PeerStatus) => {
    switch(status) {
      case 'connected': return 'default';
      case 'connecting': return 'secondary';
      case 'disconnected':
      default: return 'outline';
    }
  };

  return (
    <div className="border rounded-md p-3 bg-background shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <DeviceIcon deviceType={peer.device_type} />
          <span className="font-medium">
            {peer.name || `Peer ${peer.peer_id.substring(0, 8)}...`}
          </span>
        </div>
        <Badge variant={getBadgeVariant(peer.status)}>
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
  );
};
