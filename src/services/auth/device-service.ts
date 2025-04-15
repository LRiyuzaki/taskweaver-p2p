
import { DeviceRegistration, DatabaseDevice, mapDatabaseDeviceToDeviceRegistration } from '@/types/p2p-auth';
import { makeRpcRequest } from './api-helpers';
import { API_ENDPOINTS } from './constants';
import { toast } from '@/hooks/use-toast-extensions';

export const deviceService = {
  async registerDevice(
    teamMemberId: string,
    deviceInfo: {
      deviceId: string;
      deviceName?: string;
      deviceType?: string;
      publicKey?: string;
    }
  ): Promise<string | null> {
    try {
      await makeRpcRequest(API_ENDPOINTS.INSERT_DEVICE, {
        body: {
          p_team_member_id: teamMemberId,
          p_device_id: deviceInfo.deviceId,
          p_device_name: deviceInfo.deviceName || null,
          p_device_type: deviceInfo.deviceType || null,
          p_public_key: deviceInfo.publicKey || null
        }
      });
      
      toast.success(`Device ${deviceInfo.deviceName || deviceInfo.deviceId} registered successfully`);
      return deviceInfo.deviceId;
    } catch (error) {
      console.error('Device registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register device');
      return null;
    }
  },

  async updateDeviceTrustStatus(deviceId: string, trusted: boolean): Promise<boolean> {
    try {
      await makeRpcRequest(API_ENDPOINTS.UPDATE_TRUST_STATUS, {
        body: {
          p_device_id: deviceId,
          p_trusted: trusted
        }
      });
      
      toast.success(`Device trust status updated to ${trusted ? 'trusted' : 'untrusted'}`);
      return true;
    } catch (error) {
      console.error('Error updating device trust status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update device trust status');
      return false;
    }
  },

  async getTeamMemberDevices(teamMemberId: string): Promise<DeviceRegistration[]> {
    try {
      type DatabaseDeviceResponse = DatabaseDevice[];
      
      const data = await makeRpcRequest<DatabaseDeviceResponse>(API_ENDPOINTS.GET_DEVICES, {
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
