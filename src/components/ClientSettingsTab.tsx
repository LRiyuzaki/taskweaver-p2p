
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface ClientSettingsTabProps {
  clientId: string;
}

export const ClientSettingsTab: React.FC<ClientSettingsTabProps> = ({ clientId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No settings configured yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSettingsTab;
