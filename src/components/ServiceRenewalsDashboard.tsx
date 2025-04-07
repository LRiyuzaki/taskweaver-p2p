
import React, { useMemo, useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, AlertTriangle, CheckCircle, Edit, Filter } from 'lucide-react';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast-extensions";

export const ServiceRenewalsDashboard: React.FC = () => {
  const { clientServices, serviceTypes, clients, updateClientService } = useClientContext();
  const [timeFrame, setTimeFrame] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [editReminderDays, setEditReminderDays] = useState<number>(30);
  
  // Get current date
  const today = new Date();
  
  // Calculate cutoff dates
  const cutoffDate = useMemo(() => {
    switch (timeFrame) {
      case '7days':
        return addDays(today, 7);
      case '30days':
        return addDays(today, 30);
      case '90days':
        return addDays(today, 90);
      default:
        return addDays(today, 365); // Show up to a year for 'all'
    }
  }, [timeFrame, today]);
  
  // Filter and process services
  const filteredServices = useMemo(() => {
    return clientServices
      .filter(service => {
        // Skip services without end/renewal dates
        if (!service.endDate) return false;
        
        const endDate = new Date(service.endDate);
        const isOverdue = isBefore(endDate, today);
        const isUpcoming = isBefore(endDate, cutoffDate) && isAfter(endDate, today);
        const isCompleted = service.status === 'completed';
        
        // Apply status filter
        switch (statusFilter) {
          case 'upcoming':
            return isUpcoming;
          case 'overdue':
            return isOverdue;
          case 'completed':
            return isCompleted;
          default:
            // For 'all', show both upcoming and overdue
            return isBefore(endDate, cutoffDate) || isOverdue;
        }
      })
      .map(service => {
        // Get service type
        const serviceType = serviceTypes.find(type => type.id === service.serviceTypeId);
        // Get client
        const client = clients.find(client => client.id === service.clientId);
        
        // Calculate days until due
        const endDate = new Date(service.endDate!);
        const daysUntilDue = differenceInDays(endDate, today);
        
        return {
          ...service,
          serviceTypeName: serviceType?.name || 'Unknown Service',
          clientName: client?.name || 'Unknown Client',
          daysUntilDue,
          status: daysUntilDue < 0 ? 'overdue' : 'upcoming'
        };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue); // Sort by days until due
  }, [clientServices, serviceTypes, clients, cutoffDate, statusFilter, today]);
  
  // Count statistics
  const overdueCount = filteredServices.filter(s => s.daysUntilDue < 0).length;
  const upcomingCount = filteredServices.filter(s => s.daysUntilDue >= 0).length;
  
  const handleEditService = (service: any) => {
    setEditingService(service);
    setEditReminderDays(service.reminderDays || 30);
    setIsEditModalOpen(true);
  };
  
  const saveReminderChanges = () => {
    if (!editingService) return;
    
    updateClientService(editingService.clientId, editingService.serviceTypeId, {
      reminderDays: editReminderDays
    });
    
    toast({
      title: "Service Updated",
      description: `Reminder period updated for ${editingService.serviceTypeName}`
    });
    
    setIsEditModalOpen(false);
  };
  
  const processRenewal = (service: any) => {
    // Mark the service as completed
    updateClientService(service.clientId, service.serviceTypeId, {
      status: 'completed'
    });
    
    toast({
      title: "Renewal Processed",
      description: `Successfully processed renewal for ${service.serviceTypeName}`
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <Card className="w-full md:w-auto flex-grow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredServices.length}</div>
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-auto flex-grow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingCount}</div>
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-auto flex-grow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueCount}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeFrame">Time Frame</Label>
            <Select
              value={timeFrame}
              onValueChange={(value: any) => setTimeFrame(value)}
            >
              <SelectTrigger id="timeFrame" className="w-[180px]">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Next 7 days</SelectItem>
                <SelectItem value="30days">Next 30 days</SelectItem>
                <SelectItem value="90days">Next 90 days</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="statusFilter">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger id="statusFilter" className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {filteredServices.length > 0 ? (
        <div className="space-y-4">
          {filteredServices.map(service => (
            <Card key={`${service.clientId}-${service.serviceTypeId}`} className={cn(
              "border-l-4",
              service.daysUntilDue < 0 ? "border-l-destructive" : 
              service.daysUntilDue < 7 ? "border-l-amber-500" : "border-l-blue-500"
            )}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-lg">{service.serviceTypeName}</h3>
                    <p className="text-muted-foreground">Client: {service.clientName}</p>
                    <div className="mt-1 text-sm">
                      <span className="text-muted-foreground">Reminder: </span>
                      {service.reminderDays || 30} days before due
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Due: {format(new Date(service.endDate), "MMM d, yyyy")}
                    </span>
                    
                    <Badge variant={service.daysUntilDue < 0 ? "destructive" : "outline"}>
                      {service.daysUntilDue < 0 
                        ? `Overdue by ${Math.abs(service.daysUntilDue)} days` 
                        : `${service.daysUntilDue} days remaining`}
                    </Badge>
                  </div>
                  
                  <div className="w-full md:w-auto flex flex-wrap gap-2 justify-end mt-2 md:mt-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Reminder
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant={service.daysUntilDue < 0 ? "destructive" : "outline"}
                      onClick={() => processRenewal(service)}
                    >
                      {service.daysUntilDue < 0 ? (
                        <AlertTriangle className="mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      {service.daysUntilDue < 0 ? "Process Overdue Renewal" : "Process Renewal"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border rounded-lg bg-muted/30">
          <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No renewals found</h3>
          <p className="text-muted-foreground">
            There are no service renewals due within the selected time frame.
          </p>
        </div>
      )}
      
      {/* Edit Reminder Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Reminder Period</DialogTitle>
            <DialogDescription>
              {editingService && (
                <>Update the reminder days for {editingService.serviceTypeName} for client {editingService.clientName}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editReminderDays">Reminder Days Before Due</Label>
              <Input
                id="editReminderDays"
                type="number"
                value={editReminderDays}
                onChange={(e) => setEditReminderDays(parseInt(e.target.value) || 30)}
                min={1}
                max={365}
              />
              <p className="text-sm text-muted-foreground">
                Tasks will be created {editReminderDays} days before the service is due for renewal.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveReminderChanges}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper function for classNames conditional
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
