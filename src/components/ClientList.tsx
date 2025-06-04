
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Mail, Phone, Building } from "lucide-react";
import { Client } from "@/types/client";
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ClientListProps {
  clients: Client[];
  onClientClick?: (clientId: string) => void;
}

interface FilterState {
  entityType?: string;
  hasGST: boolean;
  hasPAN: boolean;
  hasTAN: boolean;
  isMSME: boolean;
  isIECHolder: boolean;
}

export const ClientList: React.FC<ClientListProps> = ({ clients = [], onClientClick }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({
    entityType: undefined,
    hasGST: false,
    hasPAN: false,
    hasTAN: false,
    isMSME: false,
    isIECHolder: false
  });

  const handleClientClick = (clientId: string) => {
    try {
      if (onClientClick) {
        onClientClick(clientId);
      } else {
        navigate(`/client/${clientId}`);
      }
    } catch (error) {
      console.error('Error navigating to client:', error);
    }
  };

  const filteredClients = useMemo(() => {
    try {
      if (!Array.isArray(clients)) {
        console.warn('Clients prop is not an array:', clients);
        return [];
      }

      return clients.filter(client => {
        if (!client) return false;
        
        if (filters.entityType && client.entityType !== filters.entityType) return false;
        if (filters.hasGST && !client.isGSTRegistered) return false;
        if (filters.hasPAN && !client.pan) return false;
        if (filters.hasTAN && !client.tan) return false;
        if (filters.isMSME && !client.isMSME) return false;
        if (filters.isIECHolder && !client.isIECHolder) return false;
        return true;
      });
    } catch (error) {
      console.error('Error filtering clients:', error);
      return [];
    }
  }, [clients, filters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (!Array.isArray(clients)) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Invalid client data. Please refresh the page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Entity Type</Label>
            <Select
              value={filters.entityType || "all"}
              onValueChange={(value) => handleFilterChange('entityType', value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Entity Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                <SelectItem value="Company">Company</SelectItem>
                <SelectItem value="LLP">LLP</SelectItem>
                <SelectItem value="Partnership">Partnership</SelectItem>
                <SelectItem value="Trust">Trust</SelectItem>
                <SelectItem value="HUF">HUF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Registration Status</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasGST"
                  checked={filters.hasGST}
                  onCheckedChange={(checked) => 
                    handleFilterChange('hasGST', checked === true)
                  }
                />
                <Label htmlFor="hasGST">GST Registered</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasPAN"
                  checked={filters.hasPAN}
                  onCheckedChange={(checked) => 
                    handleFilterChange('hasPAN', checked === true)
                  }
                />
                <Label htmlFor="hasPAN">Has PAN</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasTAN"
                  checked={filters.hasTAN}
                  onCheckedChange={(checked) => 
                    handleFilterChange('hasTAN', checked === true)
                  }
                />
                <Label htmlFor="hasTAN">Has TAN</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional Registrations</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isMSME"
                  checked={filters.isMSME}
                  onCheckedChange={(checked) => 
                    handleFilterChange('isMSME', checked === true)
                  }
                />
                <Label htmlFor="isMSME">MSME Registered</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isIECHolder"
                  checked={filters.isIECHolder}
                  onCheckedChange={(checked) => 
                    handleFilterChange('isIECHolder', checked === true)
                  }
                />
                <Label htmlFor="isIECHolder">IEC Holder</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <TableRow 
                  key={client.id}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        {client.name || 'Unnamed Client'}
                      </div>
                      <span className="text-sm text-muted-foreground mt-1">
                        {client.company || 'No company'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{client.contactPerson || "-"}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" /> 
                        {client.email || 'No email'}
                      </div>
                      {client.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" /> 
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.entityType && (
                        <Badge variant="secondary">{client.entityType}</Badge>
                      )}
                      {client.isGSTRegistered && (
                        <Badge variant="outline">GST</Badge>
                      )}
                      {client.isMSME && (
                        <Badge variant="outline">MSME</Badge>
                      )}
                      {client.isIECHolder && (
                        <Badge variant="outline">IEC</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.requiredServices && Object.entries(client.requiredServices)
                        .filter(([_, isRequired]) => isRequired)
                        .map(([serviceName]) => (
                          <Badge key={serviceName} variant="outline">{serviceName}</Badge>
                        ))
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div 
                      className="flex items-center text-primary hover:text-primary/80 cursor-pointer"
                      onClick={() => handleClientClick(client.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> 
                      View
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {clients.length === 0 
                    ? "No clients found. Add your first client to get started."
                    : "No clients found matching the selected filters."
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
