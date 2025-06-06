
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

interface ClientComplianceTabProps {
  clientId: string;
  onCreateTask: (serviceName: string, dueDate: Date) => void;
}

export const ClientComplianceTab: React.FC<ClientComplianceTabProps> = ({ clientId, onCreateTask }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No compliance requirements configured.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientComplianceTab;
