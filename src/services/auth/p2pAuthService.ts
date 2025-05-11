
import { supabase } from '@/integrations/supabase/client';
import { TeamMemberRole, TeamMemberStatus, DeviceRegistration } from '@/types/p2p-auth';
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
      
      // Fetch devices
      const { data: devices, error: devicesError } = await supabase
        .from('team_member_devices')
        .select('*')
        .eq('team_member_id', teamMemberData.id);
      
      if (devicesError) throw new Error(`Failed to fetch devices: ${devicesError.message}`);
      
      // Map database devices to DeviceRegistration format
      const mappedDevices: DeviceRegistration[] = devices.map(device => ({
        id: device.id,
        team_member_id: device.team_member_id,
        deviceId: device.device_id,
        deviceName: device.device_name,
        deviceType: device.device_type,
        publicKey: device.public_key,
        registeredAt: device.registered_at ? new Date(device.registered_at) : undefined,
        lastActive: device.updated_at ? new Date(device.updated_at) : undefined,
        trusted: device.trusted
      }));
      
      // Update team member status to active
      await supabase
        .from('team_members')
        .update({ status: 'active' })
        .eq('id', teamMemberData.id);
      
      return { 
        success: true, 
        teamMember: {
          id: teamMemberData.id,
          userId: authData.user?.id,
          email: teamMemberData.email,
          name: teamMemberData.name,
          role: teamMemberData.role as TeamMemberRole,
          status: teamMemberData.status as TeamMemberStatus,
          devices: mappedDevices
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
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        if (!teamMember) {
          throw new Error('Team member profile not found');
        }
        
        finalTeamMemberId = teamMember.id;
      }
      
      // Create device record directly in Supabase
      const { data, error } = await supabase
        .from('team_member_devices')
        .insert({
          team_member_id: finalTeamMemberId,
          device_id: deviceInfo.deviceId,
          device_name: deviceInfo.deviceName,
          device_type: deviceInfo.deviceType,
          public_key: deviceInfo.publicKey,
          trusted: false
        })
        .select('device_id')
        .single();
      
      if (error) throw new Error(`Failed to register device: ${error.message}`);
      
      toast.success('Device registered successfully');
      return data.device_id;
    } catch (error) {
      console.error('Device registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register device');
      return null;
    }
  },

  async updateDeviceTrustStatus(deviceId: string, trusted: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_member_devices')
        .update({ trusted })
        .eq('device_id', deviceId);
      
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
      const { data, error } = await supabase
        .from('team_member_devices')
        .select('*')
        .eq('team_member_id', teamMemberId);
      
      if (error) throw new Error(`Failed to fetch devices: ${error.message}`);
      
      return data.map(device => ({
        id: device.id,
        team_member_id: device.team_member_id,
        deviceId: device.device_id,
        deviceName: device.device_name,
        deviceType: device.device_type,
        publicKey: device.public_key,
        registeredAt: device.registered_at ? new Date(device.registered_at) : undefined,
        lastActive: device.updated_at ? new Date(device.updated_at) : undefined,
        trusted: device.trusted
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
