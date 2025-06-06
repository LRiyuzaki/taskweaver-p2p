
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Upload, RefreshCw, Archive, Trash2, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast-extensions';

interface DataStats {
  clients: number;
  tasks: number;
  documents: number;
  lastBackup: Date | null;
  storageUsed: number;
  storageLimit: number;
}

export const DataManagementPanel: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Mock data - replace with actual data from context
  const dataStats: DataStats = {
    clients: 45,
    tasks: 128,
    documents: 234,
    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    storageUsed: 2.4, // GB
    storageLimit: 10, // GB
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Implement data export logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    setIsImporting(true);
    try {
      // Implement data import logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data imported successfully');
    } catch (error) {
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Backup created successfully');
    } catch (error) {
      toast.error('Failed to create backup');
    }
  };

  const storagePercentage = (dataStats.storageUsed / dataStats.storageLimit) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Management</h2>
        <p className="text-muted-foreground">
          Manage your data, backups, and storage
        </p>
      </div>

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataStats.clients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataStats.tasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataStats.documents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataStats.storageUsed}GB
            </div>
            <div className="text-xs text-muted-foreground">
              of {dataStats.storageLimit}GB ({storagePercentage.toFixed(1)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Download your data for backup or migration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleExportData} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Exports all clients, tasks, and documents in JSON format
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Import data from backup or another system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleImportData} 
              disabled={isImporting}
              variant="outline"
              className="w-full"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Upload a JSON file to import data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Management */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Management</CardTitle>
          <CardDescription>
            Create and manage data backups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Last Backup</p>
              <p className="text-sm text-muted-foreground">
                {dataStats.lastBackup 
                  ? `${dataStats.lastBackup.toLocaleDateString()} at ${dataStats.lastBackup.toLocaleTimeString()}`
                  : 'No backup created yet'
                }
              </p>
            </div>
            <Badge variant={dataStats.lastBackup ? 'default' : 'destructive'}>
              {dataStats.lastBackup ? 'Recent' : 'Overdue'}
            </Badge>
          </div>
          
          <Separator />
          
          <Button onClick={handleCreateBackup} className="w-full">
            <Archive className="mr-2 h-4 w-4" />
            Create Backup Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
