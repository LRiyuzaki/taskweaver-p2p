
import React, { useState, useMemo } from 'react';
import { Task, TaskCount, SortOption, FilterOption } from '@/types/task';
import { useTaskContext } from '@/contexts/TaskContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, isAfter, isBefore, isToday, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from './TaskForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Filter, SortAsc, SortDesc, Calendar, User, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TaskListViewProps {
  filterClient?: string; // Optional client ID to filter tasks
}

export const TaskListView: React.FC<TaskListViewProps> = ({ filterClient }) => {
  const { tasks, updateTask } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<string>('dueDate-asc');
  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const sortOptions: SortOption[] = [
    { label: 'Due Date (Earliest First)', value: 'dueDate-asc' },
    { label: 'Due Date (Latest First)', value: 'dueDate-desc' },
    { label: 'Priority (High to Low)', value: 'priority-desc' },
    { label: 'Priority (Low to High)', value: 'priority-asc' },
    { label: 'Title (A-Z)', value: 'title-asc' },
    { label: 'Title (Z-A)', value: 'title-desc' },
    { label: 'Status', value: 'status' },
  ];

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (formData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    }
    setIsDialogOpen(false);
  };

  const toggleFilter = (filter: FilterOption) => {
    const exists = filters.some(
      f => f.type === filter.type && f.value === filter.value
    );
    
    if (exists) {
      setFilters(filters.filter(
        f => !(f.type === filter.type && f.value === filter.value)
      ));
    } else {
      setFilters([...filters, filter]);
    }
  };

  const clearFilters = () => {
    setFilters([]);
    setSearchTerm('');
  };

  const clientFilteredTasks = filterClient
    ? tasks.filter(task => task.clientId === filterClient)
    : tasks;

  const taskCounts: TaskCount = {
    total: clientFilteredTasks.length,
    completed: clientFilteredTasks.filter(task => task.status === 'done').length,
    todo: clientFilteredTasks.filter(task => task.status === 'todo').length,
    inProgress: clientFilteredTasks.filter(task => task.status === 'in-progress').length,
    review: clientFilteredTasks.filter(task => task.status === 'review').length,
    done: clientFilteredTasks.filter(task => task.status === 'done').length,
    upcoming: clientFilteredTasks.filter(task => task.dueDate && isAfter(task.dueDate, new Date())).length
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = clientFilteredTasks.filter(task => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        (task.description?.toLowerCase().includes(searchLower)) ||
        (task.assigneeName?.toLowerCase().includes(searchLower)) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
    
    filtered = filtered.filter(task => {
      if (filters.length === 0) return true;
      
      return filters.every(filter => {
        switch (filter.type) {
          case 'status':
            return task.status === filter.value;
          case 'priority':
            return task.priority === filter.value;
          case 'assignee':
            if (filter.value === 'unassigned') {
              return !task.assignedTo;
            }
            return task.assignedTo === filter.value;
          case 'dueDate':
            if (!task.dueDate) return filter.value === 'none';
            if (filter.value === 'today') return isToday(task.dueDate);
            if (filter.value === 'upcoming') {
              return isAfter(task.dueDate, new Date()) && 
                     isBefore(task.dueDate, addDays(new Date(), 7));
            }
            if (filter.value === 'overdue') {
              return isBefore(task.dueDate, new Date()) && !isToday(task.dueDate);
            }
            return true;
          default:
            return true;
        }
      });
    });
    
    const [sortField, sortOrder] = sortBy.split('-');
    
    return [...filtered].sort((a, b) => {
      switch (sortField) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return sortOrder === 'asc' 
            ? a.dueDate.getTime() - b.dueDate.getTime()
            : b.dueDate.getTime() - a.dueDate.getTime();
        
        case 'priority': {
          const priorityValues = { high: 3, medium: 2, low: 1 };
          const priorityA = priorityValues[a.priority] || 0;
          const priorityB = priorityValues[b.priority] || 0;
          return sortOrder === 'asc' 
            ? priorityA - priorityB
            : priorityB - priorityA;
        }
        
        case 'title':
          return sortOrder === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        
        case 'status': {
          const statusValues = { todo: 1, 'in-progress': 2, review: 3, done: 4 };
          const statusA = statusValues[a.status] || 0;
          const statusB = statusValues[b.status] || 0;
          return statusA - statusB;
        }
        
        default:
          return 0;
      }
    });
  }, [clientFilteredTasks, sortBy, filters, searchTerm]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return <Badge variant="outline" className="bg-slate-100 text-slate-800">To Do</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'review':
        return <Badge className="bg-purple-500">Review</Badge>;
      case 'done':
        return <Badge className="bg-green-500">Done</Badge>;
      default:
        return null;
    }
  };

  const isFilterActive = (type: string, value: string) => {
    return filters.some(f => f.type === type && f.value === value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{taskCounts.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{taskCounts.todo}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{taskCounts.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{taskCounts.review}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{taskCounts.completed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
                {filters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {filters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => clearFilters()}>
                  Clear all filters
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuGroup>
                <DropdownMenuItem className="font-semibold">Status</DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('status', 'todo') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'status', value: 'todo', label: 'To Do' })}
                >
                  To Do
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('status', 'in-progress') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'status', value: 'in-progress', label: 'In Progress' })}
                >
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('status', 'review') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'status', value: 'review', label: 'Review' })}
                >
                  Review
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('status', 'done') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'status', value: 'done', label: 'Done' })}
                >
                  Done
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuGroup>
                <DropdownMenuItem className="font-semibold">Priority</DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('priority', 'high') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'priority', value: 'high', label: 'High' })}
                >
                  High
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('priority', 'medium') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'priority', value: 'medium', label: 'Medium' })}
                >
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('priority', 'low') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'priority', value: 'low', label: 'Low' })}
                >
                  Low
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuGroup>
                <DropdownMenuItem className="font-semibold">Due Date</DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('dueDate', 'today') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'dueDate', value: 'today', label: 'Today' })}
                >
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('dueDate', 'upcoming') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'dueDate', value: 'upcoming', label: 'Next 7 days' })}
                >
                  Next 7 days
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('dueDate', 'overdue') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'dueDate', value: 'overdue', label: 'Overdue' })}
                >
                  Overdue
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('dueDate', 'none') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'dueDate', value: 'none', label: 'No due date' })}
                >
                  No due date
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuGroup>
                <DropdownMenuItem className="font-semibold">Assignee</DropdownMenuItem>
                <DropdownMenuItem 
                  className={isFilterActive('assignee', 'unassigned') ? 'bg-accent' : ''}
                  onClick={() => toggleFilter({ type: 'assignee', value: 'unassigned', label: 'Unassigned' })}
                >
                  Unassigned
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTasks.length > 0 ? (
              filteredAndSortedTasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleTaskClick(task)}
                >
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    {task.dueDate ? format(task.dueDate, 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{task.assigneeName || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map(tag => (
                        <Badge key={tag} className="mr-1 bg-slate-200 text-slate-800">{tag}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No tasks match your filters or search criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here.
            </DialogDescription>
          </DialogHeader>
          <TaskForm 
            task={editingTask || undefined} 
            onSubmit={handleFormSubmit} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
