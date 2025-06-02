
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { KPIDashboard } from '@/components/KPIDashboard';
import { TaskKanbanBoard } from '@/components/TaskKanbanBoard';
import { ClientDataTable } from '@/components/ClientDataTable';
import { ComplianceDashboardWidget } from '@/components/ComplianceDashboardWidget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';
import { useTaskContext } from '@/contexts/TaskContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const EnhancedDashboard = () => {
  const { addTask } = useTaskContext();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  
  const handleTaskFormSubmit = (formData: any) => {
    addTask(formData);
    setIsTaskDialogOpen(false);
    toast({
      title: "Task Created",
      description: "New task has been successfully created.",
    });
  };

  const handleRunAutomation = async () => {
    try {
      const response = await fetch('/functions/v1/daily-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Automation Completed",
          description: `Created ${result.results.serviceTasksCreated + result.results.complianceTasksCreated + result.results.recurringTasksCreated} new tasks`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Automation Failed",
        description: "Failed to run daily automation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Practice Management Dashboard</h1>
              <p className="text-muted-foreground">KPI-driven insights for your accounting practice</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleRunAutomation}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Automation
              </Button>
              <Button onClick={() => setIsTaskDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Task Board</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* KPI Dashboard */}
              <KPIDashboard />
              
              {/* Quick Overview Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Pipeline</CardTitle>
                      <CardDescription>Current task distribution across stages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TaskKanbanBoard />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <ComplianceDashboardWidget />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Management Board</CardTitle>
                  <CardDescription>Drag and drop tasks to update their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskKanbanBoard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-6">
              <ClientDataTable />
            </TabsContent>
            
            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComplianceDashboardWidget />
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Calendar</CardTitle>
                    <CardDescription>Upcoming compliance deadlines</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Compliance calendar view coming soon
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                    <CardDescription>Monthly revenue and profitability metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Revenue analytics dashboard coming soon
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance</CardTitle>
                    <CardDescription>Team productivity and utilization metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Team performance analytics coming soon
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Add a new task to your practice management system.
            </DialogDescription>
          </DialogHeader>
          <TaskForm onSubmit={handleTaskFormSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedDashboard;
