
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  Calendar as CalendarIcon, 
  ListFilter,
  RepeatIcon
} from 'lucide-react';
import { TaskBoard } from '@/components/TaskBoard';
import { TaskListView } from '@/components/TaskListView';
import { TaskCalendarView } from '@/components/TaskCalendarView';
import { RecurringTasksPanel } from '@/components/RecurringTasksPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const TasksPage = () => {
  const [activeView, setActiveView] = useState('board');

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <BreadcrumbNavigation />
            
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <ClipboardList className="mr-2 h-6 w-6 md:h-8 md:w-8" />
                <span className="hidden sm:inline">Tasks Management</span>
                <span className="sm:hidden">Tasks</span>
              </h1>
            </div>

            <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none">
                <TabsTrigger value="board" className="flex items-center gap-1 text-xs lg:text-sm">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Board</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-1 text-xs lg:text-sm">
                  <ListFilter className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-1 text-xs lg:text-sm">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </TabsTrigger>
                <TabsTrigger value="recurring" className="flex items-center gap-1 text-xs lg:text-sm">
                  <RepeatIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Recurring</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="board" className="space-y-6">
                <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">Failed to load task board</div>}>
                  <TaskBoard />
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="list" className="space-y-6">
                <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">Failed to load task list</div>}>
                  <TaskListView />
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6">
                <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">Failed to load calendar view</div>}>
                  <TaskCalendarView />
                </ErrorBoundary>
              </TabsContent>
              
              <TabsContent value="recurring" className="space-y-6">
                <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">Failed to load recurring tasks</div>}>
                  <RecurringTasksPanel />
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default TasksPage;
