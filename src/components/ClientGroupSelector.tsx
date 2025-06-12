
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientGroup } from '@/types/clientGroup';
import { ClientGroupDialog } from './ClientGroupDialog';

interface ClientGroupSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const ClientGroupSelector: React.FC<ClientGroupSelectorProps> = ({
  value,
  onValueChange,
  className
}) => {
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClientGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('client_groups')
        .select('*')
        .order('name');

      if (error) throw error;
      setClientGroups(data || []);
    } catch (error) {
      console.error('Error fetching client groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientGroups();
  }, []);

  const handleGroupCreated = (newGroup: ClientGroup) => {
    setClientGroups(prev => [...prev, newGroup]);
    onValueChange(newGroup.id);
    setIsDialogOpen(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select client group..." />
        </SelectTrigger>
        <SelectContent>
          {clientGroups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              <div className="flex items-center gap-2">
                <span>{group.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({group.group_type})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <ClientGroupDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};
