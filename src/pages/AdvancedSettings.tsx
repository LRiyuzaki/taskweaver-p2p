
import React, { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Users, Bell, Link2, RefreshCw, Shield, Server } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { CollaborationPanel } from '@/components/CollaborationPanel';
import { FormulaField } from '@/components/FormulaField';
import { useTaskContext } from '@/contexts/TaskContext';
import { useP2P } from '@/contexts/P2PContext';
import { PeerInfo } from '@/types/p2p';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

const AdvancedSettings = () => {
  const { tasks } = useTaskContext();
  const { 
    ipfsNode, 
    initializeIPFS, 
    disconnectIPFS, 
    peers, 
    connectToPeer, 
    syncStatus, 
    syncOptions, 
    updateSyncOptions, 
    syncData,
    startLocalDiscovery,
    syncKey,
    generateSyncKey,
    setSyncKey
  } = useP2P();
  
  const [peerInput, setPeerInput] = useState("");
  const [joinKey, setJoinKey] = useState("");
  const [taskTimeFormula, setTaskTimeFormula] = useState("{taskCount} * 2.5");
  
  // Calculate task metrics for use in formulas
  const taskMetrics = {
    taskCount: tasks.length,
    todoCount: tasks.filter(t => t.status === 'todo').length,
    doneCount: tasks.filter(t => t.status === 'done').length,
    completionRate: tasks.length > 0 ? 
      Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0
  };

  const handleJoinNetwork = () => {
    if (!joinKey) {
      toast({
        variant: "destructive",
        title: "Invalid Key",
        description: "Please enter a valid sync key.",
      });
      return;
    }
    
    setSyncKey(joinKey);
    toast({
      title: "Network Joined",
      description: "Attempting to connect to the P2P network...",
    });
    
    // Simulate connecting to peers after joining
    setTimeout(() => {
      startLocalDiscovery();
    }, 1500);
  };

  const handleConnectToPeer = () => {
    if (!peerInput) return;
    
    connectToPeer(peerInput);
    setPeerInput("");
  };

  // Start IPFS node when the component mounts
  useEffect(() => {
    if (syncOptions.autoSync && !ipfsNode) {
      initializeIPFS();
    }
  }, [syncOptions.autoSync, ipfsNode, initializeIPFS]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Advanced Settings</h1>

          <Tabs defaultValue="sync" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="sync" className="flex items-center gap-1">
                <Link2 className="h-4 w-4" />
                P2P Sync
              </TabsTrigger>
              <TabsTrigger value="peers" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Peers
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" />
                Collaboration
              </TabsTrigger>
              <TabsTrigger value="formulas" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Formulas & Computations
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Security & Permissions
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex items-center gap-1">
                <Server className="h-4 w-4" />
                Storage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sync">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    IPFS Peer-to-Peer Synchronization
                  </CardTitle>
                  <CardDescription>
                    Enable real-time synchronization between devices using IPFS without a central server
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sync-toggle" className="text-base">Enable IPFS P2P Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Sync your data across devices using InterPlanetary File System
                      </p>
                    </div>
                    <Switch 
                      id="sync-toggle" 
                      checked={ipfsNode?.status === 'online'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          initializeIPFS();
                        } else {
                          disconnectIPFS();
                        }
                      }}
                    />
                  </div>

                  {ipfsNode?.status === 'online' && (
                    <>
                      <div className="rounded-lg bg-muted p-4">
                        <div className="font-medium mb-1">IPFS Node Status</div>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            ipfsNode?.status === 'online' ? 'bg-green-500' : 
                            ipfsNode?.status === 'starting' ? 'bg-amber-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm">{ipfsNode?.status || 'Offline'}</span>
                        </div>
                        <div className="text-sm mt-2">
                          Node ID: {ipfsNode?.id ? `${ipfsNode.id.substring(0, 10)}...` : 'Not available'}
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-medium">Connected Peers:</span>
                          <Badge variant="outline">{syncStatus.peersConnected}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="sync-key">Network Sync Key</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="sync-key" 
                            value={syncKey || ''}
                            readOnly 
                            className="font-mono"
                          />
                          <Button 
                            variant="outline" 
                            onClick={generateSyncKey}
                          >
                            Generate New
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Share this key with others to form a private P2P network
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="join-key">Join Existing Network</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="join-key" 
                            placeholder="Enter sync key" 
                            className="font-mono"
                            value={joinKey}
                            onChange={(e) => setJoinKey(e.target.value)}
                          />
                          <Button onClick={handleJoinNetwork}>
                            Join
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-sync">Auto Synchronization</Label>
                          <Switch 
                            id="auto-sync" 
                            checked={syncOptions.autoSync}
                            onCheckedChange={(checked) => 
                              updateSyncOptions({ autoSync: checked })
                            }
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <Label htmlFor="sync-interval">Sync Interval (seconds)</Label>
                            <span className="text-sm text-muted-foreground">
                              {syncOptions.syncInterval / 1000}s
                            </span>
                          </div>
                          <Slider 
                            id="sync-interval"
                            disabled={!syncOptions.autoSync}
                            value={[syncOptions.syncInterval / 1000]}
                            min={5}
                            max={120}
                            step={5}
                            onValueChange={(value) => 
                              updateSyncOptions({ syncInterval: value[0] * 1000 })
                            }
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="wifi-only">Sync only on WiFi</Label>
                          <Switch 
                            id="wifi-only" 
                            checked={syncOptions.syncOnlyOnWifi}
                            onCheckedChange={(checked) => 
                              updateSyncOptions({ syncOnlyOnWifi: checked })
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="local-only">Local network only</Label>
                          <Switch 
                            id="local-only" 
                            checked={syncOptions.syncOnlyOnLocalNetwork}
                            onCheckedChange={(checked) => 
                              updateSyncOptions({ syncOnlyOnLocalNetwork: checked })
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="encryption">Encrypt synced data</Label>
                          <Switch 
                            id="encryption" 
                            checked={syncOptions.syncEncryption}
                            onCheckedChange={(checked) => 
                              updateSyncOptions({ syncEncryption: checked })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={syncData}
                    disabled={ipfsNode?.status !== 'online' || syncStatus.syncing}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
                    {syncStatus.syncing ? 'Syncing...' : 'Synchronize Now'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="peers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Connected Peers
                  </CardTitle>
                  <CardDescription>
                    View and manage peer connections in your P2P network
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Connect to Peer</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter peer ID" 
                        value={peerInput}
                        onChange={(e) => setPeerInput(e.target.value)}
                      />
                      <Button onClick={handleConnectToPeer}>Connect</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Active Peers ({peers.length})</h3>
                    
                    {peers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No peers connected. Start local discovery or connect to peers manually.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {peers.map((peer: PeerInfo) => (
                          <div key={peer.id} className="bg-muted/30 p-3 rounded-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{peer.name || 'Unknown Device'}</div>
                                <div className="text-xs text-muted-foreground">{peer.id}</div>
                              </div>
                              <Badge 
                                variant={peer.status === 'connected' ? 'default' : 'outline'}
                                className={peer.status === 'connected' ? 'bg-green-500 hover:bg-green-600' : ''}
                              >
                                {peer.status}
                              </Badge>
                            </div>
                            
                            {peer.status === 'connected' && (
                              <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                                <span>Device: {peer.deviceType || 'Unknown'}</span>
                                <span>•</span>
                                <span>Last seen: {peer.lastSeen?.toLocaleTimeString()}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => startLocalDiscovery()}
                      disabled={ipfsNode?.status !== 'online'}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Start Local Discovery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="collaboration">
              <CollaborationPanel />
            </TabsContent>
            
            <TabsContent value="formulas">
              <Card>
                <CardHeader>
                  <CardTitle>Formula Settings</CardTitle>
                  <CardDescription>
                    Configure custom calculations for your tasks and projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormulaField
                      label="Estimated Hours"
                      formula={taskTimeFormula}
                      onFormulaChange={setTaskTimeFormula}
                      value={evaluateFormula(taskTimeFormula, taskMetrics)}
                      dependencies={taskMetrics}
                    />
                    
                    <FormulaField
                      label="Task Completion Rate"
                      formula="{doneCount} / {taskCount} * 100"
                      onFormulaChange={() => {}}
                      value={`${taskMetrics.completionRate}%`}
                      dependencies={taskMetrics}
                    />
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Available Variables</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <code>taskCount</code>: {taskMetrics.taskCount}
                      </div>
                      <div>
                        <code>todoCount</code>: {taskMetrics.todoCount}
                      </div>
                      <div>
                        <code>doneCount</code>: {taskMetrics.doneCount}
                      </div>
                      <div>
                        <code>completionRate</code>: {taskMetrics.completionRate}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Permissions
                  </CardTitle>
                  <CardDescription>
                    Configure data access controls and user permissions for P2P sharing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Data Encryption</h3>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="encrypt-data">Encrypt all shared data</Label>
                        <Switch 
                          id="encrypt-data" 
                          checked={syncOptions.syncEncryption}
                          onCheckedChange={(checked) => 
                            updateSyncOptions({ syncEncryption: checked })
                          }
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Adds an extra layer of protection to data shared across your P2P network
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Access Control</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="data-access">Default Data Access</Label>
                          <Select defaultValue="authenticated">
                            <SelectTrigger id="data-access" className="mt-1">
                              <SelectValue placeholder="Select default access level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public (All peers)</SelectItem>
                              <SelectItem value="authenticated">Authenticated Peers Only</SelectItem>
                              <SelectItem value="specific">Specific Peers Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="client-perm">Client Data Permissions</Label>
                          <Select defaultValue="specific">
                            <SelectTrigger id="client-perm" className="mt-1">
                              <SelectValue placeholder="Select permission level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">All Team Members</SelectItem>
                              <SelectItem value="authenticated">Authenticated Team Members</SelectItem>
                              <SelectItem value="specific">Specific Team Members</SelectItem>
                              <SelectItem value="private">Private (Only Me)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="financial-perm">Financial Data Permissions</Label>
                          <Select defaultValue="private">
                            <SelectTrigger id="financial-perm" className="mt-1">
                              <SelectValue placeholder="Select permission level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">All Team Members</SelectItem>
                              <SelectItem value="authenticated">Authenticated Team Members</SelectItem>
                              <SelectItem value="specific">Specific Team Members</SelectItem>
                              <SelectItem value="private">Private (Only Me)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Verification</h3>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="verify-content">Content verification</Label>
                        <Switch id="verify-content" defaultChecked />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Verify data integrity using cryptographic signatures
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="storage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    IPFS Storage Configuration
                  </CardTitle>
                  <CardDescription>
                    Manage how your data is stored and pinned in the IPFS network
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="text-base font-medium mb-2">Local Storage</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Used Space</div>
                        <div className="text-lg font-medium">124.5 MB</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Documents Stored</div>
                        <div className="text-lg font-medium">147</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pin-data">Pin important data</Label>
                      <Switch id="pin-data" defaultChecked />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keeps copies of important data on your device for offline access
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-cleanup">Automatic data cleanup</Label>
                      <Switch id="auto-cleanup" defaultChecked />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically remove old or unused data to save space
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Storage Location</Label>
                    <Input defaultValue="C:\Users\Username\AppData\Roaming\AccountingToolIPFS" readOnly />
                    <p className="text-xs text-muted-foreground">
                      Default location for IPFS data storage on your device
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-storage">Maximum Storage Space</Label>
                    <Select defaultValue="1024">
                      <SelectTrigger id="max-storage">
                        <SelectValue placeholder="Select storage limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="512">512 MB</SelectItem>
                        <SelectItem value="1024">1 GB</SelectItem>
                        <SelectItem value="2048">2 GB</SelectItem>
                        <SelectItem value="5120">5 GB</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-center pt-2">
                    <Button variant="outline">Clear Cache</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

// Helper function for formula evaluation
function evaluateFormula(formula: string, variables: Record<string, any>): string {
  try {
    // Replace variables with their values
    let evalStr = formula;
    
    Object.entries(variables).forEach(([key, val]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      evalStr = evalStr.replace(regex, typeof val === 'number' ? val.toString() : `"${val}"`);
    });
    
    // Basic sanity check
    if (/[;\\]/.test(evalStr)) {
      return "Error: Invalid characters";
    }

    // Simple mathematical expressions only
    if (!/^[0-9+\-*/()., "<>=&|!%\s"]*$/.test(evalStr)) {
      return "Error: Invalid operators";
    }

    // Evaluate the formula
    const result = Function(`"use strict"; return (${evalStr})`)();
    return result.toString();
  } catch (e) {
    return "Error";
  }
}

export default AdvancedSettings;
