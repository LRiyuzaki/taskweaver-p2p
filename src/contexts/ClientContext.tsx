import React, { createContext, useState, useContext, useEffect } from 'react';
import { Client, ClientFormData, ServiceType, ClientService, ServiceRenewal } from '@/types/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast-extensions';
import { useTaskContext } from './TaskContext';

interface ClientContextType {
  clients: Client[];
  serviceTypes: ServiceType[];
  clientServices: ClientService[];
  serviceRenewals: ServiceRenewal[];
  addClient: (client: ClientFormData) => string;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addServiceType: (serviceType: Omit<ServiceType, 'id'>) => string;
  updateServiceType: (id: string, serviceType: Partial<ServiceType>) => void;
  deleteServiceType: (id: string) => void;
  addClientService: (clientService: Omit<ClientService, 'id'>) => void;
  updateClientService: (clientId: string, serviceTypeId: string, clientService: Partial<ClientService>) => void;
  deleteClientService: (clientId: string, serviceTypeId: string) => void;
  addServiceRenewal: (serviceRenewal: Omit<ServiceRenewal, 'id'>) => string;
  updateServiceRenewal: (id: string, serviceRenewal: Partial<ServiceRenewal>) => void;
  deleteServiceRenewal: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
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

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      try {
        const parsedClients = JSON.parse(savedClients);
        return parsedClients.map((client: any) => ({
          ...client,
          createdAt: new Date(client.createdAt),
          startDate: client.startDate ? new Date(client.startDate) : undefined,
        }));
      } catch (e) {
        console.error('Failed to parse saved clients', e);
        return [];
      }
    }
    return [];
  });

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(() => {
    const savedServiceTypes = localStorage.getItem('serviceTypes');
    if (savedServiceTypes) {
      try {
        return JSON.parse(savedServiceTypes);
      } catch (e) {
        console.error('Failed to parse saved service types', e);
        return [];
      }
    }
    return [];
  });

  const [clientServices, setClientServices] = useState<ClientService[]>(() => {
    const savedClientServices = localStorage.getItem('clientServices');
    if (savedClientServices) {
      try {
        const parsedServices = JSON.parse(savedClientServices);
        return parsedServices.map((service: any) => ({
          ...service,
          startDate: new Date(service.startDate),
          endDate: service.endDate ? new Date(service.endDate) : undefined,
          nextRenewalDate: service.nextRenewalDate ? new Date(service.nextRenewalDate) : undefined,
          reminderDate: service.reminderDate ? new Date(service.reminderDate) : undefined,
        }));
      } catch (e) {
        console.error('Failed to parse saved client services', e);
        return [];
      }
    }
    return [];
  });

  const [serviceRenewals, setServiceRenewals] = useState<ServiceRenewal[]>(() => {
    const savedServiceRenewals = localStorage.getItem('serviceRenewals');
    if (savedServiceRenewals) {
      try {
        const parsedRenewals = JSON.parse(savedServiceRenewals);
        return parsedRenewals.map((renewal: any) => ({
          ...renewal,
          dueDate: new Date(renewal.dueDate),
          completedDate: renewal.completedDate ? new Date(renewal.completedDate) : undefined,
        }));
      } catch (e) {
        console.error('Failed to parse saved service renewals', e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('serviceTypes', JSON.stringify(serviceTypes));
  }, [serviceTypes]);

  useEffect(() => {
    localStorage.setItem('clientServices', JSON.stringify(clientServices));
  }, [clientServices]);

  useEffect(() => {
    localStorage.setItem('serviceRenewals', JSON.stringify(serviceRenewals));
  }, [serviceRenewals]);
  
  const taskContext = useTaskContext();

  const addClient = (clientData: ClientFormData) => {
    const newClient: Client = {
      ...clientData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    setClients((prev) => [...prev, newClient]);
    toast.success(`Client "${newClient.name}" was created successfully`);
    return newClient.id;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) => (client.id === id ? { ...client, ...clientData } : client))
    );
    toast.success('Client updated successfully');
  };

  const deleteClient = (id: string) => {
    if (taskContext) {
      taskContext.deleteClientTasks(id);
    }
    
    setClients(prev => prev.filter(client => client.id !== id));
    toast.success("Client deleted successfully");
  };

  const addServiceType = (serviceTypeData: Omit<ServiceType, 'id'>) => {
    const newServiceType: ServiceType = {
      ...serviceTypeData,
      id: uuidv4(),
    };
    setServiceTypes((prev) => [...prev, newServiceType]);
    toast.success(`Service type "${newServiceType.name}" was created successfully`);
    return newServiceType.id;
  };

  const updateServiceType = (id: string, serviceTypeData: Partial<ServiceType>) => {
    setServiceTypes((prev) =>
      prev.map((serviceType) => (serviceType.id === id ? { ...serviceType, ...serviceTypeData } : serviceType))
    );
    toast.success('Service type updated successfully');
  };

  const deleteServiceType = (id: string) => {
    setServiceTypes((prev) => prev.filter((serviceType) => serviceType.id !== id));
    toast.success('Service type deleted successfully');
  };

  const addClientService = (clientServiceData: Omit<ClientService, 'id'>) => {
    const newClientService: ClientService = {
      ...clientServiceData,
    };
    setClientServices((prev) => [...prev, newClientService]);
    toast.success(`Service "${clientServiceData.serviceTypeName}" was added to client`);
  };

  const updateClientService = (clientId: string, serviceTypeId: string, clientServiceData: Partial<ClientService>) => {
    setClientServices((prev) =>
      prev.map((service) => {
        if (service.clientId === clientId && service.serviceTypeId === serviceTypeId) {
          return { ...service, ...clientServiceData };
        }
        return service;
      })
    );
    toast.success('Client service updated successfully');
  };

  const deleteClientService = (clientId: string, serviceTypeId: string) => {
    setClientServices((prev) =>
      prev.filter((service) => !(service.clientId === clientId && service.serviceTypeId === serviceTypeId))
    );
    toast.success('Client service deleted successfully');
  };

  const addServiceRenewal = (serviceRenewalData: Omit<ServiceRenewal, 'id'>) => {
    const newServiceRenewal: ServiceRenewal = {
      ...serviceRenewalData,
      id: uuidv4(),
    };
    setServiceRenewals((prev) => [...prev, newServiceRenewal]);
    toast.success('Service renewal added successfully');
    return newServiceRenewal.id;
  };

  const updateServiceRenewal = (id: string, serviceRenewalData: Partial<ServiceRenewal>) => {
    setServiceRenewals((prev) =>
      prev.map((renewal) => (renewal.id === id ? { ...renewal, ...serviceRenewalData } : renewal))
    );
    toast.success('Service renewal updated successfully');
  };

  const deleteServiceRenewal = (id: string) => {
    setServiceRenewals((prev) => prev.filter((renewal) => renewal.id !== id));
    toast.success('Service renewal deleted successfully');
  };

  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  const getAvailableServiceNames = (): string[] => {
    return serviceTypes.map(type => type.name);
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        serviceTypes,
        clientServices,
        serviceRenewals,
        addClient,
        updateClient,
        deleteClient,
        addServiceType,
        updateServiceType,
        deleteServiceType,
        addClientService,
        updateClientService,
        deleteClientService,
        addServiceRenewal,
        updateServiceRenewal,
        deleteServiceRenewal,
        getClientById,
        getAvailableServiceNames
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};
