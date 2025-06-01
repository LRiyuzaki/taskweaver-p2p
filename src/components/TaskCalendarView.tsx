
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from '@/types/task';
import { useTaskContext } from '@/contexts/TaskContext';
import { format, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TaskCalendarViewProps {
  onSelectedTaskIdsChange: (taskIds: string[]) => void;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ onSelectedTaskIdsChange }) => {
  const { tasks } = useTaskContext();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);

  useEffect(() => {
    if (selectedDate) {
      const filteredTasks = tasks.filter(task => 
        task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
      );
      setTasksForSelectedDate(filteredTasks);
    } else {
      setTasksForSelectedDate([]);
    }
  }, [selectedDate, tasks]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setIsDialogOpen(true);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    const updatedSelection = selectedTasks.includes(taskId)
      ? selectedTasks.filter(id => id !== taskId)
      : [...selectedTasks, taskId];
    
    setSelectedTasks(updatedSelection);
    onSelectedTaskIdsChange(updatedSelection);
  };

  const getDayContent = (date: Date) => {
    const tasksForDay = tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
    
    if (tasksForDay.length === 0) return null;
    
    return (
      <div className="absolute bottom-0 right-0 p-0.5">
        <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
          {tasksForDay.length}
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
            modifiers={{
              taskDay: (date) => {
                return tasks.some(task => 
                  task.dueDate && isSameDay(new Date(task.dueDate), date)
                );
              },
              highPriorityDay: (date) => {
                return tasks.some(task => 
                  task.dueDate && isSameDay(new Date(task.dueDate), date) && task.priority === 'high'
                );
              }
            }}
            modifiersClassNames={{
              taskDay: "bg-blue-50 font-medium border-blue-100",
              highPriorityDay: "bg-red-100 font-bold border-red-200"
            }}
            components={{
              DayContent: ({ date }) => (
                <>
                  {date.getDate()}
                  {getDayContent(date)}
                </>
              )
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    onCheckedChange={() => handleTaskSelect(task.id)}
                    className="mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <label 
                        htmlFor={`task-${task.id}`}
                        className="font-medium cursor-pointer"
                        onClick={() => handleTaskSelect(task.id)}
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
                          setIsDialogOpen(false);
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
    </div>
  );
};
