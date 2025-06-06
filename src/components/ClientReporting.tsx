
import React, { useMemo } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ClientReportingProps {
  dateRange: string;
}

export const ClientReporting: React.FC<ClientReportingProps> = ({ dateRange }) => {
  const { clients, getAvailableServiceNames } = useClientContext();
  
  const serviceTypes = useMemo(() => {
    const serviceNames = getAvailableServiceNames();
    const serviceData = serviceNames.map(service => {
      const clientsWithService = clients.filter(
        client => client.requiredServices && client.requiredServices[service]
      );
      
      return {
        name: service,
        value: clientsWithService.length,
        clients: clientsWithService.length
      };
    });
    
    return serviceData.filter(service => service.value > 0);
  }, [clients, getAvailableServiceNames]);

  const entityTypeData = useMemo(() => {
    const entityTypes: Record<string, number> = {};
    
    clients.forEach(client => {
      if (client.entityType) {
        entityTypes[client.entityType] = (entityTypes[client.entityType] || 0) + 1;
      }
    });
    
    return Object.entries(entityTypes).map(([type, count]) => ({
      name: type,
      value: count
    }));
  }, [clients]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{serviceTypes.reduce((acc, curr) => acc + curr.value, 0)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Entity Types</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{entityTypeData.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg. Services Per Client</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {clients.length ? 
                (serviceTypes.reduce((acc, curr) => acc + curr.value, 0) / clients.length).toFixed(1) : 
                '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Services Distribution</CardTitle>
            <CardDescription>Number of clients per service type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceTypes}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clients" fill="#8884d8" name="Clients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Entity Types</CardTitle>
            <CardDescription>Distribution of client entity types</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={entityTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {entityTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
