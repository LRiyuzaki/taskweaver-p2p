
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { p2pAuthService } from '@/services/auth/p2pAuthService';
import { TeamMemberWithDevices, DeviceRegistration, TeamMemberRole } from '@/types/p2p-auth';
import { toast } from '@/hooks/use-toast-extensions';

interface P2PAuthContextType {
  user: User | null;
  teamMember: TeamMemberWithDevices | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devices: DeviceRegistration[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerDevice: (deviceInfo: Omit<DeviceRegistration, 'registeredAt' | 'trusted'>) => Promise<string | null>;
  updateDeviceTrustStatus: (deviceId: string, trusted: boolean) => Promise<boolean>;
  hasRole: (role: TeamMemberRole) => boolean;
}

const P2PAuthContext = createContext<P2PAuthContextType | undefined>(undefined);

export const useP2PAuth = () => {
  const context = useContext(P2PAuthContext);
  if (context === undefined) {
    throw new Error('useP2PAuth must be used within a P2PAuthProvider');
  }
  return context;
};

export const P2PAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMemberWithDevices | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [devices, setDevices] = useState<DeviceRegistration[]>([]);
  
  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          setUser(sessionData.session.user);
          
          // Get team member profile
          const { data: teamMember } = await supabase
            .from('team_members')
            .select('*')
            .eq('user_id', sessionData.session.user.id)
            .single();
          
          if (teamMember) {
            // Get devices
            const { data: devices } = await supabase
              .from('team_member_devices')
              .select('*')
              .eq('team_member_id', teamMember.id);
            
            setTeamMember({
              ...teamMember,
              devices: devices || []
            } as TeamMemberWithDevices);
            
            setDevices(devices || []);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTeamMember(null);
        setDevices([]);
      }
    });
    
    checkSession();
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { success, teamMember } = await p2pAuthService.authenticateTeamMember(email, password);
      
      if (success && teamMember) {
        setTeamMember(teamMember);
        setDevices(teamMember.devices || []);
        toast.success(`Welcome back, ${teamMember.name}!`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await p2pAuthService.logout();
      setUser(null);
      setTeamMember(null);
      setDevices([]);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error instanceof Error ? error.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register a device
  const registerDevice = async (deviceInfo: Omit<DeviceRegistration, 'registeredAt' | 'trusted'>): Promise<string | null> => {
    if (!teamMember) {
      toast.error('You must be logged in to register a device');
      return null;
    }
    
    const deviceId = await p2pAuthService.registerDevice(deviceInfo, teamMember.id);
    
    if (deviceId) {
      // Refresh devices list
      const updatedDevices = await p2pAuthService.getTeamMemberDevices(teamMember.id);
      setDevices(updatedDevices);
    }
    
    return deviceId;
  };
  
  // Update device trust status
  const updateDeviceTrustStatus = async (deviceId: string, trusted: boolean): Promise<boolean> => {
    const success = await p2pAuthService.updateDeviceTrustStatus(deviceId, trusted);
    
    if (success && teamMember) {
      // Refresh devices list
      const updatedDevices = await p2pAuthService.getTeamMemberDevices(teamMember.id);
      setDevices(updatedDevices);
    }
    
    return success;
  };
  
  // Check if the team member has a specific role
  const hasRole = (role: TeamMemberRole): boolean => {
    if (!teamMember) return false;
    
    return teamMember.role === role;
  };
  
  return (
    <P2PAuthContext.Provider
      value={{
        user,
        teamMember,
        isAuthenticated: !!user && !!teamMember,
        isLoading,
        devices,
        login,
        logout,
        registerDevice,
        updateDeviceTrustStatus,
        hasRole
      }}
    >
      {children}
    </P2PAuthContext.Provider>
  );
};
