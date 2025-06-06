
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Client, ClientService, ServiceType } from '@/types/client';
import { v4 as uuidv4 } from 'uuid';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  createClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getAvailableServiceTypes: () => ServiceType[];
  getAvailableServiceNames: () => string[];
  assignServiceToClient: (clientId: string, serviceTypeId: string) => Promise<void>;
  removeServiceFromClient: (clientId: string, serviceTypeId: string) => Promise<void>;
  serviceTypes: ServiceType[];
  clientServices: ClientService[];
  addClientService: (service: ClientService) => Promise<void>;
  updateClientService: (id: string, updates: Partial<ClientService>) => Promise<void>;
  deleteClientService: (id: string) => Promise<void>;
  addServiceType: (serviceType: Omit<ServiceType, 'id' | 'createdAt'>) => Promise<void>;
  updateServiceType: (id: string, updates: Partial<ServiceType>) => Promise<void>;
  deleteServiceType: (id: string) => Promise<void>;
  serviceRenewals: any[];
  addServiceRenewal: (renewal: any) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientContext must be used within a ClientContextProvider');
  }
  return context;
};

export const ClientContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const storedClients = localStorage.getItem('clients');
      return storedClients ? JSON.parse(storedClients) : [];
    } catch (error) {
      console.error("Failed to load clients from local storage:", error);
      return [];
    }
  });
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(() => {
    try {
      const storedServiceTypes = localStorage.getItem('serviceTypes');
      return storedServiceTypes ? JSON.parse(storedServiceTypes) : [];
    } catch (error) {
      console.error("Failed to load service types from local storage:", error);
      return [];
    }
  });
  const [clientServices, setClientServices] = useState<ClientService[]>([]);
  const [serviceRenewals, setServiceRenewals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('clients', JSON.stringify(clients));
    } catch (error) {
      console.error("Failed to save clients to local storage:", error);
      setError("Failed to save clients to local storage.");
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('serviceTypes', JSON.stringify(serviceTypes));
    } catch (error) {
      console.error("Failed to save service types to local storage:", error);
    }
  }, [serviceTypes]);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newClient: Client = {
        id: uuidv4(),
        createdAt: new Date(),
        ...clientData,
      };
      setClients(prevClients => [...prevClients, newClient]);
    } catch (e) {
      setError('Failed to add client');
    } finally {
      setLoading(false);
    }
  };
  
  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    setLoading(true);
    setError(null);
    try {
      const newClient: Client = {
        id: uuidv4(),
        createdAt: new Date(),
        ...clientData,
      };
      setClients(prevClients => [...prevClients, newClient]);
      return newClient;
    } catch (e) {
      setError('Failed to create client');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    setLoading(true);
    setError(null);
    try {
      setClients(prevClients =>
        prevClients.map(client => (client.id === id ? { ...client, ...updates } : client))
      );
    } catch (e) {
      setError('Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      setClients(prevClients => prevClients.filter(client => client.id !== id));
    } catch (e) {
      setError('Failed to delete client');
    } finally {
      setLoading(false);
    }
  };

  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  const getAvailableServiceTypes = (): ServiceType[] => {
    return serviceTypes;
  };

  const getAvailableServiceNames = (): string[] => {
    return serviceTypes.map(serviceType => serviceType.name);
  };

  const assignServiceToClient = async (clientId: string, serviceTypeId: string) => {
    setLoading(true);
    setError(null);
    try {
      setClients(prevClients =>
        prevClients.map(client => {
          if (client.id === clientId) {
            const serviceType = serviceTypes.find(st => st.id === serviceTypeId);
            if (serviceType) {
              const newService: ClientService = {
                id: uuidv4(),
                clientId: client.id,
                serviceTypeId: serviceType.id,
                serviceTypeName: serviceType.name,
                isActive: true,
                startDate: new Date(),
                status: 'active' as const
              };
              const updatedServices: ClientService[] = [
                ...(client.services?.filter(s => typeof s === 'object') as ClientService[] || []),
                newService
              ];
              return {
                ...client,
                services: updatedServices,
              };
            }
          }
          return client;
        })
      );
    } catch (e) {
      setError('Failed to assign service to client');
    } finally {
      setLoading(false);
    }
  };

  const removeServiceFromClient = async (clientId: string, serviceTypeId: string) => {
    setLoading(true);
    setError(null);
    try {
      setClients(prevClients =>
        prevClients.map(client => {
          if (client.id === clientId) {
            const updatedServices = (client.services || []).filter((service: any) => {
              if (typeof service === 'string') {
                return service !== serviceTypeId;
              } else {
                return service.serviceTypeId !== serviceTypeId;
              }
            }) as ClientService[];
            return {
              ...client,
              services: updatedServices,
            };
          }
          return client;
        })
      );
    } catch (e) {
      setError('Failed to remove service from client');
    } finally {
      setLoading(false);
    }
  };

  const addServiceType = async (serviceTypeData: Omit<ServiceType, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newServiceType: ServiceType = {
        id: uuidv4(),
        createdAt: new Date(),
        ...serviceTypeData,
      };
      setServiceTypes(prev => [...prev, newServiceType]);
    } catch (e) {
      setError('Failed to add service type');
    } finally {
      setLoading(false);
    }
  };

  const updateServiceType = async (id: string, updates: Partial<ServiceType>) => {
    setLoading(true);
    setError(null);
    try {
      setServiceTypes(prev =>
        prev.map(serviceType => (serviceType.id === id ? { ...serviceType, ...updates } : serviceType))
      );
    } catch (e) {
      setError('Failed to update service type');
    } finally {
      setLoading(false);
    }
  };

  const deleteServiceType = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      setServiceTypes(prev => prev.filter(serviceType => serviceType.id !== id));
    } catch (e) {
      setError('Failed to delete service type');
    } finally {
      setLoading(false);
    }
  };

  const addClientService = async (service: ClientService) => {
    setLoading(true);
    setError(null);
    try {
      setClientServices(prev => [...prev, service]);
    } catch (e) {
      setError('Failed to add client service');
    } finally {
      setLoading(false);
    }
  };

  const updateClientService = async (id: string, updates: Partial<ClientService>) => {
    setLoading(true);
    setError(null);
    try {
      setClientServices(prev =>
        prev.map(service => (service.id === id ? { ...service, ...updates } : service))
      );
    } catch (e) {
      setError('Failed to update client service');
    } finally {
      setLoading(false);
    }
  };

  const deleteClientService = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      setClientServices(prev => prev.filter(service => service.id !== id));
    } catch (e) {
      setError('Failed to delete client service');
    } finally {
      setLoading(false);
    }
  };

  const addServiceRenewal = async (renewal: any) => {
    setLoading(true);
    setError(null);
    try {
      setServiceRenewals(prev => [...prev, renewal]);
    } catch (e) {
      setError('Failed to add service renewal');
    } finally {
      setLoading(false);
    }
  };

  const value: ClientContextType = {
    clients,
    addClient,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    getAvailableServiceTypes,
    getAvailableServiceNames,
    assignServiceToClient,
    removeServiceFromClient,
    serviceTypes,
    clientServices,
    addClientService,
    updateClientService,
    deleteClientService,
    addServiceType,
    updateServiceType,
    deleteServiceType,
    serviceRenewals,
    addServiceRenewal,
    loading,
    error
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

// Export as ClientProvider for backward compatibility
export const ClientProvider = ClientContextProvider;
