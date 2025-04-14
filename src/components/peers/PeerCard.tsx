
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Laptop, Smartphone, Server, CircleSlash, CheckCircle, AlertCircle } from 'lucide-react';
import { PeerStatus } from '@/types/p2p';

interface PeerCardProps {
  id: string;
  name?: string;
  deviceType?: string;
  lastSeen: string;
  status: PeerStatus;
}

export const PeerCard: React.FC<PeerCardProps> = ({
  id,
  name,
  deviceType,
  lastSeen,
  status
}) => {
  const getDeviceIcon = () => {
    const iconProps = { className: "h-4 w-4 mr-1", strokeWidth: 1.5 };
    
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
      case 'phone':
      case 'smartphone':
        return <Smartphone {...iconProps} />;
      case 'server':
        return <Server {...iconProps} />;
      case 'desktop':
      case 'laptop':
      default:
        return <Laptop {...iconProps} />;
    }
  };
  
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Connecting
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center">
            <CircleSlash className="h-3 w-3 mr-1" />
            Disconnected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Unknown
          </Badge>
        );
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-row justify-between items-start mb-2">
          <div className="flex items-center">
            {getDeviceIcon()}
            <h3 className="font-medium text-sm">
              {name || `Peer ${id.substring(0, 8)}...`}
            </h3>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span>Last seen</span>
            <span>{formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>ID</span>
            <code className="bg-muted px-1 py-0.5 rounded text-[0.7rem]">
              {id.substring(0, 12)}...
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
