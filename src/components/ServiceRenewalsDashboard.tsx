
import React, { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ClientService } from '@/types/client';

export const ServiceRenewalsDashboard: React.FC = () => {
  const { clients, updateClient } = useClientContext();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  // Get all services with renewal dates
  const allServices: (ClientService & { clientName: string })[] = [];
  
  clients.forEach(client => {
    if (client.services) {
      client.services.forEach(service => {
        if (typeof service === 'object' && service.nextRenewalDate) {
          allServices.push({
            ...service,
            clientName: client.name
          });
        }
      });
    }
  });

  const today = new Date();
  const timeframes = {
    week: addDays(today, 7),
    month: addDays(today, 30),
    quarter: addDays(today, 90)
  };

  const upcomingRenewals = allServices.filter(service => {
    const renewalDate = new Date(service.nextRenewalDate!);
    return isAfter(renewalDate, today) && isBefore(renewalDate, timeframes[selectedTimeframe]);
  });

  const overdueRenewals = allServices.filter(service => {
    const renewalDate = new Date(service.nextRenewalDate!);
    return isBefore(renewalDate, today);
  });

  const handleMarkRenewed = async (service: ClientService & { clientName: string }) => {
    const client = clients.find(c => c.name === service.clientName);
    if (!client) return;

    const updatedServices = client.services?.map(s => {
      if (typeof s === 'object' && s.id === service.id) {
        const newRenewalDate = new Date(service.nextRenewalDate!);
        newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
        return {
          ...s,
          nextRenewalDate: newRenewalDate
        };
      }
      return s;
    });

    if (updatedServices) {
      await updateClient(client.id, { services: updatedServices });
    }
  };

  const getRenewalUrgency = (renewalDate: Date) => {
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRenewal < 0) return 'overdue';
    if (daysUntilRenewal <= 7) return 'urgent';
    if (daysUntilRenewal <= 30) return 'warning';
    return 'normal';
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'urgent':
        return <Badge variant="destructive">Due Soon</Badge>;
      case 'warning':
        return <Badge variant="secondary">Due This Month</Badge>;
      default:
        return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Renewals Dashboard</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Renewals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueRenewals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{upcomingRenewals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allServices.length}</div>
          </CardContent>
        </Card>
      </div>

      {overdueRenewals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Overdue Renewals</CardTitle>
            <CardDescription>
              These services have passed their renewal date and require immediate attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overdueRenewals.map((service) => {
                const renewalDate = new Date(service.nextRenewalDate!);
                const urgency = getRenewalUrgency(renewalDate);
                
                return (
                  <div
                    key={`${service.clientName}-${service.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{service.serviceTypeName}</span>
                        {getUrgencyBadge(urgency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Client: {service.clientName}
                      </div>
                      <div className="text-sm text-destructive">
                        Due: {format(renewalDate, "PPP")}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkRenewed(service)}
                    >
                      Mark Renewed
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals ({selectedTimeframe})</CardTitle>
          <CardDescription>
            Services that will need renewal in the selected timeframe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingRenewals.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No renewals due in the selected timeframe.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingRenewals.map((service) => {
                const renewalDate = new Date(service.nextRenewalDate!);
                const urgency = getRenewalUrgency(renewalDate);
                
                return (
                  <div
                    key={`${service.clientName}-${service.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{service.serviceTypeName}</span>
                        {getUrgencyBadge(urgency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Client: {service.clientName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Due: {format(renewalDate, "PPP")}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkRenewed(service)}
                    >
                      Mark Renewed
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
