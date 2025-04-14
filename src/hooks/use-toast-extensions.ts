
// Re-export toast functionality and add custom toast helper functions
import { toast as toastBase } from '@/hooks/use-toast';

// Basic toast function from original package
export const toast = {
  ...toastBase,
  
  // Custom toast helpers for peer operations
  peerConnected: (name: string) => {
    toastBase({
      title: 'Peer Connected',
      description: `${name || 'A peer'} has joined the network`,
      variant: 'default'
    });
  },
  
  peerDisconnected: (name: string) => {
    toastBase({
      title: 'Peer Disconnected',
      description: `${name || 'A peer'} has left the network`,
      variant: 'default'
    });
  },
  
  syncComplete: (count: number) => {
    toastBase({
      title: 'Synchronization Complete',
      description: `Successfully synchronized ${count} ${count === 1 ? 'item' : 'items'}`,
      variant: 'default'
    });
  },
  
  syncFailed: (error?: string) => {
    toastBase({
      title: 'Synchronization Failed',
      description: error || 'Failed to synchronize with the network',
      variant: 'destructive'
    });
  },
  
  // General success and error toasts
  success: (message: string) => {
    toastBase({
      title: 'Success',
      description: message,
      variant: 'default'
    });
  },
  
  error: (message: string) => {
    toastBase({
      title: 'Error',
      description: message,
      variant: 'destructive'
    });
  }
};
