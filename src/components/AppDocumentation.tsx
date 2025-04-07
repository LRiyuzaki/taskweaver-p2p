
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Users, Briefcase, ClipboardList, CalendarClock } from "lucide-react";

export const AppDocumentation: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Accounting Practice Management System</h1>
      <p className="text-lg text-muted-foreground mb-8">
        This documentation provides a comprehensive guide on how to use the system effectively
        to manage your accounting practice.
      </p>

      <Tabs defaultValue="overview">
        <TabsList className="mb-8 w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Management</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="services">Service Management</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Key components and how they interact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The Accounting Practice Management System is designed to help accounting professionals 
                  manage their clients, services, tasks, and overall workflow efficiently. The system
                  consists of four primary interconnected modules:
                </p>
                
                <ul className="space-y-4 mt-4">
                  <li className="flex items-start">
                    <Users className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                    <div>
                      <span className="font-medium">Client Management</span> - Store client information, 
                      track which services are required for each client, and manage client-specific details.
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <Briefcase className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                    <div>
                      <span className="font-medium">Service Management</span> - Define and configure the 
                      services your practice offers, including frequency, renewal periods, and requirements.
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <ClipboardList className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                    <div>
                      <span className="font-medium">Task Management</span> - Create, assign, and track 
                      tasks related to client services, with support for recurring tasks.
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <CalendarClock className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                    <div>
                      <span className="font-medium">Timeline & Scheduling</span> - Monitor upcoming deadlines, 
                      renewal dates, and keep track of work progress across clients.
                    </div>
                  </li>
                </ul>

                <h3 className="text-lg font-medium mt-6">How the Modules Interact</h3>
                <p className="mb-4">
                  The system is designed with interconnected workflows:
                </p>

                <ol className="space-y-3 ml-5 list-decimal">
                  <li>Create and manage clients with their required services</li>
                  <li>Define service types that can be assigned to clients</li>
                  <li>Create tasks that can be client-specific or general</li>
                  <li>Track recurring tasks that automatically regenerate based on schedules</li>
                  <li>Monitor client activities, document submissions, and upcoming deadlines</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                How to add, edit and manage clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="adding-clients">
                  <AccordionTrigger>Adding New Clients</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>To add a new client to the system:</p>
                    <ol className="list-decimal ml-5 space-y-2">
                      <li>Navigate to the Client Management page</li>
                      <li>Click the "Add Client" button in the top-right corner</li>
                      <li>Fill in the required fields (Name, Company, Email)</li>
                      <li>Select the entity type from the dropdown</li>
                      <li>Add any additional details like GSTIN, PAN, address</li>
                      <li>In the Required Services section, check the boxes for services this client needs</li>
                      <li>Click "Add Client" to save the new client</li>
                    </ol>
                    <p className="text-muted-foreground mt-2">
                      Note: The services you select here will determine which tasks are automatically 
                      generated for this client.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="editing-clients">
                  <AccordionTrigger>Editing Client Information</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>To edit an existing client:</p>
                    <ol className="list-decimal ml-5 space-y-2">
                      <li>Find the client in the Client Management list</li>
                      <li>Click on the client's name to view their details</li>
                      <li>Click the "Edit" button in the top-right of the client page</li>
                      <li>Update the client information as needed</li>
                      <li>Click "Update Client" to save your changes</li>
                    </ol>
                    <p className="text-muted-foreground mt-2">
                      When you change a client's required services, this will affect which recurring
                      tasks are generated for them in the future.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="client-services">
                  <AccordionTrigger>Managing Client Services</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Each client can have multiple services assigned. To manage these:</p>
                    <ol className="list-decimal ml-5 space-y-2">
                      <li>View the client's detail page</li>
                      <li>Click on the "Services" tab</li>
                      <li>Here you can see all services assigned to this client</li>
                      <li>You can add new services or edit existing ones</li>
                      <li>For each service, you can set start dates, end dates, and renewal periods</li>
                    </ol>
                    <p className="text-muted-foreground mt-2">
                      Services assigned to a client will generate appropriate tasks based on their 
                      frequency and renewal periods.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Creating, assigning and tracking tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="task-creation">
                  <AccordionTrigger>Creating Tasks</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>To create a new task:</p>
                    <ol className="list-decimal ml-5 space-y-2">
                      <li>Navigate to the Task Board</li>
                      <li>Click the "Add Task" button</li>
                      <li>Enter the task title and description</li>
                      <li>Select a client from the dropdown (if the task is client-specific)</li>
                      <li>Assign the task to a team member if needed</li>
                      <li>Set priority, due date, and status</li>
                      <li>If it's a recurring task, select the recurrence pattern (daily, weekly, etc.)</li>
                      <li>Optionally add tags for easier filtering</li>
                      <li>Click "Create Task" to save</li>
                    </ol>
                    <p className="text-muted-foreground mt-2">
                      When associating a task with a client, the client's information will be displayed
                      on the task card, making it easy to identify who it's for.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="recurring-tasks">
                  <AccordionTrigger>Working with Recurring Tasks</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Recurring tasks automatically create new instances when completed:</p>
                    <ol className="list-decimal ml-5 space-y-2">
                      <li>Create a task as normal, but select a recurrence pattern</li>
                      <li>Optionally set an end date for the recurrence</li>
                      <li>When you mark a recurring task as "Done", a new task will automatically be created</li>
                      <li>The new task will have a due date based on the recurrence pattern</li>
                    </ol>
                    <p className="font-medium mt-2">Available recurrence patterns:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Daily - Creates a new task due the next day</li>
                      <li>Weekly - Creates a new task due one week later</li>
                      <li>Monthly - Creates a new task due one month later</li>
                      <li>Quarterly - Creates a new task due three months later</li>
                      <li>Half-Yearly - Creates a new task due six months later</li>
                      <li>Yearly - Creates a new task due one year later</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="task-board">
                  <AccordionTrigger>Using the Task Board</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>The Task Board provides a visual kanban-style interface:</p>
                    <ul className="list-disc ml-5 space-y-2">
                      <li>Tasks are organized in columns by status: "To Do", "In Progress", and "Done"</li>
                      <li>Drag and drop tasks between columns to update their status</li>
                      <li>Click on any task card to view its details or make edits</li>
                      <li>Use the filters at the top to show only specific tasks</li>
                    </ul>
                    <p className="text-muted-foreground mt-2">
                      The color-coding on task cards helps identify priority: red for high, blue for medium,
                      and gray for low priority tasks.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>
                Defining and configuring the services your practice offers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="service-types">
                  <AccordionTrigger>Managing Service Types</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>To define the services your practice offers:</p>
                    <ol className="list-decimal ml-5 space-y-2">
                      <li>Go to the Client Management page</li>
                      <li>Click on the "Services" tab</li>
                      <li>Use the "Add Service Type" button to create a new service</li>
                      <li>Enter the service name, description, and frequency</li>
                      <li>Specify renewal periods if applicable</li>
                      <li>Save the service type</li>
                    </ol>
                    <p className="text-muted-foreground mt-2">
                      Common service types include Monthly GST Filing, Annual Tax Return, 
                      TDS Filing, and Audit services.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="service-client">
                  <AccordionTrigger>Assigning Services to Clients</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Services can be assigned to clients in two ways:</p>
                    <ol className="list-decimal ml-5 space-y-2">
                      <li>When creating or editing a client, check the services they require</li>
                      <li>From a client's detail page, go to the "Services" tab to add specific services</li>
                    </ol>
                    <p className="mt-2">
                      When assigning a service to a client, you can specify:
                    </p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Start date of the service</li>
                      <li>End date (if applicable)</li>
                      <li>Next renewal date</li>
                      <li>Status (active, inactive, completed)</li>
                      <li>Reminder days (how many days before the due date to remind)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="service-renewals">
                  <AccordionTrigger>Service Renewals and Reminders</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>
                      The system tracks service renewals and can generate tasks automatically:
                    </p>
                    <ul className="list-disc ml-5 space-y-2">
                      <li>Services with renewal periods will show upcoming renewal dates</li>
                      <li>Tasks can be automatically created based on these renewal dates</li>
                      <li>Reminder notifications appear before the due dates</li>
                      <li>Services can be marked as renewed when the renewal process is complete</li>
                    </ul>
                    <p className="text-muted-foreground mt-2">
                      Example: For a Monthly GST Filing service, a new task is created each month 
                      to remind you to complete the filing for that client.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Integration</CardTitle>
              <CardDescription>
                How the various modules work together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-medium mb-4">Example Workflow</h3>
              <div className="space-y-6">
                <div className="bg-muted rounded-lg p-5 relative">
                  <h4 className="text-md font-medium mb-2">1. Client Onboarding</h4>
                  <p>Add a new client with their personal and business details</p>
                  <div className="absolute right-5 bottom-5">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-5 relative">
                  <h4 className="text-md font-medium mb-2">2. Service Assignment</h4>
                  <p>Assign the required services to the client, setting up frequencies and renewal periods</p>
                  <div className="absolute right-5 bottom-5">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-5 relative">
                  <h4 className="text-md font-medium mb-2">3. Task Creation</h4>
                  <p>Create tasks for the services (either manually or automatically generated)</p>
                  <div className="absolute right-5 bottom-5">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-5 relative">
                  <h4 className="text-md font-medium mb-2">4. Task Management</h4>
                  <p>Assign tasks to team members, track progress, and complete tasks</p>
                  <div className="absolute right-5 bottom-5">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-5">
                  <h4 className="text-md font-medium mb-2">5. Recurring Task Generation</h4>
                  <p>When recurring tasks are completed, new tasks are automatically scheduled</p>
                </div>
              </div>

              <Separator className="my-8" />

              <h3 className="text-lg font-medium mb-4">Data Linkages</h3>
              <p className="mb-4">
                Understanding how data is connected throughout the system:
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="font-medium mr-2">Clients ⟶ Services:</span>
                  Clients have required services assigned through checkboxes in their profile
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">Services ⟶ Tasks:</span>
                  Services generate recurring tasks based on their frequency
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">Tasks ⟶ Clients:</span>
                  Tasks can be associated with specific clients and display their information
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">Recurring Tasks:</span>
                  When marked as complete, generate new task instances automatically
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppDocumentation;
