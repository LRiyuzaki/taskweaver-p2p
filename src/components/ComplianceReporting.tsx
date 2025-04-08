
import React, { useMemo } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { format, addDays, isAfter, isBefore } from 'date-fns';

interface ComplianceReportingProps {
  dateRange: string;
}

export const ComplianceReporting: React.FC<ComplianceReportingProps> = ({ dateRange }) => {
  const { clients, getAvailableServiceNames } = useClientContext();
  const { tasks } = useTaskContext();

  // Sample compliance metrics - in a real app, this would use actual compliance data
  const complianceScores = useMemo(() => {
    // This would normally calculate real compliance metrics based on tasks, clients, etc.
    return [
      { name: 'Documentation', score: 85, fullMark: 100 },
      { name: 'Deadlines', score: 92, fullMark: 100 },
      { name: 'Regulatory', score: 78, fullMark: 100 },
      { name: 'Client Information', score: 95, fullMark: 100 },
      { name: 'Process Adherence', score: 88, fullMark: 100 },
    ];
  }, []);
  
  // Calculate upcoming compliance tasks
  const upcomingComplianceTasks = useMemo(() => {
    const today = new Date();
    const nextMonth = addDays(today, 30);
    
    return tasks.filter(task => {
      // Assume tasks with "compliance", "deadline", "regulatory" tags are compliance-related
      const isComplianceTask = task.tags.some(tag => 
        ['compliance', 'deadline', 'regulatory', 'filing'].includes(tag.toLowerCase())
      );
      
      const isDueSoon = task.dueDate && 
                        isAfter(new Date(task.dueDate), today) && 
                        isBefore(new Date(task.dueDate), nextMonth);
      
      return isComplianceTask && isDueSoon && task.status !== 'done';
    });
  }, [tasks]);

  // Service type compliance status
  const serviceComplianceData = useMemo(() => {
    const serviceNames = getAvailableServiceNames();
    
    return serviceNames.map(service => {
      // In a real app, this would calculate actual compliance metrics for each service
      // For now, we'll generate sample data
      const completionRate = Math.floor(Math.random() * 40) + 60; // Random between 60-100%
      
      return {
        name: service,
        complianceRate: completionRate,
      };
    }).filter(service => service.name !== '');
  }, [getAvailableServiceNames]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Risk categories (sample data)
  const riskData = [
    { name: 'Low Risk', value: clients.length * 0.6 },
    { name: 'Medium Risk', value: clients.length * 0.3 },
    { name: 'High Risk', value: clients.length * 0.1 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">87%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcomingComplianceTasks.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">High Risk Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Math.round(clients.length * 0.1)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Document Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">92%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Compliance by Service Type</CardTitle>
            <CardDescription>Compliance rates across different services</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceComplianceData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => [`${value}%`, 'Compliance Rate']} />
                <Legend />
                <Bar dataKey="complianceRate" fill="#8884d8" name="Compliance Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>Client distribution by risk category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Metrics</CardTitle>
          <CardDescription>Key compliance areas performance</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={150} data={complianceScores}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Compliance Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
