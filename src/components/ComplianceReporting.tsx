import React, { useState, useEffect } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { ComplianceStatus } from '@/types/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

const mockComplianceData = [
  {
    type: 'GST Filing',
    status: 'current' as const,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description: 'Monthly GST return due in 7 days',
    missingDocuments: ['Purchase invoices', 'Sales register']
  },
  {
    type: 'Income Tax',
    status: 'upcoming' as const,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    description: 'Annual income tax return due in 30 days',
    missingDocuments: ['Form 16', 'Investment proofs']
  },
  {
    type: 'TDS Filing',
    status: 'overdue' as const,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    description: 'TDS return was due 2 days ago',
    missingDocuments: []
  }
];

export const ComplianceReporting: React.FC = () => {
  const { clients } = useClientContext();
  const { tasks } = useTaskContext();
  const [complianceStatuses, setComplianceStatuses] = useState<ComplianceStatus[]>([]);

  useEffect(() => {
    // Generate compliance status for all clients
    const statuses: ComplianceStatus[] = [];
    
    clients.forEach(client => {
      // GST Compliance
      if (client.isGSTRegistered) {
        statuses.push({
          type: 'GST Return',
          status: 'upcoming',
          dueDate: new Date(2024, 2, 20), // March 20th
          description: `GST return filing for ${client.name}`,
          missingDocuments: [],
          isCompliant: true
        });
      }
      
      // Income Tax Compliance
      statuses.push({
        type: 'Income Tax Return',
        status: 'upcoming',
        dueDate: new Date(2024, 6, 31), // July 31st
        description: `Income tax return filing for ${client.name}`,
        missingDocuments: [],
        isCompliant: true
      });
    });
    
    setComplianceStatuses(statuses);
  }, [clients]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="h-4 w-4" />;
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const upcomingTasks = tasks.filter(task => 
    task.status !== 'done' && 
    task.tags.some(tag => 
      tag.toLowerCase().includes('compliance') || 
      tag.toLowerCase().includes('gst') || 
      tag.toLowerCase().includes('tax')
    )
  );

  const overdueTasks = tasks.filter(task => 
    task.status !== 'done' && 
    task.dueDate && 
    isBefore(new Date(task.dueDate), new Date())
  );

  const compliantClients = clients.filter(client => {
    const clientTasks = tasks.filter(t => t.clientId === client.id && t.status !== 'done');
    const overdueCount = clientTasks.filter(t => 
      t.dueDate && isBefore(new Date(t.dueDate), new Date())
    ).length;
    return overdueCount === 0;
  });

  const nonCompliantClients = clients.filter(client => {
    const clientTasks = tasks.filter(t => t.clientId === client.id && t.status !== 'done');
    const overdueCount = clientTasks.filter(t => 
      t.dueDate && isBefore(new Date(t.dueDate), new Date())
    ).length;
    return overdueCount > 0;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliant Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{compliantClients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{nonCompliantClients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{upcomingTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceStatuses.slice(0, 5).map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status.status)}
                    <div>
                      <p className="font-medium">{status.type}</p>
                      <p className="text-sm text-muted-foreground">{status.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(status.status)}>
                      {status.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(status.dueDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Compliance Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.clientName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                      {task.priority}
                    </Badge>
                    {task.dueDate && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(task.dueDate), 'MMM dd')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
