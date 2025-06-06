
import { v4 as uuidv4 } from 'uuid';

// Local device interface (no longer P2P related)
interface DeviceInfo {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  platform: string;
  lastActive: Date;
  isCurrentDevice: boolean;
}

class DeviceService {
  private deviceId: string;
  private deviceInfo: DeviceInfo;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.deviceInfo = this.getDeviceInfo();
  }

  private getOrCreateDeviceId(): string {
    const existingId = localStorage.getItem('device-id');
    if (existingId) {
      return existingId;
    }
    
    const newId = uuidv4();
    localStorage.setItem('device-id', newId);
    return newId;
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    
    return {
      id: this.deviceId,
      name: this.getDeviceName(),
      type: this.getDeviceType(),
      browser: this.getBrowserName(userAgent),
      platform: navigator.platform,
      lastActive: new Date(),
      isCurrentDevice: true
    };
  }

  private getDeviceName(): string {
    // Generate a friendly device name
    const platform = navigator.platform;
    const browser = this.getBrowserName(navigator.userAgent);
    return `${platform} - ${browser}`;
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad/.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|android/.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  private getBrowserName(userAgent: string): string {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  public getCurrentDevice(): DeviceInfo {
    return { ...this.deviceInfo, lastActive: new Date() };
  }

  public getDeviceId(): string {
    return this.deviceId;
  }

  public updateLastActive(): void {
    this.deviceInfo.lastActive = new Date();
  }
}

export const deviceService = new DeviceService();
export default deviceService;
