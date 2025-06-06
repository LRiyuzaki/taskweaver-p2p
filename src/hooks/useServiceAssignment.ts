
import { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { Client, ServiceType, ClientService } from '@/types/client';
import { useEnhancedToast } from '@/components/UserFeedback';

export const useServiceAssignment = () => {
  const { clients, updateClient, getAvailableServiceTypes } = useClientContext();
  const { showSuccess, showError, showWarning } = useEnhancedToast();
  const [isAssigning, setIsAssigning] = useState(false);

  const serviceTypes = getAvailableServiceTypes();

  // Assign service to client
  const assignServiceToClient = async (
    clientId: string, 
    serviceTypeId: string,
    startDate: Date = new Date(),
    endDate?: Date
  ): Promise<boolean> => {
    setIsAssigning(true);
    
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) {
        showError('Client not found');
        return false;
      }

      const serviceType = serviceTypes.find(st => st.id === serviceTypeId);
      if (!serviceType) {
        showError('Service type not found');
        return false;
      }

      // Check if service is already assigned
      const clientServices = Array.isArray(client.services) ? client.services : [];
      const existingService = clientServices.find((s: any) => {
        if (typeof s === 'string') {
          return s === serviceType.name;
        }
        return s.serviceTypeName === serviceType.name;
      });
      
      if (existingService && typeof existingService === 'object' && existingService.status === 'active') {
        showWarning('Service is already assigned to this client');
        return false;
      }

      // Calculate renewal date based on service type
      let renewalDate: Date | undefined;
      if (serviceType.renewalPeriod) {
        renewalDate = new Date(startDate);
        renewalDate.setMonth(renewalDate.getMonth() + serviceType.renewalPeriod);
      }

      const newClientService: ClientService = {
        id: `service_${Date.now()}`,
        clientId,
        serviceTypeId,
        serviceTypeName: serviceType.name,
        isActive: true,
        startDate,
        endDate,
        nextRenewalDate: renewalDate,
        status: 'active' as const
      };

      // Update client with new service - ensure we maintain proper array type
      const updatedServices: ClientService[] = [];
      
      // Add existing ClientService objects
      clientServices.forEach((service: any) => {
        if (typeof service === 'object' && service.serviceTypeName !== serviceType.name) {
          updatedServices.push(service);
        }
      });
      
      // Add the new service
      updatedServices.push(newClientService);

      // Update required services flag
      const updatedRequiredServices = {
        ...client.requiredServices,
        [serviceType.name]: true
      };

      await updateClient(clientId, {
        services: updatedServices,
        requiredServices: updatedRequiredServices
      });

      showSuccess('Service assigned successfully', `${serviceType.name} has been assigned to ${client.name}`);
      return true;

    } catch (error) {
      console.error('Failed to assign service:', error);
      showError('Failed to assign service', 'Please try again');
      return false;
    } finally {
      setIsAssigning(false);
    }
  };

  // Remove service from client
  const removeServiceFromClient = async (
    clientId: string, 
    serviceTypeId: string
  ): Promise<boolean> => {
    setIsAssigning(true);
    
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) {
        showError('Client not found');
        return false;
      }

      const serviceType = serviceTypes.find(st => st.id === serviceTypeId);
      if (!serviceType) {
        showError('Service type not found');
        return false;
      }

      // Update services array - handle both string[] and proper service objects
      const clientServices = Array.isArray(client.services) ? client.services : [];
      const updatedServices = clientServices.map((service: any) => {
        if (typeof service === 'string') {
          return service === serviceType.name ? null : service;
        }
        return (service.name === serviceType.name || service.serviceTypeName === serviceType.name)
          ? { ...service, status: 'inactive' as const, endDate: new Date() }
          : service;
      }).filter(Boolean);

      // Update required services flag
      const updatedRequiredServices = {
        ...client.requiredServices,
        [serviceType.name]: false
      };

      await updateClient(clientId, {
        services: updatedServices,
        requiredServices: updatedRequiredServices
      });

      showSuccess('Service removed successfully', `${serviceType.name} has been removed from ${client.name}`);
      return true;

    } catch (error) {
      console.error('Failed to remove service:', error);
      showError('Failed to remove service', 'Please try again');
      return false;
    } finally {
      setIsAssigning(false);
    }
  };

  // Bulk assign services to multiple clients
  const bulkAssignServices = async (
    clientIds: string[],
    serviceTypeIds: string[],
    startDate: Date = new Date()
  ): Promise<{ successful: number; failed: number }> => {
    setIsAssigning(true);
    let successful = 0;
    let failed = 0;

    try {
      for (const clientId of clientIds) {
        for (const serviceTypeId of serviceTypeIds) {
          const success = await assignServiceToClient(clientId, serviceTypeId, startDate);
          if (success) {
            successful++;
          } else {
            failed++;
          }
        }
      }

      if (successful > 0) {
        showSuccess(
          'Bulk assignment completed',
          `${successful} services assigned successfully${failed > 0 ? `, ${failed} failed` : ''}`
        );
      }

      return { successful, failed };

    } catch (error) {
      console.error('Bulk assignment failed:', error);
      showError('Bulk assignment failed', 'Please try again');
      return { successful, failed: clientIds.length * serviceTypeIds.length };
    } finally {
      setIsAssigning(false);
    }
  };

  // Get client services with renewal information
  const getClientServicesWithRenewal = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.services) return [];

    const now = new Date();
    
    return client.services.map((service: any) => {
      // Handle both string and object services
      if (typeof service === 'string') {
        return {
          name: service,
          isRenewalDue: false,
          daysUntilRenewal: null,
          renewalStatus: 'current'
        };
      }
      
      const renewalDate = service.renewalDate || service.nextRenewalDate;
      const isRenewalDue = renewalDate && new Date(renewalDate) <= now;
      const daysUntilRenewal = renewalDate 
        ? Math.ceil((new Date(renewalDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...service,
        isRenewalDue,
        daysUntilRenewal,
        renewalStatus: isRenewalDue ? 'overdue' : daysUntilRenewal && daysUntilRenewal <= 30 ? 'upcoming' : 'current'
      };
    });
  };

  // Get services that need renewal across all clients
  const getServicesNeedingRenewal = () => {
    const now = new Date();
    const renewalThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const servicesNeedingRenewal: Array<{
      client: Client;
      service: any;
      daysUntilRenewal: number;
      isOverdue: boolean;
    }> = [];

    clients.forEach(client => {
      if (client.services) {
        client.services.forEach((service: any) => {
          // Skip string services
          if (typeof service === 'string') return;
          
          const renewalDate = service.renewalDate || service.nextRenewalDate;
          if (renewalDate) {
            const renewalDateObj = new Date(renewalDate);
            const daysUntilRenewal = Math.ceil((renewalDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (renewalDateObj <= renewalThreshold) {
              servicesNeedingRenewal.push({
                client,
                service,
                daysUntilRenewal,
                isOverdue: renewalDateObj < now
              });
            }
          }
        });
      }
    });

    return servicesNeedingRenewal.sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
  };

  return {
    assignServiceToClient,
    removeServiceFromClient,
    bulkAssignServices,
    getClientServicesWithRenewal,
    getServicesNeedingRenewal,
    isAssigning,
    serviceTypes
  };
};
