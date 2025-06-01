
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '@/types/client';
import { clientService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';

interface SupabaseClientContextType {
  clients: Client[];
  loading: boolean;
  createClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  refreshClients: () => Promise<void>;
}

const SupabaseClientContext = createContext<SupabaseClientContextType | undefined>(undefined);

export const useSupabaseClientContext = () => {
  const context = useContext(SupabaseClientContext);
  if (!context) {
    throw new Error('useSupabaseClientContext must be used within a SupabaseClientProvider');
  }
  return context;
};

export const SupabaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll();
      // Transform database format to client interface
      const transformedClients = data.map(dbClient => ({
        id: dbClient.id,
        name: dbClient.name,
        email: dbClient.email,
        phone: dbClient.phone,
        company: dbClient.company,
        address: dbClient.address,
        city: dbClient.city,
        state: dbClient.state,
        postalCode: dbClient.postal_code,
        country: dbClient.country,
        abn: dbClient.abn,
        registrationDate: dbClient.registration_date,
        entityType: dbClient.entity_type,
        status: dbClient.status,
        notes: dbClient.notes,
        whatsappNumber: dbClient.whatsapp_number,
        preferredContactMethod: dbClient.preferred_contact_method,
        createdAt: dbClient.created_at
      }));
      setClients(transformedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshClients();
  }, []);

  const createClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      await clientService.create(client);
      await refreshClients();
      toast({
        title: "Success",
        description: "Client created successfully"
      });
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      await clientService.update(id, updates);
      await refreshClients();
      toast({
        title: "Success",
        description: "Client updated successfully"
      });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await clientService.delete(id);
      await refreshClients();
      toast({
        title: "Success",
        description: "Client deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  return (
    <SupabaseClientContext.Provider value={{
      clients,
      loading,
      createClient,
      updateClient,
      deleteClient,
      getClientById,
      refreshClients
    }}>
      {children}
    </SupabaseClientContext.Provider>
  );
};
