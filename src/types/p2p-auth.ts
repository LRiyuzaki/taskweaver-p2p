
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
 * Device registration information - matches the database schema
 */
export interface DeviceRegistration {
  id?: string;
  team_member_id?: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  publicKey?: string;
  registeredAt?: Date;
  lastActive?: Date;
  trusted: boolean;
}

/**
 * Database representation of a device - matches the team_member_devices table
 */
export interface DatabaseDevice {
  id: string;
  team_member_id: string;
  device_id: string;
  device_name?: string;
  device_type?: string;
  public_key?: string;
  registered_at: string;
  updated_at: string;
  trusted: boolean;
}

/**
 * Status of a team member
 */
export type TeamMemberStatus = 'active' | 'inactive' | 'pending';

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
  status: TeamMemberStatus;
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

/**
 * Helper function to convert database device to DeviceRegistration
 */
export function mapDatabaseDeviceToDeviceRegistration(dbDevice: DatabaseDevice): DeviceRegistration {
  return {
    id: dbDevice.id,
    team_member_id: dbDevice.team_member_id,
    deviceId: dbDevice.device_id,
    deviceName: dbDevice.device_name,
    deviceType: dbDevice.device_type,
    publicKey: dbDevice.public_key,
    registeredAt: dbDevice.registered_at ? new Date(dbDevice.registered_at) : undefined,
    lastActive: dbDevice.updated_at ? new Date(dbDevice.updated_at) : undefined,
    trusted: dbDevice.trusted
  };
}
