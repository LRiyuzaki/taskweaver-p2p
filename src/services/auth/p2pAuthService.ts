
import { supabase } from '@/integrations/supabase/client';
import { TeamMemberRole, TeamMemberStatus } from '@/types/p2p-auth';
import { toast } from '@/hooks/use-toast-extensions';

// Simple device info type without recursive references
export type DeviceInfo = {
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  publicKey?: string;
};

// Simplified team member type to avoid deep type instantiations
export type TeamMember = {
  id: string;
  userId?: string;
  email: string;
  name: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
};

// Device registration for frontend use
export interface DeviceRegistration {
  id?: string;
  teamMemberId?: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  publicKey?: string;
  registeredAt?: Date;
  lastActive?: Date;
  trusted: boolean;
}

export const p2pAuthService = {
  async authenticateTeamMember(email: string, password: string): Promise<{ success: boolean; teamMember?: TeamMember & { devices: DeviceRegistration[] } }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw new Error(`Authentication failed: ${authError.message}`);
      
      const { data: teamMemberData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', email)
        .single();
      
      if (teamError) throw new Error(`Team member not found: ${teamError.message}`);
      
      // Update team member status to active
      await supabase
        .from('team_members')
        .update({ status: 'active' })
        .eq('id', teamMemberData.id);
      
      // For now, return an empty devices array since we don't have a devices table
      // In a real implementation, this might come from sync_peers or another appropriate table
      const devices: DeviceRegistration[] = [];
      
      return { 
        success: true, 
        teamMember: {
          id: teamMemberData.id,
          userId: authData.user?.id,
          email: teamMemberData.email,
          name: teamMemberData.name,
          role: teamMemberData.role as TeamMemberRole,
          status: teamMemberData.status as TeamMemberStatus,
          devices: devices
        }
      };
    } catch (error) {
      console.error('Team member authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
      return { success: false };
    }
  },
  
  async registerDevice(
    teamMemberId: string | undefined, 
    deviceInfo: DeviceInfo
  ): Promise<string | null> {
    try {
      let finalTeamMemberId = teamMemberId;
      
      if (!finalTeamMemberId) {
        // Get current user
        const { data } = await supabase.auth.getUser();
        
        if (!data?.user) {
          throw new Error('User not authenticated');
        }
        
        // Find team member associated with user
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('id')
          .eq('email', data.user.email)
          .maybeSingle();
        
        if (!teamMember) {
          throw new Error('Team member profile not found');
        }
        
        finalTeamMemberId = teamMember.id;
      }
      
      // Since we don't have a devices table, we'll use sync_peers as a fallback
      // In a real implementation, you might want to create a proper devices table
      const { data, error } = await supabase
        .from('sync_peers')
        .insert({
          peer_id: deviceInfo.deviceId,
          name: deviceInfo.deviceName,
          device_type: deviceInfo.deviceType,
          status: 'connected'
        })
        .select('peer_id')
        .single();
      
      if (error) throw new Error(`Failed to register device: ${error.message}`);
      
      toast.success('Device registered successfully');
      return data.peer_id;
    } catch (error) {
      console.error('Device registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register device');
      return null;
    }
  },

  async updateDeviceTrustStatus(deviceId: string, trusted: boolean): Promise<boolean> {
    try {
      // Since we don't have a direct trust status field in sync_peers,
      // we'll simulate this by updating the status field
      const { error } = await supabase
        .from('sync_peers')
        .update({ 
          status: trusted ? 'connected' : 'disconnected' 
        })
        .eq('peer_id', deviceId);
      
      if (error) throw new Error(`Failed to update device trust status: ${error.message}`);
      
      toast.success(`Device trust status updated to ${trusted ? 'trusted' : 'untrusted'}`);
      return true;
    } catch (error) {
      console.error('Error updating device trust status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update device trust status');
      return false;
    }
  },
  
  async getTeamMemberDevices(teamMemberId: string): Promise<DeviceRegistration[]> {
    try {
      // For demonstration purposes, we'll fetch all sync_peers and return them as devices
      // In a real implementation, you'd filter by team member ID if that relationship existed
      const { data, error } = await supabase
        .from('sync_peers')
        .select('*');
      
      if (error) throw new Error(`Failed to fetch devices: ${error.message}`);
      
      return data.map(peer => ({
        id: peer.id,
        teamMemberId: teamMemberId, // Assuming all devices belong to this team member
        deviceId: peer.peer_id,
        deviceName: peer.name,
        deviceType: peer.device_type,
        registeredAt: new Date(peer.last_seen),
        lastActive: new Date(peer.last_seen),
        trusted: peer.status === 'connected'
      }));
    } catch (error) {
      console.error('Error fetching team member devices:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch devices');
      return [];
    }
  },
  
  async logout(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast.success('Successfully logged out');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to log out');
      return false;
    }
  }
};
