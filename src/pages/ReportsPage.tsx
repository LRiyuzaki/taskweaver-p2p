
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  PieChart, 
  Users, 
  Calendar, 
  Clock,
  Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientReporting } from '@/components/ClientReporting';
import { TaskReporting } from '@/components/TaskReporting';
import { ComplianceReporting } from '@/components/ComplianceReporting';
import { useToast } from '@/hooks/use-toast';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [dateRange, setDateRange] = useState('month');
  const { toast } = useToast();

  const handleExportReport = () => {
    toast({
      title: "Report exported",
      description: "Your report has been exported successfully."
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold flex items-center">
              <BarChart3 className="mr-2 h-8 w-8" />
              Reports & Analytics
            </h1>
            
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="clients" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Client Reports
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Task Reports
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-1">
                <PieChart className="h-4 w-4" />
                Compliance Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-6">
              <ClientReporting dateRange={dateRange} />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <TaskReporting dateRange={dateRange} />
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <ComplianceReporting dateRange={dateRange} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
