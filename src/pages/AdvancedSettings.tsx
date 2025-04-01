
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Users, Bell, Link2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CollaborationPanel } from '@/components/CollaborationPanel';
import { FormulaField } from '@/components/FormulaField';
import { useTaskContext } from '@/contexts/TaskContext';

const AdvancedSettings = () => {
  const { tasks } = useTaskContext();
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [syncKey, setSyncKey] = useState("");
  const [taskTimeFormula, setTaskTimeFormula] = useState("{taskCount} * 2.5");
  
  // Calculate task metrics for use in formulas
  const taskMetrics = {
    taskCount: tasks.length,
    todoCount: tasks.filter(t => t.status === 'todo').length,
    doneCount: tasks.filter(t => t.status === 'done').length,
    completionRate: tasks.length > 0 ? 
      Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0
  };

  const handleGenerateSyncKey = () => {
    const randomKey = Math.random().toString(36).substring(2, 15);
    setSyncKey(randomKey);
  };

  const handleEnableSync = (checked: boolean) => {
    setSyncEnabled(checked);
    if (checked && !syncKey) {
      handleGenerateSyncKey();
    }
  };

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
              <TabsTrigger value="collaboration" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Collaboration
              </TabsTrigger>
              <TabsTrigger value="formulas" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Formulas & Computations
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sync">
              <Card>
                <CardHeader>
                  <CardTitle>Peer-to-Peer Synchronization</CardTitle>
                  <CardDescription>
                    Enable real-time synchronization between devices without a central server
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sync-toggle" className="text-base">Enable P2P Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Sync your tasks and projects across devices
                      </p>
                    </div>
                    <Switch 
                      id="sync-toggle" 
                      checked={syncEnabled} 
                      onCheckedChange={handleEnableSync}
                    />
                  </div>

                  {syncEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sync-key">Sync Key</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="sync-key" 
                            value={syncKey} 
                            readOnly 
                            className="font-mono"
                          />
                          <Button 
                            variant="outline" 
                            onClick={handleGenerateSyncKey}
                          >
                            Generate New
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Share this key with others to sync with their devices
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted p-4">
                        <div className="font-medium mb-1">Connection Status</div>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${peerCount > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                          <span className="text-sm">{peerCount > 0 ? 'Connected' : 'Waiting for peers'}</span>
                        </div>
                        <div className="text-sm mt-2">
                          {peerCount} {peerCount === 1 ? 'peer' : 'peers'} connected
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="join-key">Join Existing Group</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="join-key" 
                            placeholder="Enter sync key" 
                            className="font-mono"
                          />
                          <Button>
                            Join
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
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
            
            <TabsContent value="notifications">
              <div className="bg-muted/30 p-12 rounded-lg text-center text-muted-foreground">
                Notification settings will be available soon.
              </div>
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
