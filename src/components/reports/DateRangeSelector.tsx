
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Create props interface for DateRangeSelector
interface DateRangeSelectorProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  dateRange,
  onDateRangeChange
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">Time Period:</span>
      <Select
        value={dateRange}
        onValueChange={onDateRangeChange}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7days">Last 7 Days</SelectItem>
          <SelectItem value="30days">Last 30 Days</SelectItem>
          <SelectItem value="90days">Last 90 Days</SelectItem>
          <SelectItem value="thisMonth">This Month</SelectItem>
          <SelectItem value="lastMonth">Last Month</SelectItem>
          <SelectItem value="thisYear">This Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
