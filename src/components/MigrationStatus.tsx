
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';

export const MigrationStatus: React.FC = () => {
  const { migrationStatus, isInitialized } = useSupabaseIntegration();

  if (isInitialized && migrationStatus === 'completed') {
    return null; // Don't show anything when migration is complete
  }

  const getStatusIcon = () => {
    switch (migrationStatus) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'in-progress':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (migrationStatus) {
      case 'completed':
        return 'Migration completed successfully!';
      case 'error':
        return 'Migration failed. Please check the console for details.';
      case 'in-progress':
        return 'Migrating your data to the database...';
      default:
        return 'Preparing to migrate data...';
    }
  };

  const getProgress = () => {
    switch (migrationStatus) {
      case 'completed':
        return 100;
      case 'in-progress':
        return 50;
      case 'error':
        return 0;
      default:
        return 10;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Database Migration
          </CardTitle>
          <CardDescription>
            We're upgrading your data storage to use a proper database for better performance and reliability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={getProgress()} className="w-full" />
          <p className="text-sm text-muted-foreground">{getStatusText()}</p>
          {migrationStatus === 'error' && (
            <p className="text-xs text-red-600">
              Don't worry - your original data is safely backed up in localStorage with "_backup" suffix.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
