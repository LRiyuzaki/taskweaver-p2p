
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { p2pAuthService } from './p2pAuthService';

// Mock the dependencies used in the service
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(() => ({
      data: { user: { id: 'u1' } },
      error: null,
    })),
    getUser: vi.fn(() => ({
      data: { user: { id: 'u1', email: 'a@b.com' } }
    })),
    signOut: vi.fn(() => ({ error: null }))
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({ data: { id: 'tm1', email: 'a@b.com', name: 'ABC', role: 'admin', status: 'active' }, error: null })),
        maybeSingle: vi.fn(() => ({ data: { id: 'tm1' } }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({}))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({ data: { peer_id: 'dev1' }, error: null }))
      }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/hooks/use-toast-extensions', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

describe('p2pAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should authenticate a team member and return their data', async () => {
    const result = await p2pAuthService.authenticateTeamMember('a@b.com', 'pass');
    expect(result.success).toBe(true);
    expect(result.teamMember).toBeDefined();
    expect(result.teamMember?.email).toBe('a@b.com');
  });

  it('should return a device id after device registration', async () => {
    const devId = await p2pAuthService.registerDevice('tm1', { deviceId: 'dev1', deviceName: 'X' });
    expect(devId).toBe('dev1');
  });

  it('should update device trust status', async () => {
    const result = await p2pAuthService.updateDeviceTrustStatus('dev1', true);
    expect(result).toBe(true);
  });

  it('should get team member devices', async () => {
    // Use the mockSupabase variable directly instead of the global supabase
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        data: [{ id: 'd1', peer_id: 'dev1', name: 'X', device_type: 'desktop', last_seen: new Date().toISOString(), status: 'connected' }],
        error: null
      })
    });
    
    const devices = await p2pAuthService.getTeamMemberDevices('tm1');
    expect(devices).toHaveLength(1);
    expect(devices[0].deviceId).toBe('dev1');
  });

  it('should handle logout', async () => {
    const result = await p2pAuthService.logout();
    expect(result).toBe(true);
  });
});
