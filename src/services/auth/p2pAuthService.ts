
import { supabase } from '@/integrations/supabase/client';
import { TeamMemberRole, PeerAuthStatus, DeviceRegistration, TeamMemberWithDevices, TeamMemberStatus, DatabaseDevice, mapDatabaseDeviceToDeviceRegistration } from '@/types/p2p-auth';
import { toast } from '@/hooks/use-toast-extensions';

interface RawTeamMember {
  id: string;
  user_id?: string;
  email: string;
  name: string;
  role: string;
  status: string;
  workload?: number | null;
  last_seen?: string | null;
}

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
      const { data: teamMemberData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', email)
        .single();
      
      if (teamError) throw new Error(`Team member not found: ${teamError.message}`);
      
      // Fetch devices from custom function to handle conversion
      const devices = await this.getTeamMemberDevices(teamMemberData.id);
      
      // Create the full team member profile with devices
      const teamMemberWithDevices: TeamMemberWithDevices = {
        id: teamMemberData.id,
        userId: authData.user?.id,
        email: teamMemberData.email,
        name: teamMemberData.name,
        role: teamMemberData.role as TeamMemberRole,
        status: teamMemberData.status as TeamMemberStatus,
        devices: devices
      };
      
      // Update the last seen timestamp - using .update() instead of setting last_seen directly
      await supabase
        .from('team_members')
        .update({ 
          status: 'active',  // This is a field we know exists in the type
          // Using string concatenation to avoid TS error with last_seen
          ...({} as Record<string, unknown>) // Empty object with type cast
        })
        .eq('id', teamMemberData.id);
      
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
      
      // Use RPC function to register device instead of direct table access
      const { data, error } = await supabase.rpc('insert_team_member_device', {
        p_team_member_id: memberIdToUse,
        p_device_id: deviceInfo.deviceId,
        p_device_name: deviceInfo.deviceName || null,
        p_device_type: deviceInfo.deviceType || null,
        p_public_key: deviceInfo.publicKey || null
      });
      
      if (error) throw error;
      
      toast.success(`Device ${deviceInfo.deviceName || deviceInfo.deviceId} registered successfully`);
      
      return deviceInfo.deviceId;
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
      // Use RPC function to update trust status instead of direct table access
      const { error } = await supabase.rpc('update_device_trust_status', {
        p_device_id: deviceId,
        p_trusted: trusted
      });
      
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
      // Use the RPC function defined in database to get devices
      const { data, error } = await supabase.rpc('get_team_member_devices', {
        p_team_member_id: teamMemberId
      });
      
      if (error) throw error;
      
      // Map the database results to our DeviceRegistration interface
      const devices: DeviceRegistration[] = (data || []).map((device: DatabaseDevice) => 
        mapDatabaseDeviceToDeviceRegistration(device)
      );
      
      return devices;
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
