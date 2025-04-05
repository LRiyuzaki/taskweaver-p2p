
import React, { useState, useEffect } from 'react';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { Table } from '@/contexts/DatabaseContext';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Plus, Database, Users, CheckCircle2 } from 'lucide-react';
import { ClientForm } from '@/components/ClientForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTaskContext } from '@/contexts/TaskContext';
import { TaskListView } from '@/components/TaskListView';
import { ClientFormData } from '@/types/client';

const ClientManagement = () => {
  const { tables, createTable, addField, addRow } = useDatabaseContext();
  const { addTask } = useTaskContext();
  const [clientTable, setClientTable] = useState<Table | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeClient, setActiveClient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('clients');

  // Initialize client table if it doesn't exist
  useEffect(() => {
    const existingTable = tables.find(table => table.name === 'Clients');
    
    if (existingTable) {
      setClientTable(existingTable);
    } else {
      // Create client table
      const tableId = uuidv4();
      createTable({
        name: 'Clients',
        icon: 'users',
        color: '#4f46e5',
      });
      
      // Add fields to the client table
      setTimeout(() => {
        const newTable = tables.find(table => table.name === 'Clients');
        if (newTable) {
          addField(newTable.id, { name: 'Client Name', type: 'text', required: true });
          addField(newTable.id, { name: 'Email', type: 'email' });
          addField(newTable.id, { name: 'Company', type: 'text' });
          addField(newTable.id, { name: 'Start Date', type: 'date', required: true });
          addField(newTable.id, { name: 'GST Required', type: 'checkbox' });
          addField(newTable.id, { name: 'Income Tax Required', type: 'checkbox' });
          addField(newTable.id, { name: 'TDS Required', type: 'checkbox' });
          addField(newTable.id, { name: 'Audit Required', type: 'checkbox' });
          
          setClientTable(newTable);
        }
      }, 500);
    }
  }, [tables, createTable, addField]);

  const handleAddClient = (data: ClientFormData) => {
    if (!clientTable) return;
    
    const clientId = uuidv4();
    const currentDate = new Date();
    
    // Add client to database
    addRow(clientTable.id, {
      id: clientId,
      ...data,
      createdAt: currentDate
    });
    
    // Create tasks based on selected services
    if (data.gstRequired) {
      // Monthly GST filing task for the next 12 months
      for (let i = 0; i < 12; i++) {
        const dueDate = new Date();
        dueDate.setMonth(currentDate.getMonth() + i + 1, 7); // Due on 7th of each month
        
        addTask({
          title: `GST Filing for ${data.name}`,
          description: `Monthly GST filing for ${data.name} for the month of ${dueDate.toLocaleString('default', { month: 'long' })}`,
          status: 'todo',
          priority: 'medium',
          dueDate,
          tags: ['GST', 'Monthly'],
          clientId,
          assignedTo: '',
          recurrence: 'monthly',
          recurrenceEndDate: undefined,
        });
      }
    }
    
    if (data.incomeTaxRequired) {
      // Yearly income tax filing
      const taxDueDate = new Date(currentDate.getFullYear(), 6, 31); // July 31st
      if (taxDueDate < currentDate) {
        taxDueDate.setFullYear(taxDueDate.getFullYear() + 1);
      }
      
      addTask({
        title: `Income Tax Filing for ${data.name}`,
        description: `Annual income tax filing for ${data.name}`,
        status: 'todo',
        priority: 'high',
        dueDate: taxDueDate,
        tags: ['Income Tax', 'Yearly'],
        clientId,
        assignedTo: '',
        recurrence: 'yearly',
        recurrenceEndDate: undefined,
      });
    }
    
    if (data.tdsRequired) {
      // Quarterly TDS filing
      for (let i = 0; i < 4; i++) {
        const dueDate = new Date();
        dueDate.setMonth(Math.floor(dueDate.getMonth() / 3) * 3 + 3 * (i + 1), 7);
        
        addTask({
          title: `TDS Filing for ${data.name}`,
          description: `Quarterly TDS filing for ${data.name}`,
          status: 'todo',
          priority: 'medium',
          dueDate,
          tags: ['TDS', 'Quarterly'],
          clientId,
          assignedTo: '',
          recurrence: 'quarterly',
          recurrenceEndDate: undefined,
        });
      }
    }
    
    if (data.auditRequired) {
      // Yearly audit
      const auditDueDate = new Date(currentDate.getFullYear(), 8, 30); // September 30th
      if (auditDueDate < currentDate) {
        auditDueDate.setFullYear(auditDueDate.getFullYear() + 1);
      }
      
      addTask({
        title: `Annual Audit for ${data.name}`,
        description: `Complete annual audit for ${data.name}`,
        status: 'todo',
        priority: 'high',
        dueDate: auditDueDate,
        tags: ['Audit', 'Yearly'],
        clientId,
        assignedTo: '',
        recurrence: 'yearly',
        recurrenceEndDate: undefined,
      });
    }
    
    setDialogOpen(false);
  };

  const getClientNameById = (clientId: string) => {
    if (!clientTable) return 'Unknown Client';
    
    const client = clientTable.rows.find(row => row.id === clientId);
    const nameFieldId = clientTable.fields.find(field => field.name === 'Client Name')?.id;
    
    return client && nameFieldId ? client[nameFieldId] || 'Unnamed Client' : 'Unknown Client';
  };

  const viewClientTasks = (clientId: string) => {
    setActiveClient(clientId);
    setActiveTab('tasks');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Client Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            Database
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-semibold">Client List</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                  <DialogDescription>
                    Enter client details below. Required fields are marked with an asterisk (*).
                  </DialogDescription>
                </DialogHeader>
                <ClientForm onSubmit={handleAddClient} />
              </DialogContent>
            </Dialog>
          </div>
          
          {clientTable && clientTable.rows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientTable.rows.map(client => {
                const nameFieldId = clientTable.fields.find(field => field.name === 'Client Name')?.id;
                const emailFieldId = clientTable.fields.find(field => field.name === 'Email')?.id;
                const companyFieldId = clientTable.fields.find(field => field.name === 'Company')?.id;
                const gstFieldId = clientTable.fields.find(field => field.name === 'GST Required')?.id;
                const taxFieldId = clientTable.fields.find(field => field.name === 'Income Tax Required')?.id;
                const tdsFieldId = clientTable.fields.find(field => field.name === 'TDS Required')?.id;
                const auditFieldId = clientTable.fields.find(field => field.name === 'Audit Required')?.id;
                
                const services = [
                  gstFieldId && client[gstFieldId] ? 'GST' : null,
                  taxFieldId && client[taxFieldId] ? 'Income Tax' : null,
                  tdsFieldId && client[tdsFieldId] ? 'TDS' : null,
                  auditFieldId && client[auditFieldId] ? 'Audit' : null,
                ].filter(Boolean);
                
                return (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{nameFieldId ? client[nameFieldId] : 'Unnamed Client'}</CardTitle>
                      <CardDescription>
                        {companyFieldId && client[companyFieldId]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {emailFieldId && (
                        <p className="text-sm text-gray-500 mb-4">
                          Email: {client[emailFieldId] || 'N/A'}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {services.map(service => (
                          <span 
                            key={service} 
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => viewClientTasks(client.id)}>
                        View Tasks
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 border rounded-lg bg-gray-50">
              {clientTable ? (
                <p className="text-gray-500">No clients found. Add a client to get started.</p>
              ) : (
                <p className="text-gray-500">Loading client database...</p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tasks">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {activeClient 
                ? `Tasks for ${getClientNameById(activeClient)}`
                : 'All Client Tasks'
              }
            </h2>
            {activeClient && (
              <Button variant="outline" onClick={() => setActiveClient(null)}>
                View All Tasks
              </Button>
            )}
          </div>
          <TaskListView filterClient={activeClient} />
        </TabsContent>
        
        <TabsContent value="database">
          <h2 className="text-2xl font-semibold mb-6">Client Database</h2>
          <p className="text-lg text-gray-600 mb-6">
            View and manage the underlying database structure for client information.
            You can modify fields, add relationships, and customize the schema as needed.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/database'}>
            Go to Database Management
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientManagement;
