
import React, { useEffect } from 'react';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileJson, User } from 'lucide-react';
import { format } from 'date-fns';

export const SyncHistory: React.FC = () => {
  const { syncedDocuments, loading, fetchDocuments } = useSupabaseSync();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Sync History
        </CardTitle>
        <CardDescription>
          Recent documents synchronized with the network
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center text-muted-foreground">Loading sync history...</div>
        ) : syncedDocuments.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">No synchronized documents found</div>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {syncedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-md p-3 bg-background shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-blue-500" />
                    <span className="font-medium truncate max-w-[200px]" title={doc.original_id}>
                      {doc.original_id}
                    </span>
                  </div>
                  <Badge variant={doc.is_deleted ? "destructive" : "outline"}>
                    {doc.document_type}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(doc.updated_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>v{doc.version}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground truncate" title={doc.cid}>
                  CID: {doc.cid}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
