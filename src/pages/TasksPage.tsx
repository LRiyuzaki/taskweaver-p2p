
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  Calendar as CalendarIcon, 
  ListFilter,
  RepeatIcon,
  Plus,
  Trash2
} from 'lucide-react';
import { TaskBoard } from '@/components/TaskBoard';
import { TaskListView } from '@/components/TaskListView';
import { TaskCalendarView } from '@/components/TaskCalendarView';
import { RecurringTasksPanel } from '@/components/RecurringTasksPanel';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTaskContext } from "@/contexts/TaskContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';

const TasksPage = () => {
  const [activeView, setActiveView] = useState('board');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const navigate = useNavigate();
  const { deleteTasks } = useTaskContext();

  const handleCreateTask = () => {
    navigate('/tasks/new');
  };

  const handleDeleteSelected = () => {
    if (selectedTasks.length > 0) {
      setIsDeleteDialogOpen(true);
    } else {
      toast({
        title: "No Tasks Selected",
        description: "Please select at least one task to delete.",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = () => {
    deleteTasks(selectedTasks);
    setSelectedTasks([]);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Tasks Deleted",
      description: `${selectedTasks.length} task(s) deleted successfully.`,
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold flex items-center">
              <ClipboardList className="mr-2 h-8 w-8" />
              Tasks Management
            </h1>
            <div className="flex gap-2">
              <Button onClick={handleCreateTask}>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
              <Button variant="destructive" onClick={handleDeleteSelected}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          </div>

          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="board" className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" />
                Board View
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <ListFilter className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="recurring" className="flex items-center gap-1">
                <RepeatIcon className="h-4 w-4" />
                Recurring Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="board" className="space-y-6">
              <TaskBoard onTaskSelect={(taskIds) => setSelectedTasks(taskIds)} />
            </TabsContent>

            <TabsContent value="list" className="space-y-6">
              <TaskListView onTaskSelect={(taskIds) => setSelectedTasks(taskIds)} />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <TaskCalendarView onTaskSelect={(taskId) => {
                if (selectedTasks.includes(taskId)) {
                  setSelectedTasks(selectedTasks.filter(id => id !== taskId));
                } else {
                  setSelectedTasks([...selectedTasks, taskId]);
                }
              }} />
            </TabsContent>
            
            <TabsContent value="recurring" className="space-y-6">
              <RecurringTasksPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tasks</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedTasks.length} selected task(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
