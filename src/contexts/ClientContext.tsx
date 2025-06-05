
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, ClientFormData, ServiceType, ClientService, ServiceRenewal, ComplianceStatus } from '@/types/client';
import { localStorageManager } from '@/utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

interface ClientContextType {
  clients: Client[];
  serviceTypes: ServiceType[];
  clientServices: ClientService[];
  serviceRenewals: ServiceRenewal[];
  addClient: (client: ClientFormData) => Promise<string>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getAvailableServiceNames: () => string[];
  getAvailableServiceTypes: () => ServiceType[];
  bulkUpdateClients: (updates: Array<{ id: string; updates: Partial<Client> }>) => Promise<void>;
  addServiceType: (serviceType: Omit<ServiceType, 'id'>) => Promise<string>;
  updateServiceType: (id: string, updates: Partial<ServiceType>) => Promise<void>;
  deleteServiceType: (id: string) => Promise<void>;
  addClientService: (clientService: Omit<ClientService, 'id'>) => Promise<string>;
  updateClientService: (clientId: string, serviceTypeId: string, updates: Partial<ClientService>) => Promise<void>;
  deleteClientService: (clientId: string, serviceTypeId: string) => Promise<void>;
  addServiceRenewal: (renewal: Omit<ServiceRenewal, 'id'>) => Promise<string>;
  getClientComplianceStatus: (clientId: string) => ComplianceStatus[];
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
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [clientServices, setClientServices] = useState<ClientService[]>([]);
  const [serviceRenewals, setServiceRenewals] = useState<ServiceRenewal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const loadedClients = localStorageManager.getClients();
        const loadedServiceTypes = localStorageManager.getServiceTypes();
        const loadedClientServices = localStorageManager.getClientServices();
        const loadedServiceRenewals = localStorageManager.getServiceRenewals();
        
        setClients(loadedClients);
        setServiceTypes(loadedServiceTypes.length > 0 ? loadedServiceTypes : defaultServiceTypes);
        setClientServices(loadedClientServices);
        setServiceRenewals(loadedServiceRenewals);
        
        // Initialize service types if not present
        if (loadedServiceTypes.length === 0) {
          localStorageManager.saveServiceTypes(defaultServiceTypes);
        }
        
        // Validate data integrity
        const { isValid, errors } = localStorageManager.validateDataIntegrity();
        if (!isValid) {
          console.warn('Data integrity issues found:', errors);
          const repaired = localStorageManager.repairData();
          if (repaired) {
            const repairedClients = localStorageManager.getClients();
            setClients(repairedClients);
          }
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      localStorageManager.saveClients(clients);
      localStorageManager.saveServiceTypes(serviceTypes);
      localStorageManager.saveClientServices(clientServices);
      localStorageManager.saveServiceRenewals(serviceRenewals);
    }
  }, [clients, serviceTypes, clientServices, serviceRenewals, isLoading]);

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
      setClientServices(prev => prev.filter(service => service.clientId !== id));
      setServiceRenewals(prev => prev.filter(renewal => renewal.clientId !== id));
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
    return serviceTypes.map(st => st.name);
  };

  const getAvailableServiceTypes = (): ServiceType[] => {
    return serviceTypes;
  };

  // Service Type methods
  const addServiceType = async (serviceTypeData: Omit<ServiceType, 'id'>): Promise<string> => {
    try {
      const newServiceType: ServiceType = {
        ...serviceTypeData,
        id: uuidv4()
      };

      setServiceTypes(prev => [...prev, newServiceType]);
      return newServiceType.id;
    } catch (err) {
      setError('Failed to add service type');
      throw err;
    }
  };

  const updateServiceType = async (id: string, updates: Partial<ServiceType>): Promise<void> => {
    try {
      setServiceTypes(prev => prev.map(serviceType => 
        serviceType.id === id 
          ? { ...serviceType, ...updates }
          : serviceType
      ));
    } catch (err) {
      setError('Failed to update service type');
      throw err;
    }
  };

  const deleteServiceType = async (id: string): Promise<void> => {
    try {
      setServiceTypes(prev => prev.filter(serviceType => serviceType.id !== id));
      setClientServices(prev => prev.filter(service => service.serviceTypeId !== id));
    } catch (err) {
      setError('Failed to delete service type');
      throw err;
    }
  };

  // Client Service methods
  const addClientService = async (clientServiceData: Omit<ClientService, 'id'>): Promise<string> => {
    try {
      const newClientService: ClientService = {
        ...clientServiceData,
        id: uuidv4()
      };

      setClientServices(prev => [...prev, newClientService]);
      return newClientService.id;
    } catch (err) {
      setError('Failed to add client service');
      throw err;
    }
  };

  const updateClientService = async (clientId: string, serviceTypeId: string, updates: Partial<ClientService>): Promise<void> => {
    try {
      setClientServices(prev => prev.map(service => 
        service.clientId === clientId && service.serviceTypeId === serviceTypeId
          ? { ...service, ...updates }
          : service
      ));
    } catch (err) {
      setError('Failed to update client service');
      throw err;
    }
  };

  const deleteClientService = async (clientId: string, serviceTypeId: string): Promise<void> => {
    try {
      setClientServices(prev => prev.filter(service => 
        !(service.clientId === clientId && service.serviceTypeId === serviceTypeId)
      ));
    } catch (err) {
      setError('Failed to delete client service');
      throw err;
    }
  };

  // Service Renewal methods
  const addServiceRenewal = async (renewalData: Omit<ServiceRenewal, 'id'>): Promise<string> => {
    try {
      const newRenewal: ServiceRenewal = {
        ...renewalData,
        id: uuidv4()
      };

      setServiceRenewals(prev => [...prev, newRenewal]);
      return newRenewal.id;
    } catch (err) {
      setError('Failed to add service renewal');
      throw err;
    }
  };

  const getClientComplianceStatus = (clientId: string): ComplianceStatus[] => {
    // This is a mock implementation - in a real app this would come from a compliance service
    const client = clients.find(c => c.id === clientId);
    if (!client) return [];

    return [
      {
        type: 'GST Filing',
        status: 'current',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: 'Monthly GST return filing'
      },
      {
        type: 'Income Tax',
        status: 'upcoming',
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        description: 'Annual income tax return'
      }
    ];
  };

  const value: ClientContextType = {
    clients,
    serviceTypes,
    clientServices,
    serviceRenewals,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    getAvailableServiceNames,
    getAvailableServiceTypes,
    bulkUpdateClients,
    addServiceType,
    updateServiceType,
    deleteServiceType,
    addClientService,
    updateClientService,
    deleteClientService,
    addServiceRenewal,
    getClientComplianceStatus,
    isLoading,
    error
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};
