
import { supabase } from '@/integrations/supabase/client';
import { TeamMemberRole, PeerAuthStatus, DeviceRegistration, TeamMemberWithDevices } from '@/types/p2p-auth';
import { toast } from '@/hooks/use-toast-extensions';

/**
 * Service for P2P authentication operations
 */
export const p2pAuthService = {
  /**
   * Authenticate a team member in the P2P network
   * @param email Team member email
   * @param password Password
   * @returns Authentication success status and team member data
   */
  async authenticateTeamMember(email: string, password: string): Promise<{ success: boolean; teamMember?: TeamMemberWithDevices }> {
    try {
      // First authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw new Error(`Authentication failed: ${authError.message}`);
      
      // Then get the team member profile
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', email)
        .single();
      
      if (teamError) throw new Error(`Team member not found: ${teamError.message}`);
      
      // Get this team member's registered devices
      const { data: devices, error: devicesError } = await supabase
        .from('team_member_devices')
        .select('*')
        .eq('team_member_id', teamMember.id);
      
      if (devicesError) {
        console.error('Error fetching devices:', devicesError);
      }
      
      // Create the full team member profile with devices
      const teamMemberWithDevices: TeamMemberWithDevices = {
        id: teamMember.id,
        userId: authData.user?.id,
        email: teamMember.email,
        name: teamMember.name,
        role: teamMember.role as TeamMemberRole,
        status: teamMember.status,
        devices: devices || []
      };
      
      // Update the last seen timestamp
      await supabase
        .from('team_members')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', teamMember.id);
      
      return { success: true, teamMember: teamMemberWithDevices };
    } catch (error) {
      console.error('Team member authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
      return { success: false };
    }
  },
  
  /**
   * Register a new device for the current team member
   * @param deviceInfo Device registration information
   * @returns Device ID if registration successful
   */
  async registerDevice(deviceInfo: Omit<DeviceRegistration, 'registeredAt' | 'trusted'>, teamMemberId?: string): Promise<string | null> {
    try {
      // Get current user if team member ID is not provided
      let memberIdToUse = teamMemberId;
      
      if (!memberIdToUse) {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData?.user) {
          throw new Error('User not authenticated');
        }
        
        // Get team member ID from user ID
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('id')
          .eq('user_id', userData.user.id)
          .single();
        
        if (!teamMember) {
          throw new Error('Team member profile not found');
        }
        
        memberIdToUse = teamMember.id;
      }
      
      // Register the device
      const { data: device, error } = await supabase
        .from('team_member_devices')
        .insert({
          team_member_id: memberIdToUse,
          device_id: deviceInfo.deviceId,
          device_name: deviceInfo.deviceName,
          device_type: deviceInfo.deviceType,
          public_key: deviceInfo.publicKey,
          registered_at: new Date().toISOString(),
          trusted: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success(`Device ${deviceInfo.deviceName || deviceInfo.deviceId} registered successfully`);
      
      return device.device_id;
    } catch (error) {
      console.error('Device registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register device');
      return null;
    }
  },
  
  /**
   * Update the trust status of a device
   * @param deviceId Device ID to update
   * @param trusted New trust status
   * @returns Success status
   */
  async updateDeviceTrustStatus(deviceId: string, trusted: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_member_devices')
        .update({ trusted, updated_at: new Date().toISOString() })
        .eq('device_id', deviceId);
      
      if (error) throw error;
      
      toast.success(`Device trust status updated to ${trusted ? 'trusted' : 'untrusted'}`);
      return true;
    } catch (error) {
      console.error('Error updating device trust status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update device trust status');
      return false;
    }
  },
  
  /**
   * Get all registered devices for a team member
   * @param teamMemberId Team member ID
   * @returns List of registered devices
   */
  async getTeamMemberDevices(teamMemberId: string): Promise<DeviceRegistration[]> {
    try {
      const { data, error } = await supabase
        .from('team_member_devices')
        .select('*')
        .eq('team_member_id', teamMemberId);
      
      if (error) throw error;
      
      return data as DeviceRegistration[];
    } catch (error) {
      console.error('Error fetching team member devices:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch devices');
      return [];
    }
  },
  
  /**
   * Log out the current authenticated user
   */
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
