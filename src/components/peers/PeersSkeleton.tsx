
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Loading skeleton component for peers list
export const PeersSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="border rounded-md p-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-32 mt-2" />
        <Skeleton className="h-4 w-24 mt-2" />
      </div>
    ))}
  </div>
);
