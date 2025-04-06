
import React, { useState } from 'react';
import { useClientContext } from "@/contexts/ClientContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceType } from "@/types/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ClockIcon, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

export const ServicesManagement: React.FC = () => {
  const { serviceTypes, addServiceType, updateServiceType, deleteServiceType } = useClientContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceType | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceType>>({
    name: '',
    description: '',
    frequency: 'monthly',
    renewalPeriod: 12 // Default to 12 months
  });

  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'monthly',
      renewalPeriod: 12
    });
  };

  const handleOpenAddDialog = () => {
    resetFormData();
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (service: ServiceType) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description,
      frequency: service.frequency,
      renewalPeriod: service.renewalPeriod
    });
    setIsEditDialogOpen(true);
  };

  const handleAddService = () => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Service name is required",
        variant: "destructive"
      });
      return;
    }

    addServiceType(formData as Omit<ServiceType, 'id'>);
    setIsAddDialogOpen(false);
    resetFormData();
  };

  const handleEditService = () => {
    if (!currentService || !formData.name) {
      toast({
        title: "Error",
        description: "Service name is required",
        variant: "destructive"
      });
      return;
    }

    updateServiceType(currentService.id, formData);
    setIsEditDialogOpen(false);
    setCurrentService(null);
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      deleteServiceType(serviceId);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'one-time': return 'One-time';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'annually': return 'Annual';
      default: return frequency;
    }
  };

  const serviceForm = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service-name">Service Name</Label>
          <Input 
            id="service-name"
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Monthly GST Filing"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="service-description">Description</Label>
          <Textarea 
            id="service-description"
            value={formData.description || ''}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Brief description of this service"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="service-frequency">Frequency</Label>
          <Select 
            value={formData.frequency} 
            onValueChange={(value: 'one-time' | 'monthly' | 'quarterly' | 'annually') => 
              setFormData({...formData, frequency: value})
            }
          >
            <SelectTrigger id="service-frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-time">One-time</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="renewal-period">Renewal Period (months)</Label>
          <Input 
            id="renewal-period"
            type="number"
            value={formData.renewalPeriod || ''}
            onChange={(e) => setFormData({...formData, renewalPeriod: parseInt(e.target.value) || undefined})}
            placeholder="e.g., 12 for annual renewals"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Management</h2>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="annually">Annual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceTypes.map((service) => (
              <Card key={service.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge
                      variant="secondary"
                      className="mb-1"
                    >
                      {getFrequencyLabel(service.frequency)}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    {service.description}
                  </p>
                  
                  {service.renewalPeriod && (
                    <div className="flex items-center mt-2 text-sm">
                      <span>Renewal: {service.renewalPeriod} {service.renewalPeriod === 1 ? 'month' : 'months'}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {serviceTypes.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-3" />
              <h3 className="text-lg font-medium mb-1">No Services Defined</h3>
              <p className="text-muted-foreground">
                Add services to start creating tasks for your clients
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleOpenAddDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="monthly">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceTypes
              .filter(service => service.frequency === 'monthly')
              .map((service) => (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge variant="secondary" className="mb-1">Monthly</Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {service.description}
                    </p>
                    
                    {service.renewalPeriod && (
                      <div className="flex items-center mt-2 text-sm">
                        <span>Renewal: {service.renewalPeriod} {service.renewalPeriod === 1 ? 'month' : 'months'}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
            {serviceTypes.filter(s => s.frequency === 'monthly').length === 0 && (
              <div className="col-span-3 text-center py-8">
                <ClockIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-30 mb-2" />
                <p className="text-muted-foreground">
                  No monthly services defined
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="quarterly">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceTypes
              .filter(service => service.frequency === 'quarterly')
              .map((service) => (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge variant="secondary" className="mb-1">Quarterly</Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {service.description}
                    </p>
                    
                    {service.renewalPeriod && (
                      <div className="flex items-center mt-2 text-sm">
                        <span>Renewal: {service.renewalPeriod} {service.renewalPeriod === 1 ? 'month' : 'months'}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
            {serviceTypes.filter(s => s.frequency === 'quarterly').length === 0 && (
              <div className="col-span-3 text-center py-8">
                <ClockIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-30 mb-2" />
                <p className="text-muted-foreground">
                  No quarterly services defined
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="annually">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceTypes
              .filter(service => service.frequency === 'annually')
              .map((service) => (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge variant="secondary" className="mb-1">Annual</Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {service.description}
                    </p>
                    
                    {service.renewalPeriod && (
                      <div className="flex items-center mt-2 text-sm">
                        <span>Renewal: {service.renewalPeriod} {service.renewalPeriod === 1 ? 'month' : 'months'}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
            {serviceTypes.filter(s => s.frequency === 'annually').length === 0 && (
              <div className="col-span-3 text-center py-8">
                <ClockIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-30 mb-2" />
                <p className="text-muted-foreground">
                  No annual services defined
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Service</DialogTitle>
            <DialogDescription>
              Create a service that can be assigned to clients
            </DialogDescription>
          </DialogHeader>
          {serviceForm}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddService}>
              Add Service
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Service</DialogTitle>
            <DialogDescription>
              Modify service details
            </DialogDescription>
          </DialogHeader>
          {serviceForm}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditService}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
