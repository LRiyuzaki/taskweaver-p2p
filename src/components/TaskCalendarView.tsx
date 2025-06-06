import React, { useState, useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  CircleDot,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay
} from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Task, TaskStatus } from '@/types/task';
import { useNavigate } from 'react-router-dom';

export const TaskCalendarView = () => {
  const { tasks } = useTaskContext();
  const navigate = useNavigate();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  const daysInMonth = useMemo(() => {
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    } catch (error) {
      console.error('Error calculating days in month:', error);
      return [];
    }
  }, [currentMonth]);
  
  const firstDayOfMonth = useMemo(() => {
    try {
      return getDay(startOfMonth(currentMonth));
    } catch (error) {
      console.error('Error getting first day of month:', error);
      return 0;
    }
  }, [currentMonth]);
  
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    try {
      return tasks.filter(task => 
        task?.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
      );
    } catch (error) {
      console.error('Error filtering tasks for selected date:', error);
      return [];
    }
  }, [selectedDate, tasks]);
  
  const completedTasks = tasks.filter(task => task.status === 'done');
  
  const getTasksForDay = (day: Date) => {
    try {
      return tasks.filter(task => task?.dueDate && isSameDay(new Date(task.dueDate), day));
    } catch (error) {
      console.error('Error getting tasks for day:', error);
      return [];
    }
  };
  
  const isOverdue = (task: Task) => {
    try {
      return task.status !== 'done' && 
        task.dueDate && 
        new Date(task.dueDate) < new Date() && 
        !isSameDay(new Date(task.dueDate), new Date());
    } catch (error) {
      console.error('Error checking if task is overdue:', error);
      return false;
    }
  };
  
  const getTaskStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return '#94a3b8'; // slate-400
      case 'in-progress':
        return '#3b82f6'; // blue-500
      case 'review':
        return '#f59e0b'; // amber-500
      case 'done':
        return '#10b981'; // emerald-500
      default:
        return '#6b7280'; // gray-500
    }
  };
  
  const handlePreviousMonth = () => {
    try {
      setCurrentMonth(subMonths(currentMonth, 1));
    } catch (error) {
      console.error('Error navigating to previous month:', error);
    }
  };
  
  const handleNextMonth = () => {
    try {
      setCurrentMonth(addMonths(currentMonth, 1));
    } catch (error) {
      console.error('Error navigating to next month:', error);
    }
  };
  
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsTaskDialogOpen(true);
  };
  
  const handleTaskView = (taskId: string) => {
    try {
      setIsTaskDialogOpen(false);
      
      // If the task has a clientId, navigate to that client's page
      const task = tasks.find(t => t.id === taskId);
      if (task && task.clientId) {
        navigate(`/client/${task.clientId}`);
      }
    } catch (error) {
      console.error('Error navigating to task view:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">
              <CalendarClock className="inline-block mr-2 h-5 w-5" />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <CardDescription>
              View tasks and deadlines on a calendar
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCurrentMonth(new Date())}
              className="text-xs"
            >
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center text-sm font-medium">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square p-1"></div>
            ))}
            
            {/* Calendar days */}
            {daysInMonth.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isToday = isSameDay(day, new Date());
              const isInCurrentMonth = isSameMonth(day, currentMonth);
              const hasOverdueTasks = dayTasks.some(isOverdue);
              
              return (
                <div 
                  key={day.toString()} 
                  className={`relative aspect-square p-1 ${
                    isInCurrentMonth ? "" : "opacity-40"
                  }`}
                >
                  <button
                    onClick={() => handleDateClick(day)}
                    className={`h-full w-full flex flex-col items-center rounded-md p-1 hover:bg-muted ${
                      isToday ? "bg-primary/10 font-medium" : ""
                    }`}
                  >
                    <span className={`text-sm ${isToday ? "text-primary font-bold" : ""}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {dayTasks.length > 0 && (
                      <div className="mt-auto flex flex-wrap justify-center gap-1">
                        {hasOverdueTasks && (
                          <CircleDot className="h-2 w-2 text-destructive" />
                        )}
                        {!hasOverdueTasks && dayTasks.length > 0 && (
                          <CircleDot className="h-2 w-2 text-primary" />
                        )}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              {tasksForSelectedDate.length > 0 
                ? `Tasks scheduled for this day` 
                : `No tasks scheduled for this day`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
            {tasksForSelectedDate.length > 0 ? (
              <>
                {tasksForSelectedDate.map(task => (
                  <div 
                    key={task.id}
                    className={`p-4 border rounded-md ${
                      isOverdue(task) ? "border-destructive/40" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      <Badge variant={task.status === 'done' ? "outline" : isOverdue(task) ? "destructive" : "default"}>
                        {task.status === 'todo' ? 'To Do' : 
                         task.status === 'in-progress' ? 'In Progress' : 
                         task.status === 'review' ? 'Review' : 'Done'}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex flex-wrap gap-2">
                        {task.tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTaskView(task.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground opacity-30 mb-2" />
                <p className="text-muted-foreground">No tasks scheduled for this day</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
