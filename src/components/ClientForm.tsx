
import React, { useState, useEffect } from 'react';
import { Client, ClientFormData } from '@/types/client';
import { useClientContext } from '@/contexts/ClientContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormData) => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit }) => {
  const { getAvailableServiceNames } = useClientContext();
  const availableServices = getAvailableServiceNames();
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    company: '',
    contactPerson: '',
    phone: '',
    requiredServices: {
      'GST': false,
      'Income Tax': false,
      'TDS': false,
      'Audit': false
    },
    entityType: undefined,
    gstin: '',
    pan: '',
    address: '',
    startDate: new Date(),
  });

  // Initialize form with client data if provided
  useEffect(() => {
    if (client) {
      // Create a copy of the client object to avoid modifying the original
      const clientCopy = { ...client };

      // Ensure requiredServices contains all available services
      const requiredServices = { ...clientCopy.requiredServices };
      availableServices.forEach(service => {
        if (!(service in requiredServices)) {
          requiredServices[service] = false;
        }
      });

      setFormData({
        name: clientCopy.name,
        email: clientCopy.email,
        company: clientCopy.company,
        contactPerson: clientCopy.contactPerson || '',
        phone: clientCopy.phone || '',
        requiredServices,
        entityType: clientCopy.entityType,
        gstin: clientCopy.gstin || '',
        pan: clientCopy.pan || '',
        address: clientCopy.address || '',
        startDate: clientCopy.startDate || new Date(),
      });
    }
  }, [client, availableServices]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceCheckboxChange = (serviceName: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requiredServices: {
        ...prev.requiredServices,
        [serviceName]: checked
      }
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, startDate: date || new Date() }));
  };

  const handleSelectChange = (name: keyof ClientFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Client Name <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            name="name"
            placeholder="Full client name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Company Name <span className="text-destructive">*</span></Label>
          <Input
            id="company"
            name="company"
            placeholder="Company or business name"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            placeholder="Primary contact person"
            value={formData.contactPerson}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="contact@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startDate">Client Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !formData.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? (
                  format(formData.startDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="entityType">Entity Type</Label>
          <Select
            value={formData.entityType}
            onValueChange={handleSelectChange('entityType' as keyof ClientFormData)}
          >
            <SelectTrigger id="entityType">
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Company">Company</SelectItem>
              <SelectItem value="LLP">LLP</SelectItem>
              <SelectItem value="Partnership">Partnership</SelectItem>
              <SelectItem value="Trust">Trust</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gstin">GSTIN</Label>
          <Input
            id="gstin"
            name="gstin"
            placeholder="GSTIN number"
            value={formData.gstin}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pan">PAN</Label>
          <Input
            id="pan"
            name="pan"
            placeholder="PAN number"
            value={formData.pan}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            placeholder="Client address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label>Compliance Requirements</Label>
        <div className="grid grid-cols-2 gap-4">
          {availableServices.map((serviceName) => (
            <div key={serviceName} className="flex items-start space-x-3 space-y-0">
              <Checkbox 
                id={`service-${serviceName}`}
                checked={formData.requiredServices[serviceName] || false}
                onCheckedChange={handleServiceCheckboxChange(serviceName)}
              />
              <div>
                <Label htmlFor={`service-${serviceName}`} className="font-normal">{serviceName}</Label>
                <p className="text-muted-foreground text-xs">Client requires {serviceName} compliance</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit">
          {client ? 'Update Client' : 'Add Client'}
        </Button>
      </div>
    </form>
  );
};
