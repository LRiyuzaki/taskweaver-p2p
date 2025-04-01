
import React from 'react';
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollaborationPanel } from '@/components/CollaborationPanel';
import { Settings as SettingsIcon, Users, Database, Bell } from 'lucide-react';

const Settings = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          <Tabs defaultValue="collaboration" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="collaboration" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Collaboration
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Data Management
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="collaboration">
              <CollaborationPanel />
            </TabsContent>
            
            <TabsContent value="data">
              <div className="bg-muted/30 p-12 rounded-lg text-center text-muted-foreground">
                Data management settings will be available soon.
              </div>
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

export default Settings;
