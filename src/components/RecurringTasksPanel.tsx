
import React, { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import { RecurrenceType } from '@/types/task';

export const RecurringTasksPanel = () => {
  const { tasks, updateTask } = useTaskContext();
  
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
