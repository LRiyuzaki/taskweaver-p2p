
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

interface ClientReportingTabProps {
  clientId: string;
}

export const ClientReportingTab: React.FC<ClientReportingTabProps> = ({ clientId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reports available yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientReportingTab;
