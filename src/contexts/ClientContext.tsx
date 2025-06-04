
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, ClientFormData, ServiceType } from '@/types/client';
import { localStorageManager } from '@/utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

interface ClientContextType {
  clients: Client[];
  addClient: (client: ClientFormData) => Promise<string>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getAvailableServiceNames: () => string[];
  getAvailableServiceTypes: () => ServiceType[];
  bulkUpdateClients: (updates: Array<{ id: string; updates: Partial<Client> }>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
};

const defaultServiceTypes: ServiceType[] = [
  {
    id: 'gst-filing',
    name: 'GST Filing',
    description: 'Monthly/Quarterly GST return filing',
    frequency: 'monthly',
    category: 'gst',
    requiresGST: true,
    applicableEntities: ['Company', 'LLP', 'Partnership', 'Proprietorship'],
    renewalPeriod: 12
  },
  {
    id: 'income-tax',
    name: 'Income Tax Filing',
    description: 'Annual income tax return filing',
    frequency: 'annually',
    category: 'incometax',
    requiresPAN: true,
    applicableEntities: ['Individual', 'Company', 'LLP', 'Partnership', 'Proprietorship', 'Trust', 'HUF'],
    renewalPeriod: 12
  },
  {
    id: 'tds-filing',
    name: 'TDS Filing',
    description: 'TDS return filing and compliance',
    frequency: 'quarterly',
    category: 'tds',
    requiresTAN: true,
    applicableEntities: ['Company', 'LLP', 'Partnership'],
    renewalPeriod: 12
  },
  {
    id: 'bookkeeping',
    name: 'Bookkeeping',
    description: 'Monthly bookkeeping and accounts maintenance',
    frequency: 'monthly',
    category: 'other',
    applicableEntities: ['Company', 'LLP', 'Partnership', 'Proprietorship'],
    renewalPeriod: 12
  },
  {
    id: 'audit',
    name: 'Statutory Audit',
    description: 'Annual statutory audit',
    frequency: 'annually',
    category: 'audit',
    applicableEntities: ['Company', 'LLP'],
    renewalPeriod: 12
  }
];

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load clients from localStorage on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const loadedClients = localStorageManager.getClients();
        setClients(loadedClients);
        
        // Initialize service types if not present
        const serviceTypes = localStorageManager.getServiceTypes();
        if (serviceTypes.length === 0) {
          localStorageManager.saveServiceTypes(defaultServiceTypes);
        }
        
        // Validate data integrity
        const { isValid, errors } = localStorageManager.validateDataIntegrity();
        if (!isValid) {
          console.warn('Data integrity issues found:', errors);
          // Attempt to repair data
          const repaired = localStorageManager.repairData();
          if (repaired) {
            const repairedClients = localStorageManager.getClients();
            setClients(repairedClients);
          }
        }
      } catch (err) {
        setError('Failed to load clients');
        console.error('Failed to load clients:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  // Save clients to localStorage whenever clients change
  useEffect(() => {
    if (!isLoading) {
      localStorageManager.saveClients(clients);
    }
  }, [clients, isLoading]);

  const addClient = async (clientData: ClientFormData): Promise<string> => {
    try {
      const newClient: Client = {
        ...clientData,
        id: uuidv4(),
        createdAt: new Date(),
        active: true,
        services: [],
        notes: [],
        documents: [],
        requiredServices: clientData.requiredServices || {}
      };

      setClients(prev => [...prev, newClient]);
      return newClient.id;
    } catch (err) {
      setError('Failed to add client');
      throw err;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>): Promise<void> => {
    try {
      setClients(prev => prev.map(client => 
        client.id === id 
          ? { ...client, ...updates }
          : client
      ));
    } catch (err) {
      setError('Failed to update client');
      throw err;
    }
  };

  const deleteClient = async (id: string): Promise<void> => {
    try {
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err) {
      setError('Failed to delete client');
      throw err;
    }
  };

  const bulkUpdateClients = async (updates: Array<{ id: string; updates: Partial<Client> }>): Promise<void> => {
    try {
      setClients(prev => {
        const updatesMap = new Map(updates.map(u => [u.id, u.updates]));
        return prev.map(client => {
          const clientUpdates = updatesMap.get(client.id);
          return clientUpdates 
            ? { ...client, ...clientUpdates }
            : client;
        });
      });
    } catch (err) {
      setError('Failed to bulk update clients');
      throw err;
    }
  };

  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  const getAvailableServiceNames = (): string[] => {
    const serviceTypes = localStorageManager.getServiceTypes();
    return serviceTypes.length > 0 
      ? serviceTypes.map(st => st.name)
      : defaultServiceTypes.map(st => st.name);
  };

  const getAvailableServiceTypes = (): ServiceType[] => {
    const serviceTypes = localStorageManager.getServiceTypes();
    return serviceTypes.length > 0 ? serviceTypes : defaultServiceTypes;
  };

  const value: ClientContextType = {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    getAvailableServiceNames,
    getAvailableServiceTypes,
    bulkUpdateClients,
    isLoading,
    error
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};
