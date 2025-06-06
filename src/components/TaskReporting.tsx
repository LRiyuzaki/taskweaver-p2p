
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskReportingProps {
  dateRange: string;
  filters: {
    employeeName: string;
    taskName: string;
    projectName: string;
  };
}

export const TaskReporting: React.FC<TaskReportingProps> = ({ dateRange, filters }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Task reporting data for {dateRange} with filters: {JSON.stringify(filters)}</p>
      </CardContent>
    </Card>
  );
};
