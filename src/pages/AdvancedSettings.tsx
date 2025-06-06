
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Shield, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast-extensions';

const AdvancedSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    autoBackup: true,
    dataRetention: '365',
    debugMode: false,
    experimentalFeatures: false,
    cacheSize: '100',
    apiTimeout: '30'
  });

  const handleSaveSettings = () => {
    // Save settings logic
    toast.success('Advanced settings saved successfully');
  };

  const handleResetSettings = () => {
    setSettings({
      autoBackup: true,
      dataRetention: '365',
      debugMode: false,
      experimentalFeatures: false,
      cacheSize: '100',
      apiTimeout: '30'
    });
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Advanced Settings</h1>
        <Badge variant="outline" className="ml-2">Admin Only</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Configuration
            </CardTitle>
            <CardDescription>
              Manage database and storage settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoBackup">Automatic Backups</Label>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoBackup: checked }))
                }
              />
            </div>
            
            <div>
              <Label htmlFor="dataRetention">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                value={settings.dataRetention}
                onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: e.target.value }))}
                type="number"
              />
            </div>

            <div>
              <Label htmlFor="cacheSize">Cache Size (MB)</Label>
              <Input
                id="cacheSize"
                value={settings.cacheSize}
                onChange={(e) => setSettings(prev => ({ ...prev, cacheSize: e.target.value }))}
                type="number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Tuning
            </CardTitle>
            <CardDescription>
              Optimize application performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiTimeout">API Timeout (seconds)</Label>
              <Input
                id="apiTimeout"
                value={settings.apiTimeout}
                onChange={(e) => setSettings(prev => ({ ...prev, apiTimeout: e.target.value }))}
                type="number"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="experimentalFeatures">Experimental Features</Label>
              <Switch
                id="experimentalFeatures"
                checked={settings.experimentalFeatures}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, experimentalFeatures: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Configuration
            </CardTitle>
            <CardDescription>
              Advanced security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="debugMode">Debug Mode</Label>
              <Switch
                id="debugMode"
                checked={settings.debugMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, debugMode: checked }))
                }
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Warning:</strong> Debug mode may expose sensitive information in logs.
                Only enable for troubleshooting purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Current system status and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Application Version:</span>
              <span className="text-sm">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Database Status:</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Backup:</span>
              <span className="text-sm">2 hours ago</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex gap-4">
        <Button onClick={handleSaveSettings}>
          Save Advanced Settings
        </Button>
        <Button variant="outline" onClick={handleResetSettings}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default AdvancedSettings;
