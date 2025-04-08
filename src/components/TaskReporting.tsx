
import React, { useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

interface TaskReportingProps {
  dateRange: string;
}

export const TaskReporting: React.FC<TaskReportingProps> = ({ dateRange }) => {
  const { tasks } = useTaskContext();
  
  const dateRangeInDays = useMemo(() => {
    switch (dateRange) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  }, [dateRange]);

  const taskStats = useMemo(() => {
    const todo = tasks.filter(task => task.status === 'todo').length;
    const inProgress = tasks.filter(task => task.status === 'inProgress').length;
    const done = tasks.filter(task => task.status === 'done').length;
    const overdue = tasks.filter(task => 
      task.status !== 'done' && 
      task.dueDate && 
      new Date(task.dueDate) < new Date()
    ).length;
    
    return { todo, inProgress, done, overdue };
  }, [tasks]);

  const priorityData = useMemo(() => {
    const high = tasks.filter(task => task.priority === 'high').length;
    const medium = tasks.filter(task => task.priority === 'medium').length;
    const low = tasks.filter(task => task.priority === 'low').length;
    
    return [
      { name: 'High', value: high },
      { name: 'Medium', value: medium },
      { name: 'Low', value: low }
    ];
  }, [tasks]);

  const statusData = useMemo(() => {
    return [
      { name: 'To Do', value: taskStats.todo },
      { name: 'In Progress', value: taskStats.inProgress },
      { name: 'Done', value: taskStats.done }
    ];
  }, [taskStats]);

  const taskCompletionTrend = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, dateRangeInDays);
    
    const datesInterval = eachDayOfInterval({ 
      start: startDate, 
      end: today 
    });
    
    return datesInterval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dateStart = startOfDay(date).getTime();
      const dateEnd = startOfDay(date).getTime() + 86400000 - 1;
      
      const completedTasks = tasks.filter(task => {
        const taskUpdatedAt = task.updatedAt ? new Date(task.updatedAt).getTime() : 0;
        return task.status === 'done' && 
               taskUpdatedAt >= dateStart && 
               taskUpdatedAt <= dateEnd;
      }).length;
      
      return {
        date: format(date, 'MMM dd'),
        Tasks: completedTasks
      };
    });
  }, [tasks, dateRangeInDays]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{taskStats.done}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{taskStats.inProgress}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{taskStats.overdue}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Current status of all tasks</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
            <CardDescription>Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Completion Trend</CardTitle>
          <CardDescription>Number of tasks completed over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={taskCompletionTrend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Tasks" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
