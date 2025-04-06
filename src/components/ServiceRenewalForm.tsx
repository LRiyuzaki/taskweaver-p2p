
import React, { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addMonths, addQuarters, addYears } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { ServiceType } from '@/types/client';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  serviceTypeId: z.string().min(1, "Service type is required"),
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  frequency: z.enum(["one-time", "monthly", "quarterly", "annually"]),
  renewalPeriod: z.number().int().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const ServiceRenewalForm: React.FC = () => {
  const { addServiceType, serviceTypes } = useClientContext();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: "annually",
      renewalPeriod: 12, // Default to 12 months
    },
  });
  
  const onSubmit = (values: FormValues) => {
    addServiceType({
      name: values.name,
      description: values.description || "",
      frequency: values.frequency,
      renewalPeriod: values.renewalPeriod,
    });
    
    form.reset();
    
    toast({
      title: "Service Added",
      description: `${values.name} has been added to the service catalog`
    });
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Add New Service Type</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="DGFT Registration" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the service or compliance requirement
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often this service needs to be renewed
                  </FormDescription>
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
                    <Input placeholder="Service description" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="renewalPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Renewal Period (months)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                      min={1}
                      max={120}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of months before renewal is required
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit">Add Service Type</Button>
        </form>
      </Form>
    </div>
  );
};
