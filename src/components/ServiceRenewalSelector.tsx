
import React from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ServiceRenewalSelectorProps {
  serviceName: string;
  isRenewalRequired: boolean;
  onRenewalChange: (isRequired: boolean) => void;
  reminderDays: number;
  onReminderDaysChange: (days: number) => void;
  reminderDate?: Date;
  onReminderDateChange: (date?: Date) => void;
  reminderType: 'days' | 'date';
  onReminderTypeChange: (type: 'days' | 'date') => void;
}

export const ServiceRenewalSelector: React.FC<ServiceRenewalSelectorProps> = ({
  serviceName,
  isRenewalRequired,
  onRenewalChange,
  reminderDays,
  onReminderDaysChange,
  reminderDate,
  onReminderDateChange,
  reminderType,
  onReminderTypeChange,
}) => {
  // Handle checkbox click
  const handleRenewalCheckbox = (checked: boolean) => {
    onRenewalChange(checked);
  };
  
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <div className="flex items-center justify-between">
        <Label className="font-medium cursor-pointer" onClick={() => onRenewalChange(!isRenewalRequired)}>
          {serviceName}
        </Label>
        <div className="flex items-center space-x-2">
          <Label 
            htmlFor={`renewal-${serviceName}`}
            className="cursor-pointer"
            onClick={() => onRenewalChange(!isRenewalRequired)}
          >
            Renewal Required:
          </Label>
          <Checkbox
            id={`renewal-${serviceName}`}
            checked={isRenewalRequired}
            onCheckedChange={handleRenewalCheckbox}
          />
        </div>
      </div>
      
      {isRenewalRequired && (
        <div className="space-y-3 pl-4 border-l-2 border-l-muted/30">
          <div>
            <Label className="text-sm">Reminder Type</Label>
            <RadioGroup
              value={reminderType}
              onValueChange={(value) => onReminderTypeChange(value as 'days' | 'date')}
              className="flex items-center space-x-4 mt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="days" id={`days-${serviceName}`} />
                <Label 
                  htmlFor={`days-${serviceName}`} 
                  className="cursor-pointer"
                  onClick={() => onReminderTypeChange('days')}
                >
                  Days Before
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id={`date-${serviceName}`} />
                <Label 
                  htmlFor={`date-${serviceName}`}
                  className="cursor-pointer"
                  onClick={() => onReminderTypeChange('date')}
                >
                  Specific Date
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {reminderType === 'days' ? (
            <div className="flex items-center space-x-2">
              <Label htmlFor={`days-input-${serviceName}`}>Remind</Label>
              <Input
                id={`days-input-${serviceName}`}
                type="number"
                className="w-20"
                value={reminderDays}
                onChange={(e) => onReminderDaysChange(parseInt(e.target.value) || 30)}
                min={1}
                max={365}
              />
              <span>days before due date</span>
            </div>
          ) : (
            <div>
              <Label className="mb-1 block">Reminder Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reminderDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reminderDate ? (
                      format(reminderDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reminderDate}
                    onSelect={onReminderDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          <div className="flex items-start space-x-2 bg-muted/20 p-2 rounded text-sm">
            <Bell className="h-4 w-4 text-amber-500 mt-0.5" />
            <p>
              {reminderType === 'days'
                ? `A task will be created ${reminderDays} days before the service is due for renewal.`
                : reminderDate
                  ? `A reminder task will be created for ${format(reminderDate, "MMMM d, yyyy")}.`
                  : 'Please select a reminder date.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
