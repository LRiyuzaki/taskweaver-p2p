
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

interface ClientFinancialsTabProps {
  clientId: string;
}

export const ClientFinancialsTab: React.FC<ClientFinancialsTabProps> = ({ clientId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No financial information available.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientFinancialsTab;
