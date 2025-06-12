
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Attendance, AttendanceStatus } from '@/types/attendance';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
}

const formSchema = z.object({
  team_member_id: z.string().min(1, 'Team member is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['present', 'absent', 'half_day', 'sick_leave', 'casual_leave', 'work_from_home']),
  hours_worked: z.coerce.number().min(0, 'Hours cannot be negative').max(24, 'Hours cannot exceed 24'),
  notes: z.string().optional(),
});

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance?: Attendance | null;
  selectedDate?: Date | undefined;
  onAttendanceSaved: (attendance: Attendance) => void;
}

export const AttendanceDialog: React.FC<AttendanceDialogProps> = ({
  open,
  onOpenChange,
  attendance,
  selectedDate,
  onAttendanceSaved
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      team_member_id: attendance?.team_member_id || '',
      date: attendance?.date || (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
      status: (attendance?.status as AttendanceStatus) || 'present',
      hours_worked: attendance?.hours_worked || 8,
      notes: attendance?.notes || '',
    },
  });

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('status', 'available')
        .order('name');
      
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (open && attendance) {
      form.reset({
        team_member_id: attendance.team_member_id,
        date: attendance.date,
        status: attendance.status,
        hours_worked: attendance.hours_worked,
        notes: attendance.notes || '',
      });
    } else if (open && selectedDate) {
      form.reset({
        ...form.getValues(),
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
    }
  }, [open, attendance, selectedDate, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (attendance) {
        // Update existing attendance
        const { data, error } = await supabase
          .from('attendance')
          .update(values)
          .eq('id', attendance.id)
          .select()
          .single();

        if (error) throw error;
        toast.success('Attendance updated successfully');
        if (data) onAttendanceSaved(data);
      } else {
        // Create new attendance
        const { data, error } = await supabase
          .from('attendance')
          .insert(values)
          .select()
          .single();

        if (error) throw error;
        toast.success('Attendance marked successfully');
        if (data) onAttendanceSaved(data);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {attendance ? 'Edit Attendance Record' : 'Mark Attendance'}
          </DialogTitle>
          <DialogDescription>
            {attendance ? 'Update attendance record details.' : 'Record team member attendance.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="team_member_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                      <SelectItem value="sick_leave">Sick Leave</SelectItem>
                      <SelectItem value="casual_leave">Casual Leave</SelectItem>
                      <SelectItem value="work_from_home">Work from Home</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hours_worked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Worked</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" min="0" max="24" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the number of hours worked (0-24)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {attendance ? 'Update Record' : 'Save Attendance'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
