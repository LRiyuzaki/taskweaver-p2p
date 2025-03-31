
import React, { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Project, Task } from '@/types/task';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, List, Calendar, CheckSquare, 
  BookOpen, Users, CreditCard, BarChart,
  FileText, Star, Folder, Briefcase,
  Edit, Trash
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ProjectForm } from './ProjectForm';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const ProjectView: React.FC = () => {
  const { projects, tasks, updateProject, deleteProject } = useTaskContext();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId).length;
  };

  const getProjectIcon = (iconName?: string) => {
    switch (iconName) {
      case 'layoutGrid': return <LayoutGrid size={18} />;
      case 'list': return <List size={18} />;
      case 'calendar': return <Calendar size={18} />;
      case 'checkSquare': return <CheckSquare size={18} />;
      case 'bookOpen': return <BookOpen size={18} />;
      case 'users': return <Users size={18} />;
      case 'creditCard': return <CreditCard size={18} />;
      case 'barChart': return <BarChart size={18} />;
      case 'fileText': return <FileText size={18} />;
      case 'star': return <Star size={18} />;
      case 'briefcase': return <Briefcase size={18} />;
      case 'folder':
      default: return <Folder size={18} />;
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleProjectUpdate = (values: Omit<Project, 'id' | 'createdAt'>) => {
    if (editingProject) {
      updateProject(editingProject.id, values);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Projects</h2>
      
      {projects.length === 0 ? (
        <div className="text-center p-10 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">Create a project to help organize your tasks</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Card key={project.id} className="overflow-hidden">
              <div 
                className="h-2" 
                style={{ backgroundColor: project.color || '#4f46e5' }} 
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-muted">
                      {getProjectIcon(project.icon)}
                    </div>
                    <CardTitle className="text-base">{project.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive" 
                      onClick={() => deleteProject(project.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
                {project.description && (
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">
                    {getProjectTaskCount(project.id)} tasks
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    Created {format(project.createdAt, 'MMM d, yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project here.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm 
            project={editingProject || undefined} 
            onSubmit={handleProjectUpdate} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
