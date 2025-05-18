
import React, { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FilePlus2, AlertCircle } from 'lucide-react';
import { RecurrenceType } from '@/types/task';
import { useClientContext } from '@/contexts/ClientContext';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { format, addDays } from 'date-fns';

export const RecurringTasksPanel = () => {
  const { tasks, updateTask, addBulkTasks } = useTaskContext();
  const { clients } = useClientContext();
  
  // Filter only recurring tasks
  const recurringTasks = tasks.filter(task => task.recurrence !== 'none');
  
  // Group tasks by recurrence type
  const tasksByRecurrence: Record<string, typeof recurringTasks> = {
    daily: recurringTasks.filter(task => task.recurrence === 'daily'),
    weekly: recurringTasks.filter(task => task.recurrence === 'weekly'),
    monthly: recurringTasks.filter(task => task.recurrence === 'monthly'),
    quarterly: recurringTasks.filter(task => task.recurrence === 'quarterly'),
    halfYearly: recurringTasks.filter(task => task.recurrence === 'halfYearly'),
    yearly: recurringTasks.filter(task => task.recurrence === 'yearly'),
  };
  
  // State for bulk task generation
  const [selectedFilingTypes, setSelectedFilingTypes] = useState({
    gst1: true,
    gst3b: true,
    tds: false,
    incomeTax: false,
    roc: false
  });
  
  // Handle toggle for enabling/disabling recurring tasks
  const handleToggleRecurrence = (taskId: string, enabled: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    updateTask(taskId, { 
      recurrence: enabled ? (task.recurrence || 'monthly') : 'none' 
    });
  };
  
  // Handle days input change
  const handleDaysChange = (taskId: string, days: number) => {
    // This would typically update a field that specifies how many days before the due date
    // to create the next recurring task. For now, we'll just log it.
    console.log(`Set reminder days for task ${taskId} to ${days}`);
  };
  
  // Handle bulk generation of filing tasks
  const handleGenerateFilingTasks = () => {
    const activeClients = clients.filter(client => client.active !== false);
    const newTasks = [];
    const currentDate = new Date();
    const nextDueDate = new Date();
    
    // GST-1 - Due on 10th of every month
    if (selectedFilingTypes.gst1) {
      nextDueDate.setDate(10); // Set to 10th of the current month
      
      // If today is past the 10th, set for next month
      if (currentDate.getDate() > 10) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }
      
      // Find GST registered clients
      const gstClients = activeClients.filter(client => client.isGSTRegistered);
      
      for (const client of gstClients) {
        newTasks.push({
          title: `GSTR-1 Filing - ${client.name}`,
          description: `Monthly GSTR-1 return filing for ${client.name}${client.gstin ? ` (GSTIN: ${client.gstin})` : ''}`,
          status: 'todo',
          priority: 'high',
          dueDate: new Date(nextDueDate),
          clientId: client.id,
          clientName: client.name,
          tags: ['GST', 'GSTR-1', 'Compliance', 'Monthly'],
          recurrence: 'monthly' as RecurrenceType
        });
      }
    }
    
    // GST-3B - Due on 20th of every month
    if (selectedFilingTypes.gst3b) {
      nextDueDate.setDate(20); // Set to 20th of the current month
      
      // If today is past the 20th, set for next month
      if (currentDate.getDate() > 20) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }
      
      // Find GST registered clients
      const gstClients = activeClients.filter(client => client.isGSTRegistered);
      
      for (const client of gstClients) {
        newTasks.push({
          title: `GSTR-3B Filing - ${client.name}`,
          description: `Monthly GSTR-3B return filing for ${client.name}${client.gstin ? ` (GSTIN: ${client.gstin})` : ''}`,
          status: 'todo',
          priority: 'high',
          dueDate: new Date(nextDueDate),
          clientId: client.id,
          clientName: client.name,
          tags: ['GST', 'GSTR-3B', 'Compliance', 'Monthly'],
          recurrence: 'monthly' as RecurrenceType
        });
      }
    }
    
    // TDS - Quarterly filings
    if (selectedFilingTypes.tds) {
      // Find clients with TAN
      const tdsClients = activeClients.filter(client => client.tan);
      
      // Set for the end of current quarter + 7 days
      const currentMonth = currentDate.getMonth();
      const currentQuarter = Math.floor(currentMonth / 3);
      const quarterEndMonth = (currentQuarter + 1) * 3 - 1;
      
      const quarterEndDate = new Date(currentDate.getFullYear(), quarterEndMonth, 
        [1, 4, 7, 10].includes(quarterEndMonth + 1) ? 30 : 31);
      
      const tdsDueDate = addDays(quarterEndDate, 7);
      
      for (const client of tdsClients) {
        newTasks.push({
          title: `TDS Return - ${client.name}`,
          description: `Quarterly TDS return filing for ${client.name}${client.tan ? ` (TAN: ${client.tan})` : ''}`,
          status: 'todo',
          priority: 'high',
          dueDate: tdsDueDate,
          clientId: client.id,
          clientName: client.name,
          tags: ['TDS', 'Compliance', 'Quarterly'],
          recurrence: 'quarterly' as RecurrenceType
        });
      }
    }
    
    // Create the bulk tasks
    if (newTasks.length > 0) {
      addBulkTasks(newTasks);
      toast({
        title: "Tasks Generated",
        description: `Successfully created ${newTasks.length} compliance tasks`,
      });
    } else {
      toast({
        title: "No Tasks Created",
        description: "No eligible clients found for selected filing types",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recurring Tasks</h2>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1.5" />
          <span className="text-sm text-muted-foreground">
            {recurringTasks.length} Active Recurrences
          </span>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Generate Statutory Filing Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate compliance tasks for all eligible clients based on government filing due dates.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="gst1" 
                  checked={selectedFilingTypes.gst1}
                  onCheckedChange={(checked) => 
                    setSelectedFilingTypes(prev => ({ ...prev, gst1: !!checked }))
                  }
                />
                <label htmlFor="gst1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  GSTR-1 (Monthly)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="gst3b" 
                  checked={selectedFilingTypes.gst3b}
                  onCheckedChange={(checked) => 
                    setSelectedFilingTypes(prev => ({ ...prev, gst3b: !!checked }))
                  }
                />
                <label htmlFor="gst3b" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  GSTR-3B (Monthly)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tds" 
                  checked={selectedFilingTypes.tds}
                  onCheckedChange={(checked) => 
                    setSelectedFilingTypes(prev => ({ ...prev, tds: !!checked }))
                  }
                />
                <label htmlFor="tds" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  TDS Returns (Quarterly)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="incomeTax" 
                  checked={selectedFilingTypes.incomeTax}
                  onCheckedChange={(checked) => 
                    setSelectedFilingTypes(prev => ({ ...prev, incomeTax: !!checked }))
                  }
                />
                <label htmlFor="incomeTax" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Income Tax (Annual)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="roc" 
                  checked={selectedFilingTypes.roc}
                  onCheckedChange={(checked) => 
                    setSelectedFilingTypes(prev => ({ ...prev, roc: !!checked }))
                  }
                />
                <label htmlFor="roc" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  ROC Filings (Annual)
                </label>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateFilingTasks}
              className="mt-4"
            >
              <FilePlus2 className="mr-2 h-4 w-4" />
              Generate Filing Tasks
            </Button>
            
            <div className="text-xs text-muted-foreground mt-2 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Tasks will be generated for all active clients with appropriate registration details.
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Task Name</CardTitle>
            <div className="grid grid-cols-2 gap-16">
              <span className="font-medium">Recurring</span>
              <span className="font-medium">Days</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-2">
          {recurringTasks.length > 0 ? (
            <div className="space-y-3">
              {recurringTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {task.recurrence && task.recurrence !== 'none' && (
                        <span className="capitalize">{task.recurrence}</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-16 items-center">
                    <Switch 
                      checked={task.recurrence !== 'none'} 
                      onCheckedChange={(checked) => handleToggleRecurrence(task.id, checked)}
                    />
                    <Input 
                      type="number" 
                      className="w-16 h-8" 
                      min={1}
                      defaultValue={7}
                      onChange={(e) => handleDaysChange(task.id, parseInt(e.target.value))}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No recurring tasks configured. Create a task with recurrence to see it here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
