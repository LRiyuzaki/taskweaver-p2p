
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { useTaskContext } from '@/contexts/TaskContext';
import { useClientContext } from '@/contexts/ClientContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, PieChart, Calendar, FileText, Users, Clock, ArrowDownToLine, Activity } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, getMonth, getYear } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { TaskReport } from '@/types/task';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart as ReChartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as ReChartsLineChart,
  Line,
  PieChart as ReChartsPieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ReportsPage = () => {
  const { tasks, projects, getTaskProgress, getTasksByMonth, getTasksByProject, getTasksByClient, getActivityLogs } = useTaskContext();
  const { clients } = useClientContext();
  
  // State for filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  
  // Get the current date for reference
  const currentDate = new Date();
  
  // Calculate available years for reporting (current year and 2 previous years)
  const availableYears = [currentDate.getFullYear(), currentDate.getFullYear() - 1, currentDate.getFullYear() - 2];
  
  // Calculate task summary
  const calculateTaskSummary = (): TaskReport => {
    const summary: TaskReport = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      pendingTasks: tasks.filter(t => t.status !== 'done').length,
      overdueCount: tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < currentDate).length,
      upcomingCount: tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) > currentDate).length,
      byAssignee: {},
      byClient: {}
    };
    
    // Group by assignee
    tasks.forEach(task => {
      if (task.assignedTo) {
        if (!summary.byAssignee[task.assignedTo]) {
          summary.byAssignee[task.assignedTo] = { assigned: 0, completed: 0 };
        }
        summary.byAssignee[task.assignedTo].assigned++;
        if (task.status === 'done') {
          summary.byAssignee[task.assignedTo].completed++;
        }
      }
    });
    
    // Group by client
    tasks.forEach(task => {
      if (task.clientId) {
        if (!summary.byClient[task.clientId]) {
          summary.byClient[task.clientId] = { total: 0, completed: 0, pending: 0 };
        }
        summary.byClient[task.clientId].total++;
        if (task.status === 'done') {
          summary.byClient[task.clientId].completed++;
        } else {
          summary.byClient[task.clientId].pending++;
        }
      }
    });
    
    return summary;
  };
  
  const taskSummary = calculateTaskSummary();
  
  // Get filtered tasks by month
  const filteredTasksByMonth = getTasksByMonth(selectedYear, selectedMonth);
  
  // Get filtered tasks by project
  const filteredTasksByProject = selectedProject === "all" 
    ? tasks 
    : getTasksByProject(selectedProject);
  
  // Get filtered tasks by client
  const filteredTasksByClient = selectedClient === "all" 
    ? tasks 
    : getTasksByClient(selectedClient);
  
  // Calculate monthly task data for the last 6 months
  const getMonthlyTaskData = () => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const year = getYear(date);
      const month = getMonth(date);
      const monthTasks = getTasksByMonth(year, month);
      
      data.push({
        name: format(date, 'MMM yyyy'),
        total: monthTasks.length,
        completed: monthTasks.filter(t => t.status === 'done').length,
        inProgress: monthTasks.filter(t => t.status === 'inProgress').length,
        todo: monthTasks.filter(t => t.status === 'todo').length
      });
    }
    
    return data;
  };
  
  const monthlyTaskData = getMonthlyTaskData();
  
  // Calculate task status distribution for pie chart
  const taskStatusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'inProgress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length }
  ];
  
  // Calculate project distribution
  const projectDistribution = projects.map(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    return {
      name: project.name,
      total: projectTasks.length,
      completed: projectTasks.filter(t => t.status === 'done').length
    };
  });
  
  // Calculate client distribution
  const clientDistribution = clients.map(client => {
    const clientTasks = tasks.filter(t => t.clientId === client.id);
    return {
      name: client.name,
      total: clientTasks.length,
      completed: clientTasks.filter(t => t.status === 'done').length
    };
  });
  
  // Get activity logs
  const activityLogs = getActivityLogs();
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4" />
              Export Reports
            </Button>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Monthly
              </TabsTrigger>
              <TabsTrigger value="project" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                By Project
              </TabsTrigger>
              <TabsTrigger value="client" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                By Client
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity Log
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Task Summary</CardTitle>
                    <CardDescription>Overall task statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Total Tasks</span>
                          <span className="font-medium">{taskSummary.totalTasks}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Completed</span>
                          <span className="font-medium text-green-600">{taskSummary.completedTasks}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pending</span>
                          <span className="font-medium text-amber-600">{taskSummary.pendingTasks}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Overdue</span>
                          <span className="font-medium text-red-600">{taskSummary.overdueCount}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="text-sm font-medium mb-1">Completion Rate</div>
                        <Progress 
                          value={taskSummary.totalTasks ? (taskSummary.completedTasks / taskSummary.totalTasks) * 100 : 0} 
                          className="h-2" 
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {taskSummary.totalTasks ? Math.round((taskSummary.completedTasks / taskSummary.totalTasks) * 100) : 0}% Complete
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Task Trend</CardTitle>
                    <CardDescription>Last 6 months task activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReChartsBarChart data={monthlyTaskData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" fill="#22c55e" stackId="a" name="Completed" />
                          <Bar dataKey="inProgress" fill="#f59e0b" stackId="a" name="In Progress" />
                          <Bar dataKey="todo" fill="#3b82f6" stackId="a" name="To Do" />
                        </ReChartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Task Status Distribution</CardTitle>
                    <CardDescription>Current task status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex justify-center">
                      <ResponsiveContainer width="70%" height="100%">
                        <ReChartsPieChart>
                          <Pie
                            data={taskStatusData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {taskStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </ReChartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Tasks by Project</CardTitle>
                    <CardDescription>Project distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReChartsBarChart data={projectDistribution} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" fill="#3b82f6" name="Total Tasks" />
                          <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                        </ReChartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Task Report</CardTitle>
                  <CardDescription>
                    View tasks for a specific month
                  </CardDescription>
                  <div className="flex gap-4 pt-2">
                    <div className="w-[180px]">
                      <Select 
                        value={selectedYear.toString()} 
                        onValueChange={(value) => setSelectedYear(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-[180px]">
                      <Select 
                        value={selectedMonth.toString()} 
                        onValueChange={(value) => setSelectedMonth(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredTasksByMonth.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Total Tasks</div>
                          <div className="text-2xl font-bold">{filteredTasksByMonth.length}</div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Completed</div>
                          <div className="text-2xl font-bold text-green-600">
                            {filteredTasksByMonth.filter(t => t.status === 'done').length}
                          </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Completion Rate</div>
                          <div className="text-2xl font-bold">
                            {filteredTasksByMonth.length > 0 
                              ? `${Math.round((filteredTasksByMonth.filter(t => t.status === 'done').length / filteredTasksByMonth.length) * 100)}%`
                              : '0%'}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Tasks in {MONTHS[selectedMonth]} {selectedYear}</h3>
                        <div className="border rounded-md divide-y">
                          {filteredTasksByMonth.map(task => (
                            <div key={task.id} className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{task.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {task.dueDate && format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                    {task.clientName && ` • ${task.clientName}`}
                                  </p>
                                </div>
                                <div className={`text-sm px-2 py-1 rounded-full ${
                                  task.status === 'done' 
                                    ? 'bg-green-100 text-green-800' 
                                    : task.status === 'inProgress' 
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {task.status === 'todo' 
                                    ? 'To Do' 
                                    : task.status === 'inProgress' 
                                      ? 'In Progress' 
                                      : 'Done'}
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <div className="text-xs text-muted-foreground mb-1">Progress</div>
                                <Progress value={getTaskProgress(task.id)} className="h-1.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No tasks found for {MONTHS[selectedMonth]} {selectedYear}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="project" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Reports</CardTitle>
                  <CardDescription>
                    View task distribution by project
                  </CardDescription>
                  <div className="w-[300px] pt-2">
                    <Select 
                      value={selectedProject} 
                      onValueChange={setSelectedProject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {projects.length > 0 ? (
                    <div className="space-y-6">
                      {selectedProject === "all" ? (
                        <>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <ReChartsBarChart data={projectDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#3b82f6" name="Total Tasks" />
                                <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                              </ReChartsBarChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="border rounded-md overflow-hidden">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-muted/50">
                                  <th className="text-left p-3">Project</th>
                                  <th className="text-center p-3">Total Tasks</th>
                                  <th className="text-center p-3">Completed</th>
                                  <th className="text-center p-3">Completion Rate</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {projects.map(project => {
                                  const projectTasks = tasks.filter(t => t.projectId === project.id);
                                  const completedTasks = projectTasks.filter(t => t.status === 'done');
                                  const completionRate = projectTasks.length > 0 
                                    ? Math.round((completedTasks.length / projectTasks.length) * 100) 
                                    : 0;
                                  
                                  return (
                                    <tr key={project.id}>
                                      <td className="p-3">{project.name}</td>
                                      <td className="text-center p-3">{projectTasks.length}</td>
                                      <td className="text-center p-3">{completedTasks.length}</td>
                                      <td className="text-center p-3">
                                        <div className="flex items-center justify-center">
                                          <span className="mr-2">{completionRate}%</span>
                                          <div className="w-20">
                                            <Progress value={completionRate} className="h-1.5" />
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        // Selected specific project
                        <div className="space-y-6">
                          {filteredTasksByProject.length > 0 ? (
                            <>
                              <div className="grid grid-cols-3 gap-6">
                                <div className="bg-muted/30 rounded-lg p-4">
                                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                                  <div className="text-2xl font-bold">{filteredTasksByProject.length}</div>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-4">
                                  <div className="text-sm text-muted-foreground">Completed</div>
                                  <div className="text-2xl font-bold text-green-600">
                                    {filteredTasksByProject.filter(t => t.status === 'done').length}
                                  </div>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-4">
                                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                                  <div className="text-2xl font-bold">
                                    {filteredTasksByProject.length > 0 
                                      ? `${Math.round((filteredTasksByProject.filter(t => t.status === 'done').length / filteredTasksByProject.length) * 100)}%`
                                      : '0%'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-md divide-y">
                                {filteredTasksByProject.map(task => (
                                  <div key={task.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h4 className="font-medium">{task.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {task.dueDate && format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                          {task.clientName && ` • ${task.clientName}`}
                                          {task.assigneeName && ` • Assigned to: ${task.assigneeName}`}
                                        </p>
                                      </div>
                                      <div className={`text-sm px-2 py-1 rounded-full ${
                                        task.status === 'done' 
                                          ? 'bg-green-100 text-green-800' 
                                          : task.status === 'inProgress' 
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {task.status === 'todo' 
                                          ? 'To Do' 
                                          : task.status === 'inProgress' 
                                            ? 'In Progress' 
                                            : 'Done'}
                                      </div>
                                    </div>
                                    
                                    <div className="mt-2">
                                      <div className="text-xs text-muted-foreground mb-1">Progress</div>
                                      <Progress value={getTaskProgress(task.id)} className="h-1.5" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-12">
                              <p className="text-muted-foreground">No tasks found for the selected project</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No projects have been created yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="client" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Reports</CardTitle>
                  <CardDescription>
                    View task distribution by client
                  </CardDescription>
                  <div className="w-[300px] pt-2">
                    <Select 
                      value={selectedClient} 
                      onValueChange={setSelectedClient}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {clients.length > 0 ? (
                    <div className="space-y-6">
                      {selectedClient === "all" ? (
                        <>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <ReChartsBarChart data={clientDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#3b82f6" name="Total Tasks" />
                                <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                              </ReChartsBarChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="border rounded-md overflow-hidden">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-muted/50">
                                  <th className="text-left p-3">Client</th>
                                  <th className="text-center p-3">Total Tasks</th>
                                  <th className="text-center p-3">Completed</th>
                                  <th className="text-center p-3">Completion Rate</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {clients.map(client => {
                                  const clientTasks = tasks.filter(t => t.clientId === client.id);
                                  const completedTasks = clientTasks.filter(t => t.status === 'done');
                                  const completionRate = clientTasks.length > 0 
                                    ? Math.round((completedTasks.length / clientTasks.length) * 100) 
                                    : 0;
                                  
                                  return (
                                    <tr key={client.id}>
                                      <td className="p-3">{client.name}</td>
                                      <td className="text-center p-3">{clientTasks.length}</td>
                                      <td className="text-center p-3">{completedTasks.length}</td>
                                      <td className="text-center p-3">
                                        <div className="flex items-center justify-center">
                                          <span className="mr-2">{completionRate}%</span>
                                          <div className="w-20">
                                            <Progress value={completionRate} className="h-1.5" />
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        // Selected specific client
                        <div className="space-y-6">
                          {filteredTasksByClient.length > 0 ? (
                            <>
                              <div className="grid grid-cols-3 gap-6">
                                <div className="bg-muted/30 rounded-lg p-4">
                                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                                  <div className="text-2xl font-bold">{filteredTasksByClient.length}</div>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-4">
                                  <div className="text-sm text-muted-foreground">Completed</div>
                                  <div className="text-2xl font-bold text-green-600">
                                    {filteredTasksByClient.filter(t => t.status === 'done').length}
                                  </div>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-4">
                                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                                  <div className="text-2xl font-bold">
                                    {filteredTasksByClient.length > 0 
                                      ? `${Math.round((filteredTasksByClient.filter(t => t.status === 'done').length / filteredTasksByClient.length) * 100)}%`
                                      : '0%'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-md divide-y">
                                {filteredTasksByClient.map(task => (
                                  <div key={task.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h4 className="font-medium">{task.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {task.dueDate && format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                          {task.projectName && ` • ${task.projectName}`}
                                          {task.assigneeName && ` • Assigned to: ${task.assigneeName}`}
                                        </p>
                                      </div>
                                      <div className={`text-sm px-2 py-1 rounded-full ${
                                        task.status === 'done' 
                                          ? 'bg-green-100 text-green-800' 
                                          : task.status === 'inProgress' 
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {task.status === 'todo' 
                                          ? 'To Do' 
                                          : task.status === 'inProgress' 
                                            ? 'In Progress' 
                                            : 'Done'}
                                      </div>
                                    </div>
                                    
                                    <div className="mt-2">
                                      <div className="text-xs text-muted-foreground mb-1">Progress</div>
                                      <Progress value={getTaskProgress(task.id)} className="h-1.5" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-12">
                              <p className="text-muted-foreground">No tasks found for the selected client</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No clients have been added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>
                    Recent activity in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    {activityLogs.length > 0 ? (
                      <div className="space-y-1">
                        {activityLogs.map((log, index) => (
                          <div key={index} className="flex items-start py-3">
                            <div className="flex-shrink-0 w-12 text-xs text-muted-foreground">
                              {format(new Date(log.date), 'HH:mm')}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{log.action}</div>
                              <div className="text-sm text-muted-foreground">{log.details}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {format(new Date(log.date), 'dd MMM yyyy')}
                              </div>
                            </div>
                            <Separator className="my-2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No activity logs found</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
