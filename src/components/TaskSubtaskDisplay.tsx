
import React, { useState } from 'react';
import { Task } from '@/types/task';
import { SubTask } from '@/types/client';
import { useTaskContext } from '@/contexts/TaskContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast-extensions';

interface TaskSubtaskDisplayProps {
  task: Task;
  showAll?: boolean;
  editable?: boolean;
}

export const TaskSubtaskDisplay: React.FC<TaskSubtaskDisplayProps> = ({ 
  task, 
  showAll = false,
  editable = false
}) => {
  const { subtasks, addSubtask, updateSubtask, deleteSubtask, getTaskProgress } = useTaskContext();
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [subtaskToDelete, setSubtaskToDelete] = useState<SubTask | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  
  // Get subtasks for this task and sort them by order
  const taskSubtasks = subtasks
    .filter(st => st.taskId === task.id)
    .sort((a, b) => a.order - b.order);
  
  const progress = getTaskProgress(task.id);
  
  // If there are no subtasks and we're not in edit mode, don't render anything
  if (taskSubtasks.length === 0 && !editable) return null;
  
  const handleSubtaskToggle = (subtask: SubTask, isCompleted: boolean) => {
    updateSubtask(subtask.id, { completed: isCompleted });
  };
  
  const handleEditSubtask = (subtask: SubTask) => {
    setEditingSubtaskId(subtask.id);
    setNewSubtaskTitle(subtask.title);
  };
  
  const handleSaveSubtaskEdit = () => {
    if (!editingSubtaskId || !newSubtaskTitle.trim()) return;
    
    updateSubtask(editingSubtaskId, { title: newSubtaskTitle.trim() });
    setEditingSubtaskId(null);
    setNewSubtaskTitle("");
    toast.success("Subtask updated successfully");
  };
  
  const handleCancelSubtaskEdit = () => {
    setEditingSubtaskId(null);
    setNewSubtaskTitle("");
  };
  
  const handleDeleteSubtask = () => {
    if (!subtaskToDelete) return;
    
    deleteSubtask(subtaskToDelete.id);
    setSubtaskToDelete(null);
    toast.success("Subtask deleted successfully");
  };
  
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    addSubtask({
      taskId: task.id,
      title: newSubtaskTitle.trim(),
      description: "",
      completed: false,
      order: taskSubtasks.length,
    });
    
    setIsAddingSubtask(false);
    setNewSubtaskTitle("");
    toast.success("Subtask added successfully");
  };
  
  return (
    <div className="mt-3 space-y-2">
      {(taskSubtasks.length > 0 || editable) && (
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Progress: {progress}%</span>
          {editable && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsAddingSubtask(true)}
              className="h-7 px-2"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Step
            </Button>
          )}
        </div>
      )}
      
      {taskSubtasks.length > 0 && (
        <Progress value={progress} className="h-1.5" />
      )}
      
      {/* Display subtasks */}
      {taskSubtasks.length > 0 && (
        <div className="mt-2 pl-1 space-y-1 border-l-2 border-l-muted/50">
          {taskSubtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2">
              <Checkbox
                id={`subtask-${subtask.id}`} 
                checked={subtask.completed}
                onCheckedChange={(checked) => handleSubtaskToggle(subtask, checked === true)}
                className={subtask.completed ? "text-green-500" : ""}
              />
              
              {editingSubtaskId === subtask.id ? (
                <div className="flex flex-1 items-center gap-1">
                  <Input 
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={handleCancelSubtaskEdit} className="h-7 px-2">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveSubtaskEdit} className="h-7 px-2">
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <label 
                    htmlFor={`subtask-${subtask.id}`}
                    className={cn(
                      "text-sm cursor-pointer flex-1",
                      subtask.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {subtask.title}
                  </label>
                  
                  {editable && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditSubtask(subtask)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setSubtaskToDelete(subtask)}
                        className="h-6 w-6 p-0 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
      
      {!showAll && taskSubtasks.length > 3 && (
        <div className="text-xs text-muted-foreground mt-1">
          {taskSubtasks.filter(st => st.completed).length} of {taskSubtasks.length} subtasks completed
        </div>
      )}
      
      {/* Add subtask UI */}
      {isAddingSubtask && (
        <div className="flex items-center gap-1 mt-2">
          <Input 
            placeholder="Enter subtask title" 
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="text-sm"
            autoFocus
          />
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setIsAddingSubtask(false);
                setNewSubtaskTitle("");
              }} 
              className="whitespace-nowrap"
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleAddSubtask} 
              disabled={!newSubtaskTitle.trim()} 
              className="whitespace-nowrap"
            >
              Add
            </Button>
          </div>
        </div>
      )}
      
      {/* Confirmation dialog for deleting subtask */}
      <AlertDialog open={!!subtaskToDelete} onOpenChange={(open) => !open && setSubtaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subtask</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subtask? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubtask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
