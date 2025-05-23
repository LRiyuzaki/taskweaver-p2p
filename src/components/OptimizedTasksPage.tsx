import React, { useState, useMemo } from 'react';
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  Calendar as CalendarIcon, 
  ListFilter
} from 'lucide-react';
import { TaskBoard } from '@/components/TaskBoard';
import { TaskListView } from '@/components/TaskListView';
import { TaskCalendarView } from '@/components/TaskCalendarView';
import { usePerformance } from '@/contexts/PerformanceContext';

const OptimizedTasksPage = () => {
  const [activeView, setActiveView] = useState('board');
  const { isLowPerformanceMode } = usePerformance();
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  
  // Only render the active view to improve performance
  const renderActiveViewOnly = isLowPerformanceMode;
  
  // Memoize the views to avoid unnecessary re-renders
  const boardView = useMemo(() => <TaskBoard onTaskSelect={setSelectedTaskIds} />, []);
  const listView = useMemo(() => <TaskListView filterClient={undefined} />, []);
  const calendarView = useMemo(() => <TaskCalendarView onSelectedTaskIdsChange={setSelectedTaskIds} />, []);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold flex items-center">
              <ClipboardList className="mr-2 h-8 w-8" />
              Tasks Management
            </h1>
          </div>

          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="board" className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" />
                Board View
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <ListFilter className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Calendar View
              </TabsTrigger>
            </TabsList>

            {renderActiveViewOnly ? (
              // In low performance mode, only render the active view
              <>
                {activeView === 'board' && (
                  <div className="space-y-6">{boardView}</div>
                )}
                {activeView === 'list' && (
                  <div className="space-y-6">{listView}</div>
                )}
                {activeView === 'calendar' && (
                  <div className="space-y-6">{calendarView}</div>
                )}
              </>
            ) : (
              // In regular mode, render all views but hide inactive ones
              <>
                <TabsContent value="board" className="space-y-6">
                  {boardView}
                </TabsContent>
                <TabsContent value="list" className="space-y-6">
                  {listView}
                </TabsContent>
                <TabsContent value="calendar" className="space-y-6">
                  {calendarView}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default OptimizedTasksPage;
