
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { ClientGroup } from '@/types/clientGroup';
import { ClientGroupDialog } from './ClientGroupDialog';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const ClientGroupList: React.FC = () => {
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<ClientGroup | undefined>();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_groups')
        .select('*, clients(count)')
        .order('name');

      if (error) throw error;
      setClientGroups(data || []);
    } catch (error) {
      console.error('Error fetching client groups:', error);
      toast.error('Failed to fetch client groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientGroups();
  }, []);

  const handleEdit = (group: ClientGroup) => {
    setCurrentGroup(group);
    setIsDialogOpen(true);
  };

  const handleDelete = (groupId: string) => {
    setGroupToDelete(groupId);
    setIsAlertDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      const { error } = await supabase
        .from('client_groups')
        .delete()
        .eq('id', groupToDelete);

      if (error) throw error;
      
      setClientGroups(prev => prev.filter(group => group.id !== groupToDelete));
      toast.success('Client group deleted successfully');
    } catch (error) {
      console.error('Error deleting client group:', error);
      toast.error('Failed to delete client group');
    } finally {
      setIsAlertDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  const handleGroupCreated = (group: ClientGroup) => {
    if (currentGroup) {
      // Update existing group in the list
      setClientGroups(prev => 
        prev.map(g => g.id === group.id ? { ...g, ...group } : g)
      );
    } else {
      // Add new group to the list
      setClientGroups(prev => [...prev, group]);
    }
    setCurrentGroup(undefined);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Groups</CardTitle>
            <CardDescription>Manage client groups and families</CardDescription>
          </div>
          <Button onClick={() => {
            setCurrentGroup(undefined);
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Group
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading client groups...</div>
          ) : clientGroups.length === 0 ? (
            <div className="text-center p-6">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No client groups</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first client group to better organize your clients.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  setCurrentGroup(undefined);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Client Group
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>
                      <span className="capitalize">{group.group_type}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {group.description || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {/* @ts-ignore - clients count from join */}
                      {group.clients?.[0]?.count || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(group)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ClientGroupDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onGroupCreated={handleGroupCreated}
        group={currentGroup}
      />

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client group
              and potentially unlink clients associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
