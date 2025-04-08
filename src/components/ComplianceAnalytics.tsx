import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from 'recharts';

export const ComplianceAnalytics = () => {
  const { clients } = useClientContext();
  const { tasks } = useTaskContext();

  // Generate last 6 months of compliance data
  const getComplianceHistory = () => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthTasks = tasks.filter(task => {
        const taskDate = task.dueDate ? new Date(task.dueDate) : null;
        return taskDate && 
               taskDate >= monthStart && 
               taskDate <= monthEnd && 
               (task.tags.includes('GST') || task.tags.includes('TDS'));
      });

      const completedOnTime = monthTasks.filter(task => 
        task.status === 'done' && 
        task.completedDate && 
        new Date(task.completedDate) <= new Date(task.dueDate!)
      ).length;

      const compliance = monthTasks.length > 0 
        ? (completedOnTime / monthTasks.length) * 100 
        : 100;

      return {
        month: format(date, 'MMM yy'),
        compliance: Math.round(compliance),
        total: monthTasks.length,
        completed: completedOnTime,
        late: monthTasks.length - completedOnTime
      };
    }).reverse();

    return months;
  };

  // Calculate entity-wise compliance
  const getEntityCompliance = () => {
    const entityTypes = ['Company', 'LLP', 'Partnership', 'Proprietorship', 'Trust', 'HUF'];
    
    return entityTypes.map(type => {
      const typeClients = clients.filter(c => c.entityType === type);
      const totalClients = typeClients.length;
      
      if (totalClients === 0) return null;

      const withGST = typeClients.filter(c => c.isGSTRegistered).length;
      const withPAN = typeClients.filter(c => c.pan).length;
      const withTAN = typeClients.filter(c => c.tan).length;
      const withRequiredDocs = typeClients.filter(c => {
        if (type === 'Company') return c.cin;
        if (type === 'LLP') return c.llpin;
        return true;
      }).length;

      const complianceScore = Math.round(
        ((withGST + withPAN + withTAN + withRequiredDocs) / (totalClients * 4)) * 100
      );

      return {
        entityType: type,
        clients: totalClients,
        compliance: complianceScore
      };
    }).filter(Boolean);
  };

  const complianceHistory = getComplianceHistory();
  const entityCompliance = getEntityCompliance();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Compliance Rate</CardTitle>
          <CardDescription>
            Percentage of statutory filings completed on time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complianceHistory}>
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="compliance" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  dot={{ fill: '#0ea5e9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Filing Distribution</CardTitle>
            <CardDescription>
              Monthly breakdown of on-time vs late filings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complianceHistory}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" name="On Time" />
                  <Bar dataKey="late" stackId="a" fill="#ef4444" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entity-wise Compliance</CardTitle>
            <CardDescription>
              Compliance score by entity type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entityCompliance} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="entityType" />
                  <Tooltip />
                  <Bar 
                    dataKey="compliance" 
                    fill="#0ea5e9"
                    label={{ position: 'right', fill: '#666' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};