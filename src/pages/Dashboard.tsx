
import React from 'react';
import { Header } from "@/components/Header";
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { useTaskContext } from '@/contexts/TaskContext';
import { useClientContext } from '@/contexts/ClientContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskListView } from '@/components/TaskListView';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, ClipboardList, AlertCircle, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';
import { useNavigate } from 'react-router-dom';
import { ClientList } from '@/components/ClientList';

const Dashboard = () => {
  const { tasks, addTask } = useTaskContext();
  const { clients } = useClientContext();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  
  // Get upcoming deadlines (due in the next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const upcomingDeadlines = tasks
    .filter(task => 
      task.status !== 'done' && 
      task.dueDate && 
      new Date(task.dueDate) > today && 
      new Date(task.dueDate) < nextWeek
    )
    .sort((a, b) => 
      a.dueDate && b.dueDate ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : 0
    );
  
  // Get overdue tasks
  const overdueTasks = tasks
    .filter(task => 
      task.status !== 'done' && 
      task.dueDate && 
      new Date(task.dueDate) < today
    )
    .sort((a, b) => 
      a.dueDate && b.dueDate ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : 0
    );
  
  // Get recent clients
  const recentClients = [...clients]
    .sort((a, b) => {
      if (a.startDate && b.startDate) {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      return 0;
    })
    .slice(0, 5);
  
  const handleTaskFormSubmit = (formData: any) => {
    addTask(formData);
    setIsTaskDialogOpen(false);
  };
  
  const handleTaskView = (taskId: string) => {
    // If the task has a clientId, navigate to that client's page
    const task = tasks.find(t => t.id === taskId);
    if (task && task.clientId) {
      navigate(`/client/${task.clientId}`);
    }
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button onClick={() => setIsTaskDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <AnalyticsDashboard />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Upcoming Deadlines
                    </CardTitle>
                    <CardDescription>Tasks due in the next 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingDeadlines.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingDeadlines.slice(0, 5).map(task => (
                          <div key={task.id} className="flex justify-between items-center p-3 border rounded-md">
                            <div>
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTaskView(task.id)}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                        
                        {upcomingDeadlines.length > 5 && (
                          <Button variant="link" className="w-full" onClick={() => document.querySelector('[data-value="tasks"]')?.click()}>
                            View all ({upcomingDeadlines.length})
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No upcoming deadlines</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card className={overdueTasks.length > 0 ? "col-span-1 border-destructive/30" : "col-span-1"}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className={`h-5 w-5 mr-2 ${overdueTasks.length > 0 ? "text-destructive" : ""}`} />
                      Overdue Tasks
                    </CardTitle>
                    <CardDescription>Tasks past their due date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overdueTasks.length > 0 ? (
                      <div className="space-y-4">
                        {overdueTasks.slice(0, 5).map(task => (
                          <div key={task.id} className="flex justify-between items-center p-3 border border-destructive/30 rounded-md">
                            <div>
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-destructive">
                                Due {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTaskView(task.id)}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                        
                        {overdueTasks.length > 5 && (
                          <Button variant="link" className="w-full" onClick={() => document.querySelector('[data-value="tasks"]')?.click()}>
                            View all ({overdueTasks.length})
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No overdue tasks</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Recent Clients
                    </CardTitle>
                    <CardDescription>Recently added or updated clients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentClients.length > 0 ? (
                      <div className="space-y-4">
                        {recentClients.map(client => (
                          <div key={client.id} className="flex justify-between items-center p-3 border rounded-md">
                            <div>
                              <h4 className="font-medium">{client.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {client.contactPerson || client.email}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/client/${client.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                        
                        <Button variant="link" className="w-full" onClick={() => navigate('/client-management')}>
                          View all clients
                        </Button>
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No clients found</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2" />
                    All Tasks
                  </CardTitle>
                  <CardDescription>Manage and track all your tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskListView />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    All Clients
                  </CardTitle>
                  <CardDescription>View and manage all clients</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ClientList 
                    clients={clients}
                    onClientClick={(id) => navigate(`/client/${id}`)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>View tasks and deadlines on a calendar</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[500px]">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Calendar view coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Add a new task to your board.
            </DialogDescription>
          </DialogHeader>
          <TaskForm onSubmit={handleTaskFormSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
