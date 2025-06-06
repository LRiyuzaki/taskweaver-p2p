import React, { useState, useEffect } from 'react';
import { TaskTemplate, SubTask } from '@/types/task';
import { useTaskContext } from '@/contexts/TaskContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface TaskTemplateManagerProps {
  template?: TaskTemplate;
  onSave: (data: Omit<TaskTemplate, 'id'>) => void;
  onCancel: () => void;
}

export const TaskTemplateManager: React.FC<TaskTemplateManagerProps> = ({ template, onSave, onCancel }) => {
  const { subtasks: globalSubtasks, addSubtask: addGlobalSubtask, updateSubtask: updateGlobalSubtask, deleteSubtask: deleteGlobalSubtask } = useTaskContext();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [subtasks, setSubtasks] = useState<Omit<SubTask, 'taskId'>[]>([]);

  useEffect(() => {
    if (template) {
      loadTemplate(template);
    }
  }, [template]);

  const loadTemplate = (template: TaskTemplate) => {
    const templateSubtasks = template.subtasks.map((subtask, index) => ({
      id: uuidv4(),
      title: subtask.title,
      description: subtask.description || '',
      completed: false,
      order: index,
      orderPosition: index,
      assignedTo: subtask.assignedTo || '',
      assigneeName: subtask.assigneeName || ''
    }));
    
    setSubtasks(templateSubtasks);
    // Update form data with template info
    setFormData(prev => ({
      ...prev,
      title: template.name,
      description: template.description || '',
      tags: template.category ? [template.category] : []
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSubtask = () => {
    const newSubtask = {
      id: uuidv4(),
      title: '',
      description: '',
      completed: false,
      order: subtasks.length,
      orderPosition: subtasks.length,
      assignedTo: '',
      assigneeName: ''
    };
    setSubtasks(prev => [...prev, newSubtask]);
  };

  const updateSubtask = (index: number, field: keyof Omit<SubTask, 'id' | 'taskId'>, value: any) => {
    setSubtasks(prev => prev.map((subtask, i) =>
      i === index ? { ...subtask, [field]: value } : subtask
    ));
  };

  const removeSubtask = (index: number) => {
    setSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const templateData: Omit<TaskTemplate, 'id'> = {
      name: formData.title,
      description: formData.description,
      subtasks: subtasks.map(s => ({
        title: s.title,
        description: s.description,
        completed: s.completed,
        order: s.order,
        orderPosition: s.orderPosition,
        assignedTo: s.assignedTo,
        assigneeName: s.assigneeName
      })),
      category: formData.category
    };
    onSave(templateData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Subtasks</h3>
          <Button type="button" onClick={addSubtask} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Subtask
          </Button>
        </div>

        {subtasks.map((subtask, index) => (
          <Card key={subtask.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 mt-2" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={subtask.title}
                    onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                    placeholder="Subtask title"
                  />
                  <Input
                    value={subtask.description}
                    onChange={(e) => updateSubtask(index, 'description', e.target.value)}
                    placeholder="Subtask description (optional)"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubtask(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Template</Button>
      </div>
    </div>
  );
};
