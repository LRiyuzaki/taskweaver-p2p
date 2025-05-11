
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { p2pAuthService, DeviceInfo, TeamMember, DeviceRegistration } from '@/services/auth/p2pAuthService';
import { TeamMemberRole, TeamMemberStatus } from '@/types/p2p-auth';
import { toast } from '@/hooks/use-toast-extensions';

interface AuthContextType {
  user: User | null;
  teamMember: (TeamMember & { devices: DeviceRegistration[] }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devices: DeviceRegistration[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerDevice: (deviceInfo: DeviceInfo) => Promise<string | null>;
  updateDeviceTrustStatus: (deviceId: string, trusted: boolean) => Promise<boolean>;
  hasRole: (role: TeamMemberRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useP2PAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useP2PAuth must be used within a P2PAuthProvider');
  }
  return context;
};

export const P2PAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teamMember, setTeamMember] = useState<(TeamMember & { devices: DeviceRegistration[] }) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [devices, setDevices] = useState<DeviceRegistration[]>([]);
  
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          setUser(sessionData.session.user);
          
          try {
            const { data: teamMemberData } = await supabase
              .from('team_members')
              .select('*')
              .eq('email', sessionData.session.user.email)
              .single();
            
            if (teamMemberData) {
              const devicesList = await p2pAuthService.getTeamMemberDevices(teamMemberData.id);
              
              setTeamMember({
                id: teamMemberData.id,
                userId: sessionData.session.user.id,
                email: teamMemberData.email,
                name: teamMemberData.name,
                role: teamMemberData.role as TeamMemberRole,
                status: teamMemberData.status as TeamMemberStatus,
                devices: devicesList
              });
              
              setDevices(devicesList);
            }
          } catch (err) {
            console.error('Error fetching team member:', err);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        checkSession();
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
  
  const registerDevice = async (deviceInfo: DeviceInfo): Promise<string | null> => {
    if (!teamMember) {
      toast.error('You must be logged in to register a device');
      return null;
    }
    
    const result = await p2pAuthService.registerDevice(
      teamMember.id, 
      deviceInfo
    );
    
    if (result) {
      const updatedDevices = await p2pAuthService.getTeamMemberDevices(teamMember.id);
      setDevices(updatedDevices);
    }
    
    return result;
  };
  
  const updateDeviceTrustStatus = async (deviceId: string, trusted: boolean): Promise<boolean> => {
    const success = await p2pAuthService.updateDeviceTrustStatus(deviceId, trusted);
    
    if (success && teamMember) {
      const updatedDevices = await p2pAuthService.getTeamMemberDevices(teamMember.id);
      setDevices(updatedDevices);
    }
    
    return success;
  };
  
  const hasRole = (role: TeamMemberRole): boolean => {
    if (!teamMember) return false;
    
    return teamMember.role === role;
  };
  
  return (
    <AuthContext.Provider
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
    </AuthContext.Provider>
  );
};
