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
import { format, subDays, startOfDay, eachDayOfInterval, parseISO, startOfWeek, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns';

interface TaskReportingProps {
  dateRange: string;
  filters?: {
    employeeName: string;
    taskName: string;
    projectName: string;
  };
}

export const TaskReporting: React.FC<TaskReportingProps> = ({ 
  dateRange,
  filters = {
    employeeName: '',
    taskName: '',
    projectName: ''
  }
}) => {
  const { tasks } = useTaskContext();
  
  const dateRangeInDays = useMemo(() => {
    switch (dateRange) {
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      case 'thisMonth': return 30; // Approximate
      case 'lastMonth': return 30; // Approximate
      case 'thisYear': return 365; // Approximate
      default: return 30;
    }
  }, [dateRange]);

  // Get start date based on selected range
  const getStartDate = useMemo(() => {
    const now = new Date();
    
    switch (dateRange) {
      case '7days': 
        return subDays(now, 7);
      case '30days': 
        return subDays(now, 30);
      case '90days': 
        return subDays(now, 90);
      case 'thisMonth': 
        return startOfMonth(now);
      case 'lastMonth': 
        return startOfMonth(subMonths(now, 1));
      case 'thisYear': 
        return startOfYear(now);
      default: 
        return subDays(now, 30);
    }
  }, [dateRange]);

  // Filter tasks based on date range and other filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Apply date filter
      const taskCreatedAt = task.createdAt ? new Date(task.createdAt) : null;
      const isInDateRange = taskCreatedAt && taskCreatedAt >= getStartDate;
      
      // Apply other filters
      const matchesEmployee = !filters.employeeName || task.assigneeName === filters.employeeName;
      const matchesTaskName = !filters.taskName || 
        task.title.toLowerCase().includes(filters.taskName.toLowerCase());
      const matchesProject = !filters.projectName || task.projectName === filters.projectName;
      
      return isInDateRange && matchesEmployee && matchesTaskName && matchesProject;
    });
  }, [tasks, getStartDate, filters]);

  const taskStats = useMemo(() => {
    const todo = filteredTasks.filter(task => task.status === 'todo').length;
    const inProgress = filteredTasks.filter(task => task.status === 'inProgress').length;
    const done = filteredTasks.filter(task => task.status === 'done').length;
    const overdue = filteredTasks.filter(task => 
      task.status !== 'done' && 
      task.dueDate && 
      new Date(task.dueDate) < new Date()
    ).length;
    
    return { todo, inProgress, done, overdue };
  }, [filteredTasks]);

  const priorityData = useMemo(() => {
    const high = filteredTasks.filter(task => task.priority === 'high').length;
    const medium = filteredTasks.filter(task => task.priority === 'medium').length;
    const low = filteredTasks.filter(task => task.priority === 'low').length;
    
    return [
      { name: 'High', value: high },
      { name: 'Medium', value: medium },
      { name: 'Low', value: low }
    ];
  }, [filteredTasks]);

  const statusData = useMemo(() => {
    return [
      { name: 'To Do', value: taskStats.todo },
      { name: 'In Progress', value: taskStats.inProgress },
      { name: 'Done', value: taskStats.done }
    ];
  }, [taskStats]);

  const getCompletionRate = () => {
    if (filteredTasks.length === 0) return 0;
    const completed = filteredTasks.filter(task => task.status === 'done').length;
    return Math.round((completed / filteredTasks.length) * 100);
  };

  const getTasksByStatus = () => {
    return [
      { status: 'To Do', count: filteredTasks.filter(task => task.status === 'todo').length },
      { status: 'In Progress', count: filteredTasks.filter(task => task.status === 'in-progress').length },
      { status: 'Review', count: filteredTasks.filter(task => task.status === 'review').length },
      { status: 'Done', count: filteredTasks.filter(task => task.status === 'done').length }
    ];
  };

  // Group tasks by assignee (employee)
  const tasksByEmployee = useMemo(() => {
    const employeeMap: Record<string, number> = {};
    
    filteredTasks.forEach(task => {
      if (task.assigneeName) {
        employeeMap[task.assigneeName] = (employeeMap[task.assigneeName] || 0) + 1;
      }
    });
    
    return Object.entries(employeeMap).map(([name, count]) => ({
      name,
      tasks: count
    })).sort((a, b) => b.tasks - a.tasks).slice(0, 10); // Top 10
  }, [filteredTasks]);

  // Group tasks by project
  const tasksByProject = useMemo(() => {
    const projectMap: Record<string, number> = {};
    
    filteredTasks.forEach(task => {
      if (task.projectName) {
        projectMap[task.projectName] = (projectMap[task.projectName] || 0) + 1;
      }
    });
    
    return Object.entries(projectMap).map(([name, count]) => ({
      name,
      tasks: count
    })).sort((a, b) => b.tasks - a.tasks).slice(0, 5); // Top 5
  }, [filteredTasks]);

  const taskCompletionTrend = useMemo(() => {
    const today = new Date();
    const startDate = getStartDate;
    
    const datesInterval = eachDayOfInterval({ 
      start: startDate, 
      end: today 
    });
    
    return datesInterval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dateStart = startOfDay(date).getTime();
      const dateEnd = startOfDay(date).getTime() + 86400000 - 1;
      
      const completedTasks = filteredTasks.filter(task => {
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
  }, [filteredTasks, getStartDate]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Generate report title based on filters
  const getReportTitle = () => {
    let title = "Task Report";
    
    if (filters.employeeName) {
      title += ` for ${filters.employeeName}`;
    }
    
    if (filters.projectName) {
      title += ` on ${filters.projectName}`;
    }
    
    return title;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{getReportTitle()}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filteredTasks.length}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasksByEmployee.length > 0 && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Tasks by Employee</CardTitle>
              <CardDescription>Task distribution across team members</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tasksByEmployee}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#82ca9d" name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {tasksByProject.length > 0 && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Tasks by Project</CardTitle>
              <CardDescription>Task distribution across projects</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tasksByProject}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#8884d8" name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
