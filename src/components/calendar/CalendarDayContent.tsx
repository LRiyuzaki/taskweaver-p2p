
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface CalendarDayContentProps {
  date: Date;
  taskCount: number;
}

export const CalendarDayContent: React.FC<CalendarDayContentProps> = ({ date, taskCount }) => {
  return (
    <>
      {date.getDate()}
      {taskCount > 0 && (
        <div className="absolute bottom-0 right-0 p-0.5">
          <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
            {taskCount}
          </Badge>
        </div>
      )}
    </>
  );
};
