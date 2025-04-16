import { DeviceRegistration, DatabaseDevice, mapDatabaseDeviceToDeviceRegistration } from '@/types/p2p-auth';
import { makeRpcRequest } from './api-helpers';
import { API_ENDPOINTS } from './constants';
import { toast } from '@/hooks/use-toast-extensions';

interface SimpleDeviceInfo {
  deviceId: string;
  deviceName?: string | undefined;
  deviceType?: string | undefined;
  publicKey?: string | undefined;
}

export const deviceService = {
  async registerDevice(
    teamMemberId: string,
    deviceInfo: SimpleDeviceInfo
  ): Promise<string | null> {
    try {
      // Use explicit type annotation for the response
      const response = await makeRpcRequest<{ success: boolean }>(API_ENDPOINTS.INSERT_DEVICE, {
        body: {
          p_team_member_id: teamMemberId,
          p_device_id: deviceInfo.deviceId,
          p_device_name: deviceInfo.deviceName || null,
          p_device_type: deviceInfo.deviceType || null,
          p_public_key: deviceInfo.publicKey || null
        }
      });
      
      // Check response for validation if needed
      if (response && response.success) {
        toast.success(`Device ${deviceInfo.deviceName || deviceInfo.deviceId} registered successfully`);
        return deviceInfo.deviceId;
      } else {
        throw new Error('Device registration failed');
      }
    } catch (error) {
      console.error('Device registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register device');
      return null;
    }
  },

  // Update method to accept boolean instead of string
  async updateDeviceTrustStatus(deviceId: string, trusted: boolean): Promise<boolean> {
    try {
      // Use explicit type annotation for the response
      const response = await makeRpcRequest<{ success: boolean }>(API_ENDPOINTS.UPDATE_TRUST_STATUS, {
        body: {
          p_device_id: deviceId,
          p_trusted: trusted // This now correctly passes a boolean
        }
      });
      
      if (response && response.success) {
        toast.success(`Device trust status updated to ${trusted ? 'trusted' : 'untrusted'}`);
        return true;
      } else {
        throw new Error('Failed to update device trust status');
      }
    } catch (error) {
      console.error('Error updating device trust status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update device trust status');
      return false;
    }
  },

  async getTeamMemberDevices(teamMemberId: string): Promise<DeviceRegistration[]> {
    try {
      // Use explicit type annotation for the database response
      const data = await makeRpcRequest<DatabaseDevice[]>(API_ENDPOINTS.GET_DEVICES, {
        body: {
          p_team_member_id: teamMemberId
        }
      });
      
      return (data || []).map(mapDatabaseDeviceToDeviceRegistration);
    } catch (error) {
      console.error('Error fetching team member devices:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch devices');
      return [];
    }
  }
};
