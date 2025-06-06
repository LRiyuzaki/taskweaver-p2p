
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface ClientActivityTabProps {
  clientId: string;
}

export const ClientActivityTab: React.FC<ClientActivityTabProps> = ({ clientId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity recorded yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientActivityTab;
