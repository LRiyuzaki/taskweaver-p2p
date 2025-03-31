
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { TaskBoard } from "@/components/TaskBoard";
import { TaskListView } from "@/components/TaskListView";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/TaskForm";
import { useTaskContext } from "@/contexts/TaskContext";

const Index = () => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
  const { addTask } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFormSubmit = (formData: any) => {
    addTask(formData);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Task Management</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button 
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('board')}
                className="rounded-none"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Board
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm" 
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
        {viewMode === 'board' ? <TaskBoard /> : <TaskListView />}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>
                Add a new task to your board.
              </DialogDescription>
            </DialogHeader>
            <TaskForm onSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Index;
