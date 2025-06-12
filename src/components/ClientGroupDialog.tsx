
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ClientGroup, ClientGroupFormData } from '@/types/clientGroup';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
  group_type: z.enum(['family', 'entity', 'business']),
});

interface ClientGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: (group: ClientGroup) => void;
  group?: ClientGroup;
}

export const ClientGroupDialog: React.FC<ClientGroupDialogProps> = ({
  open,
  onOpenChange,
  onGroupCreated,
  group
}) => {
  const form = useForm<ClientGroupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
      group_type: group?.group_type || 'family',
    },
  });

  const onSubmit = async (values: ClientGroupFormData) => {
    try {
      if (group) {
        // Update existing group
        const { data, error } = await supabase
          .from('client_groups')
          .update(values)
          .eq('id', group.id)
          .select()
          .single();

        if (error) throw error;
        toast.success('Client group updated successfully');
      } else {
        // Create new group
        const { data, error } = await supabase
          .from('client_groups')
          .insert(values)
          .select()
          .single();

        if (error) throw error;
        
        if (onGroupCreated && data) {
          onGroupCreated(data);
        }
        toast.success('Client group created successfully');
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving client group:', error);
      toast.error('Failed to save client group');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {group ? 'Edit Client Group' : 'Create New Client Group'}
          </DialogTitle>
          <DialogDescription>
            {group ? 'Update the client group details.' : 'Create a new group to organize related clients.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter group name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select group type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="entity">Entity</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the appropriate type for this client group.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Optional description for this group"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {group ? 'Update Group' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
