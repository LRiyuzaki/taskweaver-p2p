import React, { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTaskContext } from "@/contexts/TaskContext";
import { useDatabaseContext } from "@/contexts/DatabaseContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, Users, Calendar, Plus, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ClientForm } from "@/components/ClientForm";
import { TaskListView } from "@/components/TaskListView";
import { TaskForm } from "@/components/TaskForm";
import { toast } from "@/hooks/use-toast";

const ClientManagement = () => {
  const { tasks, addTask, updateTask } = useTaskContext();
  const { tables, createTable, addField, addRow, updateRow } = useDatabaseContext();
  
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  
  useEffect(() => {
    const clientTable = tables.find(table => table.name === "Clients");
    
    if (!clientTable) {
      createTable({ 
        name: "Clients",
        icon: "users",
        color: "#4f46e5" 
      });
    }
  }, [tables, createTable]);
  
  useEffect(() => {
    const clientTable = tables.find(table => table.name === "Clients");
    
    if (clientTable) {
      const requiredFields = [
        { name: "Email", type: "email" as const },
        { name: "Phone", type: "phone" as const },
        { name: "Address", type: "text" as const },
        { name: "Start Date", type: "date" as const },
        { name: "GST Required", type: "checkbox" as const },
        { name: "Income Tax Required", type: "checkbox" as const },
        { name: "TDS Required", type: "checkbox" as const },
        { name: "Account Audit Required", type: "checkbox" as const }
      ];
      
      for (const field of requiredFields) {
        const fieldExists = clientTable.fields.some(f => f.name === field.name);
        if (!fieldExists) {
          addField(clientTable.id, field);
        }
      }
    }
  }, [tables, addField]);
  
  const clientTable = tables.find(table => table.name === "Clients");
  const clients = clientTable ? clientTable.fields.length > 0 ? clientTable.rows : [] : [];
  
  const getClientNameById = (clientId: string) => {
    if (!clientTable) return "Unknown Client";
    
    const client = clientTable.rows.find(row => row.id === clientId);
    if (!client) return "Unknown Client";
    
    const nameFieldId = clientTable.fields[0].id;
    return client[nameFieldId] || "Unnamed Client";
  };
  
  const getClientTasks = (clientId: string) => {
    return tasks.filter(task => task.clientId === clientId);
  };

  const getClientTaskStats = (clientId: string) => {
    const clientTasks = getClientTasks(clientId);
    
    return {
      total: clientTasks.length,
      pending: clientTasks.filter(t => t.status === 'todo').length,
      inProgress: clientTasks.filter(t => t.status === 'inProgress').length,
      completed: clientTasks.filter(t => t.status === 'done').length,
      upcoming: clientTasks.filter(t => 
        t.dueDate && t.dueDate > new Date() && t.status !== 'done'
      ).length,
      overdue: clientTasks.filter(t => 
        t.dueDate && t.dueDate < new Date() && t.status !== 'done'
      ).length
    };
  };
  
  const handleClientSubmit = (clientData: any) => {
    if (!clientTable) return;
    
    addRow(clientTable.id, clientData);
    setClientDialogOpen(false);
    
    const newClient = clientTable.rows[clientTable.rows.length - 1];
    
    const gstFieldId = clientTable.fields.find(f => f.name === "GST Required")?.id;
    const incomeTaxFieldId = clientTable.fields.find(f => f.name === "Income Tax Required")?.id;
    const tdsFieldId = clientTable.fields.find(f => f.name === "TDS Required")?.id;
    const auditFieldId = clientTable.fields.find(f => f.name === "Account Audit Required")?.id;
    
    if (gstFieldId && newClient[gstFieldId]) {
      addTask({
        title: "GST Filing",
        description: `Monthly GST filing for ${getClientNameById(newClient.id)}`,
        status: "todo",
        priority: "medium",
        tags: ["GST", "Monthly"],
        clientId: newClient.id,
        recurrence: "monthly",
        dueDate: new Date(new Date().setDate(15)),
      });
    }
    
    if (incomeTaxFieldId && newClient[incomeTaxFieldId]) {
      addTask({
        title: "Income Tax Filing",
        description: `Yearly income tax filing for ${getClientNameById(newClient.id)}`,
        status: "todo",
        priority: "high",
        tags: ["Income Tax", "Yearly"],
        clientId: newClient.id,
        recurrence: "yearly",
        dueDate: new Date(new Date().getFullYear(), 6, 31),
      });
    }
    
    if (tdsFieldId && newClient[tdsFieldId]) {
      addTask({
        title: "TDS Filing",
        description: `Quarterly TDS filing for ${getClientNameById(newClient.id)}`,
        status: "todo",
        priority: "medium",
        tags: ["TDS", "Quarterly"],
        clientId: newClient.id,
        recurrence: "quarterly",
        dueDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 2, 7),
      });
    }
    
    if (auditFieldId && newClient[auditFieldId]) {
      addTask({
        title: "Account Audit",
        description: `Yearly account audit for ${getClientNameById(newClient.id)}`,
        status: "todo",
        priority: "high",
        tags: ["Audit", "Yearly"],
        clientId: newClient.id,
        recurrence: "yearly",
        dueDate: new Date(new Date().getFullYear(), 8, 30),
      });
    }
    
    toast({
      title: "Client Added",
      description: "Client added successfully with initial tasks created."
    });
  };
  
  const handleTaskSubmit = (taskData: any) => {
    if (selectedClient) {
      addTask({
        ...taskData,
        clientId: selectedClient.id
      });
      setTaskDialogOpen(false);
    }
  };
  
  if (!clientTable) {
    return <div>Loading client management system...</div>;
  }
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Client Management</h1>
          <Button onClick={() => setClientDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
        
        <Tabs defaultValue="clients">
          <TabsList className="mb-4">
            <TabsTrigger value="clients">
              <Users className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <FileText className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              <Calendar className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Task Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length > 0 ? (
                    clients.map(client => {
                      const nameFieldId = clientTable.fields[0].id;
                      const emailFieldId = clientTable.fields.find(f => f.name === "Email")?.id;
                      const startDateFieldId = clientTable.fields.find(f => f.name === "Start Date")?.id;
                      const gstFieldId = clientTable.fields.find(f => f.name === "GST Required")?.id;
                      const incomeTaxFieldId = clientTable.fields.find(f => f.name === "Income Tax Required")?.id;
                      const tdsFieldId = clientTable.fields.find(f => f.name === "TDS Required")?.id;
                      const auditFieldId = clientTable.fields.find(f => f.name === "Account Audit Required")?.id;
                      
                      const taskStats = getClientTaskStats(client.id);
                      
                      return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client[nameFieldId]}</TableCell>
                          <TableCell>{emailFieldId ? client[emailFieldId] : "N/A"}</TableCell>
                          <TableCell>
                            {startDateFieldId && client[startDateFieldId] 
                              ? format(new Date(client[startDateFieldId]), "MMM d, yyyy") 
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {gstFieldId && client[gstFieldId] && <Badge>GST</Badge>}
                              {incomeTaxFieldId && client[incomeTaxFieldId] && <Badge>Income Tax</Badge>}
                              {tdsFieldId && client[tdsFieldId] && <Badge>TDS</Badge>}
                              {auditFieldId && client[auditFieldId] && <Badge>Audit</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{taskStats.total} tasks</span>
                              {taskStats.overdue > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {taskStats.overdue} overdue
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedClient(client);
                                  setTaskDialogOpen(true);
                                }}
                              >
                                Add Task
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedClient(client);
                                  const tabsElement = document.querySelector('[data-value="tasks"]') as HTMLElement;
                                  if (tabsElement) tabsElement.click();
                                }}
                              >
                                View Tasks
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No clients yet. Add your first client.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks">
            {selectedClient ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Tasks for {getClientNameById(selectedClient.id)}
                  </h2>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedClient(null)}
                  >
                    View All Tasks
                  </Button>
                </div>
                
                <TaskListView 
                  filterClient={selectedClient.id}
                />
              </div>
            ) : (
              <TaskListView />
            )}
          </TabsContent>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    <Check className="h-4 w-4 inline mr-2" />
                    Completed Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => t.status === 'done').length}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    <Clock className="h-4 w-4 inline mr-2" />
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => t.status === 'inProgress').length}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    Overdue Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-500">
                    {tasks.filter(t => 
                      t.dueDate && t.dueDate < new Date() && t.status !== 'done'
                    ).length}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>Tasks due in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks
                      .filter(t => 
                        t.dueDate && 
                        t.dueDate > new Date() && 
                        t.dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                        t.status !== 'done'
                      )
                      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
                      .slice(0, 5)
                      .map(task => (
                        <div key={task.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {task.clientId ? getClientNameById(task.clientId) : 'No client'} • 
                              Due {task.dueDate ? format(task.dueDate, "MMM d, yyyy") : 'No date'}
                            </p>
                          </div>
                          <Badge className={
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }>
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    
                    {tasks.filter(t => 
                      t.dueDate && 
                      t.dueDate > new Date() && 
                      t.dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                      t.status !== 'done'
                    ).length === 0 && (
                      <p className="text-center py-4 text-muted-foreground">No upcoming deadlines</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Client Status</CardTitle>
                  <CardDescription>Overview of client task status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clients.slice(0, 5).map(client => {
                      const stats = getClientTaskStats(client.id);
                      const nameFieldId = clientTable.fields[0].id;
                      
                      return (
                        <div key={client.id} className="p-3 border rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">{client[nameFieldId]}</h3>
                            <span className="text-xs">
                              {stats.total} tasks • {stats.completed} completed
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ 
                                width: stats.total > 0 
                                  ? `${(stats.completed / stats.total) * 100}%` 
                                  : '0%' 
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {clients.length === 0 && (
                      <p className="text-center py-4 text-muted-foreground">No clients yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientForm onSubmit={handleClientSubmit} fields={clientTable.fields} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedClient 
                ? `Add Task for ${getClientNameById(selectedClient.id)}` 
                : 'Add Task'}
            </DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={handleTaskSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagement;
