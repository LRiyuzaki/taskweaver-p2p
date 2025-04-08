
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { FileText, Users, AlertTriangle, BarChart3, Calendar, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast-extensions';

const ReportCard = ({ 
  title, 
  description, 
  icon,
  onGenerate,
  bgClass = "bg-blue-50" 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  onGenerate: () => void;
  bgClass?: string;
}) => {
  return (
    <Card className="h-full">
      <CardHeader className={`${bgClass} border-b`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {icon}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-6">
        <Button onClick={onGenerate} className="w-full">
          Generate Report
        </Button>
      </CardFooter>
    </Card>
  );
};

const ClientCard = ({ 
  client, 
  taskCount
}: { 
  client: any; 
  taskCount: number 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <h3 className="font-medium text-lg mb-2">{client.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{client.company}</p>
        
        <div className="flex justify-between items-center text-sm">
          <div>{taskCount} tasks</div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary flex items-center"
            onClick={() => navigate(`/client/${client.id}`)}
          >
            View <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ReportListPage = () => {
  const navigate = useNavigate();
  const { clients } = useClientContext();
  const { tasks } = useTaskContext();
  const [activeTab, setActiveTab] = useState('reports');
  
  const handleGenerateReport = (reportType: string) => {
    toast.success(`${reportType} report generating...`);
    // Simulate report generation
    setTimeout(() => {
      toast.success(`${reportType} report ready for download!`);
    }, 2000);
  };
  
  const getClientTaskCount = (clientId: string) => {
    return tasks.filter(task => task.clientId === clientId).length;
  };
  
  // Count upcoming deadlines within 7 days
  const upcomingDeadlines = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;
  
  // Count overdue tasks
  const overdueTasksCount = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  }).length;
  
  // Calculate completion rate
  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(task => task.status === 'done').length / tasks.length) * 100)
    : 0;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-2 h-8 w-8" /> 
            Reports
          </h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="reports">Standard Reports</TabsTrigger>
            <TabsTrigger value="client-reports">Client Reports</TabsTrigger>
            <TabsTrigger value="quick-reports">Quick Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ReportCard
                title="Task Status Report"
                description="Overview of all tasks by status and priority"
                icon={<FileText className="h-5 w-5" />}
                onGenerate={() => handleGenerateReport("Task Status")}
                bgClass="bg-blue-50"
              />
              
              <ReportCard
                title="Client Activity Report"
                description="Activity summary for all clients"
                icon={<Users className="h-5 w-5" />}
                onGenerate={() => handleGenerateReport("Client Activity")}
                bgClass="bg-green-50"
              />
              
              <ReportCard
                title="Compliance Status"
                description="Track compliance deadlines and status"
                icon={<AlertTriangle className="h-5 w-5" />}
                onGenerate={() => handleGenerateReport("Compliance Status")}
                bgClass="bg-purple-50"
              />
              
              <ReportCard
                title="Team Performance"
                description="Task completion rates and workload distribution"
                icon={<BarChart3 className="h-5 w-5" />}
                onGenerate={() => handleGenerateReport("Team Performance")}
                bgClass="bg-amber-50"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" /> 
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold mb-2">
                    {upcomingDeadlines}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tasks due in the next 7 days
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-red-500" /> 
                    Overdue Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold mb-2">
                    {overdueTasksCount}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tasks past their due date
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-500" /> 
                    Task Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold mb-2">
                    {completionRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Overall completion rate
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="client-reports">
            <h2 className="text-xl font-semibold mb-6">Client Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              {clients.slice(0, 6).map(client => (
                <ClientCard 
                  key={client.id} 
                  client={client} 
                  taskCount={getClientTaskCount(client.id)} 
                />
              ))}
            </div>
            
            {clients.length > 6 && (
              <div className="flex justify-center mt-6">
                <Button onClick={() => navigate('/client-management')}>
                  View All Clients
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="quick-reports">
            <h2 className="text-xl font-semibold mb-6">Quick Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="h-10 w-10 text-blue-500" />
                    <Badge variant="outline">Current Month</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Current Month</h3>
                  <p className="text-sm text-muted-foreground mb-4">Tasks for {format(new Date(), 'MMMM yyyy')}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleGenerateReport("Current Month")}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="h-10 w-10 text-green-500" />
                    <Badge variant="outline">Previous Month</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Previous Month</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tasks for {format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'MMMM yyyy')}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleGenerateReport("Previous Month")}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="h-10 w-10 text-purple-500" />
                    <Badge variant="outline">Last 30 Days</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Last 30 Days</h3>
                  <p className="text-sm text-muted-foreground mb-4">Rolling 30-day activity summary</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleGenerateReport("Last 30 Days")}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ReportListPage;
