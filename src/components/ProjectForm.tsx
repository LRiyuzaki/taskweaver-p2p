
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Project } from '@/types/task';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  LayoutGrid, List, Calendar, CheckSquare, 
  BookOpen, Users, CreditCard, BarChart,
  FileText, Star, Folder, Briefcase
} from 'lucide-react';

const ICONS = [
  { icon: <LayoutGrid size={18} />, value: 'layoutGrid' },
  { icon: <List size={18} />, value: 'list' },
  { icon: <Calendar size={18} />, value: 'calendar' },
  { icon: <CheckSquare size={18} />, value: 'checkSquare' },
  { icon: <BookOpen size={18} />, value: 'bookOpen' },
  { icon: <Users size={18} />, value: 'users' },
  { icon: <CreditCard size={18} />, value: 'creditCard' },
  { icon: <BarChart size={18} />, value: 'barChart' },
  { icon: <FileText size={18} />, value: 'fileText' },
  { icon: <Star size={18} />, value: 'star' },
  { icon: <Folder size={18} />, value: 'folder' },
  { icon: <Briefcase size={18} />, value: 'briefcase' },
];

const formSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  project?: Project;
  onSubmit: (values: Omit<Project, 'id' | 'createdAt'>) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      color: project?.color || '#4f46e5', // Default indigo color
      icon: project?.icon || 'folder',
    },
  });

  const handleSubmit = (values: FormValues) => {
    // Ensure name is treated as a required field to match the Project type
    onSubmit({
      name: values.name, // This is guaranteed to be a non-empty string due to zod validation
      description: values.description,
      color: values.color,
      icon: values.icon,
      status: 'active', // Add default status
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Project description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Color</FormLabel>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Input type="color" {...field} className="w-12 h-10 p-1" />
                </FormControl>
                <span className="text-sm">{field.value}</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Icon</FormLabel>
              <FormControl>
                <div className="grid grid-cols-6 gap-2 p-2 border rounded-md">
                  {ICONS.map((iconObj) => (
                    <div
                      key={iconObj.value}
                      className={`flex items-center justify-center p-2 rounded-md cursor-pointer ${
                        field.value === iconObj.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={() => form.setValue('icon', iconObj.value)}
                    >
                      {iconObj.icon}
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </form>
    </Form>
  );
};
