
import React from 'react';
import { Header } from '@/components/Header';
import { AttendanceTracker } from '@/components/AttendanceTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AttendancePage = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Team Attendance</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <AttendanceTracker />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Summary</CardTitle>
                    <CardDescription>Team attendance statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>Attendance tracking and reporting features will be implemented in the next phase.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendancePage;
