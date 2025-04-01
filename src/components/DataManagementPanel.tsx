
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from "@/hooks/use-toast";
import { Database, FileJson, ArrowDownToLine, ArrowUpFromLine, Trash2, Shield } from 'lucide-react';

export const DataManagementPanel: React.FC = () => {
  const [backupFrequency, setBackupFrequency] = useState("weekly");
  const [isAutoBackup, setIsAutoBackup] = useState(true);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isPurgeDialogOpen, setIsPurgeDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  
  const handleImport = () => {
    // Simulated import functionality
    toast({
      title: "Data Imported",
      description: "Your data has been successfully imported.",
    });
    setIsImportDialogOpen(false);
  };
  
  const handleExport = () => {
    // Simulated export functionality
    toast({
      title: "Data Exported",
      description: `Your data has been exported in ${exportFormat.toUpperCase()} format.`,
    });
    setIsExportDialogOpen(false);
  };
  
  const handlePurge = () => {
    // Simulated purge functionality
    toast({
      variant: "destructive",
      title: "Data Purged",
      description: "All your data has been purged from this device.",
    });
    setIsPurgeDialogOpen(false);
  };

  const handleBackupFrequencyChange = (value: string) => {
    setBackupFrequency(value);
    toast({
      title: "Backup Settings Updated",
      description: `Automatic backups will now occur ${value}`,
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Configure how your data is stored, backed up and synchronized
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium">Automatic Backups</h3>
                <p className="text-sm text-muted-foreground">Regularly back up your data to prevent loss</p>
              </div>
              <Switch 
                checked={isAutoBackup} 
                onCheckedChange={setIsAutoBackup} 
              />
            </div>
            
            {isAutoBackup && (
              <div className="grid gap-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select value={backupFrequency} onValueChange={handleBackupFrequencyChange}>
                  <SelectTrigger id="backup-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Import Data
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsExportDialogOpen(true)}
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Export Data
            </Button>
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
              onClick={() => setIsPurgeDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Purge Local Data
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Data Formats
          </CardTitle>
          <CardDescription>
            Configure the format of your data exports and imports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="default-export-format">Default Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="default-export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose the default format for exporting your task and project data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Privacy
          </CardTitle>
          <CardDescription>
            Control how your data is stored and shared
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium">End-to-End Encryption</h3>
                <p className="text-sm text-muted-foreground">Encrypt all data before syncing to other devices</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium">Usage Analytics</h3>
                <p className="text-sm text-muted-foreground">Send anonymous usage data to improve the app</p>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Upload a file to import tasks, projects, and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="import-file">Import File</Label>
              <Input id="import-file" type="file" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="merge" />
              <Label htmlFor="merge">Merge with existing data</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Export your tasks, projects, and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="include-completed" defaultChecked />
              <Label htmlFor="include-completed">Include completed tasks</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Purge Dialog */}
      <Dialog open={isPurgeDialogOpen} onOpenChange={setIsPurgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purge Local Data</DialogTitle>
            <DialogDescription>
              This will permanently delete all local data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-destructive font-semibold">
              Warning: This will delete all your tasks, projects, and settings from this device.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPurgeDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handlePurge}>
              Delete All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
