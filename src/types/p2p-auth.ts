
import { User } from '@supabase/supabase-js';
import { PeerStatus } from './p2p';

/**
 * Team member role within the P2P network
 */
export enum TeamMemberRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

/**
 * Authentication status for P2P connections
 */
export enum PeerAuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  PENDING = 'pending'
}

/**
 * Authentication information for a peer
 */
export interface PeerAuth {
  userId?: string;
  teamMemberId?: string;
  role?: TeamMemberRole;
  authStatus: PeerAuthStatus;
  authToken?: string;
  lastAuthenticated?: Date;
  permissions?: string[];
}

/**
 * Extended peer information with authentication data
 */
export interface AuthenticatedPeer {
  id: string;
  name?: string;
  status: PeerStatus;
  lastSeen?: Date;
  deviceType?: string;
  auth: PeerAuth;
}

/**
 * Authentication configuration for P2P sync
 */
export interface P2PAuthConfig {
  requireAuth: boolean;
  encryptData: boolean;
  allowAnonymousPeers: boolean;
  trustLevel: 'high' | 'medium' | 'low';
}

/**
 * Device registration information
 */
export interface DeviceRegistration {
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  publicKey?: string;
  registeredAt: Date;
  lastActive?: Date;
  trusted: boolean;
}

/**
 * Team member with their associated devices
 */
export interface TeamMemberWithDevices {
  id: string;
  userId?: string;
  email: string;
  name: string;
  role: TeamMemberRole;
  devices: DeviceRegistration[];
  status: 'active' | 'inactive' | 'pending';
}

/**
 * Auth context for P2P operations
 */
export interface P2PAuthContext {
  currentUser?: User;
  currentTeamMember?: TeamMemberWithDevices;
  isAuthenticated: boolean;
  authenticateTeamMember: (email: string, password: string) => Promise<boolean>;
  registerDevice: (device: Omit<DeviceRegistration, 'registeredAt' | 'trusted'>) => Promise<string>;
  logout: () => Promise<void>;
}
