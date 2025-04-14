
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useP2PAuth } from '@/contexts/P2PAuthContext';
import { Loader2, DeviceMobile } from 'lucide-react';
import { generateRandomId } from '@/utils/p2p-helpers';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export const P2PDeviceRegistration: React.FC = () => {
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('desktop');
  const [isRegistering, setIsRegistering] = useState(false);
  const { registerDevice, devices } = useP2PAuth();
  
  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceName) {
      return;
    }
    
    setIsRegistering(true);
    
    try {
      // Generate a unique device ID
      const deviceId = generateRandomId();
      
      // Register the device
      const registeredId = await registerDevice({
        deviceId,
        deviceName,
        deviceType
      });
      
      if (registeredId) {
        // Clear form
        setDeviceName('');
      }
    } catch (error) {
      console.error('Device registration error:', error);
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Register New Device</CardTitle>
        <CardDescription>
          Add a new device to your P2P network
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegisterDevice}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceName">Device Name</Label>
            <Input
              id="deviceName"
              placeholder="My Laptop"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              disabled={isRegistering}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deviceType">Device Type</Label>
            <Select
              value={deviceType}
              onValueChange={setDeviceType}
              disabled={isRegistering}
            >
              <SelectTrigger id="deviceType">
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {devices.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-2">Registered Devices ({devices.length})</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                {devices.map((device) => (
                  <div key={device.deviceId} className="flex items-center">
                    <DeviceMobile className="h-3 w-3 mr-1" />
                    <span>
                      {device.deviceName} ({device.deviceType})
                      {device.trusted && " ✓"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isRegistering || !deviceName}>
            {isRegistering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>Register Device</>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
