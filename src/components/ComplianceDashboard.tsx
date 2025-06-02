
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useSupabaseClientContext } from '@/contexts/SupabaseClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { format, addMonths, isBefore, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, Receipt, AlertCircle, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplianceAnalytics } from './ComplianceAnalytics';
import { ComplianceReporting } from './ComplianceReporting';

export const ComplianceDashboard = () => {
  const { clients, loading: clientsLoading } = useSupabaseClientContext();
  const { tasks, addTask } = useTaskContext();

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  // Get current month's GST filing deadlines
  const currentMonthGSTDeadlines = clients
    .filter(client => client.isGSTRegistered)
    .map(client => {
      const dueDate = new Date();
      dueDate.setDate(20); // Default GST due date
      
      const isOverdue = isBefore(dueDate, new Date());
      const filingTask = tasks.find(task => 
        task.clientId === client.id && 
        task.tags?.includes('GST') &&
        task.dueDate &&
        isBefore(task.dueDate, endOfMonth(new Date())) &&
        isBefore(startOfMonth(new Date()), task.dueDate)
      );

      return {
        clientId: client.id,
        clientName: client.name,
        gstin: client.gstin || 'N/A',
        dueDate,
        status: filingTask?.status || 'pending',
        isOverdue
      };
    });

  // Get upcoming TDS deadlines
  const upcomingTDSDeadlines = clients
    .filter(client => client.tan)
    .map(client => {
      const currentQuarter = Math.floor((new Date().getMonth() / 3));
      const quarterEndDate = addDays(addMonths(startOfMonth(new Date()), (currentQuarter + 1) * 3), -1);
      const dueDate = addDays(quarterEndDate, 7); // Default TDS due date

      const tdsTask = tasks.find(task => 
        task.clientId === client.id && 
        task.tags?.includes('TDS') &&
        task.dueDate && 
        isBefore(task.dueDate, addDays(dueDate, 1)) &&
        isBefore(quarterEndDate, task.dueDate)
      );

      return {
        clientId: client.id,
        clientName: client.name,
        tan: client.tan,
        dueDate,
        status: tdsTask?.status || 'pending'
      };
    });

  // Calculate compliance status
  const totalClients = clients.length;
  const gstRegistered = clients.filter(c => c.isGSTRegistered).length;
  const withPAN = clients.filter(c => c.pan).length;
  const withTAN = clients.filter(c => c.tan).length;
  const msmeRegistered = clients.filter(c => c.isMSME).length;
  const iecHolders = clients.filter(c => c.isIECHolder).length;

  const handleCreateTask = (clientId: string, type: 'GST' | 'TDS') => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const taskData = type === 'GST' 
      ? {
          title: `GST Filing - ${client.name}`,
          description: `Monthly GST return filing for ${format(new Date(), 'MMMM yyyy')}`,
          tags: ['GST', 'Compliance', 'Monthly'],
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20)
        }
      : {
          title: `TDS Return - ${client.name}`,
          description: `Quarterly TDS return filing for Q${Math.floor((new Date().getMonth() / 3)) + 1}`,
          tags: ['TDS', 'Compliance', 'Quarterly'],
          dueDate: addDays(addMonths(startOfMonth(new Date()), Math.floor(new Date().getMonth() / 3) * 3 + 3), 6)
        };

    addTask({
      ...taskData,
      clientId,
      clientName: client.name,
      status: 'todo',
      priority: 'high',
      recurrence: type === 'GST' ? 'monthly' : 'quarterly'
    });
  };

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="filings">Filing Status</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{totalClients}</span>
                <div className="space-y-1 text-right">
                  <div className="text-sm">
                    GST Registered: <Badge variant="outline">{gstRegistered}</Badge>
                  </div>
                  <div className="text-sm">
                    With PAN: <Badge variant="outline">{withPAN}</Badge>
                  </div>
                  <div className="text-sm">
                    With TAN: <Badge variant="outline">{withTAN}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Additional Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>MSME Registered</span>
                  <Badge>{msmeRegistered}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>IEC Holders</span>
                  <Badge>{iecHolders}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Missing Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Clients without PAN: {totalClients - withPAN}
                </div>
                <div className="text-sm text-muted-foreground">
                  Companies without CIN: {
                    clients.filter(c => c.entityType === 'Company' && !c.cin).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  LLPs without LLPIN: {
                    clients.filter(c => c.entityType === 'LLP' && !c.llpin).length
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          {clients.filter(c => c.entityType === 'Company' && !c.cin).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Missing CIN</AlertTitle>
              <AlertDescription>
                {clients.filter(c => c.entityType === 'Company' && !c.cin).length} companies don't have their CIN registered.
                Update their profile to ensure compliance.
              </AlertDescription>
            </Alert>
          )}

          {clients.filter(c => !c.pan).length > 0 && (
            <Alert>
              <Receipt className="h-4 w-4" />
              <AlertTitle>Missing PAN</AlertTitle>
              <AlertDescription>
                {clients.filter(c => !c.pan).length} clients don't have their PAN registered.
                Update their profile to ensure proper documentation.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </TabsContent>

      <TabsContent value="filings" className="space-y-6">
        {/* Filing Status Tables */}
        <Card>
          <CardHeader>
            <CardTitle>GST Filing Status - Current Month</CardTitle>
            <CardDescription>
              Monthly GST return filing status for {format(new Date(), 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMonthGSTDeadlines.length > 0 ? (
                  currentMonthGSTDeadlines.map(deadline => (
                    <TableRow key={deadline.clientId}>
                      <TableCell>{deadline.clientName}</TableCell>
                      <TableCell>{deadline.gstin}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(deadline.dueDate, 'dd MMM yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            deadline.status === 'done' ? 'default' :
                            deadline.isOverdue ? 'destructive' : 'outline'
                          }
                        >
                          {deadline.status === 'done' ? 'Completed' :
                           deadline.isOverdue ? 'Overdue' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deadline.status !== 'done' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCreateTask(deadline.clientId, 'GST')}
                          >
                            Create Task
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No GST registered clients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TDS Return Status - Current Quarter</CardTitle>
            <CardDescription>
              Quarterly TDS return filing status for Q{Math.floor((new Date().getMonth() / 3)) + 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>TAN</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingTDSDeadlines.length > 0 ? (
                  upcomingTDSDeadlines.map(deadline => (
                    <TableRow key={deadline.clientId}>
                      <TableCell>{deadline.clientName}</TableCell>
                      <TableCell>{deadline.tan}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(deadline.dueDate, 'dd MMM yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            deadline.status === 'done' ? 'default' :
                            isBefore(deadline.dueDate, new Date()) ? 'destructive' : 'outline'
                          }
                        >
                          {deadline.status === 'done' ? 'Completed' :
                           isBefore(deadline.dueDate, new Date()) ? 'Overdue' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deadline.status !== 'done' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCreateTask(deadline.clientId, 'TDS')}
                          >
                            Create Task
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No clients with TAN found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <ComplianceAnalytics />
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <ComplianceReporting />
      </TabsContent>
    </Tabs>
  );
};
