
import React from 'react';
import { Task } from '@/types/task';
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TaskCalendarDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  tasksForSelectedDate: Task[];
  selectedTasks: string[];
  onTaskSelect: (taskId: string) => void;
}

export const TaskCalendarDialog: React.FC<TaskCalendarDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedDate,
  tasksForSelectedDate,
  selectedTasks,
  onTaskSelect
}) => {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Tasks for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ""}
          </DialogTitle>
          <DialogDescription>
            {tasksForSelectedDate.length > 0 
              ? "Select tasks to perform actions on them." 
              : "No tasks scheduled for this date."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2 p-1">
            {tasksForSelectedDate.map(task => (
              <div 
                key={task.id} 
                className="flex items-start p-3 border rounded-md hover:bg-muted/50"
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={() => onTaskSelect(task.id)}
                  className="mt-1"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <label 
                      htmlFor={`task-${task.id}`}
                      className="font-medium"
                    >
                      {task.title}
                    </label>
                    <Badge 
                      variant={
                        task.priority === 'high' ? 'destructive' : 
                        task.priority === 'medium' ? 'default' : 
                        'outline'
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex justify-between mt-2">
                    <Badge variant={
                      task.status === 'done' ? 'secondary' :
                      task.status === 'inProgress' ? 'default' :
                      'outline'
                    }>
                      {task.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        navigate(`/tasks/${task.id}`);
                        onOpenChange(false);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
