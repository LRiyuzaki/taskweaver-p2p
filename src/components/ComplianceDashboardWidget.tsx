
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Calendar, 
  Building, 
  FileText,
  Plus,
  AlertCircle,
  Clock
} from 'lucide-react';
import { enhancedSupabaseService, ClientCompliance } from '@/services/enhancedSupabaseService';
import { format, differenceInDays, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

interface ComplianceItemProps {
  compliance: ClientCompliance & {
    clients?: { name: string; company?: string };
    compliance_types?: { name: string; description?: string };
  };
}

const ComplianceItem: React.FC<ComplianceItemProps> = ({ compliance }) => {
  const expiryDate = new Date(compliance.expiry_date);
  const daysUntilExpiry = differenceInDays(expiryDate, new Date());
  const isExpired = isAfter(new Date(), expiryDate);
  
  const getStatusColor = () => {
    if (isExpired) return 'text-red-600 bg-red-50 border-red-200';
    if (daysUntilExpiry <= 7) return 'text-red-600 bg-red-50 border-red-200';
    if (daysUntilExpiry <= 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getUrgencyText = () => {
    if (isExpired) return 'Expired';
    if (daysUntilExpiry === 0) return 'Expires today';
    if (daysUntilExpiry === 1) return 'Expires tomorrow';
    if (daysUntilExpiry <= 7) return `Expires in ${daysUntilExpiry} days`;
    if (daysUntilExpiry <= 30) return `Expires in ${daysUntilExpiry} days`;
    return `${daysUntilExpiry} days remaining`;
  };

  return (
    <div className={cn(
      "p-4 border rounded-lg transition-colors hover:shadow-sm",
      getStatusColor()
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <Building className="h-4 w-4 mr-2" />
            <span className="font-medium text-sm">
              {compliance.clients?.company || compliance.clients?.name || 'Unknown Client'}
            </span>
          </div>
          <div className="flex items-center mb-2">
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {compliance.compliance_types?.name || 'Unknown Compliance'}
            </span>
          </div>
        </div>
        <Badge 
          variant={isExpired ? "destructive" : "default"}
          className="text-xs"
        >
          {compliance.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Expires: {format(expiryDate, 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center text-xs font-medium">
          <Clock className="h-3 w-3 mr-1" />
          {getUrgencyText()}
        </div>
      </div>

      {compliance.compliance_types?.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {compliance.compliance_types.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          {!compliance.renewal_task_created && (
            <Button size="sm" variant="outline" className="text-xs">
              Create Renewal Task
            </Button>
          )}
        </div>
        {compliance.renewal_task_created && (
          <span className="text-xs text-green-600 flex items-center">
            ✓ Renewal task created
          </span>
        )}
      </div>
    </div>
  );
};

export const ComplianceDashboardWidget: React.FC = () => {
  const { data: complianceItems, isLoading, error } = useQuery({
    queryKey: ['expiring-compliance'],
    queryFn: () => enhancedSupabaseService.getExpiringCompliance(),
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error loading compliance data: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            At-Risk Compliance Items
          </CardTitle>
          <Badge variant="secondary">
            {complianceItems?.length || 0} Items
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : complianceItems?.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="font-medium mb-1">All Compliance Items Up to Date</h3>
              <p className="text-sm">No compliance items require immediate attention.</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {complianceItems?.map((item) => (
                <ComplianceItem key={item.client_compliance_id} compliance={item} />
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Compliance Item
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
