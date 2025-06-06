
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientReportingProps {
  dateRange: string;
}

export const ClientReporting: React.FC<ClientReportingProps> = ({ dateRange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Client reporting data for {dateRange}</p>
      </CardContent>
    </Card>
  );
};
