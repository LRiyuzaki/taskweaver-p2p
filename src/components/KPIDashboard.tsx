
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  ClipboardList, 
  Clock, 
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { enhancedSupabaseService } from '@/services/enhancedSupabaseService';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className 
}) => {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={cn(
            "flex items-center mt-2 text-xs",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            <TrendingUp 
              className={cn(
                "h-3 w-3 mr-1",
                !trend.isPositive && "rotate-180"
              )} 
            />
            {Math.abs(trend.value)}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const KPIDashboard: React.FC = () => {
  const { data: kpiData, isLoading, error } = useQuery({
    queryKey: ['kpi-summary'],
    queryFn: () => enhancedSupabaseService.getKPISummary(),
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Error loading KPI data: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Active Clients"
        value={kpiData?.total_active_clients || 0}
        description="Total clients in your portfolio"
        icon={Users}
        trend={{ value: 12, isPositive: true }}
        className="border-blue-200 bg-blue-50"
      />
      
      <KPICard
        title="Open Tasks"
        value={kpiData?.total_open_tasks || 0}
        description="Tasks pending completion"
        icon={ClipboardList}
        trend={{ value: 5, isPositive: false }}
        className="border-orange-200 bg-orange-50"
      />
      
      <KPICard
        title="Hours Logged"
        value={`${kpiData?.total_hours_logged_this_month || 0}h`}
        description="Total hours this month"
        icon={Clock}
        trend={{ value: 8, isPositive: true }}
        className="border-green-200 bg-green-50"
      />
      
      <KPICard
        title="Compliance Alerts"
        value={kpiData?.compliance_items_expiring_soon || 0}
        description="Items requiring attention"
        icon={AlertTriangle}
        className={cn(
          "border-red-200 bg-red-50",
          (kpiData?.compliance_items_expiring_soon || 0) > 0 && "ring-2 ring-red-200"
        )}
      />
      
      <KPICard
        title="Revenue (MTD)"
        value={formatCurrency(kpiData?.revenue_this_month || 0)}
        description="Month-to-date revenue"
        icon={DollarSign}
        trend={{ value: 15, isPositive: true }}
        className="border-purple-200 bg-purple-50"
      />
      
      <KPICard
        title="Tasks Completed"
        value={kpiData?.tasks_completed_this_month || 0}
        description="Completed this month"
        icon={CheckCircle2}
        trend={{ value: 10, isPositive: true }}
        className="border-emerald-200 bg-emerald-50"
      />
      
      <KPICard
        title="Avg. Completion"
        value={`${kpiData?.average_task_completion_time || 0}d`}
        description="Average task completion time"
        icon={Activity}
        trend={{ value: 2, isPositive: false }}
        className="border-indigo-200 bg-indigo-50"
      />
      
      <KPICard
        title="Team Utilization"
        value={formatPercentage(kpiData?.team_utilization_rate || 0)}
        description="Current team capacity usage"
        icon={TrendingUp}
        trend={{ value: 3, isPositive: true }}
        className="border-cyan-200 bg-cyan-50"
      />
    </div>
  );
};
