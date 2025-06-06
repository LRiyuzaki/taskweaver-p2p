
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskReporting } from "@/components/TaskReporting";
import { ClientReporting } from "@/components/ClientReporting";
import { ComplianceReporting } from "@/components/ComplianceReporting";

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('last-30-days');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compliance" className="space-y-4">
          <ComplianceReporting />
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <TaskReporting 
            dateRange={dateRange}
            filters={{
              employeeName: '',
              taskName: '',
              projectName: ''
            }}
          />
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-4">
          <ClientReporting dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
