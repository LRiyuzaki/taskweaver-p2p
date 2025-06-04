
import { useState, useMemo } from 'react';
import { Client } from '@/types/client';
import { Task } from '@/types/task';

interface SearchFilters {
  searchTerm: string;
  entityType?: string;
  hasGST?: boolean;
  hasPAN?: boolean;
  taskStatus?: string;
  priority?: string;
  serviceFilters?: string[];
}

export const useUnifiedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    serviceFilters: [],
  });

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ searchTerm: '', serviceFilters: [] });
  };

  const filterClients = (clients: Client[]) => {
    return useMemo(() => {
      if (!Array.isArray(clients)) return [];
      
      return clients.filter(client => {
        if (!client) return false;
        
        // Search term filter
        const matchesSearch = !filters.searchTerm || 
          client.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          client.contactPerson?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          client.email?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          client.phone?.toLowerCase().includes(filters.searchTerm.toLowerCase());
        
        // Entity type filter
        if (filters.entityType && client.entityType !== filters.entityType) return false;
        
        // GST filter
        if (filters.hasGST && !client.isGSTRegistered) return false;
        
        // PAN filter
        if (filters.hasPAN && !client.pan) return false;
        
        // Service filters
        if (filters.serviceFilters && filters.serviceFilters.length > 0) {
          const hasRequiredService = filters.serviceFilters.some(service => 
            client.requiredServices && client.requiredServices[service]
          );
          if (!hasRequiredService) return false;
        }
        
        return matchesSearch;
      });
    }, [clients, filters]);
  };

  const filterTasks = (tasks: Task[]) => {
    return useMemo(() => {
      if (!Array.isArray(tasks)) return [];
      
      return tasks.filter(task => {
        if (!task) return false;
        
        // Search term filter
        const matchesSearch = !filters.searchTerm || 
          task.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          task.tags?.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()));
        
        // Status filter
        if (filters.taskStatus && task.status !== filters.taskStatus) return false;
        
        // Priority filter
        if (filters.priority && task.priority !== filters.priority) return false;
        
        return matchesSearch;
      });
    }, [tasks, filters]);
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    filterClients,
    filterTasks,
  };
};
