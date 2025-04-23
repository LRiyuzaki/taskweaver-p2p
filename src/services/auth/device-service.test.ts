
import { describe, it, expect, vi } from 'vitest';
import { deviceService } from './device-service';

vi.mock('./api-helpers', () => ({
  makeRpcRequest: vi.fn(async (_endpoint, { body }) => {
    if ('p_team_member_id' in body && 'p_device_id' in body) {
      return { success: true };
    }
    if ('p_team_member_id' in body) {
      // Fake returned device
      return [{
        device_id: 'dev1', device_name: 'Device X', device_type: 'phone', trusted: true, 
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(), public_key: "pubkey"
      }];
    }
    if ('p_device_id' in body && 'p_trusted' in body) {
      return { success: true };
    }
    return { success: false};
  })
}));

vi.mock('@/hooks/use-toast-extensions', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

vi.mock('@/types/p2p-auth', () => ({
  mapDatabaseDeviceToDeviceRegistration: vi.fn(dev => ({
    deviceId: dev.device_id,
    deviceName: dev.device_name,
    deviceType: dev.device_type,
    trusted: dev.trusted,
    createdAt: dev.created_at,
    updatedAt: dev.updated_at,
    publicKey: dev.public_key,
  }))
}));

describe('deviceService', () => {
  it('registerDevice returns deviceId if successful', async () => {
    const deviceId = await deviceService.registerDevice('tm1', { deviceId: 'dev1', deviceName: 'X' });
    expect(deviceId).toBe('dev1');
  });
  it('updateDeviceTrustStatus returns true if succeeds', async () => {
    expect(await deviceService.updateDeviceTrustStatus('dev1', true)).toBe(true);
  });
  it('getTeamMemberDevices returns devices array', async () => {
    const result = await deviceService.getTeamMemberDevices('tm1');
    expect(result[0].deviceId).toBe('dev1');
  });
});
