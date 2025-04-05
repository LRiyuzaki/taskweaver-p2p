
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { CheckCircle2, Clock, Calendar, AlertTriangle, CircleDot } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'task' | 'note' | 'document' | 'communication';
  status?: 'completed' | 'pending' | 'overdue';
  tags?: string[];
}

interface ClientTimelineProps {
  clientId: string;
  tasks: Task[];
}

export const ClientTimeline: React.FC<ClientTimelineProps> = ({ clientId, tasks }) => {
  // Filter tasks for this client
  const clientTasks = tasks.filter(task => task.clientId === clientId);
  
  // Convert tasks to timeline events
  const taskEvents: TimelineEvent[] = clientTasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    date: task.completedDate || task.dueDate || task.createdAt,
    type: 'task',
    status: task.status === 'done' 
      ? 'completed' 
      : (task.dueDate && task.dueDate < new Date() ? 'overdue' : 'pending'),
    tags: task.tags
  }));
  
  // Sort all events by date (newest first)
  const timelineEvents = [...taskEvents].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Helper function to get icon based on event type and status
  const getEventIcon = (event: TimelineEvent) => {
    if (event.type === 'task') {
      if (event.status === 'completed') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      if (event.status === 'overdue') return <AlertTriangle className="h-4 w-4 text-destructive" />;
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    return <CircleDot className="h-4 w-4 text-muted-foreground" />;
  };
  
  // Helper function for status badge display
  const getStatusBadge = (event: TimelineEvent) => {
    if (!event.status) return null;
    
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | null = null;
    
    switch (event.status) {
      case 'completed':
        variant = 'outline'; // Green outline
        break;
      case 'pending':
        variant = 'secondary'; // Blue
        break;
      case 'overdue':
        variant = 'destructive'; // Red
        break;
    }
    
    return (
      <Badge variant={variant} className="ml-2">
        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 py-4">
      <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
      
      {timelineEvents.length > 0 ? (
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative pl-6">
              {/* Timeline connector */}
              {index < timelineEvents.length - 1 && (
                <div className="absolute left-2 top-4 h-full w-px bg-border"></div>
              )}
              
              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5">
                <div className="flex h-4 w-4 items-center justify-center">
                  {getEventIcon(event)}
                </div>
              </div>
              
              {/* Event card */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium">{event.title}</span>
                        {getStatusBadge(event)}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md bg-muted/50">
          <p className="text-muted-foreground">No activity found for this client.</p>
        </div>
      )}
    </div>
  );
};
