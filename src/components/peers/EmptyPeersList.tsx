
import React from 'react';
import { Users } from 'lucide-react';

// Component displayed when no peers are connected
export const EmptyPeersList: React.FC = () => (
  <div className="py-6 text-center text-muted-foreground">
    <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
    <p>No peers connected</p>
    <p className="text-sm mt-1">Peers will appear here when devices connect to the network</p>
  </div>
);
