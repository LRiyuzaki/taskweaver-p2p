
import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, GripVerticalIcon, Plus, X, ListFilter } from "lucide-react";
import { useTaskContext } from '@/contexts/TaskContext';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

interface TaskBoardProps {
  onTaskSelect: (taskIds: string[]) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ onTaskSelect }) => {
  const { tasks, updateTask, addTask } = useTaskContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientId = searchParams.get('clientId');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortColumn, setSortColumn] = useState<'dueDate' | 'priority'>('dueDate');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const handleTaskSelect = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  useEffect(() => {
    onTaskSelect(selectedTasks);
  }, [selectedTasks, onTaskSelect]);

  const filteredTasks = tasks.filter(task => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(searchTermLower) ||
      (task.description?.toLowerCase().includes(searchTermLower) ?? false);

    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;

    const matchesClient = clientId ? task.clientId === clientId : true;

    return matchesSearch && matchesStatus && matchesPriority && matchesClient;
  });

  const sortTasks = (tasksToSort: Task[]): Task[] => {
    return [...tasksToSort].sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;

      if (sortColumn === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return order * (dateA - dateB);
      } else if (sortColumn === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityA = priorityOrder[a.priority] || 0;
        const priorityB = priorityOrder[b.priority] || 0;
        return order * (priorityA - priorityB);
      }

      return 0;
    });
  };

  const sortedTasks = sortTasks(filteredTasks);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;

      if (!destination) {
        return;
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const taskId = draggableId;
      const newStatus = destination.droppableId as TaskStatus;

      updateTask(taskId, { status: newStatus });
    },
    [updateTask]
  );

  const getTasksByStatus = (status: string) => {
    return sortedTasks.filter(task => task.status === status);
  };

  const handleCreateNewTask = async () => {
    if (newTaskTitle.trim() === '') return;

    const newTask = {
      title: newTaskTitle,
      description: '',
      status: 'todo' as TaskStatus,
      priority: 'medium' as TaskPriority,
      dueDate: new Date(),
      tags: [],
      clientId: clientId || '',
      assignedTo: '',
      recurrence: 'none'
    };

    addTask(newTask);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const taskStatuses = ['todo', 'inProgress', 'review', 'done'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ListFilter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                <Check
                  className={cn("mr-2 h-4 w-4", statusFilter === null ? "opacity-100" : "opacity-0")}
                />
                All
              </DropdownMenuItem>
              {taskStatuses.map(status => (
                <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                  <Check
                    className={cn("mr-2 h-4 w-4", statusFilter === status ? "opacity-100" : "opacity-0")}
                  />
                  {status}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['high', 'medium', 'low'].map(priority => (
                <DropdownMenuItem key={priority} onClick={() => setPriorityFilter(priority)}>
                  <Check
                    className={cn("mr-2 h-4 w-4", priorityFilter === priority ? "opacity-100" : "opacity-0")}
                  />
                  {priority}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setStatusFilter(null);
                setPriorityFilter(null);
              }}>
                Reset Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ChevronsUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setSortColumn('dueDate');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}>
                Due Date
                {sortColumn === 'dueDate' && (
                  <span className="ml-auto">
                    {sortOrder === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSortColumn('priority');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}>
                Priority
                {sortColumn === 'priority' && (
                  <span className="ml-auto">
                    {sortOrder === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {taskStatuses.map(status => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <Card
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn("shadow-md rounded-md", snapshot.isDraggingOver ? "bg-secondary" : "")}
                >
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold capitalize mb-2">{status}</h3>
                    <ScrollArea className="h-[400px] pr-2">
                      {getTasksByStatus(status).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "bg-muted rounded-md shadow-sm p-3 mb-2 flex items-start gap-2",
                                snapshot.isDragging ? "ring-2 ring-primary" : "",
                                task.status === 'done' ? "border-green-200 bg-green-50/30" : ""
                              )}
                            >
                              <Checkbox
                                id={`select-${task.id}`}
                                checked={selectedTasks.includes(task.id)}
                                onCheckedChange={() => handleTaskSelect(task.id)}
                              />
                              <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`select-${task.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                                    {task.title}
                                  </Label>
                                  <GripVerticalIcon className="h-4 w-4 opacity-50 hover:opacity-100 cursor-grab" />
                                </div>
                                <div className="flex flex-col gap-1 mt-1">
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                  )}
                                  {task.dueDate && (
                                    <div className="text-xs text-muted-foreground">
                                      Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                    </div>
                                  )}
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <div className="flex gap-1">
                                    {task.priority && (
                                      <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'}>
                                        {task.priority}
                                      </Badge>
                                    )}
                                  </div>
                                  <Button size="sm" variant="outline" onClick={() => navigate(`/tasks/${task.id}`)}>
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {isAddingTask ? (
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="New task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleCreateNewTask}>Add Task</Button>
          <Button variant="ghost" onClick={() => setIsAddingTask(false)}>Cancel</Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsAddingTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      )}
    </div>
  );
};

export { TaskBoard };
