
import { supabase } from '@/integrations/supabase/client';
import { TeamMemberRole, TeamMemberWithDevices, TeamMemberStatus } from '@/types/p2p-auth';
import { toast } from '@/hooks/use-toast-extensions';
import { deviceService } from './device-service';

export const p2pAuthService = {
  async authenticateTeamMember(email: string, password: string): Promise<{ success: boolean; teamMember?: TeamMemberWithDevices }> {
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
      
      // Fetch devices from device service
      const devices = await deviceService.getTeamMemberDevices(teamMemberData.id);
      
      const teamMemberWithDevices: TeamMemberWithDevices = {
        id: teamMemberData.id,
        userId: authData.user?.id,
        email: teamMemberData.email,
        name: teamMemberData.name,
        role: teamMemberData.role as TeamMemberRole,
        status: teamMemberData.status as TeamMemberStatus,
        devices: devices
      };
      
      await supabase
        .from('team_members')
        .update({ status: 'active' })
        .eq('id', teamMemberData.id);
      
      return { success: true, teamMember: teamMemberWithDevices };
    } catch (error) {
      console.error('Team member authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
      return { success: false };
    }
  },
  
  // Fix for error TS2589: Type instantiation is excessively deep
  async registerDevice(
    deviceInfo: {
      deviceId: string;
      deviceName?: string;
      deviceType?: string;
      publicKey?: string;
    },
    teamMemberId?: string
  ): Promise<string | null> {
    try {
      if (!teamMemberId) {
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
        
        teamMemberId = teamMember.id;
      }
      
      // Call device service with simplified approach
      return await deviceService.registerDevice(teamMemberId, deviceInfo);
    } catch (error) {
      console.error('Device registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register device');
      return null;
    }
  },

  // Fix for error TS2345: Argument of type 'string' is not assignable to parameter of type 'boolean'
  updateDeviceTrustStatus(deviceId: string, trusted: boolean): Promise<boolean> {
    // Convert trusted boolean to the appropriate string format expected by the service
    return deviceService.updateDeviceTrustStatus(deviceId, trusted);
  },
  
  getTeamMemberDevices(teamMemberId: string) {
    return deviceService.getTeamMemberDevices(teamMemberId);
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
