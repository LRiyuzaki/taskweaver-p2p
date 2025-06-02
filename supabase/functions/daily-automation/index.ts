
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ServicePeriod {
  service_period_id: string;
  service_id: string;
  period_name: string;
  trigger_day: number | null;
  trigger_month: number | null;
  due_days_offset: number;
  is_active: boolean;
  team_services: {
    name: string;
    team_id: string;
  };
}

interface ClientServiceEnhanced {
  client_service_id: string;
  client_id: string;
  service_id: string;
  is_active: boolean;
  clients: {
    id: string;
    name: string;
    company: string | null;
    team_id: string;
  };
}

interface ClientCompliance {
  client_compliance_id: string;
  client_id: string;
  compliance_type_id: string;
  expiry_date: string;
  renewal_task_created: boolean;
  clients: {
    name: string;
    company: string | null;
    team_id: string;
  };
  compliance_types: {
    name: string;
  };
}

interface RecurringTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  client_id: string;
  service_id: string;
  budgeted_minutes: number | null;
  recurring_rule: string;
  team_id: string;
  status: string;
  completed_at: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth() + 1
    const results = {
      serviceTasksCreated: 0,
      complianceTasksCreated: 0,
      recurringTasksCreated: 0,
      errors: [] as string[]
    }

    console.log(`Starting daily automation for ${today.toISOString()}`)

    // =============================================
    // 1. SERVICE-BASED TASK GENERATION
    // =============================================
    
    try {
      console.log('Processing service-based task generation...')
      
      // Find service periods that should trigger today
      const { data: servicePeriods, error: servicePeriodsError } = await supabaseClient
        .from('service_periods')
        .select(`
          *,
          team_services (
            name,
            team_id
          )
        `)
        .eq('is_active', true)
        .or(`trigger_day.eq.${currentDay},and(trigger_day.eq.${currentDay},trigger_month.eq.${currentMonth})`)

      if (servicePeriodsError) {
        throw new Error(`Error fetching service periods: ${servicePeriodsError.message}`)
      }

      for (const period of servicePeriods as ServicePeriod[]) {
        console.log(`Processing service period: ${period.period_name}`)
        
        // Find all active client services for this service
        const { data: clientServices, error: clientServicesError } = await supabaseClient
          .from('client_services_enhanced')
          .select(`
            *,
            clients (
              id,
              name,
              company,
              team_id
            )
          `)
          .eq('service_id', period.service_id)
          .eq('is_active', true)

        if (clientServicesError) {
          console.error(`Error fetching client services for ${period.service_id}:`, clientServicesError)
          continue
        }

        // Create tasks for each active client service
        for (const clientService of clientServices as ClientServiceEnhanced[]) {
          const dueDate = new Date(today)
          dueDate.setDate(dueDate.getDate() + (period.due_days_offset || 7))

          const taskTitle = `${period.period_name} - ${clientService.clients.company || clientService.clients.name}`
          
          // Check if a similar task already exists for this period
          const { data: existingTask } = await supabaseClient
            .from('tasks')
            .select('id')
            .eq('client_id', clientService.client_id)
            .eq('client_service_id', clientService.client_service_id)
            .eq('auto_generated', true)
            .eq('status', 'todo')
            .ilike('title', `%${period.period_name}%`)
            .gte('created_at', today.toISOString().split('T')[0])

          if (existingTask && existingTask.length > 0) {
            console.log(`Task already exists for ${taskTitle}`)
            continue
          }

          const { error: taskError } = await supabaseClient
            .from('tasks')
            .insert({
              team_id: clientService.clients.team_id,
              title: taskTitle,
              description: `Automated task for ${period.period_name}`,
              status: 'todo',
              priority: 'medium',
              due_date: dueDate.toISOString().split('T')[0],
              client_id: clientService.client_id,
              service_id: period.service_id,
              client_service_id: clientService.client_service_id,
              auto_generated: true,
              created_at: today.toISOString()
            })

          if (taskError) {
            console.error(`Error creating task for ${taskTitle}:`, taskError)
            results.errors.push(`Failed to create task: ${taskTitle}`)
          } else {
            console.log(`Created task: ${taskTitle}`)
            results.serviceTasksCreated++
          }
        }
      }
    } catch (error) {
      console.error('Error in service-based task generation:', error)
      results.errors.push(`Service task generation failed: ${error.message}`)
    }

    // =============================================
    // 2. COMPLIANCE RENEWAL TASK AUTOMATION
    // =============================================
    
    try {
      console.log('Processing compliance renewal tasks...')
      
      const futureDate = new Date(today)
      futureDate.setDate(futureDate.getDate() + 60) // 60 days from now

      // Find compliance items expiring in the next 60 days
      const { data: expiringCompliance, error: complianceError } = await supabaseClient
        .from('client_compliance')
        .select(`
          *,
          clients (
            name,
            company,
            team_id
          ),
          compliance_types (
            name
          )
        `)
        .gte('expiry_date', today.toISOString().split('T')[0])
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .eq('renewal_task_created', false)

      if (complianceError) {
        throw new Error(`Error fetching expiring compliance: ${complianceError.message}`)
      }

      for (const compliance of expiringCompliance as ClientCompliance[]) {
        const taskTitle = `Action: Renew ${compliance.compliance_types.name} for ${compliance.clients.company || compliance.clients.name}`
        
        const { error: taskError } = await supabaseClient
          .from('tasks')
          .insert({
            team_id: compliance.clients.team_id,
            title: taskTitle,
            description: `Renewal required for ${compliance.compliance_types.name} expiring on ${compliance.expiry_date}`,
            status: 'todo',
            priority: 'high',
            due_date: compliance.expiry_date,
            client_id: compliance.client_id,
            compliance_id: compliance.client_compliance_id,
            auto_generated: true,
            created_at: today.toISOString()
          })

        if (taskError) {
          console.error(`Error creating compliance task for ${taskTitle}:`, taskError)
          results.errors.push(`Failed to create compliance task: ${taskTitle}`)
        } else {
          // Mark compliance as having renewal task created
          await supabaseClient
            .from('client_compliance')
            .update({ renewal_task_created: true })
            .eq('client_compliance_id', compliance.client_compliance_id)
          
          console.log(`Created compliance renewal task: ${taskTitle}`)
          results.complianceTasksCreated++
        }
      }
    } catch (error) {
      console.error('Error in compliance renewal automation:', error)
      results.errors.push(`Compliance automation failed: ${error.message}`)
    }

    // =============================================
    // 3. AD-HOC RECURRING TASK GENERATION
    // =============================================
    
    try {
      console.log('Processing recurring task generation...')
      
      // Find completed tasks with recurring rules
      const { data: recurringTasks, error: recurringError } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('status', 'done')
        .not('recurring_rule', 'is', null)
        .not('recurring_rule', 'eq', 'none')

      if (recurringError) {
        throw new Error(`Error fetching recurring tasks: ${recurringError.message}`)
      }

      for (const task of recurringTasks as RecurringTask[]) {
        if (!task.completed_at || !task.recurring_rule) continue

        const completedDate = new Date(task.completed_at)
        const shouldCreateNew = this.shouldCreateRecurringTask(task.recurring_rule, completedDate, today)

        if (shouldCreateNew) {
          // Check if we already created a new instance today
          const { data: existingRecurring } = await supabaseClient
            .from('tasks')
            .select('id')
            .eq('client_id', task.client_id)
            .eq('service_id', task.service_id)
            .eq('title', task.title)
            .eq('auto_generated', true)
            .gte('created_at', today.toISOString().split('T')[0])

          if (existingRecurring && existingRecurring.length > 0) {
            console.log(`Recurring task already created today for: ${task.title}`)
            continue
          }

          const newDueDate = this.calculateNextDueDate(task.recurring_rule, completedDate)
          
          const { error: newTaskError } = await supabaseClient
            .from('tasks')
            .insert({
              team_id: task.team_id,
              title: task.title,
              description: task.description,
              status: 'todo',
              priority: task.priority,
              due_date: newDueDate.toISOString().split('T')[0],
              client_id: task.client_id,
              service_id: task.service_id,
              budgeted_minutes: task.budgeted_minutes,
              recurring_rule: task.recurring_rule,
              auto_generated: true,
              created_at: today.toISOString()
            })

          if (newTaskError) {
            console.error(`Error creating recurring task for ${task.title}:`, newTaskError)
            results.errors.push(`Failed to create recurring task: ${task.title}`)
          } else {
            console.log(`Created recurring task: ${task.title}`)
            results.recurringTasksCreated++
          }
        }
      }
    } catch (error) {
      console.error('Error in recurring task generation:', error)
      results.errors.push(`Recurring task generation failed: ${error.message}`)
    }

    // =============================================
    // 4. UPDATE COMPLIANCE STATUS
    // =============================================
    
    try {
      console.log('Updating compliance status...')
      await supabaseClient.rpc('update_compliance_status')
    } catch (error) {
      console.error('Error updating compliance status:', error)
      results.errors.push(`Compliance status update failed: ${error.message}`)
    }

    console.log('Daily automation completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily automation completed successfully',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Daily automation failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// Helper functions for recurring task logic
function shouldCreateRecurringTask(rule: string, completedDate: Date, today: Date): boolean {
  const daysSinceCompletion = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))
  
  switch (rule) {
    case 'daily':
      return daysSinceCompletion >= 1
    case 'weekly':
      return daysSinceCompletion >= 7
    case 'monthly':
      return daysSinceCompletion >= 30
    case 'quarterly':
      return daysSinceCompletion >= 90
    case 'annually':
      return daysSinceCompletion >= 365
    default:
      return false
  }
}

function calculateNextDueDate(rule: string, completedDate: Date): Date {
  const nextDate = new Date(completedDate)
  
  switch (rule) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1)
      break
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3)
      break
    case 'annually':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
    default:
      nextDate.setDate(nextDate.getDate() + 30) // Default to monthly
  }
  
  return nextDate
}
