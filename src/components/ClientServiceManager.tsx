
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, addDays, addMonths, addYears } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';
import { Client, ClientService } from '@/types/client';
import { toast } from '@/hooks/use-toast-extensions';

interface ClientServiceManagerProps {
  client: Client;
}

export const ClientServiceManager: React.FC<ClientServiceManagerProps> = ({ client }) => {
  const { updateClient, serviceTypes } = useClientContext();
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [customRenewalDate, setCustomRenewalDate] = useState<Date>();
  const [renewalPeriod, setRenewalPeriod] = useState<'months' | 'days' | 'specificDate'>('months');
  const [renewalValue, setRenewalValue] = useState('12');
  const [reminderDays, setReminderDays] = useState('30');
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Ensure services is always an array of ClientService objects
  const clientServices: ClientService[] = Array.isArray(client.services) 
    ? client.services.filter((service): service is ClientService => 
        typeof service === 'object' && service !== null
      )
    : [];

  const handleAddService = async () => {
    if (!selectedServiceType) {
      toast.error('Please select a service type');
      return;
    }

    const serviceType = serviceTypes.find(st => st.id === selectedServiceType);
    if (!serviceType) {
      toast.error('Service type not found');
      return;
    }

    let nextRenewalDate: Date;
    const startDate = new Date();

    if (renewalPeriod === 'specificDate' && customRenewalDate) {
      nextRenewalDate = customRenewalDate;
    } else if (renewalPeriod === 'months') {
      nextRenewalDate = addMonths(startDate, parseInt(renewalValue));
    } else {
      nextRenewalDate = addDays(startDate, parseInt(renewalValue));
    }

    const newService: ClientService = {
      id: `service-${Date.now()}`,
      serviceTypeId: serviceType.id,
      serviceTypeName: serviceType.name,
      startDate,
      nextRenewalDate,
      status: 'active',
      reminderDays: parseInt(reminderDays),
      reminderType: 'email',
      isActive: true
    };

    const updatedServices: ClientService[] = [...clientServices, newService];

    try {
      await updateClient(client.id, { services: updatedServices });
      toast.success('Service added successfully');
      
      // Reset form
      setSelectedServiceType('');
      setRenewalValue('12');
      setReminderDays('30');
      setCustomRenewalDate(undefined);
      setIsAddingService(false);
    } catch (error) {
      toast.error('Failed to add service');
      console.error('Error adding service:', error);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    const updatedServices = clientServices.filter(service => service.id !== serviceId);
    
    try {
      await updateClient(client.id, { services: updatedServices });
      toast.success('Service removed successfully');
    } catch (error) {
      toast.error('Failed to remove service');
      console.error('Error removing service:', error);
    }
  };

  const handleEditService = async (serviceId: string, updates: Partial<ClientService>) => {
    const updatedServices = clientServices.map(service => 
      service.id === serviceId ? { ...service, ...updates } : service
    );
    
    try {
      await updateClient(client.id, { services: updatedServices });
      toast.success('Service updated successfully');
      setEditingServiceId(null);
    } catch (error) {
      toast.error('Failed to update service');
      console.error('Error updating service:', error);
    }
  };

  const getServiceStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Client Services</h3>
        <Button
          onClick={() => setIsAddingService(true)}
          size="sm"
          disabled={isAddingService}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {isAddingService && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Service</CardTitle>
            <CardDescription>
              Configure a new service for this client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="serviceType">Service Type</Label>
              <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((serviceType) => (
                    <SelectItem key={serviceType.id} value={serviceType.id}>
                      {serviceType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Renewal Schedule</Label>
              <div className="space-y-2">
                <Select 
                  value={renewalPeriod} 
                  onValueChange={(value: 'months' | 'days' | 'specificDate') => setRenewalPeriod(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="months">Every X Months</SelectItem>
                    <SelectItem value="days">Every X Days</SelectItem>
                    <SelectItem value="specificDate">Specific Date</SelectItem>
                  </SelectContent>
                </Select>

                {renewalPeriod !== 'specificDate' && (
                  <div>
                    <Label htmlFor="renewalValue">
                      {renewalPeriod === 'months' ? 'Months' : 'Days'}
                    </Label>
                    <Input
                      id="renewalValue"
                      type="number"
                      value={renewalValue}
                      onChange={(e) => setRenewalValue(e.target.value)}
                      placeholder={renewalPeriod === 'months' ? '12' : '365'}
                    />
                  </div>
                )}

                {renewalPeriod === 'specificDate' && (
                  <div>
                    <Label>Renewal Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !customRenewalDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customRenewalDate ? format(customRenewalDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customRenewalDate}
                          onSelect={setCustomRenewalDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="reminderDays">Reminder Days Before Renewal</Label>
              <Input
                id="reminderDays"
                type="number"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                placeholder="30"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddService}>
                <Save className="h-4 w-4 mr-2" />
                Add Service
              </Button>
              <Button variant="outline" onClick={() => setIsAddingService(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {clientServices.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No services assigned to this client yet.</p>
            </CardContent>
          </Card>
        ) : (
          clientServices.map((service) => (
            <Card key={service.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{service.serviceTypeName}</h4>
                      {getServiceStatusBadge(service.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Start Date: {format(new Date(service.startDate), 'PPP')}</p>
                      {service.nextRenewalDate && (
                        <p>Next Renewal: {format(new Date(service.nextRenewalDate), 'PPP')}</p>
                      )}
                      {service.reminderDays && (
                        <p>Reminder: {service.reminderDays} days before renewal</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingServiceId(service.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
