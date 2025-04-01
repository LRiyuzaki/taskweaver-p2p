
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { TaskBoard } from "@/components/TaskBoard";
import { TaskListView } from "@/components/TaskListView";
import { ProjectView } from "@/components/ProjectView";
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid, 
  List, 
  Plus, 
  FolderPlus, 
  Briefcase,
  CheckSquare as CheckSquareIcon 
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "@/components/TaskForm";
import { ProjectForm } from "@/components/ProjectForm";
import { useTaskContext } from "@/contexts/TaskContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
  const { addTask, addProject } = useTaskContext();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'projects'>('tasks');

  const handleTaskFormSubmit = (formData: any) => {
    addTask(formData);
    setIsTaskDialogOpen(false);
  };

  const handleProjectFormSubmit = (formData: any) => {
    addProject(formData);
    setIsProjectDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <Tabs 
          defaultValue="tasks" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'tasks' | 'projects')} 
          className="w-full"
        >
          <div className="p-4 flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="tasks" className="flex items-center gap-1">
                <CheckSquareIcon className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                Projects
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-4">
              {activeTab === 'tasks' && (
                <>
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
                  <Button onClick={() => setIsTaskDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </>
              )}
              
              <Button 
                variant={activeTab === 'projects' ? 'default' : 'outline'} 
                onClick={() => setIsProjectDialogOpen(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          <TabsContent value="tasks" className="mt-0">
            {viewMode === 'board' ? <TaskBoard /> : <TaskListView />}
          </TabsContent>
          
          <TabsContent value="projects" className="mt-0">
            <ProjectView />
          </TabsContent>
        </Tabs>

        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>
                Add a new task to your board.
              </DialogDescription>
            </DialogHeader>
            <TaskForm onSubmit={handleTaskFormSubmit} />
          </DialogContent>
        </Dialog>

        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Add a new project to organize your tasks.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm onSubmit={handleProjectFormSubmit} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Index;
