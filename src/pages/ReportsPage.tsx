import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<string>('clients');
  const [dateRange, setDateRange] = useState<string>('30days');
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <DateRangeSelector 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Detailed reports on client activity and engagement coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Insights into task completion rates and timelines will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="finances" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Financial overviews and analytics to help manage your business finances coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
