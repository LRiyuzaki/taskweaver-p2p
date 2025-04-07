
import React from 'react';
import { Header } from '@/components/Header';
import { TaskTemplateManager } from '@/components/TaskTemplateManager';

const TaskTemplatesPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <TaskTemplateManager />
        </div>
      </main>
    </div>
  );
};

export default TaskTemplatesPage;
