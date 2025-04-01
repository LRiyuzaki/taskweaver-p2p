
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Users, Send, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Simulating active collaborators
const MOCK_COLLABORATORS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'idle' },
];

export const CollaborationPanel: React.FC = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [collaborators, setCollaborators] = useState(MOCK_COLLABORATORS);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }

    // In a real app, you would send an API request to invite the user
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${inviteEmail}`,
    });
    
    setInviteEmail('');
    setIsInviteDialogOpen(false);
  };

  const triggerSync = () => {
    setSyncStatus('syncing');
    
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus('synced');
      toast({
        title: "Sync complete",
        description: "All your data is now up to date across devices",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration
          </CardTitle>
          <CardDescription>
            Invite team members to collaborate on your tasks and projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium">Team Members</h3>
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Collaborator</DialogTitle>
                    <DialogDescription>
                      Send an invitation to collaborate on this workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvite}>
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-2">
              {collaborators.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-2 bg-secondary/20 rounded-md">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                    {user.status === 'active' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5" />
            P2P Sync Status
          </CardTitle>
          <CardDescription>
            Keep your data synchronized across all your devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  syncStatus === 'synced' ? 'bg-green-500' : 
                  syncStatus === 'syncing' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span>
                  {syncStatus === 'synced' ? 'All changes synced' : 
                   syncStatus === 'syncing' ? 'Syncing changes...' : 'Sync error'}
                </span>
              </div>
              <Button 
                size="sm" 
                onClick={triggerSync} 
                disabled={syncStatus === 'syncing'}
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Last synced: {new Date().toLocaleTimeString()}</p>
              <p className="mt-2">
                All your tasks and projects are automatically synchronized across devices.
                Hit "Sync Now" if you want to force a manual synchronization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
