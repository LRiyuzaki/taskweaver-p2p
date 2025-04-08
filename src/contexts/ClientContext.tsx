
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Client, Service, Note, Document } from '@/types/client';
import { useTaskContext } from '@/contexts/TaskContext';
import { toast } from '@/hooks/use-toast-extensions';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  toggleClientActive: (id: string) => void;
  addService: (clientId: string, service: Omit<Service, 'id'>) => string;
  updateService: (clientId: string, serviceId: string, service: Partial<Service>) => void;
  deleteService: (clientId: string, serviceId: string) => void;
  addNote: (clientId: string, note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (clientId: string, noteId: string, note: Partial<Note>) => void;
  deleteNote: (clientId: string, noteId: string) => void;
  addDocument: (clientId: string, document: Omit<Document, 'id' | 'uploadedAt'>) => void;
  updateDocument: (clientId: string, documentId: string, document: Partial<Document>) => void;
  deleteDocument: (clientId: string, documentId: string) => void;
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

  // Save clients to localStorage when they change
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  // Get the deleteClientTasks function from TaskContext, but make it optional
  // to prevent circular dependency issues during initialization
  const taskContext = React.useContext(useTaskContext()._context || {});
  const deleteClientTasks = taskContext?.deleteClientTasks;

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: uuidv4(),
      createdAt: new Date(),
      services: clientData.services || [],
      notes: clientData.notes || [],
      documents: clientData.documents || [],
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
    // If deleteClientTasks is available, use it to delete associated tasks
    if (deleteClientTasks) {
      deleteClientTasks(id);
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

  return (
    <ClientContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        deleteClient,
        toggleClientActive,
        addService,
        updateService,
        deleteService,
        addNote,
        updateNote,
        deleteNote,
        addDocument,
        updateDocument,
        deleteDocument,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};
