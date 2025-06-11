
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useTaskCalendar } from '@/hooks/useTaskCalendar';
import { CalendarDayContent } from '@/components/calendar/CalendarDayContent';
import { TaskCalendarDialog } from '@/components/calendar/TaskCalendarDialog';

interface TaskCalendarViewProps {
  onSelectedTaskIdsChange: (taskIds: string[]) => void;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ onSelectedTaskIdsChange }) => {
  const {
    selectedDate,
    selectedTasks,
    isDialogOpen,
    tasksForSelectedDate,
    handleDateSelect,
    handleTaskSelect,
    setIsDialogOpen,
    getTasksForDay,
    hasTasksOnDay,
    hasHighPriorityTasksOnDay
  } = useTaskCalendar();

  const onTaskSelect = (taskId: string) => {
    const updatedSelection = handleTaskSelect(taskId);
    onSelectedTaskIdsChange(updatedSelection);
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
              taskDay: hasTasksOnDay,
              highPriority: hasHighPriorityTasksOnDay
            }}
            modifiersClassNames={{
              taskDay: "bg-blue-50 border-blue-100 font-medium",
              highPriority: "bg-red-100 border-red-200 font-bold"
            }}
            components={{
              DayContent: ({ date }) => (
                <CalendarDayContent 
                  date={date} 
                  taskCount={getTasksForDay(date).length} 
                />
              )
            }}
            classNames={{
              day: "relative hover:bg-accent hover:text-accent-foreground",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
            }}
          />
        </CardContent>
      </Card>

      <TaskCalendarDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
        tasksForSelectedDate={tasksForSelectedDate}
        selectedTasks={selectedTasks}
        onTaskSelect={onTaskSelect}
      />
    </div>
  );
};
