
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskReporting } from '@/components/TaskReporting';
import { ClientReporting } from '@/components/ClientReporting';
import { ComplianceReporting } from '@/components/ComplianceReporting';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  Filter
} from "lucide-react";
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';
import { ReportFilters } from '@/components/reports/ReportFilters';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('tasks');
  const [filters, setFilters] = useState({
    employeeName: '',
    taskName: '',
    projectName: ''
  });

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0 flex items-center">
            <FileText className="mr-2 h-8 w-8" /> 
            Reports
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <DateRangeSelector 
              dateRange={dateRange} 
              onDateRangeChange={handleDateRangeChange}
            />
            
            <ReportFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Task Reports
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Client Reports
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Compliance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="space-y-8">
            <TaskReporting 
              dateRange={dateRange} 
              filters={filters} 
            />
          </TabsContent>
          
          <TabsContent value="clients" className="space-y-8">
            <ClientReporting dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="compliance" className="space-y-8">
            <ComplianceReporting />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ReportsPage;
