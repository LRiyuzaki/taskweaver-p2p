import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Client, ClientFormData, ServiceType, ClientService } from '@/types/client';
import { toast } from '@/hooks/use-toast';

interface ClientContextType {
  clients: Client[];
  serviceTypes: ServiceType[];
  clientServices: ClientService[];
  addClient: (client: ClientFormData) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  addServiceType: (serviceType: Omit<ServiceType, 'id'>) => void;
  updateServiceType: (id: string, serviceType: Partial<ServiceType>) => void;
  deleteServiceType: (id: string) => void;
  addClientService: (clientService: Omit<ClientService, 'id'>) => void;
  updateClientService: (clientId: string, serviceTypeId: string, clientService: Partial<ClientService>) => void;
  deleteClientService: (clientId: string, serviceTypeId: string) => void;
  getAvailableServiceNames: () => string[];
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
};

// Sample service types for initial data
const initialServiceTypes: ServiceType[] = [
  {
    id: '1',
    name: 'Monthly GST Filing',
    description: 'Regular GST filing on a monthly basis',
    frequency: 'monthly',
    requiresGST: true
  },
  {
    id: '2',
    name: 'Annual Income Tax Return',
    description: 'Filing of yearly income tax returns',
    frequency: 'annually',
    requiresIncomeTax: true
  },
  {
    id: '3',
    name: 'TDS Filing',
    description: 'Tax Deducted at Source filing',
    frequency: 'quarterly',
    requiresTDS: true
  },
  {
    id: '4',
    name: 'Statutory Audit',
    description: 'Annual statutory audit of financial statements',
    frequency: 'annually',
    requiresAudit: true
  }
];

