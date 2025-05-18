import React, { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FilePlus2, AlertCircle, CalendarCheck, RefreshCw } from 'lucide-react';
import { RecurrenceType } from '@/types/task';
import { useClientContext } from '@/contexts/ClientContext';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, addDays, isPast } from 'date-fns';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

export const RecurringTasksPanel = () => {
  const { tasks, updateTask, addBulkTasks } = useTaskContext();
  const { clients } = useClientContext();
  const recurringTasks = tasks.filter(task => task.recurrence !== 'none');
  
  const [activeTab, setActiveTab] = useState<'statutory' | 'subscriptions'>('statutory');
  
  // State for statutory filings
  const [selectedFilingTypes, setSelectedFilingTypes] = useState({
    gst1: true,
    gst3b: true,
    tds: false,
    incomeTax: false,
    roc: false,
    dir3kyc: false,
    ieCode: false
  });
  
  // State for subscription services
  const [selectedSubscriptions, setSelectedSubscriptions] = useState({
    digitalSignature: false,
    trademarkRegistration: false,
    businessLicense: false,
    professionalMembership: false
  });
  
  // State for subscription renewal periods
  const [renewalPeriods, setRenewalPeriods] = useState({
    digitalSignature: 2, // years
    trademarkRegistration: 10, // years
    businessLicense: 1, // years
    professionalMembership: 1, // years
  });
  
  // State for reminder days before due date
  const [reminderDays, setReminderDays] = useState({
    statutory: 7,
    subscription: 30
  });
  
  // Toggle for enabling/disabling recurring tasks
  const handleToggleRecurrence = (taskId: string, enabled: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    updateTask(taskId, { 
      recurrence: enabled ? (task.recurrence || 'monthly') : 'none' 
    });
  };
  
  // Generate statutory filing tasks for all eligible clients
  const handleGenerateStatutoryTasks = () => {
    const activeClients = clients.filter(client => client.active !== false);
    const newTasks = [];
    const currentDate = new Date();
    
    // GST-1 - Due on 11th of every month for the previous month
    if (selectedFilingTypes.gst1) {
      const nextDueDate = new Date();
      nextDueDate.setDate(11); 
      
      // If today is past the 11th, set for next month
      if (currentDate.getDate() > 11) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }
      
      // Find GST registered clients
      const gstClients = activeClients.filter(client => 
        client.isGSTRegistered || 
        (client.requiredServices && client.requiredServices['GST Filing'])
      );
      
      for (const client of gstClients) {
        newTasks.push({
          title: `GSTR-1 Filing - ${client.name}`,
          description: `Monthly GSTR-1 return filing for ${client.name}${client.gstin ? ` (GSTIN: ${client.gstin})` : ''}`,
          status: 'todo',
          priority: 'high',
          dueDate: new Date(nextDueDate),
          clientId: client.id,
          clientName: client.name,
          tags: ['GST', 'GSTR-1', 'Compliance', 'Monthly'],
          recurrence: 'monthly' as RecurrenceType
        });
      }
    }
    
    // GST-3B - Due on 20th of every month
    if (selectedFilingTypes.gst3b) {
      const nextDueDate = new Date();
      nextDueDate.setDate(20); 
      
      // If today is past the 20th, set for next month
      if (currentDate.getDate() > 20) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }
      
      // Find GST registered clients
      const gstClients = activeClients.filter(client => 
        client.isGSTRegistered || 
        (client.requiredServices && client.requiredServices['GST Filing'])
      );
      
      for (const client of gstClients) {
        newTasks.push({
          title: `GSTR-3B Filing - ${client.name}`,
          description: `Monthly GSTR-3B return filing for ${client.name}${client.gstin ? ` (GSTIN: ${client.gstin})` : ''}`,
          status: 'todo',
          priority: 'high',
          dueDate: new Date(nextDueDate),
          clientId: client.id,
          clientName: client.name,
          tags: ['GST', 'GSTR-3B', 'Compliance', 'Monthly'],
          recurrence: 'monthly' as RecurrenceType
        });
      }
    }
    
    // TDS - Quarterly filings
    if (selectedFilingTypes.tds) {
      // Find clients with TDS requirements
      const tdsClients = activeClients.filter(client => 
        client.tan || 
        (client.requiredServices && client.requiredServices['TDS Filing'])
      );
      
      // Calculate due date - 7th of the month following the end of quarter
      const currentMonth = currentDate.getMonth();
      const currentQuarter = Math.floor(currentMonth / 3);
      const nextQuarterMonth = (currentQuarter + 1) * 3; // 0, 3, 6, or 9
      
      const dueDate = new Date(currentDate.getFullYear(), nextQuarterMonth, 7);
      if (isPast(dueDate)) {
        dueDate.setMonth(dueDate.getMonth() + 3);
      }
      
      for (const client of tdsClients) {
        newTasks.push({
          title: `TDS Return Filing - ${client.name}`,
          description: `Quarterly TDS return filing for ${client.name}${client.tan ? ` (TAN: ${client.tan})` : ''}`,
          status: 'todo',
          priority: 'high',
          dueDate: dueDate,
          clientId: client.id,
          clientName: client.name,
          tags: ['TDS', 'Compliance', 'Quarterly'],
          recurrence: 'quarterly' as RecurrenceType
        });
      }
    }
    
    // Income Tax Annual Filing - Due July 31
    if (selectedFilingTypes.incomeTax) {
      const currentYear = currentDate.getFullYear();
      let dueYear = currentYear;
      
      // Due date is July 31st
      const dueDate = new Date(dueYear, 6, 31); // July 31
      
      // If we're past July 31, set for next year
      if (isPast(dueDate)) {
        dueYear = currentYear + 1;
        dueDate.setFullYear(dueYear);
      }
      
      for (const client of activeClients) {
        if (client.requiredServices && client.requiredServices['Income Tax Filing']) {
          newTasks.push({
            title: `Income Tax Return - ${client.name}`,
            description: `Annual income tax return for ${client.name} for FY ${dueYear-1}-${dueYear}`,
            status: 'todo',
            priority: 'high',
            dueDate: dueDate,
            clientId: client.id,
            clientName: client.name,
            tags: ['Income Tax', 'Compliance', 'Yearly'],
            recurrence: 'yearly' as RecurrenceType
          });
        }
      }
    }
    
    // ROC Annual Filing - Due November 30
    if (selectedFilingTypes.roc) {
      const currentYear = currentDate.getFullYear();
      let dueYear = currentYear;
      
      // Due date is November 30th
      const dueDate = new Date(dueYear, 10, 30); // November 30
      
      // If we're past November 30, set for next year
      if (isPast(dueDate)) {
        dueYear = currentYear + 1;
        dueDate.setFullYear(dueYear);
      }
      
      // Filter company clients
      const companyClients = activeClients.filter(client => 
        client.entityType === 'Company' || 
        (client.requiredServices && client.requiredServices['ROC Filing'])
      );
      
      for (const client of companyClients) {
        newTasks.push({
          title: `Annual ROC Filing - ${client.name}`,
          description: `Annual ROC filing for ${client.name} for FY ${dueYear-1}-${dueYear}`,
          status: 'todo',
          priority: 'high',
          dueDate: dueDate,
          clientId: client.id,
          clientName: client.name,
          tags: ['ROC', 'Compliance', 'Yearly'],
          recurrence: 'yearly' as RecurrenceType
        });
      }
    }

    // DIR-3 KYC - Due September 30
    if (selectedFilingTypes.dir3kyc) {
      const currentYear = currentDate.getFullYear();
      let dueYear = currentYear;
      
      // Due date is September 30th
      const dueDate = new Date(dueYear, 8, 30); // September 30
      
      // If we're past September 30, set for next year
      if (isPast(dueDate)) {
        dueYear = currentYear + 1;
        dueDate.setFullYear(dueYear);
      }
      
      // Filter directors
      const directorClients = activeClients.filter(client => 
        client.isDirector || 
        (client.requiredServices && client.requiredServices['DIR-3 KYC'])
      );
      
      for (const client of directorClients) {
        newTasks.push({
          title: `DIR-3 KYC Filing - ${client.name}`,
          description: `Annual Director KYC filing for ${client.name}`,
          status: 'todo',
          priority: 'high',
          dueDate: dueDate,
          clientId: client.id,
          clientName: client.name,
          tags: ['DIR-3 KYC', 'Compliance', 'Yearly'],
          recurrence: 'yearly' as RecurrenceType
        });
      }
    }
    
    // IE Code Renewal - Due June 30
    if (selectedFilingTypes.ieCode) {
      const currentYear = currentDate.getFullYear();
      let dueYear = currentYear;
      
      // Due date is June 30th
      const dueDate = new Date(dueYear, 5, 30); // June 30
      
      // If we're past June 30, set for next year
      if (isPast(dueDate)) {
        dueYear = currentYear + 1;
        dueDate.setFullYear(dueYear);
      }
      
      // Filter importing/exporting clients
      const ieClients = activeClients.filter(client => 
        client.hasIECode || 
        (client.requiredServices && client.requiredServices['IE Code Renewal'])
      );
      
      for (const client of ieClients) {
        newTasks.push({
          title: `IE Code Renewal - ${client.name}`,
          description: `Annual IE Code renewal for ${client.name}`,
          status: 'todo',
          priority: 'high',
          dueDate: dueDate,
          clientId: client.id,
          clientName: client.name,
          tags: ['IE Code', 'Compliance', 'Yearly'],
          recurrence: 'yearly' as RecurrenceType
        });
      }
    }
    
    // Create the bulk tasks
    if (newTasks.length > 0) {
      // Add reminder days to all tasks
      const tasksWithReminders = newTasks.map(task => {
        const dueDate = new Date(task.dueDate);
        const reminderDate = addDays(dueDate, -reminderDays.statutory);
        // If reminder date is in the past, use tomorrow
        const actualReminderDate = isPast(reminderDate) ? addDays(new Date(), 1) : reminderDate;
        
        return {
          ...task,
          dueDate: actualReminderDate // Set the task's due date to reminder date 
        };
      });
      
      addBulkTasks(tasksWithReminders);
      toast({
        title: "Tasks Generated",
        description: `Successfully created ${tasksWithReminders.length} compliance tasks`,
      });
    } else {
      toast({
        title: "No Tasks Created",
        description: "No eligible clients found for selected filing types",
        variant: "destructive"
      });
    }
  };
  
  // Generate subscription-based renewal tasks
  const handleGenerateSubscriptionTasks = () => {
    const activeClients = clients.filter(client => client.active !== false);
    const newTasks = [];
    
    // Digital Signature Certificate (DSC) - Every 2 years from start date
    if (selectedSubscriptions.digitalSignature) {
      const dscClients = activeClients.filter(client => 
        client.hasDSC || 
        (client.requiredServices && client.requiredServices['Digital Signature'])
      );
      
      for (const client of dscClients) {
        // Get client's DSC start date or use today's date - 2 years + 1 month
        // as a substitute (just for demonstration)
        const startDate = client.dscStartDate || new Date();
        startDate.setFullYear(startDate.getFullYear() - renewalPeriods.digitalSignature + 1);
        startDate.setMonth(startDate.getMonth() + 1);
        
        // Calculate next renewal
        const renewalDate = new Date(startDate);
        renewalDate.setFullYear(renewalDate.getFullYear() + renewalPeriods.digitalSignature);
        
        // Calculate reminder date
        const reminderDate = addDays(renewalDate, -reminderDays.subscription);
        
        newTasks.push({
          title: `DSC Renewal - ${client.name}`,
          description: `Digital Signature Certificate renewal for ${client.name}. Current DSC expires on ${format(renewalDate, 'PPP')}`,
          status: 'todo',
          priority: 'medium',
          dueDate: reminderDate,
          clientId: client.id,
          clientName: client.name,
          tags: ['DSC', 'Renewal', 'Compliance'],
          recurrence: 'none' // Handle recurring manually based on new certificate date
        });
      }
    }
    
    // Trademark Registration - Every 10 years
    if (selectedSubscriptions.trademarkRegistration) {
      const trademarkClients = activeClients.filter(client => 
        client.hasTrademark || 
        (client.requiredServices && client.requiredServices['Trademark'])
      );
      
      for (const client of trademarkClients) {
        // Get client's trademark registration date or use today
        const startDate = client.trademarkDate || new Date();
        
        // Calculate next renewal
        const renewalDate = new Date(startDate);
        renewalDate.setFullYear(renewalDate.getFullYear() + renewalPeriods.trademarkRegistration);
        
        // Calculate reminder date
        const reminderDate = addDays(renewalDate, -reminderDays.subscription);
        
        newTasks.push({
          title: `Trademark Renewal - ${client.name}`,
          description: `Trademark registration renewal for ${client.name}. Current registration expires on ${format(renewalDate, 'PPP')}`,
          status: 'todo',
          priority: 'medium',
          dueDate: reminderDate,
          clientId: client.id,
          clientName: client.name,
          tags: ['Trademark', 'Renewal', 'Intellectual Property'],
          recurrence: 'none' // Handle recurring manually based on renewal
        });
      }
    }
    
    // Business License - Annually
    if (selectedSubscriptions.businessLicense) {
      const licenseClients = activeClients.filter(client => 
        (client.requiredServices && client.requiredServices['Business License'])
      );
      
      for (const client of licenseClients) {
        // Get client's license date or use today
        const startDate = client.licenseDate || new Date();
        
        // Calculate next renewal
        const renewalDate = new Date(startDate);
        renewalDate.setFullYear(renewalDate.getFullYear() + renewalPeriods.businessLicense);
        
        // Calculate reminder date
        const reminderDate = addDays(renewalDate, -reminderDays.subscription);
        
        newTasks.push({
          title: `Business License Renewal - ${client.name}`,
          description: `Annual business license renewal for ${client.name}. Current license expires on ${format(renewalDate, 'PPP')}`,
          status: 'todo',
          priority: 'high',
          dueDate: reminderDate,
          clientId: client.id,
          clientName: client.name,
          tags: ['License', 'Renewal', 'Compliance'],
          recurrence: 'yearly' as RecurrenceType
        });
      }
    }
    
    // Create the bulk tasks
    if (newTasks.length > 0) {
      addBulkTasks(newTasks);
      toast({
        title: "Tasks Generated",
        description: `Successfully created ${newTasks.length} renewal tasks`,
      });
    } else {
      toast({
        title: "No Tasks Created",
        description: "No eligible clients found for selected renewal types",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compliance Management</h2>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1.5" />
          <span className="text-sm text-muted-foreground">
            {recurringTasks.length} Active Recurrences
          </span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'statutory' | 'subscriptions')}>
        <TabsList>
          <TabsTrigger value="statutory" className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Statutory Filings
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Service Renewals
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="statutory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Statutory Filing Tasks</CardTitle>
              <CardDescription>
                Create compliance tasks for all eligible clients based on government filing due dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-3">Filing Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="gst1" 
                        checked={selectedFilingTypes.gst1}
                        onCheckedChange={(checked) => 
                          setSelectedFilingTypes(prev => ({ ...prev, gst1: !!checked }))
                        }
                      />
                      <label htmlFor="gst1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        GSTR-1 (Monthly)
                        <div className="text-xs text-muted-foreground">Due: 11th of each month</div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="gst3b" 
                        checked={selectedFilingTypes.gst3b}
                        onCheckedChange={(checked) => 
                          setSelectedFilingTypes(prev => ({ ...prev, gst3b: !!checked }))
                        }
                      />
                      <label htmlFor="gst3b" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        GSTR-3B (Monthly)
                        <div className="text-xs text-muted-foreground">Due: 20th of each month</div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tds" 
                        checked={selectedFilingTypes.tds}
                        onCheckedChange={(checked) => 
                          setSelectedFilingTypes(prev => ({ ...prev, tds: !!checked }))
                        }
                      />
                      <label htmlFor="tds" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        TDS Returns (Quarterly)
                        <div className="text-xs text-muted-foreground">Due: 7th of following month</div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="incomeTax" 
                        checked={selectedFilingTypes.incomeTax}
                        onCheckedChange={(checked) => 
                          setSelectedFilingTypes(prev => ({ ...prev, incomeTax: !!checked }))
                        }
                      />
                      <label htmlFor="incomeTax" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Income Tax (Annual)
                        <div className="text-xs text-muted-foreground">Due: July 31st</div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="roc" 
                        checked={selectedFilingTypes.roc}
                        onCheckedChange={(checked) => 
                          setSelectedFilingTypes(prev => ({ ...prev, roc: !!checked }))
                        }
                      />
                      <label htmlFor="roc" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        ROC Filings (Annual)
                        <div className="text-xs text-muted-foreground">Due: November 30th</div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="dir3kyc" 
                        checked={selectedFilingTypes.dir3kyc}
                        onCheckedChange={(checked) => 
                          setSelectedFilingTypes(prev => ({ ...prev, dir3kyc: !!checked }))
                        }
                      />
                      <label htmlFor="dir3kyc" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        DIR-3 KYC (Annual)
                        <div className="text-xs text-muted-foreground">Due: September 30th</div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="ieCode" 
                        checked={selectedFilingTypes.ieCode}
                        onCheckedChange={(checked) => 
                          setSelectedFilingTypes(prev => ({ ...prev, ieCode: !!checked }))
                        }
                      />
                      <label htmlFor="ieCode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        IE Code Renewal (Annual)
                        <div className="text-xs text-muted-foreground">Due: June 30th</div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 pt-2">
                  <div>
                    <label htmlFor="statutory-days" className="block text-sm font-medium text-muted-foreground mb-1">
                      Create task how many days before deadline?
                    </label>
                    <Input
                      id="statutory-days"
                      type="number"
                      value={reminderDays.statutory}
                      min={1}
                      max={90}
                      className="w-28"
                      onChange={(e) => setReminderDays(prev => ({ ...prev, statutory: parseInt(e.target.value) || 7 }))}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerateStatutoryTasks}
                    className="sm:ml-auto"
                  >
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Generate Filing Tasks
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Tasks will be generated for clients with appropriate registration details and service requirements.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Renewal Tasks</CardTitle>
              <CardDescription>
                Create tasks for services that need to be renewed periodically based on subscription dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-3">Subscription Services</h3>
                  
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="dsc">
                      <AccordionTrigger className="py-3">
                        <div className="flex items-center">
                          <Checkbox 
                            id="digitalSignature" 
                            checked={selectedSubscriptions.digitalSignature}
                            onCheckedChange={(checked) => 
                              setSelectedSubscriptions(prev => ({ ...prev, digitalSignature: !!checked }))
                            }
                            className="mr-2"
                          />
                          <label htmlFor="digitalSignature" className="text-sm font-medium">
                            Digital Signature Certificate (DSC)
                          </label>
                          {selectedSubscriptions.digitalSignature && (
                            <Badge variant="outline" className="ml-2">
                              Every {renewalPeriods.digitalSignature} years
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-6 space-y-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                              Renewal Period (Years)
                            </label>
                            <Select 
                              value={renewalPeriods.digitalSignature.toString()}
                              onValueChange={(value) => 
                                setRenewalPeriods(prev => ({ ...prev, digitalSignature: parseInt(value) }))
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Years" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 year</SelectItem>
                                <SelectItem value="2">2 years</SelectItem>
                                <SelectItem value="3">3 years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Digital Signature Certificates typically need renewal every 2 years from the issue date.
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="trademark">
                      <AccordionTrigger className="py-3">
                        <div className="flex items-center">
                          <Checkbox 
                            id="trademarkRegistration" 
                            checked={selectedSubscriptions.trademarkRegistration}
                            onCheckedChange={(checked) => 
                              setSelectedSubscriptions(prev => ({ ...prev, trademarkRegistration: !!checked }))
                            }
                            className="mr-2"
                          />
                          <label htmlFor="trademarkRegistration" className="text-sm font-medium">
                            Trademark Registration
                          </label>
                          {selectedSubscriptions.trademarkRegistration && (
                            <Badge variant="outline" className="ml-2">
                              Every {renewalPeriods.trademarkRegistration} years
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-6 space-y-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                              Renewal Period (Years)
                            </label>
                            <Select 
                              value={renewalPeriods.trademarkRegistration.toString()}
                              onValueChange={(value) => 
                                setRenewalPeriods(prev => ({ ...prev, trademarkRegistration: parseInt(value) }))
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Years" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 years</SelectItem>
                                <SelectItem value="10">10 years</SelectItem>
                                <SelectItem value="15">15 years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Trademark registrations typically need renewal every 10 years from the registration date.
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="license">
                      <AccordionTrigger className="py-3">
                        <div className="flex items-center">
                          <Checkbox 
                            id="businessLicense" 
                            checked={selectedSubscriptions.businessLicense}
                            onCheckedChange={(checked) => 
                              setSelectedSubscriptions(prev => ({ ...prev, businessLicense: !!checked }))
                            }
                            className="mr-2"
                          />
                          <label htmlFor="businessLicense" className="text-sm font-medium">
                            Business License
                          </label>
                          {selectedSubscriptions.businessLicense && (
                            <Badge variant="outline" className="ml-2">
                              Every {renewalPeriods.businessLicense} {renewalPeriods.businessLicense === 1 ? 'year' : 'years'}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-6 space-y-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                              Renewal Period (Years)
                            </label>
                            <Select 
                              value={renewalPeriods.businessLicense.toString()}
                              onValueChange={(value) => 
                                setRenewalPeriods(prev => ({ ...prev, businessLicense: parseInt(value) }))
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Years" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 year</SelectItem>
                                <SelectItem value="2">2 years</SelectItem>
                                <SelectItem value="3">3 years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Most business licenses need to be renewed annually.
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                
                <Separator />
                
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div>
                    <label htmlFor="subscription-days" className="block text-sm font-medium text-muted-foreground mb-1">
                      Create task how many days before expiry?
                    </label>
                    <Input
                      id="subscription-days"
                      type="number"
                      value={reminderDays.subscription}
                      min={1}
                      max={90}
                      className="w-28"
                      onChange={(e) => setReminderDays(prev => ({ ...prev, subscription: parseInt(e.target.value) || 30 }))}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerateSubscriptionTasks}
                    className="sm:ml-auto"
                  >
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Generate Renewal Tasks
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Tasks will be created based on client service subscription dates.
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Link Services to Client Renewals</CardTitle>
              <CardDescription>
                Apply service renewal settings for specific clients from their service page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-3">
                  To set up client-specific service renewals, navigate to the client details page,
                  select the Services tab, and configure renewal settings for each service.
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/client-management'}>
                  Go to Client Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {recurringTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Recurring Tasks</CardTitle>
            <CardDescription>View and manage currently active recurring tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Task</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-muted-foreground w-32">Frequency</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-muted-foreground w-32">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-muted-foreground w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted bg-background">
                  {recurringTasks.map(task => (
                    <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-medium">{task.title}</span>
                          {task.clientName && (
                            <div className="text-sm text-muted-foreground">{task.clientName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className="capitalize">
                          {task.recurrence}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={
                          task.status === 'done' ? "secondary" : 
                          task.status === 'inProgress' ? "default" : 
                          "outline"
                        }>
                          {task.status === 'inProgress' ? 'In Progress' : 
                           task.status === 'todo' ? 'To Do' :
                           task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Switch 
                          checked={task.recurrence !== 'none'} 
                          onCheckedChange={(checked) => handleToggleRecurrence(task.id, checked)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {recurringTasks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recurring tasks configured.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
