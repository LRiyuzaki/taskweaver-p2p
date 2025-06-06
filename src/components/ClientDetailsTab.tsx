
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClientDetailsTabProps } from '@/types/client';
import { format } from 'date-fns';

export const ClientDetailsTab: React.FC<ClientDetailsTabProps> = ({ client }) => {
  const formatAddress = (address: string | object | undefined) => {
    if (!address) return 'Not provided';
    if (typeof address === 'string') return address;
    
    const addr = address as any;
    const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-sm">{client.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Company</label>
            <p className="text-sm">{client.company || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm">{client.email || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Phone</label>
            <p className="text-sm">{client.phone || 'Not provided'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Address</label>
            <p className="text-sm">{formatAddress(client.address)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
            <p className="text-sm">{client.contactPerson || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
              {client.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Entity Type</label>
            <p className="text-sm">{client.entityType || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">GSTIN</label>
            <p className="text-sm">{client.gstin || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">PAN</label>
            <p className="text-sm">{client.pan || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">TAN</label>
            <p className="text-sm">{client.tan || 'Not provided'}</p>
          </div>
          {client.entityType === 'Company' && client.cin && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">CIN</label>
              <p className="text-sm">{client.cin}</p>
            </div>
          )}
          {client.entityType === 'LLP' && client.llpin && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">LLPIN</label>
              <p className="text-sm">{client.llpin}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">GST Registered</label>
            <Badge variant={client.isGSTRegistered ? 'default' : 'secondary'}>
              {client.isGSTRegistered ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">MSME</label>
            <Badge variant={client.isMSME ? 'default' : 'secondary'}>
              {client.isMSME ? 'Yes' : 'No'}
            </Badge>
          </div>
          {client.isMSME && client.msmeNumber && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">MSME Number</label>
              <p className="text-sm">{client.msmeNumber}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">IEC Holder</label>
            <Badge variant={client.isIECHolder ? 'default' : 'secondary'}>
              {client.isIECHolder ? 'Yes' : 'No'}
            </Badge>
          </div>
          {client.isIECHolder && client.iecNumber && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">IEC Number</label>
              <p className="text-sm">{client.iecNumber}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Financial Year End</label>
            <p className="text-sm">{client.financialYearEnd || 'Not specified'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Important Dates</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created</label>
            <p className="text-sm">{format(new Date(client.createdAt), 'PPP')}</p>
          </div>
          {client.updatedAt && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm">{format(new Date(client.updatedAt), 'PPP')}</p>
            </div>
          )}
          {client.incorporationDate && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Incorporation Date</label>
              <p className="text-sm">{format(new Date(client.incorporationDate), 'PPP')}</p>
            </div>
          )}
          {client.gstRegistrationDate && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">GST Registration Date</label>
              <p className="text-sm">{format(new Date(client.gstRegistrationDate), 'PPP')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailsTab;
