
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { DataTable } from "@/components/DataTable";
import { DatabaseSidebar } from "@/components/DatabaseSidebar";
import { useDatabaseContext } from "@/contexts/DatabaseContext";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { CreateTableDialog } from "@/components/CreateTableDialog";

const Database = () => {
  const { activeTable, tables } = useDatabaseContext();
  const [isCreateTableDialogOpen, setIsCreateTableDialogOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <DatabaseSidebar />
        <main className="flex-1 overflow-auto p-6">
          {tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-2xl font-bold mb-4">No tables yet</h2>
              <p className="text-muted-foreground mb-8">Create your first table to get started</p>
              <Button 
                onClick={() => setIsCreateTableDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Table
              </Button>
            </div>
          ) : activeTable ? (
            <DataTable />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-xl font-medium mb-4">Select a table</h2>
              <p className="text-muted-foreground">Choose a table from the sidebar or create a new one</p>
            </div>
          )}
        </main>
      </div>
      <CreateTableDialog 
        open={isCreateTableDialogOpen} 
        onOpenChange={setIsCreateTableDialogOpen}
      />
    </div>
  );
};

export default Database;
