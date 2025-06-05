import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task, TaskStatus, TaskPriority, RecurrenceType } from '@/types/task';
import { ComplianceStatus } from '@/types/client';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { toast } from '@/hooks/use-toast-extensions';

export const ComplianceDashboard: React.FC = () => {
  const { clients, serviceTypes, clientServices } = useClientContext();
  const { addTask, tasks } = useTaskContext();
  const [selectedClient, setSelectedClient] = useState<string>('');

  const complianceData: ComplianceStatus[] = useMemo(() => {
    if (!selectedClient) return [];
    return [
      {
        type: 'GST Filing',
        status: 'current',
        dueDate: addDays(new Date(), 30),
        description: 'Monthly GST return filing'
      },
      {
        type: 'Income Tax',
        status: 'upcoming',
        dueDate: addDays(new Date(), 90),
        description: 'Annual income tax return'
      }
    ];
  }, [selectedClient]);

  const totalCompliance = complianceData.length;
  const currentCompliance = complianceData.filter(c => c.status === 'current').length;
  const upcomingCompliance = complianceData.filter(c => c.status === 'upcoming').length;
  const overdueCompliance = complianceData.filter(c => c.status === 'overdue').length;

  const complianceProgress = useMemo(() => {
    if (totalCompliance === 0) return 0;
    return Math.round((currentCompliance / totalCompliance) * 100);
  }, [currentCompliance, totalCompliance]);

  const createComplianceTask = async (compliance: ComplianceStatus, clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const taskData: Omit<Task, 'id' | 'createdAt'> = {
      clientId,
      clientName: client.name,
      status: 'todo' as TaskStatus,
      priority: 'high' as TaskPriority,
      recurrence: compliance.type.includes('Monthly') ? 'monthly' as RecurrenceType : 'quarterly' as RecurrenceType,
      title: `${compliance.type} - ${client.name}`,
      description: compliance.description,
      tags: [compliance.type, 'Compliance'],
      dueDate: compliance.dueDate,
      updatedAt: new Date(),
      subtasks: []
    };

    try {
      await addTask(taskData);
      toast.success(`Compliance task created for ${client.name}`);
    } catch (error) {
      toast.error('Failed to create compliance task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
        <select
          className="border rounded px-4 py-2"
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
        >
          <option value="">Select a Client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      {selectedClient ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Compliance</CardTitle>
              <CardDescription>All compliance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCompliance}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Compliance</CardTitle>
              <CardDescription>Tasks that are up-to-date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentCompliance}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Compliance</CardTitle>
              <CardDescription>Tasks due soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingCompliance}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overdue Compliance</CardTitle>
              <CardDescription>Tasks that are past due</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overdueCompliance}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">Select a client to view compliance data.</p>
        </div>
      )}

      {selectedClient && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Compliance Tasks</h3>
          {complianceData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {complianceData.map(compliance => (
                <Card key={compliance.type} className="shadow-sm">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">{compliance.type}</CardTitle>
                      {compliance.status === 'current' && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Current
                        </Badge>
                      )}
                      {compliance.status === 'upcoming' && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Clock className="h-4 w-4 mr-1" />
                          Upcoming
                        </Badge>
                      )}
                      {compliance.status === 'overdue' && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">{compliance.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due Date: {format(compliance.dueDate, 'MMM dd, yyyy')}</span>
                    </div>
                  </CardContent>
                  <div className="p-4 border-t">
                    <Button size="sm" className="w-full" onClick={() => createComplianceTask(compliance, selectedClient)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-muted-foreground">No compliance tasks found for this client.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