// Core service categories that map to legacy fields
const coreServices = ['GST', 'Income Tax', 'TDS', 'Audit'];

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    const savedClients = localStorage.getItem('accounting_clients');
    if (savedClients) {
      try {
        const parsedClients = JSON.parse(savedClients);
        return parsedClients.map((client: any) => {
          // Handle migration from old format to new format
          const requiredServices: Record<string, boolean> = client.requiredServices || {
            'GST': client.gstRequired || false,
            'Income Tax': client.incomeTaxRequired || false,
            'TDS': client.tdsRequired || false,
            'Audit': client.auditRequired || false
          };
          
          return {
            ...client,
            requiredServices,
            createdAt: new Date(client.createdAt),
            startDate: client.startDate ? new Date(client.startDate) : undefined,
            // Add getters for backward compatibility
            get gstRequired() { return this.requiredServices['GST'] ?? false; },
            get incomeTaxRequired() { return this.requiredServices['Income Tax'] ?? false; },
            get tdsRequired() { return this.requiredServices['TDS'] ?? false; },
            get auditRequired() { return this.requiredServices['Audit'] ?? false; }
          };
        });
      } catch (e) {
        console.error('Failed to parse saved clients', e);
        return [];
      }
    }
    return [];
  });

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(() => {
    const savedServiceTypes = localStorage.getItem('accounting_service_types');
    if (savedServiceTypes) {
      try {
        return JSON.parse(savedServiceTypes);
      } catch (e) {
        console.error('Failed to parse saved service types', e);
        return initialServiceTypes;
      }
    }
    return initialServiceTypes;
  });

  const [clientServices, setClientServices] = useState<ClientService[]>(() => {
    const savedClientServices = localStorage.getItem('accounting_client_services');
    if (savedClientServices) {
      try {
        const parsedServices = JSON.parse(savedClientServices);
        return parsedServices.map((service: any) => ({
          ...service,
          startDate: new Date(service.startDate),
          endDate: service.endDate ? new Date(service.endDate) : undefined,
        }));
      } catch (e) {
        console.error('Failed to parse saved client services', e);
        return [];
      }
    }
    return [];
  });

  // Save clients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accounting_clients', JSON.stringify(clients));
  }, [clients]);

  // Save service types to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accounting_service_types', JSON.stringify(serviceTypes));
  }, [serviceTypes]);

  // Save client services to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accounting_client_services', JSON.stringify(clientServices));
  }, [clientServices]);

  const addClient = (clientData: ClientFormData) => {
    const newClient: Client = {
      ...clientData,
      id: uuidv4(),
      createdAt: new Date(),
      // Add getters for backward compatibility
      get gstRequired() { return this.requiredServices['GST'] ?? false; },
      get incomeTaxRequired() { return this.requiredServices['Income Tax'] ?? false; },
      get tdsRequired() { return this.requiredServices['TDS'] ?? false; },
      get auditRequired() { return this.requiredServices['Audit'] ?? false; }
    };
    
    setClients((prevClients) => [...prevClients, newClient]);
    toast({
      title: "Client Added",
      description: `Client "${newClient.name}" has been added successfully.`
    });
  };

  const updateClient = (id: string, clientUpdates: Partial<Client>) => {
    setClients((prevClients) => 
      prevClients.map((client) => {
        if (client.id === id) {
          const updatedClient = { ...client, ...clientUpdates };
          
          // Ensure getters are preserved after update
          if (!('gstRequired' in updatedClient)) {
            Object.defineProperty(updatedClient, 'gstRequired', {
              get() { return this.requiredServices['GST'] ?? false; }
            });
          }
          if (!('incomeTaxRequired' in updatedClient)) {
            Object.defineProperty(updatedClient, 'incomeTaxRequired', {
              get() { return this.requiredServices['Income Tax'] ?? false; }
            });
          }
          if (!('tdsRequired' in updatedClient)) {
            Object.defineProperty(updatedClient, 'tdsRequired', {
              get() { return this.requiredServices['TDS'] ?? false; }
            });
          }
          if (!('auditRequired' in updatedClient)) {
            Object.defineProperty(updatedClient, 'auditRequired', {
              get() { return this.requiredServices['Audit'] ?? false; }
            });
          }
          
          return updatedClient;
        }
        return client;
      })
    );
    toast({
      title: "Client Updated",
      description: "Client information has been updated successfully."
    });
  };

  const deleteClient = (id: string) => {
    setClients((prevClients) => prevClients.filter((client) => client.id !== id));
    // Also delete any associated client services
    setClientServices((prevServices) => 
      prevServices.filter((service) => service.clientId !== id)
    );
    toast({
      title: "Client Deleted",
      description: "Client and associated services have been deleted."
    });
  };

  const getClientById = (id: string) => {
    return clients.find((client) => client.id === id);
  };

  const addServiceType = (serviceTypeData: Omit<ServiceType, 'id'>) => {
    const newServiceType: ServiceType = {
      ...serviceTypeData,
      id: uuidv4(),
    };
    setServiceTypes((prevTypes) => [...prevTypes, newServiceType]);
    toast({
      title: "Service Type Added",
      description: `Service type "${newServiceType.name}" has been added successfully.`
    });
  };

  const updateServiceType = (id: string, serviceTypeUpdates: Partial<ServiceType>) => {
    setServiceTypes((prevTypes) => 
      prevTypes.map((type) => 
        type.id === id ? { ...type, ...serviceTypeUpdates } : type
      )
    );
    toast({
      title: "Service Type Updated",
      description: "Service type has been updated successfully."
    });
  };

  const deleteServiceType = (id: string) => {
    setServiceTypes((prevTypes) => prevTypes.filter((type) => type.id !== id));
    // Also delete any associated client services
    setClientServices((prevServices) => 
      prevServices.filter((service) => service.serviceTypeId !== id)
    );
    toast({
      title: "Service Type Deleted",
      description: "Service type and associated client services have been deleted."
    });
  };

  const addClientService = (clientServiceData: Omit<ClientService, 'id'>) => {
    const newClientService: ClientService = {
      ...clientServiceData,
    };
    setClientServices((prevServices) => [...prevServices, newClientService]);
    toast({
      title: "Service Added to Client",
      description: "The service has been added to the client successfully."
    });
  };

  const updateClientService = (
    clientId: string, 
    serviceTypeId: string, 
    clientServiceUpdates: Partial<ClientService>
  ) => {
    setClientServices((prevServices) => 
      prevServices.map((service) => 
        (service.clientId === clientId && service.serviceTypeId === serviceTypeId) 
          ? { ...service, ...clientServiceUpdates } 
          : service
      )
    );
    toast({
      title: "Client Service Updated",
      description: "Client service has been updated successfully."
    });
  };

  const deleteClientService = (clientId: string, serviceTypeId: string) => {
    setClientServices((prevServices) => 
      prevServices.filter((service) => 
        !(service.clientId === clientId && service.serviceTypeId === serviceTypeId)
      )
    );
    toast({
      title: "Client Service Deleted",
      description: "Client service has been removed successfully."
    });
  };

  // Function to get all available service names from service types
  const getAvailableServiceNames = (): string[] => {
    // Start with core services and then add any unique ones from service types
    const serviceNames = [...coreServices];
    
    serviceTypes.forEach(serviceType => {
      // Extract service category from the name if not already in the list
      const category = serviceType.name.split(' ')[0]; // Simple extraction, can be improved
      if (!serviceNames.includes(category)) {
        serviceNames.push(category);
      }
    });
    
    return [...new Set(serviceNames)]; // Ensure uniqueness
  };

  return (
    <ClientContext.Provider value={{ 
      clients, 
      serviceTypes, 
      clientServices,
      addClient, 
      updateClient, 
      deleteClient, 
      getClientById,
      addServiceType,
      updateServiceType,
      deleteServiceType,
      addClientService,
      updateClientService,
      deleteClientService,
      getAvailableServiceNames
    }}>
      {children}
    </ClientContext.Provider>
  );
};
