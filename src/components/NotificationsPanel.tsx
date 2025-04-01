
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from "@/hooks/use-toast";
import { 
  Bell, 
  Calendar, 
  Clock, 
  MessageSquare,
  Users,
  CheckSquare 
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

export const NotificationsPanel: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState("30");
  const [notificationSound, setNotificationSound] = useState("chime");
  const [notificationVolume, setNotificationVolume] = useState([70]);

  const handleSaveSettings = () => {
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium">Desktop Notifications</h3>
                <p className="text-sm text-muted-foreground">Show notifications on your desktop</p>
              </div>
              <Switch 
                checked={desktopNotifications} 
                onCheckedChange={setDesktopNotifications} 
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="reminder-time">Task Reminders</Label>
            <Select value={reminderTime} onValueChange={setReminderTime}>
              <SelectTrigger id="reminder-time">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              When to send reminders about upcoming task deadlines
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which events trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Due Date Reminders</span>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Task Assignments</span>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>Comments & Mentions</span>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span>Task Status Changes</span>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Sounds</CardTitle>
          <CardDescription>
            Choose the sounds for your notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Notification Sound</Label>
            <RadioGroup 
              value={notificationSound} 
              onValueChange={setNotificationSound}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chime" id="sound-chime" />
                <Label htmlFor="sound-chime">Chime</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto h-8 w-8 p-0"
                  onClick={() => toast({ title: "Playing sound preview" })}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ping" id="sound-ping" />
                <Label htmlFor="sound-ping">Ping</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto h-8 w-8 p-0"
                  onClick={() => toast({ title: "Playing sound preview" })}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bell" id="sound-bell" />
                <Label htmlFor="sound-bell">Bell</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto h-8 w-8 p-0"
                  onClick={() => toast({ title: "Playing sound preview" })}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="sound-none" />
                <Label htmlFor="sound-none">None (Silent)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume">Volume</Label>
              <span className="text-sm">{notificationVolume[0]}%</span>
            </div>
            <Slider
              id="volume"
              value={notificationVolume}
              onValueChange={setNotificationVolume}
              max={100}
              step={1}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};
