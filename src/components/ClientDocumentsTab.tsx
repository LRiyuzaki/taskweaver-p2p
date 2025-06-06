
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';

interface ClientDocumentsTabProps {
  clientId: string;
}

export const ClientDocumentsTab: React.FC<ClientDocumentsTabProps> = ({ clientId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Documents
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet.</p>
            <Button variant="outline" className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              Upload First Document
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDocumentsTab;
