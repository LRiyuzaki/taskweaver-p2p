
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Attendance, AttendanceStatus } from '@/types/attendance';
import { AttendanceDialog } from './AttendanceDialog';

export const AttendanceTracker: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  
  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, team_members(name)')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const getAttendanceForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return attendanceRecords.filter(record => record.date === dateString);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const existingAttendance = getAttendanceForDate(date)[0];
      if (existingAttendance) {
        setSelectedAttendance(existingAttendance);
      } else {
        setSelectedAttendance(null);
      }
      setIsDialogOpen(true);
    }
  };

  const handleAttendanceSaved = (attendance: Attendance) => {
    setAttendanceRecords(prev => {
      const index = prev.findIndex(a => a.id === attendance.id);
      if (index >= 0) {
        return [...prev.slice(0, index), attendance, ...prev.slice(index + 1)];
      }
      return [...prev, attendance];
    });
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Tracker</CardTitle>
        <CardDescription>Track and manage team attendance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md border"
          components={{
            DayContent: ({ date }) => {
              const records = getAttendanceForDate(date);
              return (
                <div className="relative h-full w-full p-2">
                  <span>{date.getDate()}</span>
                  {records.length > 0 && (
                    <div className="absolute bottom-1 right-1">
                      <Badge 
                        variant={records[0].status === 'present' ? 'default' : 'destructive'}
                        className="h-2 w-2 p-0 rounded-full"
                      />
                    </div>
                  )}
                </div>
              );
            }
          }}
        />
        <Button 
          onClick={() => {
            setSelectedDate(new Date());
            setSelectedAttendance(null);
            setIsDialogOpen(true);
          }}
          className="w-full"
        >
          Mark Today's Attendance
        </Button>
      </CardContent>

      <AttendanceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        attendance={selectedAttendance}
        selectedDate={selectedDate}
        onAttendanceSaved={handleAttendanceSaved}
      />
    </Card>
  );
};
