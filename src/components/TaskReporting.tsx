import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { useClientContext } from '@/contexts/ClientContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from '@/components/ui/badge';

const TaskReporting = () => {
  const { tasks } = useTaskContext();
  const { clients } = useClientContext();

  const generateClientTaskSummary = () => {
    if (!clients || clients.length === 0) {
      return <p>No clients available.</p>;
    }

    if (!tasks || tasks.length === 0) {
      return <p>No tasks available.</p>;
    }

    const summary = clients.map(client => {
      const clientTasks = tasks.filter(task => task.clientId === client.id);
      const completedTasks = clientTasks.filter(task => task.status === 'done');
      const inProgressTasks = clientTasks.filter(task => task.status === 'in-progress');
      const todoTasks = clientTasks.filter(task => task.status === 'todo');
      
      return (
        <Card key={client.id} className="w-full">
          <CardHeader>
            <CardTitle>{client.name}</CardTitle>
            <CardDescription>{client.company}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Badge variant="secondary">Total Tasks: {clientTasks.length}</Badge>
              </div>
              <div>
                <Badge variant="outline">Completed: {completedTasks.length}</Badge>
              </div>
              <div>
                <Badge variant="outline">In Progress: {inProgressTasks.length}</Badge>
              </div>
              <div>
                <Badge variant="outline">To Do: {todoTasks.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    });

    return summary;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Task Reporting</h2>
      <ScrollArea className="h-[500px] w-full space-y-4">
        {generateClientTaskSummary()}
      </ScrollArea>
    </div>
  );
};

export default TaskReporting;
