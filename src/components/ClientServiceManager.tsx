
import React, { useState, useEffect } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientService, ServiceType } from '@/types/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast-extensions';

interface ClientServiceManagerProps {
  clientId: string;
}

export const ClientServiceManager: React.FC<ClientServiceManagerProps> = ({ clientId }) => {
  const { 
    clients, 
    serviceTypes, 
    assignServiceToClient, 
    removeServiceFromClient,
    updateClient 
  } = useClientContext();
  
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [renewalDate, setRenewalDate] = useState<Date>();
  const [renewalType, setRenewalType] = useState<'months' | 'days' | 'specificDate'>('months');
  const [renewalValue, setRenewalValue] = useState<string>('12');
  
  const client = clients.find(c => c.id === clientId);
  const currentServices = client?.services || [];

  const handleAddService = async () => {
    if (!selectedServiceType || !startDate) {
      toast.error('Please select a service type and start date');
      return;
    }

    const serviceType = serviceTypes.find(st => st.id === selectedServiceType);
    if (!serviceType) {
      toast.error('Service type not found');
      return;
    }

    const newService: ClientService = {
      id: uuidv4(),
      clientId: clientId,
      serviceTypeId: selectedServiceType,
      serviceTypeName: serviceType.name,
      isActive: true,
      startDate: startDate,
      endDate: endDate,
      nextRenewalDate: renewalDate,
      status: 'active',
      reminderDays: 30,
      reminderType: 'email'
    };

    try {
      if (client) {
        const updatedServices = [...currentServices, newService];
        await updateClient(clientId, { services: updatedServices });
        toast.success('Service added successfully');
        
        // Reset form
        setSelectedServiceType('');
        setStartDate(undefined);
        setEndDate(undefined);
        setRenewalDate(undefined);
      }
    } catch (error) {
      toast.error('Failed to add service');
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    try {
      const updatedServices = currentServices.filter(s => 
        typeof s === 'object' ? s.id !== serviceId : s !== serviceId
      );
      if (client) {
        await updateClient(clientId, { services: updatedServices });
        toast.success('Service removed successfully');
      }
    } catch (error) {
      toast.error('Failed to remove service');
    }
  };

  const calculateRenewalDate = () => {
    if (!startDate) return;
    
    const renewal = new Date(startDate);
    
    if (renewalType === 'months') {
      renewal.setMonth(renewal.getMonth() + parseInt(renewalValue));
    } else if (renewalType === 'days') {
      renewal.setDate(renewal.getDate() + parseInt(renewalValue));
    }
    
    setRenewalDate(renewal);
  };

  useEffect(() => {
    if (renewalType !== 'specificDate') {
      calculateRenewalDate();
    }
  }, [startDate, renewalType, renewalValue]);

  const availableServiceTypes = serviceTypes.filter(st => 
    !currentServices.some(cs => 
      typeof cs === 'object' ? cs.serviceTypeId === st.id : cs === st.id
    )
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Service</CardTitle>
          <CardDescription>
            Assign services to this client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceType">Service Type</Label>
              <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {availableServiceTypes.map((serviceType) => (
                    <SelectItem key={serviceType.id} value={serviceType.id}>
                      {serviceType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Renewal Period</Label>
              <Select value={renewalType} onValueChange={(value: 'months' | 'days' | 'specificDate') => setRenewalType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="specificDate">Specific Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renewalType !== 'specificDate' && (
              <div>
                <Label>Period Value</Label>
                <Input
                  type="number"
                  value={renewalValue}
                  onChange={(e) => setRenewalValue(e.target.value)}
                  placeholder="Enter number"
                />
              </div>
            )}

            <div>
              <Label>Renewal Date</Label>
              {renewalType === 'specificDate' ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !renewalDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {renewalDate ? format(renewalDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={renewalDate}
                      onSelect={setRenewalDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  value={renewalDate ? format(renewalDate, "PPP") : "Auto-calculated"}
                  disabled
                />
              )}
            </div>
          </div>

          <Button onClick={handleAddService} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Services</CardTitle>
          <CardDescription>
            Services currently assigned to this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentServices.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No services assigned to this client yet.
            </p>
          ) : (
            <div className="space-y-3">
              {currentServices.map((service, index) => {
                const serviceObj = typeof service === 'object' ? service : null;
                const serviceName = serviceObj?.serviceTypeName || 'Unknown Service';
                const serviceId = serviceObj?.id || `service-${index}`;
                
                return (
                  <div
                    key={serviceId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{serviceName}</span>
                        <Badge variant={serviceObj?.isActive ? 'default' : 'secondary'}>
                          {serviceObj?.status || 'Active'}
                        </Badge>
                      </div>
                      {serviceObj && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Started: {serviceObj.startDate ? format(new Date(serviceObj.startDate), "PPP") : 'N/A'}
                          {serviceObj.nextRenewalDate && (
                            <span className="ml-4">
                              Next Renewal: {format(new Date(serviceObj.nextRenewalDate), "PPP")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveService(serviceId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
