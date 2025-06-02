
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Building2,
  Users,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useSupabaseClientContext } from '@/contexts/SupabaseClientContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const ClientDataTable: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { clients, loading, deleteClient } = useSupabaseClientContext();

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleViewClient = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  const handleEditClient = (clientId: string) => {
    navigate(`/client/${clientId}?edit=true`);
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      try {
        await deleteClient(clientId);
        toast({
          title: "Client Deleted",
          description: `${clientName} has been successfully deleted.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete client. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Clients Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Clients Directory
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            <Button onClick={() => navigate('/client-management')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active Services</TableHead>
                <TableHead>Compliance Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="h-8 w-8 mb-2" />
                      {searchTerm ? 'No clients found matching your search.' : 'No clients added yet.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{client.company || client.name}</div>
                        {client.company && (
                          <div className="text-sm text-muted-foreground">{client.name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{client.email}</div>
                        {client.phone && (
                          <div className="text-sm text-muted-foreground">{client.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {client.entityType || 'Individual'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={client.active ? "default" : "secondary"}
                      >
                        {client.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {client.services?.length || 0} Services
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        0 Items
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewClient(client.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClient(client.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
