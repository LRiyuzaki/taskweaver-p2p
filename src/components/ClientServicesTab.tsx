
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ClientServiceSelector } from './ClientServiceSelector';
import { ServiceRenewalSelector } from './ServiceRenewalSelector';
import { Button } from '@/components/ui/button';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { toast } from '@/hooks/use-toast';
import { Client } from '@/types/client';
import { SaveIcon } from 'lucide-react';

interface ClientServicesTabProps {
  client: Client;
}

export const ClientServicesTab: React.FC<ClientServicesTabProps> = ({ client }) => {
  const { updateClient, getAvailableServiceNames } = useClientContext();
  const { addTask } = useTaskContext();
  
  const availableServices = getAvailableServiceNames();
  
  // Initialize selected services from client data
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>(
    client.requiredServices || {}
  );
  
  // Initialize renewal settings
  const [renewalSettings, setRenewalSettings] = useState<Record<string, {
    isRequired: boolean;
    reminderDays: number;
    reminderDate?: Date;
    reminderType: 'days' | 'date';
  }>>(
    availableServices.reduce((acc, serviceName) => {
      acc[serviceName] = {
        isRequired: false,
        reminderDays: 30,
        reminderType: 'days'
      };
      return acc;
    }, {} as Record<string, any>)
  );
  
  const handleServiceChange = (serviceName: string, isSelected: boolean) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceName]: isSelected
    }));
  };
  
  const handleRenewalRequiredChange = (serviceName: string, isRequired: boolean) => {
    setRenewalSettings(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        isRequired
      }
    }));
  };
  
  const handleReminderDaysChange = (serviceName: string, days: number) => {
    setRenewalSettings(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        reminderDays: days
      }
    }));
  };
  
  const handleReminderDateChange = (serviceName: string, date?: Date) => {
    setRenewalSettings(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        reminderDate: date
      }
    }));
  };
  
  const handleReminderTypeChange = (serviceName: string, type: 'days' | 'date') => {
    setRenewalSettings(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        reminderType: type
      }
    }));
  };
  
  const handleSaveServices = () => {
    // Update client with selected services
    updateClient(client.id, {
      requiredServices: selectedServices
    });
    
    // Create tasks for services with renewal required
    const selectedServiceNames = Object.entries(selectedServices)
      .filter(([_, isSelected]) => isSelected)
      .map(([name]) => name);
    
    for (const serviceName of selectedServiceNames) {
      const renewalSetting = renewalSettings[serviceName];
      
      if (renewalSetting?.isRequired) {
        // Create a task for this service renewal
        const today = new Date();
        
        let reminderDate: Date;
        if (renewalSetting.reminderType === 'days') {
          // Calculate date based on days before
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + renewalSetting.reminderDays);
          reminderDate = dueDate;
        } else {
          reminderDate = renewalSetting.reminderDate || new Date();
        }
        
        addTask({
          title: `${serviceName} Renewal for ${client.name}`,
          description: `Prepare and complete the renewal process for ${serviceName} service for client ${client.name}`,
          status: 'todo',
          priority: 'medium',
          dueDate: reminderDate,
          clientId: client.id,
          clientName: client.name,
          tags: [serviceName, 'Renewal', 'Compliance'],
          recurrence: 'none'
        });
      }
    }
    
    toast({
      title: "Services Updated",
      description: "Client services have been updated successfully.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="select">
        <TabsList>
          <TabsTrigger value="select">Select Services</TabsTrigger>
          <TabsTrigger value="renewal">Renewal Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="select" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Services Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientServiceSelector 
                clientId={client.id}
                selectedServices={selectedServices}
                onServiceChange={handleServiceChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="renewal" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Renewal Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(selectedServices)
                  .filter(([_, isSelected]) => isSelected)
                  .map(([serviceName]) => (
                    <ServiceRenewalSelector
                      key={serviceName}
                      serviceName={serviceName}
                      isRenewalRequired={renewalSettings[serviceName]?.isRequired || false}
                      onRenewalChange={(isRequired) => handleRenewalRequiredChange(serviceName, isRequired)}
                      reminderDays={renewalSettings[serviceName]?.reminderDays || 30}
                      onReminderDaysChange={(days) => handleReminderDaysChange(serviceName, days)}
                      reminderDate={renewalSettings[serviceName]?.reminderDate}
                      onReminderDateChange={(date) => handleReminderDateChange(serviceName, date)}
                      reminderType={renewalSettings[serviceName]?.reminderType || 'days'}
                      onReminderTypeChange={(type) => handleReminderTypeChange(serviceName, type)}
                    />
                  ))}
                
                {Object.entries(selectedServices).filter(([_, isSelected]) => isSelected).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No services selected. Please select services in the "Select Services" tab first.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveServices}>
          <SaveIcon className="mr-2 h-4 w-4" />
          Save Service Settings
        </Button>
      </div>
    </div>
  );
};
