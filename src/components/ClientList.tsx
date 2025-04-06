
import React from 'react';
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

interface ClientListProps {
  clients: Client[];
}

export const ClientList: React.FC<ClientListProps> = ({ clients }) => {
  const navigate = useNavigate();

  const handleClientClick = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length > 0 ? (
              clients.map((client) => (
                <TableRow 
                  key={client.id}
                  className="cursor-pointer hover:bg-accent/10"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell>{client.contactPerson || "-"}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" /> 
                        {client.email}
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
                      {client.gstRequired && (
                        <Badge variant="outline">GST</Badge>
                      )}
                      {client.incomeTaxRequired && (
                        <Badge variant="outline">Income Tax</Badge>
                      )}
                      {client.tdsRequired && (
                        <Badge variant="outline">TDS</Badge>
                      )}
                      {client.auditRequired && (
                        <Badge variant="outline">Audit</Badge>
                      )}
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
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No clients found. Add your first client to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
