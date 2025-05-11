
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTaskContext } from '@/contexts/TaskContext';

interface ReportFiltersProps {
  filters: {
    employeeName: string;
    taskName: string;
    projectName: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  const { tasks } = useTaskContext();
  const [isOpen, setIsOpen] = useState(false);

  // Get unique assignees, task names, and project names
  const uniqueAssignees = [...new Set(tasks
    .filter(task => task.assigneeName)
    .map(task => task.assigneeName))];
  
  const uniqueProjects = [...new Set(tasks
    .filter(task => task.projectName)
    .map(task => task.projectName))];

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    onFilterChange('employeeName', '');
    onFilterChange('taskName', '');
    onFilterChange('projectName', '');
  };

  const handleEmployeeSelect = (employee: string) => {
    onFilterChange('employeeName', employee);
    setIsOpen(false);
  };

  const handleProjectSelect = (project: string) => {
    onFilterChange('projectName', project);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Filter by Task Name</p>
              <Input
                placeholder="Search tasks..."
                value={filters.taskName}
                onChange={(e) => onFilterChange('taskName', e.target.value)}
                className="h-8"
              />
            </div>

            <DropdownMenuSeparator />

            <p className="text-sm font-medium mt-2">Filter by Employee</p>
            <div className="max-h-40 overflow-y-auto my-1">
              {uniqueAssignees.length > 0 ? (
                uniqueAssignees.map((assignee) => (
                  <DropdownMenuItem 
                    key={assignee}
                    className="cursor-pointer"
                    onSelect={() => handleEmployeeSelect(assignee as string)}
                  >
                    {assignee}
                    {filters.employeeName === assignee && (
                      <span className="ml-auto">✓</span>
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="text-sm text-muted-foreground p-2">No employees found</div>
              )}
            </div>
            
            <DropdownMenuSeparator />

            <p className="text-sm font-medium mt-2">Filter by Project</p>
            <div className="max-h-40 overflow-y-auto my-1">
              {uniqueProjects.length > 0 ? (
                uniqueProjects.map((project) => (
                  <DropdownMenuItem 
                    key={project}
                    className="cursor-pointer"
                    onSelect={() => handleProjectSelect(project as string)}
                  >
                    {project}
                    {filters.projectName === project && (
                      <span className="ml-auto">✓</span>
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="text-sm text-muted-foreground p-2">No projects found</div>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer justify-center text-destructive"
                onSelect={clearFilters}
              >
                <X className="h-4 w-4 mr-1" />
                Clear All Filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFilterCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-9 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
