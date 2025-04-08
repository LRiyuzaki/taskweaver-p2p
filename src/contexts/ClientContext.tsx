
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Client, ClientFormData, Service, Note, Document, ServiceType, ClientService, ServiceRenewal } from '@/types/client';
import { toast } from '@/hooks/use-toast-extensions';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'active' | 'services' | 'notes' | 'documents'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  toggleClientActive: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  
  // Services for a specific client
  addService: (clientId: string, service: Omit<Service, 'id'>) => string;
  updateService: (clientId: string, serviceId: string, service: Partial<Service>) => void;
  deleteService: (clientId: string, serviceId: string) => void;
  
  // Notes for clients
  addNote: (clientId: string, note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (clientId: string, noteId: string, note: Partial<Note>) => void;
  deleteNote: (clientId: string, noteId: string) => void;
  
  // Documents for clients
  addDocument: (clientId: string, document: Omit<Document, 'id' | 'uploadedAt'>) => void;
  updateDocument: (clientId: string, documentId: string, document: Partial<Document>) => void;
  deleteDocument: (clientId: string, documentId: string) => void;
  
  // Service Types (templates for services)
  serviceTypes: ServiceType[];
  addServiceType: (serviceType: Omit<ServiceType, 'id'>) => void;
  updateServiceType: (id: string, serviceType: Partial<ServiceType>) => void;
  deleteServiceType: (id: string) => void;
  
  // Client Services (specific instances of service types for clients)
  clientServices: ClientService[];
  addClientService: (clientService: Omit<ClientService, 'id'>) => void;
  updateClientService: (clientId: string, serviceTypeId: string, clientService: Partial<ClientService>) => void;
  deleteClientService: (clientId: string, serviceTypeId: string) => void;
  
  // Service Renewals
  serviceRenewals: ServiceRenewal[];
  addServiceRenewal: (serviceRenewal: Omit<ServiceRenewal, 'id'>) => void;
  updateServiceRenewal: (id: string, serviceRenewal: Partial<ServiceRenewal>) => void;
  deleteServiceRenewal: (id: string) => void;
  
  // Helper functions
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

// Create a separate context for accessing TaskContext to avoid circular dependencies
export const TaskContextAccessor = React.createContext<any>(null);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize clients from localStorage
  const [clients, setClients] = useState<Client[]>(() => {
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      try {
        const parsedClients = JSON.parse(savedClients);
        return parsedClients.map((client: any) => ({
          ...client,
          createdAt: new Date(client.createdAt),
          startDate: client.startDate ? new Date(client.startDate) : undefined,
          services: (client.services || []).map((service: any) => ({
            ...service,
            startDate: service.startDate ? new Date(service.startDate) : undefined,
            endDate: service.endDate ? new Date(service.endDate) : undefined,
            renewalDate: service.renewalDate ? new Date(service.renewalDate) : undefined,
          })),
          notes: (client.notes || []).map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
          })),
          documents: (client.documents || []).map((doc: any) => ({
            ...doc,
            uploadedAt: new Date(doc.uploadedAt),
          })),
        }));
      } catch (e) {
        console.error('Failed to parse saved clients', e);
        return [];
      }
    }
    return [];
  });
  
  // Initialize service types
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
    return [
      { id: uuidv4(), name: 'GST Filing', description: 'Monthly GST return filing', frequency: 'monthly', renewalPeriod: 1 },
      { id: uuidv4(), name: 'Income Tax Filing', description: 'Annual income tax return filing', frequency: 'annually', renewalPeriod: 12 },
      { id: uuidv4(), name: 'Bookkeeping', description: 'Monthly bookkeeping services', frequency: 'monthly', renewalPeriod: 1 },
      { id: uuidv4(), name: 'Audit', description: 'Annual audit services', frequency: 'annually', renewalPeriod: 12 },
      { id: uuidv4(), name: 'TDS Filing', description: 'Quarterly TDS return filing', frequency: 'quarterly', renewalPeriod: 3 },
    ];
  });
  
  // Initialize client services
  const [clientServices, setClientServices] = useState<ClientService[]>(() => {
    const savedClientServices = localStorage.getItem('clientServices');
    if (savedClientServices) {
      try {
        const parsedServices = JSON.parse(savedClientServices);
        return parsedServices.map((service: any) => ({
          ...service,
          startDate: service.startDate ? new Date(service.startDate) : undefined,
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
  
  // Initialize service renewals
  const [serviceRenewals, setServiceRenewals] = useState<ServiceRenewal[]>(() => {
    const savedRenewals = localStorage.getItem('serviceRenewals');
    if (savedRenewals) {
      try {
        const parsedRenewals = JSON.parse(savedRenewals);
        return parsedRenewals.map((renewal: any) => ({
          ...renewal,
          dueDate: renewal.dueDate ? new Date(renewal.dueDate) : undefined,
          completedDate: renewal.completedDate ? new Date(renewal.completedDate) : undefined,
        }));
      } catch (e) {
        console.error('Failed to parse saved service renewals', e);
        return [];
      }
    }
    return [];
  });

  // Save clients to localStorage when they change
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);
  
  // Save service types to localStorage when they change
  useEffect(() => {
    localStorage.setItem('serviceTypes', JSON.stringify(serviceTypes));
  }, [serviceTypes]);
  
  // Save client services to localStorage when they change
  useEffect(() => {
    localStorage.setItem('clientServices', JSON.stringify(clientServices));
  }, [clientServices]);
  
  // Save service renewals to localStorage when they change
  useEffect(() => {
    localStorage.setItem('serviceRenewals', JSON.stringify(serviceRenewals));
  }, [serviceRenewals]);

  // Use TaskContext safely to get the deleteClientTasks function
  const taskContextAccessor = React.useContext(TaskContextAccessor);
  
  // Helper function to get a client by ID
  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };
  
  // Helper function to get all available service names
  const getAvailableServiceNames = (): string[] => {
    return serviceTypes.map(serviceType => serviceType.name);
  };

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'active' | 'services' | 'notes' | 'documents'>) => {
    const newClient: Client = {
      ...clientData,
      id: uuidv4(),
      createdAt: new Date(),
      services: [],
      notes: [],
      documents: [],
      active: true,
    };
    setClients((prevClients) => [...prevClients, newClient]);
    toast.success(`Client "${newClient.name}" was added successfully`);
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === id ? { ...client, ...clientData } : client
      )
    );
    toast.success("Client updated successfully");
  };

  const deleteClient = (id: string) => {
    // If taskContextAccessor is available, delete associated tasks
    if (taskContextAccessor?.deleteClientTasks) {
      taskContextAccessor.deleteClientTasks(id);
    }
    
    setClients((prevClients) => prevClients.filter((client) => client.id !== id));
    toast.success("Client deleted successfully");
  };

  const toggleClientActive = (id: string) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === id ? { ...client, active: !client.active } : client
      )
    );
  };

  // Service management
  const addService = (clientId: string, serviceData: Omit<Service, 'id'>) => {
    const serviceId = uuidv4();
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            services: [
              ...(client.services || []),
              {
                ...serviceData,
                id: serviceId,
              },
            ],
          };
        }
        return client;
      })
    );
    toast.success(`Service "${serviceData.name}" was added successfully`);
    return serviceId;
  };

  const updateService = (clientId: string, serviceId: string, serviceData: Partial<Service>) => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            services: (client.services || []).map((service) =>
              service.id === serviceId ? { ...service, ...serviceData } : service
            ),
          };
        }
        return client;
      })
    );
    toast.success("Service updated successfully");
  };

  const deleteService = (clientId: string, serviceId: string) => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            services: (client.services || []).filter((service) => service.id !== serviceId),
          };
        }
        return client;
      })
    );
    toast.success("Service deleted successfully");
  };

  // Notes management
  const addNote = (clientId: string, noteData: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote = {
      ...noteData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            notes: [...(client.notes || []), newNote],
          };
        }
        return client;
      })
    );
    toast.success("Note added successfully");
  };

  const updateNote = (clientId: string, noteId: string, noteData: Partial<Note>) => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            notes: (client.notes || []).map((note) =>
              note.id === noteId ? { ...note, ...noteData } : note
            ),
          };
        }
        return client;
      })
    );
    toast.success("Note updated successfully");
  };

  const deleteNote = (clientId: string, noteId: string) => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            notes: (client.notes || []).filter((note) => note.id !== noteId),
          };
        }
        return client;
      })
    );
    toast.success("Note deleted successfully");
  };

  // Document management
  const addDocument = (clientId: string, documentData: Omit<Document, 'id' | 'uploadedAt'>) => {
    const newDocument = {
      ...documentData,
      id: uuidv4(),
      uploadedAt: new Date(),
    };
    
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            documents: [...(client.documents || []), newDocument],
          };
        }
        return client;
      })
    );
    toast.success("Document added successfully");
  };

  const updateDocument = (clientId: string, documentId: string, documentData: Partial<Document>) => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            documents: (client.documents || []).map((doc) =>
              doc.id === documentId ? { ...doc, ...documentData } : doc
            ),
          };
        }
        return client;
      })
    );
    toast.success("Document updated successfully");
  };

  const deleteDocument = (clientId: string, documentId: string) => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            documents: (client.documents || []).filter((doc) => doc.id !== documentId),
          };
        }
        return client;
      })
    );
    toast.success("Document deleted successfully");
  };
  
  // Service Type management
  const addServiceType = (serviceTypeData: Omit<ServiceType, 'id'>) => {
    const newServiceType: ServiceType = {
      ...serviceTypeData,
      id: uuidv4()
    };
    setServiceTypes(prev => [...prev, newServiceType]);
    toast.success(`Service type "${newServiceType.name}" added successfully`);
  };
  
  const updateServiceType = (id: string, serviceTypeData: Partial<ServiceType>) => {
    setServiceTypes(prev => 
      prev.map(serviceType => 
        serviceType.id === id ? { ...serviceType, ...serviceTypeData } : serviceType
      )
    );
    toast.success("Service type updated successfully");
  };
  
  const deleteServiceType = (id: string) => {
    setServiceTypes(prev => prev.filter(serviceType => serviceType.id !== id));
    toast.success("Service type deleted successfully");
  };
  
  // Client Service management
  const addClientService = (clientServiceData: Omit<ClientService, 'id'>) => {
    const serviceType = serviceTypes.find(st => st.id === clientServiceData.serviceTypeId);
    const newClientService: ClientService = {
      ...clientServiceData,
      serviceTypeName: serviceType?.name
    };
    
    setClientServices(prev => [...prev, newClientService]);
    toast.success("Client service added successfully");
  };
  
  const updateClientService = (clientId: string, serviceTypeId: string, clientServiceData: Partial<ClientService>) => {
    setClientServices(prev => 
      prev.map(cs => 
        cs.clientId === clientId && cs.serviceTypeId === serviceTypeId 
          ? { ...cs, ...clientServiceData } 
          : cs
      )
    );
    toast.success("Client service updated successfully");
  };
  
  const deleteClientService = (clientId: string, serviceTypeId: string) => {
    setClientServices(prev => 
      prev.filter(cs => !(cs.clientId === clientId && cs.serviceTypeId === serviceTypeId))
    );
    toast.success("Client service deleted successfully");
  };
  
  // Service Renewal management
  const addServiceRenewal = (serviceRenewalData: Omit<ServiceRenewal, 'id'>) => {
    const newRenewal: ServiceRenewal = {
      ...serviceRenewalData,
      id: uuidv4()
    };
    setServiceRenewals(prev => [...prev, newRenewal]);
    toast.success("Service renewal added successfully");
  };
  
  const updateServiceRenewal = (id: string, serviceRenewalData: Partial<ServiceRenewal>) => {
    setServiceRenewals(prev => 
      prev.map(renewal => 
        renewal.id === id ? { ...renewal, ...serviceRenewalData } : renewal
      )
    );
    toast.success("Service renewal updated successfully");
  };
  
  const deleteServiceRenewal = (id: string) => {
    setServiceRenewals(prev => prev.filter(renewal => renewal.id !== id));
    toast.success("Service renewal deleted successfully");
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        deleteClient,
        toggleClientActive,
        getClientById,
        addService,
        updateService,
        deleteService,
        addNote,
        updateNote,
        deleteNote,
        addDocument,
        updateDocument,
        deleteDocument,
        serviceTypes,
        addServiceType,
        updateServiceType,
        deleteServiceType,
        clientServices,
        addClientService,
        updateClientService,
        deleteClientService,
        serviceRenewals,
        addServiceRenewal,
        updateServiceRenewal,
        deleteServiceRenewal,
        getAvailableServiceNames,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};
