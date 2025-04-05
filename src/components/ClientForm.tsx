
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { TableField } from '@/contexts/DatabaseContext';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';

interface ClientFormProps {
  client?: any;
  fields: TableField[];
  onSubmit: (data: any) => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ client, fields, onSubmit }) => {
  // Dynamically build form schema based on table fields
  const formSchema = z.object(
    fields.reduce((acc, field) => {
      // Define validation based on field type
      let validator;
      
      switch (field.type) {
        case 'text':
        case 'url':
        case 'phone':
          validator = field.required 
            ? z.string().min(1, `${field.name} is required`) 
            : z.string().optional();
          break;
        case 'email':
          validator = field.required 
            ? z.string().email(`Invalid email format`) 
            : z.string().email(`Invalid email format`).optional();
          break;
        case 'number':
        case 'currency':
        case 'percent':
          validator = field.required 
            ? z.number().or(z.string().regex(/^\d+$/).transform(Number)) 
            : z.number().or(z.string().regex(/^\d+$/).transform(Number)).optional();
          break;
        case 'checkbox':
          validator = z.boolean().default(false);
          break;
        case 'date':
          validator = field.required 
            ? z.date() 
            : z.date().optional();
          break;
        case 'select':
          validator = field.required 
            ? z.string().min(1, `${field.name} is required`) 
            : z.string().optional();
          break;
        default:
          validator = z.any();
      }
      
      return {
        ...acc,
        [field.id]: validator
      };
    }, {})
  );

  type FormValues = z.infer<typeof formSchema>;
  
  // Set default values based on client data or field defaults
  const defaultValues: any = {};
  
  fields.forEach(field => {
    if (client && client[field.id] !== undefined) {
      if (field.type === 'date' && typeof client[field.id] === 'string') {
        defaultValues[field.id] = new Date(client[field.id]);
      } else {
        defaultValues[field.id] = client[field.id];
      }
    } else if (field.default !== undefined) {
      defaultValues[field.id] = field.default;
    } else {
      switch (field.type) {
        case 'checkbox':
          defaultValues[field.id] = false;
          break;
        case 'text':
        case 'email':
        case 'url':
        case 'phone':
        case 'select':
          defaultValues[field.id] = '';
          break;
        case 'number':
        case 'currency':
        case 'percent':
          defaultValues[field.id] = 0;
          break;
        // Other types would be undefined
      }
    }
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };
  
  // Render form fields based on field type
  const renderField = (field: TableField) => {
    switch (field.type) {
      case 'text':
      case 'url':
      case 'phone':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id as keyof FormValues}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}</FormLabel>
                <FormControl>
                  <Input {...formField} placeholder={`Enter ${field.name.toLowerCase()}`} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'email':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id as keyof FormValues}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}</FormLabel>
                <FormControl>
                  <Input 
                    {...formField} 
                    type="email" 
                    placeholder={`Enter ${field.name.toLowerCase()}`} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'number':
      case 'currency':
      case 'percent':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id as keyof FormValues}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}</FormLabel>
                <FormControl>
                  <Input 
                    {...formField} 
                    type="number" 
                    placeholder={`Enter ${field.name.toLowerCase()}`} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'checkbox':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id as keyof FormValues}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {field.name}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        );
        
      case 'date':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id as keyof FormValues}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{field.name}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formField.value ? (
                          format(formField.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value}
                      onSelect={formField.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'select':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id as keyof FormValues}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}</FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(field => renderField(field))}
        </div>
        
        <Button type="submit" className="w-full">
          {client ? 'Update Client' : 'Add Client'}
        </Button>
      </form>
    </Form>
  );
};
