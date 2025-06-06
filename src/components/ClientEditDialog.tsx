
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Client } from '@/types/client';

interface ClientEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

export const ClientEditDialog: React.FC<ClientEditDialogProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Client: {client.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">Client editing functionality will be implemented here.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientEditDialog;
