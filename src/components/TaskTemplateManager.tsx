
import React, { useState } from 'react';
import { TaskTemplate, SubTask } from '@/types/client';
import { useTaskContext } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, X, Edit, Trash2, Copy, MoveUp, MoveDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast-extensions';

export const TaskTemplateManager: React.FC = () => {
  const { templates, addTaskTemplate, updateTaskTemplate, deleteTaskTemplate } = useTaskContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<Omit<SubTask, 'taskId'>[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setSubtasks([]);
    setNewSubtaskTitle('');
  };
  
  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };
  
  const handleOpenEditModal = (template: TaskTemplate) => {
    setName(template.name);
    setDescription(template.description || '');
    setSubtasks(template.subtasks.map(st => ({
      ...st,
      id: st.id,
      title: st.title,
      description: st.description,
      completed: false,
      order: st.order
    })));
    setEditingTemplateId(template.id);
    setIsEditModalOpen(true);
  };
  
  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([
        ...subtasks, 
        {
          id: `temp-${Date.now()}`,
          title: newSubtaskTitle.trim(),
          completed: false,
          order: subtasks.length
        }
      ]);
      setNewSubtaskTitle('');
    }
  };
  
  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };
  
  const handleMoveSubtask = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === subtasks.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newSubtasks = [...subtasks];
    const temp = newSubtasks[index];
    newSubtasks[index] = newSubtasks[newIndex];
    newSubtasks[newIndex] = temp;
    
    // Update order values
    newSubtasks.forEach((st, i) => {
      st.order = i;
    });
    
    setSubtasks(newSubtasks);
  };
  
  const handleSaveTemplate = () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }
    
    if (subtasks.length === 0) {
      toast.error('Add at least one step to the template');
      return;
    }
    
    const templateData = {
      name: name.trim(),
      description: description.trim() || undefined,
      subtasks: subtasks.map((st, index) => ({
        ...st,
        order: index
      }))
    };
    
    if (editingTemplateId) {
      updateTaskTemplate(editingTemplateId, templateData);
      setIsEditModalOpen(false);
    } else {
      addTaskTemplate(templateData);
      setIsAddModalOpen(false);
    }
    
    resetForm();
  };
  
  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTaskTemplate(id);
    }
  };
  
  const handleDuplicateTemplate = (template: TaskTemplate) => {
    const newName = `${template.name} (Copy)`;
    addTaskTemplate({
      name: newName,
      description: template.description,
      subtasks: template.subtasks
    });
    toast.success(`Template "${template.name}" has been duplicated`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Templates</h2>
        <Button onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No templates created yet. Templates help you create tasks with predefined steps.
            </p>
            <Button onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <Card key={template.id} className="h-full">
              <CardHeader className="pb-3">
                <CardTitle>{template.name}</CardTitle>
                {template.description && (
                  <CardDescription>{template.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-2">Steps ({template.subtasks.length})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {template.subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-start gap-2 bg-muted/50 p-2 rounded-sm text-sm">
                      <span className="bg-muted-foreground/30 text-xs px-1 rounded">
                        {index + 1}
                      </span>
                      <span className="flex-1">{subtask.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenEditModal(template)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Template Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Task Template</DialogTitle>
            <DialogDescription>
              Create a reusable template with predefined steps for tasks.
            </DialogDescription>
          </DialogHeader>
          <TemplateForm 
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            subtasks={subtasks}
            setSubtasks={setSubtasks}
            newSubtaskTitle={newSubtaskTitle}
            setNewSubtaskTitle={setNewSubtaskTitle}
            handleAddSubtask={handleAddSubtask}
            handleRemoveSubtask={handleRemoveSubtask}
            handleMoveSubtask={handleMoveSubtask}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Template Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update your task template.
            </DialogDescription>
          </DialogHeader>
          <TemplateForm 
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            subtasks={subtasks}
            setSubtasks={setSubtasks}
            newSubtaskTitle={newSubtaskTitle}
            setNewSubtaskTitle={setNewSubtaskTitle}
            handleAddSubtask={handleAddSubtask}
            handleRemoveSubtask={handleRemoveSubtask}
            handleMoveSubtask={handleMoveSubtask}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TemplateFormProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  subtasks: Omit<SubTask, 'taskId'>[];
  setSubtasks: (subtasks: Omit<SubTask, 'taskId'>[]) => void;
  newSubtaskTitle: string;
  setNewSubtaskTitle: (value: string) => void;
  handleAddSubtask: () => void;
  handleRemoveSubtask: (index: number) => void;
  handleMoveSubtask: (index: number, direction: 'up' | 'down') => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  name,
  setName,
  description,
  setDescription,
  subtasks,
  setSubtasks,
  newSubtaskTitle,
  setNewSubtaskTitle,
  handleAddSubtask,
  handleRemoveSubtask,
  handleMoveSubtask
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Template Name</Label>
        <Input 
          id="name" 
          placeholder="E.g. DGFT Registration Process" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea 
          id="description" 
          placeholder="Brief description of this template" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div className="space-y-3">
        <Label>Template Steps</Label>
        
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Add a step..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
          />
          <Button type="button" onClick={handleAddSubtask}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="border rounded-md divide-y">
          {subtasks.length > 0 ? (
            subtasks.map((subtask, index) => (
              <div key={index} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="bg-muted w-6 h-6 flex items-center justify-center rounded text-sm">
                    {index + 1}
                  </span>
                  <span>{subtask.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleMoveSubtask(index, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleMoveSubtask(index, 'down')}
                    disabled={index === subtasks.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleRemoveSubtask(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No steps added yet. Add steps to create your template.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
