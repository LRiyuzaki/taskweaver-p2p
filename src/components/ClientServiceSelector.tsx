
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Separator } from '@/components/ui/separator';
import { useClientContext } from '@/contexts/ClientContext';

interface ClientServiceSelectorProps {
  clientId: string;
  selectedServices: Record<string, boolean>;
  onServiceChange: (serviceName: string, isSelected: boolean) => void;
}

export const ClientServiceSelector: React.FC<ClientServiceSelectorProps> = ({
  clientId,
  selectedServices,
  onServiceChange,
}) => {
  const { serviceTypes } = useClientContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Group services by category
  const servicesByCategory: Record<string, any[]> = {};
  
  serviceTypes.forEach(service => {
    if (!servicesByCategory[service.category]) {
      servicesByCategory[service.category] = [];
    }
    servicesByCategory[service.category].push(service);
  });
  
  // Filter services by search term
  const filteredCategories = Object.keys(servicesByCategory).filter(category => {
    if (searchTerm === '') return true;
    
    // Check if category name contains search term
    if (category.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    
    // Check if any service in category contains search term
    return servicesByCategory[category].some(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Count selected services
  const selectedCount = Object.values(selectedServices).filter(Boolean).length;
  const totalServices = serviceTypes.length;
  const selectionProgress = totalServices > 0 ? (selectedCount / totalServices) * 100 : 0;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Available Services</h3>
        <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
      </div>
      
      <ProgressBar
        value={selectionProgress}
        max={100}
        variant={selectedCount > 0 ? "success" : "default"}
        className="h-1.5"
      />
      
      <div className="relative">
        <input
          type="text"
          placeholder="Search services..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="max-h-[500px] overflow-y-auto pr-1">
        {filteredCategories.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No services found</p>
        ) : (
          filteredCategories.map((category) => (
            <div key={category} className="mb-4">
              <h4 className="font-medium text-sm mb-2">{category}</h4>
              <Card>
                <CardContent className="p-2">
                  {servicesByCategory[category]
                    .filter(service => 
                      searchTerm === '' || 
                      service.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((service) => (
                      <div key={service.id} className="flex items-center space-x-2 py-1.5">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={selectedServices[service.name] || false}
                          onCheckedChange={(checked) => {
                            // Only use onCheckedChange, not both this and onClick on label
                            onServiceChange(service.name, checked === true);
                          }}
                        />
                        <Label 
                          htmlFor={`service-${service.id}`}
                          className="cursor-pointer flex-1 text-sm"
                        >
                          {service.name}
                        </Label>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
