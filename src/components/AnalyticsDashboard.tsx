import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useTaskContext } from '@/contexts/TaskContext';
import { useClientContext } from '@/contexts/ClientContext';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  AlertCircle, 
  Calendar, 
  BarChart2,
  Calendar as CalendarIcon,
  User,
  ClipboardList
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export const AnalyticsDashboard = () => {
  const { tasks } = useTaskContext();
  const { clients } = useClientContext();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Count metrics
  const totalClients = clients.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const pendingTasks = tasks.filter(task => task.status === 'todo' || task.status === 'inProgress').length;
  
  // Calculate overdue tasks
  const overdueTasks = tasks.filter(task => 
    task.status !== 'done' && 
    task.dueDate && 
    new Date(task.dueDate) < new Date()
  );
  
  // Calculate tasks due this month
  const today = new Date();
  const startOfCurrentMonth = startOfMonth(today);
  const endOfCurrentMonth = endOfMonth(today);
  
  const tasksDueThisMonth = tasks.filter(task => 
    task.dueDate && 
    isWithinInterval(new Date(task.dueDate), {
      start: startOfCurrentMonth,
      end: endOfCurrentMonth
    })
  );
  
  // Calculate task status distribution for pie chart
  const statusCounts = {
    todo: tasks.filter(task => task.status === 'todo').length,
    inProgress: tasks.filter(task => task.status === 'inProgress').length,
    review: tasks.filter(task => task.status === 'review').length,
    done: tasks.filter(task => task.status === 'done').length,
  };
  
  const statusChartData = [
    { name: 'To Do', value: statusCounts.todo, color: '#f97316' },
    { name: 'In Progress', value: statusCounts.inProgress, color: '#3b82f6' },
    { name: 'Review', value: statusCounts.review, color: '#eab308' },
    { name: 'Completed', value: statusCounts.done, color: '#10b981' },
  ];
  
  // Calculate tasks by service type
  const serviceTaskCounts = {
    gst: tasks.filter(task => task.tags.includes('GST')).length,
    incomeTax: tasks.filter(task => task.tags.includes('Income Tax')).length,
    tds: tasks.filter(task => task.tags.includes('TDS')).length,
    audit: tasks.filter(task => task.tags.includes('Audit')).length,
    other: tasks.filter(task => 
      !task.tags.includes('GST') && 
      !task.tags.includes('Income Tax') && 
      !task.tags.includes('TDS') && 
      !task.tags.includes('Audit')
    ).length,
  };
  
  const serviceChartData = [
    { name: 'GST', tasks: serviceTaskCounts.gst },
    { name: 'Income Tax', tasks: serviceTaskCounts.incomeTax },
    { name: 'TDS', tasks: serviceTaskCounts.tds },
    { name: 'Audit', tasks: serviceTaskCounts.audit },
    { name: 'Other', tasks: serviceTaskCounts.other },
  ];
  
  // Generate monthly task data
  const getLastSixMonths = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        name: format(date, 'MMM'),
        completed: 0,
        added: 0,
      });
    }
    return months;
  };
  
  const monthlyTaskData = getLastSixMonths();
  
  // Fill in task data (this would normally come from real data)
  // For now, using random data for visualization
  for (let month of monthlyTaskData) {
    month.completed = Math.floor(Math.random() * 15) + 5;
    month.added = Math.floor(Math.random() * 20) + 10;
  }

  // Get recent tasks with full details for the task list
  const recentCompletedTasks = tasks
    .filter(task => task.status === 'done')
    .sort((a, b) => new Date(b.completedDate || 0).getTime() - new Date(a.completedDate || 0).getTime())
    .slice(0, 5);
  
  // Format time spent function
  const formatTimeSpent = (minutes?: number): string => {
    if (!minutes) return "0h";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Active client relationships
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksDueThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">
              Due in {format(today, 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedTasks / (completedTasks + pendingTasks || 1)) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card className={overdueTasks.length > 0 ? 'border-destructive/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className={`h-4 w-4 ${overdueTasks.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueTasks.length > 0 ? 'text-destructive' : ''}`}>
              {overdueTasks.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Current distribution of tasks by status</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [`${value} Tasks`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tasks by Service Type</CardTitle>
            <CardDescription>Distribution across service categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} Tasks`, 'Count']} />
                <Bar dataKey="tasks" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> 
            Recently Completed Tasks
          </CardTitle>
          <CardDescription>
            Details of recently completed tasks including client, service, time taken and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Date Started</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCompletedTasks.length > 0 ? (
                  recentCompletedTasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.clientName || 'N/A'}</TableCell>
                      <TableCell>
                        {task.serviceName || (task.tags.length > 0 ? task.tags[0] : 'N/A')}
                      </TableCell>
                      <TableCell>
                        {task.startedAt ? format(new Date(task.startedAt), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{task.assigneeName || 'Unassigned'}</TableCell>
                      <TableCell>{formatTimeSpent(task.timeSpentMinutes)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {task.comments || 'No comments'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No completed tasks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Six-Month Task Overview</CardTitle>
          <CardDescription>Task completion trends over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTaskData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="added" name="Tasks Added" fill="#82ca9d" />
              <Bar dataKey="completed" name="Tasks Completed" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
