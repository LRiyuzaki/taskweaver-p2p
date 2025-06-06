import React, { createContext, useState, useEffect, useContext } from 'react';
import { Client, ClientService, ServiceType } from '@/types/client';
import { v4 as uuidv4 } from 'uuid';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  createClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getAvailableServiceTypes: () => ServiceType[];
  assignServiceToClient: (clientId: string, serviceTypeId: string) => Promise<void>;
  removeServiceFromClient: (clientId: string, serviceTypeId: string) => Promise<void>;
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
  
  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    return addClient(clientData);
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
    try {
      const storedServiceTypes = localStorage.getItem('serviceTypes');
      return storedServiceTypes ? JSON.parse(storedServiceTypes) : [];
    } catch (error) {
      console.error("Failed to load service types from local storage:", error);
      return [];
    }
  };

  const assignServiceToClient = async (clientId: string, serviceTypeId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Logic to assign service to client
      setClients(prevClients =>
        prevClients.map(client => {
          if (client.id === clientId) {
            const serviceType = getAvailableServiceTypes().find(st => st.id === serviceTypeId);
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
              return {
                ...client,
                services: [...(client.services || []), newService],
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
      // Logic to remove service from client
      setClients(prevClients =>
        prevClients.map(client => {
          if (client.id === clientId) {
            return {
              ...client,
              services: (client.services || []).filter((service: any) => {
                if (typeof service === 'string') {
                  return service !== serviceTypeId;
                } else {
                  return service.serviceTypeId !== serviceTypeId;
                }
              }),
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

  const value: ClientContextType = {
    clients,
    addClient,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    getAvailableServiceTypes,
    assignServiceToClient,
    removeServiceFromClient,
    loading,
    error
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};
