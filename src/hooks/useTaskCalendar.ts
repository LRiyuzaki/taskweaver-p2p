
import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { useTaskContext } from '@/contexts/TaskContext';
import { isSameDay } from 'date-fns';

export const useTaskCalendar = () => {
  const { tasks } = useTaskContext();
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
    return updatedSelection;
  };

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const hasTasksOnDay = (date: Date) => {
    return tasks.some(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const hasHighPriorityTasksOnDay = (date: Date) => {
    return tasks.some(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date) && task.priority === 'high'
    );
  };

  return {
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
  };
};
